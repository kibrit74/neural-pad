import path from 'path';
import { app } from 'electron';
import Database from 'better-sqlite3';
import knex from 'knex';
import type { Note } from '../types';

let db: Database.Database | null = null;
let knexInstance: knex.Knex | null = null;
let isInitialized = false;

const initializeDatabase = () => {
  if (isInitialized) return;
  
  const dbPath = path.join(app.getPath('userData'), 'neural-pad.sqlite');
  db = new Database(dbPath);
  
  knexInstance = knex({
    client: 'better-sqlite3',
    connection: {
      filename: dbPath,
    },
    useNullAsDefault: true,
  });
  
  isInitialized = true;
  
  // Initialize schema after database is ready
  createSchema().catch(err => {
    console.error('Failed to initialize database schema:', err);
  });
};

const getKnex = (): knex.Knex => {
  if (!knexInstance) {
    initializeDatabase();
  }
  return knexInstance!;
};

const migrateSchema = async () => {
    console.log('🚀 Starting database migration check...');
    const knex = getKnex();
    try {
        await knex.raw('PRAGMA foreign_keys = OFF');

        const notesColumns = await knex('notes').columnInfo();
        if (notesColumns.content && (notesColumns.content.type.toUpperCase() !== 'BLOB' && notesColumns.content.type.toUpperCase() !== 'BINARY')) {
            console.log('⚠️ "notes" table needs migration. Migrating content column to BLOB...');
            await knex.schema.renameTable('notes', 'notes_old');
            await knex.schema.createTable('notes', (table) => {
                table.increments('id').primary();
                table.string('title').notNullable();
                table.binary('content').notNullable(); // Use binary for BLOB
                table.text('tags');
                table.dateTime('createdAt').notNullable();
                table.dateTime('updatedAt').notNullable();
                table.text('plainTextContent');
                table.boolean('isPinned').defaultTo(false);
                table.boolean('isLocked').defaultTo(false);
                table.text('encrypted');
                // Index will be added after dropping the old table
            });
            await knex.raw('INSERT INTO notes SELECT * FROM notes_old');
            await knex.schema.dropTable('notes_old');
            await knex.schema.table('notes', (table) => {
                table.index('updatedAt');
            });
            console.log('✅ "notes" table migrated successfully.');
        }

        const historyColumns = await knex('history').columnInfo();
        if (historyColumns.content && (historyColumns.content.type.toUpperCase() !== 'BLOB' && historyColumns.content.type.toUpperCase() !== 'BINARY')) {
            console.log('⚠️ "history" table needs migration. Migrating content column to BLOB...');
            await knex.schema.renameTable('history', 'history_old');
            await knex.schema.createTable('history', (table) => {
                table.increments('id').primary();
                table.integer('noteId').unsigned().notNullable().references('id').inTable('notes').onDelete('CASCADE');
                table.string('title').notNullable();
                table.binary('content').notNullable(); // Use binary for BLOB
                table.dateTime('timestamp').notNullable();
                // Index will be added after dropping the old table
            });
            await knex.raw('INSERT INTO history SELECT * FROM history_old');
            await knex.schema.dropTable('history_old');
            await knex.schema.table('history', (table) => {
                table.index('noteId');
            });
            console.log('✅ "history" table migrated successfully.');
        }
    } catch (error) {
        console.error('❌ Database migration failed:', error);
    } finally {
        await knex.raw('PRAGMA foreign_keys = ON');
        console.log('Migration check finished.');
    }
};


const createSchema = async () => {
  const knex = getKnex();
  await knex.raw('PRAGMA foreign_keys = ON');

  const hasNotesTable = await knex.schema.hasTable('notes');
  if (!hasNotesTable) {
    await knex.schema.createTable('notes', (table) => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.binary('content').notNullable(); // Use BLOB for new tables
      table.text('tags');
      table.dateTime('createdAt').notNullable();
      table.dateTime('updatedAt').notNullable();
      table.text('plainTextContent');
      table.boolean('isPinned').defaultTo(false);
      table.boolean('isLocked').defaultTo(false);
      table.text('encrypted');
      table.index('updatedAt');
    });
    console.log('✅ "notes" table created');
  }

  const hasHistoryTable = await knex.schema.hasTable('history');
  if (!hasHistoryTable) {
    await knex.schema.createTable('history', (table) => {
      table.increments('id').primary();
      table.integer('noteId').unsigned().notNullable().references('id').inTable('notes').onDelete('CASCADE');
      table.string('title').notNullable();
      table.binary('content').notNullable(); // Use BLOB for new tables
      table.dateTime('timestamp').notNullable();
      table.index('noteId');
    });
    console.log('✅ "history" table created');
  }
  
  // After ensuring tables exist, run migration logic
  await migrateSchema();
};

// Schema will be created when database is first accessed

export const saveNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): Promise<number> => {
    console.log('Attempting to save note:', { id: note.id, title: note.title, hasContent: !!note.content, contentLength: note.content?.length || 0 });
    const now = new Date();
    const isLocked = !!(note as any).isLocked;
    const tagsAsJson = JSON.stringify(note.tags || []);
    const encryptedAsString = (note as any).encrypted ? JSON.stringify((note as any).encrypted) : null;

    try {
        const knex = getKnex();
        const noteId = await knex.transaction(async (trx) => {
            let noteIdToReturn: number;

            if (note.id) { // Update
                const existingNote = await trx('notes').where('id', note.id).first();
                if (!existingNote) throw new Error(`Note with id ${note.id} not found`);

                const noteToSave = {
                    title: note.title,
                    content: isLocked ? '' : note.content,
                    tags: tagsAsJson,
                    updatedAt: now,
                    plainTextContent: note.plainTextContent,
                    isPinned: (note as any).isPinned ?? existingNote.isPinned,
                    isLocked,
                    encrypted: encryptedAsString ?? existingNote.encrypted,
                };
                
                console.log('Updating note in DB:', noteToSave.title);
                await trx('notes').where('id', note.id).update(noteToSave);
                noteIdToReturn = note.id;
            } else { // Create
                const noteToSave = {
                    title: note.title,
                    content: isLocked ? '' : note.content,
                    tags: tagsAsJson,
                    createdAt: now,
                    updatedAt: now,
                    plainTextContent: note.plainTextContent,
                    isPinned: (note as any).isPinned ?? false,
                    isLocked,
                    encrypted: encryptedAsString,
                };
                console.log('Creating new note in DB:', noteToSave.title);
                const returningResult = await trx('notes').insert(noteToSave).returning('id');
                noteIdToReturn = (typeof returningResult[0] === 'object' ? returningResult[0].id : returningResult[0]) as number;
            }

            await trx('history').insert({
                noteId: noteIdToReturn,
                title: note.title,
                content: isLocked ? '' : note.content,
                timestamp: now,
            });

            return noteIdToReturn;
        });
        console.log(`✅ Note saved successfully. ID: ${noteId}`);
        return noteId;
    } catch (error) {
        console.error('❌ Failed to save note to database:', error);
        throw error; // Re-throw the error to be caught by the caller
    }
};

const parseJsonField = (field: any) => {
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch (e) {
      return field;
    }
  }
  return field;
};

// When retrieving content, it might be a Buffer. Convert it to a string.
const processNote = (note: any): Note => {
    return {
        ...note,
        content: note.content instanceof Buffer ? note.content.toString('utf-8') : note.content,
        tags: parseJsonField(note.tags),
        encrypted: parseJsonField(note.encrypted),
    };
};

export const getAllNotes = async (): Promise<Note[]> => {
    const knex = getKnex();
    const notes = await knex('notes').orderBy('updatedAt', 'desc');
    return notes.map(processNote);
};

export const getNote = async (id: number): Promise<Note | undefined> => {
    const knex = getKnex();
    const note = await knex('notes').where('id', id).first();
    if (note) {
        return processNote(note);
    }
    return undefined;
};

export const getHistory = async (noteId: number): Promise<{ id: number; noteId: number; title: string; content: string; timestamp: Date }[]> => {
    const knex = getKnex();
    const history = await knex('history').where('noteId', noteId).orderBy('timestamp', 'desc');
    return history.map(h => ({
        ...h,
        content: h.content instanceof Buffer ? h.content.toString('utf-8') : h.content,
    }));
};

export const deleteNote = async (id: number): Promise<void> => {
    const knex = getKnex();
    await knex('notes').where('id', id).del();
};
