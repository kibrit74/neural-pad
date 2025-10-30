# Build Instructions

## 📦 Packaging for Distribution

### Windows

```bash
npm run dist:win
```

This command will:
1. ✅ Verify clean packaging setup
2. 🏗️ Build the app (`npm run build`)
3. 🎨 Generate icons (`npm run icon:gen`)
4. 📦 Package with electron-builder

### What Happens on First Run

When a user installs and opens the packaged app **for the first time**:

1. **Database is cleared** - No development notes
2. **Settings are reset** - Default configuration
3. **API keys are removed** - Users must add their own
4. **App is marked as installed** - Cleanup won't run again

The cleanup code is in `electron/preload.cjs` and runs automatically.

### Development vs. Production

| Environment | Database | API Keys | Settings |
|------------|----------|----------|----------|
| **Development** | Your dev notes | Your keys | Your config |
| **Packaged App** | Empty ✅ | None ✅ | Defaults ✅ |

### Important Files

- `electron/preload.cjs` - Contains first-run cleanup logic
- `scripts/prebuild-clean.mjs` - Verifies cleanup is configured
- `package.json` - Build scripts

### Testing the Packaged App

After running `npm run dist:win`, the app will be in:
```
dist/win-unpacked/Neural Pad.exe
```

**First launch:**
- Database will be empty
- No API keys
- Default settings
- Console shows: "🎉 First run detected - initializing clean state..."

**Second launch:**
- Normal operation
- User's data is preserved
- No cleanup runs

### For Users

Users need to:
1. Open the app
2. Go to Settings (⚙️)
3. Add their API key (OpenAI, Claude, or Gemini)
4. Start using the app

---

## 🛠️ Development

```bash
# Web development
npm run dev

# Electron development
npm run dev:electron
```

Your development environment is **NOT affected** by the packaging cleanup.
