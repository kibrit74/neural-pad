"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNote = exports.getHistory = exports.getNote = exports.getAllNotes = exports.saveNote = void 0;
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const knex_1 = __importDefault(require("knex"));
let db = null;
let knexInstance = null;
let isInitialized = false;
const initializeDatabase = () => {
    if (isInitialized)
        return;
    const dbPath = path_1.default.join(electron_1.app.getPath('userData'), 'neural-pad.sqlite');
    db = new better_sqlite3_1.default(dbPath);
    knexInstance = (0, knex_1.default)({
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
const getKnex = () => {
    if (!knexInstance) {
        initializeDatabase();
    }
    return knexInstance;
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
    }
    catch (error) {
        console.error('❌ Database migration failed:', error);
    }
    finally {
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
const saveNote = async (note) => {
    console.log('Attempting to save note:', { id: note.id, title: note.title, hasContent: !!note.content, contentLength: note.content?.length || 0 });
    const now = new Date();
    const isLocked = !!note.isLocked;
    const tagsAsJson = JSON.stringify(note.tags || []);
    const encryptedAsString = note.encrypted ? JSON.stringify(note.encrypted) : null;
    try {
        const knex = getKnex();
        const noteId = await knex.transaction(async (trx) => {
            let noteIdToReturn;
            if (note.id) { // Update
                const existingNote = await trx('notes').where('id', note.id).first();
                if (!existingNote)
                    throw new Error(`Note with id ${note.id} not found`);
                const noteToSave = {
                    title: note.title,
                    content: isLocked ? '' : note.content,
                    tags: tagsAsJson,
                    updatedAt: now,
                    plainTextContent: note.plainTextContent,
                    isPinned: note.isPinned ?? existingNote.isPinned,
                    isLocked,
                    encrypted: encryptedAsString ?? existingNote.encrypted,
                };
                console.log('Updating note in DB:', noteToSave.title);
                await trx('notes').where('id', note.id).update(noteToSave);
                noteIdToReturn = note.id;
            }
            else { // Create
                const noteToSave = {
                    title: note.title,
                    content: isLocked ? '' : note.content,
                    tags: tagsAsJson,
                    createdAt: now,
                    updatedAt: now,
                    plainTextContent: note.plainTextContent,
                    isPinned: note.isPinned ?? false,
                    isLocked,
                    encrypted: encryptedAsString,
                };
                console.log('Creating new note in DB:', noteToSave.title);
                const returningResult = await trx('notes').insert(noteToSave).returning('id');
                noteIdToReturn = (typeof returningResult[0] === 'object' ? returningResult[0].id : returningResult[0]);
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
    }
    catch (error) {
        console.error('❌ Failed to save note to database:', error);
        throw error; // Re-throw the error to be caught by the caller
    }
};
exports.saveNote = saveNote;
const parseJsonField = (field) => {
    if (typeof field === 'string') {
        try {
            return JSON.parse(field);
        }
        catch (e) {
            return field;
        }
    }
    return field;
};
// When retrieving content, it might be a Buffer. Convert it to a string.
const processNote = (note) => {
    return {
        ...note,
        content: note.content instanceof Buffer ? note.content.toString('utf-8') : note.content,
        tags: parseJsonField(note.tags),
        encrypted: parseJsonField(note.encrypted),
    };
};
const getAllNotes = async () => {
    const knex = getKnex();
    const notes = await knex('notes').orderBy('updatedAt', 'desc');
    return notes.map(processNote);
};
exports.getAllNotes = getAllNotes;
const getNote = async (id) => {
    const knex = getKnex();
    const note = await knex('notes').where('id', id).first();
    if (note) {
        return processNote(note);
    }
    return undefined;
};
exports.getNote = getNote;
const getHistory = async (noteId) => {
    const knex = getKnex();
    const history = await knex('history').where('noteId', noteId).orderBy('timestamp', 'desc');
    return history.map(h => ({
        ...h,
        content: h.content instanceof Buffer ? h.content.toString('utf-8') : h.content,
    }));
};
exports.getHistory = getHistory;
const deleteNote = async (id) => {
    const knex = getKnex();
    await knex('notes').where('id', id).del();
};
exports.deleteNote = deleteNote;
