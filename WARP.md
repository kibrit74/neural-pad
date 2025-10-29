# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Neural Pad** is an AI-powered note-taking application built with React, TypeScript, and Vite. It features a rich text editor (TiptapEditor), AI chat capabilities with multiple providers (Gemini, OpenAI, Claude), and password-protected notes with client-side encryption. The app runs both as a web application and as an Electron desktop app.

## Common Commands

### Development
```powershell
# Install dependencies
npm install

# Run web development server (http://localhost:5175)
npm run dev

# Run Electron development mode
npm run dev:electron

# Build for production (web)
npm run build

# Build for Electron
npm run build:electron

# Start Electron app (after build)
npm run start:electron

# Preview production build
npm run preview
```

### Configuration
- Set API keys in `.env.local` file (especially `GEMINI_API_KEY`)
- API keys are also configurable via the in-app Settings modal (stored in localStorage)

## Architecture Overview

### Data Flow & State Management

**Note Lifecycle:**
1. Notes are stored in IndexedDB (`utils/db.ts`) using the `GeminiWriterDB` database
2. The `App.tsx` component manages all note state and orchestrates CRUD operations
3. Auto-save runs every 5 minutes when enabled; manual save via Ctrl+S
4. Locked notes: encrypted content stored in `encrypted` field, `content` field cleared

**AI Chat Flow:**
1. User input → `Chat.tsx` → selected API provider service
2. Streaming responses via async generators in `services/geminiService.ts`
3. Gemini supports web search (auto-detected or manual) with source citations
4. Editor context (text + images) can be injected into chat requests

### Key Components

**App.tsx (Main Controller)**
- Central state management for notes, UI, settings, notifications
- Handles note selection, creation, deletion, saving
- Manages password modal flow for locked notes
- Coordinates sidebar visibility and mobile responsiveness

**Editor Pipeline:**
- `components/Editor.tsx` wraps TiptapEditor
- Custom extensions in `utils/tiptapExtensions.ts`
- Custom image handling via `utils/tiptapCustomImage.tsx`
- Content changes trigger `handleEditorChange` → update activeNote state

**Chat System:**
- `components/Chat.tsx`: Multi-session chat UI with tabs
- `services/geminiService.ts`: Unified API service for Gemini/OpenAI/Claude
- Auto-detects when web search needed (keywords: "today", "weather", "latest", etc.)
- Returns streaming chunks with optional web sources

**Password Protection:**
- `utils/crypto.ts`: Web Crypto API (AES-GCM + PBKDF2)
- Password cache in `App.tsx` (Map) for temporary unlock during editing
- Three modes: 'set', 'unlock', 'remove' handled by `PasswordModal`

**Context Menu System:**
- Right-click on text/images → `ContextMenu.tsx`
- Actions: AI operations (summarize, explain, translate, etc.), tags, Make Blueprint
- AI image analysis for right-clicked images
- Text operations use `generateContent` from `geminiService.ts`

### Database Schema (IndexedDB)

**Object Store: `notes`**
- keyPath: `id` (auto-increment)
- Indexes: `title`, `updatedAt`, `tags` (multiEntry)
- Fields: `id`, `title`, `content`, `createdAt`, `updatedAt`, `tags[]`, `plainTextContent`, `isPinned`, `isLocked`, `encrypted`

**Note:** `plainTextContent` is generated from HTML for efficient search; cleared for locked notes.

### Multi-Provider AI Integration

**Supported Providers:**
- **Gemini** (default): Full feature support including web search & grounding
- **OpenAI**: Chat completions via streaming API
- **Claude**: Anthropic Messages API

**Key Functions (geminiService.ts):**
- `getChatStream()`: Main streaming dispatcher (routes to provider)
- `generateContent()`: Non-streaming for context menu operations
- `generateTagsForNote()`: Structured output for tag suggestions
- `shouldUseWebSearch()`: Auto-detection logic for web search needs

### Internationalization (i18n)

- `contexts/LanguageContext.tsx`: React Context for language state
- `utils/i18n.ts`: Translation dictionaries (English & Turkish)
- Hook: `useTranslations()` returns `t()` function
- Auto-detects browser language on first load
- Stored in localStorage

### Theming System

- `contexts/ThemeContext.tsx`: React Context for theme state
- Themes: 'default', 'twilight', 'ocean', 'forest', 'blossom', 'dusk'
- CSS variables defined per theme in `index.css` via `[data-theme="..."]`
- Applied via `data-theme` attribute on `<html>`

### Electron Integration

- **Main Process:** `electron/main.js` - Creates BrowserWindow, manages app lifecycle
- **Preload Script:** `electron/preload.js` (not shown but referenced)
- Dev mode: Loads from Vite dev server (http://localhost:5175)
- Production: Loads from `dist/index.html`
- External links open in system browser

## Important Implementation Details

### Note Saving with Encryption
When saving a locked note, the plaintext `content` is encrypted and stored in the `encrypted` field, while the `content` field is cleared. The password is cached in-memory during the session for subsequent saves. Always use `passwordCacheRef.current.get(noteId)` to retrieve passwords.

### Editor Content Updates
Use `editor.commands.setContent(html, { emitUpdate: false })` when programmatically setting content to avoid triggering unnecessary `onUpdate` events that could cause race conditions.

### Context Menu AI Operations
All AI operations in the context menu use `generateContent()` which is non-streaming. For image operations, pass `{ mimeType, data }` as the third argument.

### Web Search in Chat
Gemini automatically enables web search if the user message contains keywords like "today", "weather", "latest", etc. You can also force it via the `forceWebSearch` parameter. Search results include source citations in `WebSource[]` format.

### IndexedDB Version Migrations
When adding new indexes or fields to the notes store, increment `DB_VERSION` in `utils/db.ts` and handle the migration in the `onupgradeneeded` handler.

### Mobile Responsiveness
The app uses a breakpoint at 768px (`isMobile` state). On mobile, sidebars are rendered as fixed overlays with slide-in animations instead of inline columns.

## File Organization

```
/
├── components/          # React components (UI)
│   ├── Chat.tsx        # Multi-session chat interface
│   ├── Editor.tsx      # TiptapEditor wrapper
│   ├── ContextMenu.tsx # Right-click AI menu
│   ├── *Modal.tsx      # Various modal dialogs
│   └── icons/          # SVG icon components
├── contexts/           # React Context providers
│   ├── LanguageContext.tsx
│   └── ThemeContext.tsx
├── hooks/              # Custom React hooks
│   ├── useTranslations.ts
│   ├── useDebounce.ts
│   └── useUndoRedo.ts
├── services/           # API integrations
│   ├── geminiService.ts      # Multi-provider AI service
│   └── makeBlueprintService.ts
├── utils/              # Core utilities
│   ├── db.ts          # IndexedDB operations
│   ├── crypto.ts      # AES-GCM encryption
│   ├── i18n.ts        # Translation dictionaries
│   └── tiptap*.ts     # Editor extensions
├── electron/           # Electron app files
│   ├── main.js        # Main process
│   └── preload.js     # Preload script
├── App.tsx            # Root component (main controller)
├── index.tsx          # React entry point
├── types.ts           # TypeScript type definitions
└── vite.config.ts     # Vite configuration
```

## Type Definitions (types.ts)

Key interfaces:
- `Settings`: AI model config, API keys, autoSave
- `Note`: Full note structure including encryption fields
- `ChatMessage`: User/model message with optional sources
- `ApiProvider`: 'gemini' | 'openai' | 'claude'
- `EncryptedPayload`: { salt, iv, data } for AES-GCM

## Development Notes

- **Port:** Vite dev server runs on `5175` (not the default 5173)
- **State refs:** `activeNoteRef` is used in callbacks to avoid stale closure issues
- **Error handling:** AI service errors are caught and mapped to user-friendly notifications
- **Performance:** Plain text search uses pre-computed `plainTextContent` field (added in DB v2)
- **Security:** Passwords never leave the client; encryption via Web Crypto API

## Testing & Building

This project does not currently have automated tests configured. When testing:
- Test multi-provider AI chat (requires valid API keys)
- Test note encryption/decryption flow
- Test mobile responsive layouts (< 768px)
- Test Electron app packaging and window management
