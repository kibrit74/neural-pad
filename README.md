# 🧠 Neural Pad

Modern, AI-powered note-taking application built with React, TypeScript, and Electron. Neural Pad combines powerful rich-text editing with intelligent AI assistance to enhance your writing and note-taking experience.

![Neural Pad](https://img.shields.io/badge/version-0.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Electron](https://img.shields.io/badge/Electron-33.2.0-blue.svg)
![React](https://img.shields.io/badge/React-19.2.0-blue.svg)

## ✨ Features

### 📝 Rich Text Editor
- **TipTap Editor Integration** - Powerful WYSIWYG editor with full formatting support
- **Markdown Support** - Write and render markdown seamlessly
- **Image Support** - Embed and manage images in your notes
- **Custom Formatting** - Font families, colors, text styles, and more
- **PDF Export** - Convert your notes to PDF with jsPDF

### 🤖 AI-Powered Assistance
- **Multiple AI Providers** - Support for Google Gemini, OpenAI, and Claude
- **Integrated Chat Interface** - Get AI assistance while you write
- **Blueprint Mode** - Generate structured content from selected text
- **Contextual Help** - AI understands your note context for better suggestions

### 🔐 Security & Privacy
- **Password Protection** - Lock sensitive notes with encryption
- **AES Encryption** - Secure your private content
- **Local Storage** - All data stored locally in IndexedDB

### 📱 User Interface
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark Mode Ready** - Built with Tailwind CSS
- **Resizable Panels** - Customize your workspace layout
- **Notes Sidebar** - Organize and search through your notes
- **Tag System** - Categorize notes with tags
- **Context Menu** - Quick access to common actions

### 🛠️ Additional Features
- **Auto-Save** - Never lose your work
- **Multiple Languages** - i18n support
- **Search Functionality** - Find notes quickly
- **Welcome Tutorial** - Guided onboarding experience
- **Keyboard Shortcuts** - Efficient workflow (Ctrl+S to save)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/kibrit74/neural-pad.git
cd neural-pad
```

2. Install dependencies
```bash
npm install
```

3. Configure your AI API key
- Launch the app
- Open Settings
- Select your AI provider (Gemini/OpenAI/Claude)
- Enter your API key

### Development

Run the web development server:
```bash
npm run dev
```

Run as Electron app:
```bash
npm run dev:electron
```

### Building

Build for web:
```bash
npm run build
```

Build Electron app for Windows:
```bash
npm run dist:win
```

Generate icons:
```bash
npm run icon:gen
```

## 🏗️ Tech Stack

### Frontend
- **React 19.2** - UI framework
- **TypeScript 5.8** - Type safety
- **TipTap** - Rich text editor
- **Tailwind CSS** - Styling
- **React Markdown** - Markdown rendering

### AI Integration
- **Google Gemini AI** - Default AI provider
- Support for OpenAI and Claude APIs

### Desktop
- **Electron 33.2** - Desktop application framework
- **Electron Builder** - Package and distribute

### Build Tools
- **Vite 6.2** - Lightning-fast build tool
- **TypeScript** - Type checking
- **PostCSS** - CSS processing

### Utilities
- **jsPDF** - PDF generation
- **Marked** - Markdown parsing
- **Remark GFM** - GitHub Flavored Markdown

## 📦 Project Structure

```
neural-pad/
├── src/
│   ├── components/      # React components
│   │   ├── Editor.tsx
│   │   ├── Chat.tsx
│   │   ├── NotesSidebar.tsx
│   │   └── ...
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript definitions
│   └── App.tsx         # Main application
├── electron/           # Electron main process
├── public/            # Static assets
├── build/             # Build artifacts
└── package.json
```

## 🔑 API Configuration

### Google Gemini (Default)
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Enter in Settings → API Provider → Gemini

### OpenAI
1. Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Enter in Settings → API Provider → OpenAI

### Claude
1. Get API key from [Anthropic Console](https://console.anthropic.com/)
2. Enter in Settings → API Provider → Claude

## ⌨️ Keyboard Shortcuts

- `Ctrl+S` / `Cmd+S` - Save current note
- `Ctrl+B` - Bold text
- `Ctrl+I` - Italic text
- `Ctrl+U` - Underline text

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [TipTap](https://tiptap.dev/) - Excellent headless editor
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI capabilities
- [Electron](https://www.electronjs.org/) - Cross-platform desktop apps
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📧 Contact

Project Link: [https://github.com/kibrit74/neural-pad](https://github.com/kibrit74/neural-pad)

---

Made with ❤️ by kibrit74
