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

  // Create images table for tracking uploaded images
  const hasImagesTable = await knex.schema.hasTable('images');
  if (!hasImagesTable) {
    await knex.schema.createTable('images', (table) => {
      table.increments('id').primary();
      table.string('filename').notNullable().unique(); // hash.png
      table.string('hash').notNullable().unique(); // SHA-256 hash
      table.integer('size').notNullable(); // File size in bytes
      table.dateTime('createdAt').notNullable();
      table.dateTime('lastUsedAt').notNullable(); // For cleanup of unused images
      table.index('hash');
      table.index('lastUsedAt');
    });
    console.log('✅ "images" table created');
  }
  
  // After ensuring tables exist, run migration logic
  await migrateSchema();
};

// Schema will be created when database is first accessed

export const saveNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: number }): Promise<number> => {
    // Skip saving empty notes without ID (new notes with no content)
    if (!note.id && !note.title && !note.content) {
        console.log('⏭️ Skipping save for empty new note');
        throw new Error('Cannot save empty note');
    }

    const now = new Date();
    const isLocked = !!(note as any).isLocked;
    const tagsAsJson = JSON.stringify(note.tags || []);
    const encryptedAsString = (note as any).encrypted ? JSON.stringify((note as any).encrypted) : null;

    // Extract image hashes from content and update their usage
    if (note.content) {
        const imageRegex = /app:\/\/images\/([a-f0-9]+)\.png/g;
        const matches = note.content.matchAll(imageRegex);
        for (const match of matches) {
            const hash = match[1];
            try {
                await updateImageUsage(hash);
            } catch (error) {
                console.error('Failed to update image usage:', hash, error);
            }
        }
    }

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
                const returningResult = await trx('notes').insert(noteToSave).returning('id');
                noteIdToReturn = (typeof returningResult[0] === 'object' ? returningResult[0].id : returningResult[0]) as number;
            }

            // Only save to history if there's actual content
            if (note.content || note.title) {
                await trx('history').insert({
                    noteId: noteIdToReturn,
                    title: note.title,
                    content: isLocked ? '' : note.content,
                    timestamp: now,
                });
            }

            return noteIdToReturn;
        });
        return noteId;
    } catch (error) {
        console.error('❌ Failed to save note:', error);
        throw error;
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

// Image tracking functions
export const trackImage = async (filename: string, hash: string, size: number): Promise<void> => {
    const knex = getKnex();
    const now = new Date();
    
    try {
        await knex('images').insert({
            filename,
            hash,
            size,
            createdAt: now,
            lastUsedAt: now
        }).onConflict('hash').merge({
            lastUsedAt: now
        });
    } catch (error) {
        console.error('Failed to track image:', error);
    }
};

export const updateImageUsage = async (hash: string): Promise<void> => {
    const knex = getKnex();
    try {
        await knex('images').where('hash', hash).update({
            lastUsedAt: new Date()
        });
    } catch (error) {
        console.error('Failed to update image usage:', error);
    }
};

export const getUnusedImages = async (daysOld: number = 30): Promise<string[]> => {
    const knex = getKnex();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    try {
        const images = await knex('images')
            .where('lastUsedAt', '<', cutoffDate)
            .select('filename');
        return images.map(img => img.filename);
    } catch (error) {
        console.error('Failed to get unused images:', error);
        return [];
    }
};

export const deleteImageRecord = async (hash: string): Promise<void> => {
    const knex = getKnex();
    try {
        await knex('images').where('hash', hash).del();
    } catch (error) {
        console.error('Failed to delete image record:', error);
    }
};
