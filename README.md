# Tinti.art 🎨

A collaborative pixel art editor with real-time synchronization and animation features. Create, share, and collaborate on pixel art projects with powerful tools and an intuitive interface.

## ✨ Features

### Core Features
- **Pixel Art Editor**: Professional pixel art creation tools with layers support
- **Real-time Collaboration**: Multiple users can work on the same project simultaneously using Ably WebSocket
- **Animation System**: Create animated sprites with frame-by-frame editing
  - Multiple frames support with customizable duration
  - Configurable FPS (1-30 fps)
  - Frame navigation and playback controls
  - Export animations as PNG sequences
- **Layer Management**: Multiple layers with opacity, blend modes, and visibility controls
- **Advanced Tools**: 
  - Drawing tools (pencil, eraser, fill, eyedropper)
  - Shape tools (line, rectangle, circle)
  - Selection and transform tools
  - Color palette management
  - Symmetry modes

### Project Management
- **Projects & Folders**: Organize your work with folders and subfolders
- **Public Gallery**: Share your creations with the community
- **Project Settings**: Control visibility, collaboration, and permissions
- **Import/Export**: Save and load projects in various formats
- **Thumbnails**: Auto-generated project previews

### Collaboration
- **Real-time Sync**: See changes from other users instantly
- **User Presence**: View who's currently working on a project
- **Cursor Tracking**: See where other users are editing
- **Folder Collaboration**: Share entire folders with team members
- **Permission Roles**: Owner, Editor, and Viewer roles

### Community Features
- **User Profiles**: Customizable profiles with avatars and bios
- **Comments**: Discuss projects with the community
- **Likes & Views**: Track project popularity
- **Explore Page**: Discover popular and recent projects
- **Multi-language Support**: Interface available in multiple languages

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom components
- **UI Components**: 
  - Radix UI primitives
  - Material-UI icons
  - Framer Motion for animations
- **Real-time**: Ably for WebSocket connections
- **Database**: Neon (Serverless PostgreSQL)
- **Authentication**: JWT-based authentication with bcrypt
- **State Management**: React Context API
- **Build Tools**: Turbopack (Next.js dev mode)

## 📦 Installation

### Prerequisites

- Node.js 18.x or higher
- npm, pnpm, or bun package manager
- A Neon database (or PostgreSQL compatible database)
- Ably account for real-time features

### Setup

1. Clone the repository:
```bash
git clone https://github.com/ArubikU/tinti.git
cd tinti
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
# or
bun install
```

3. Set up environment variables:

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Ably Configuration (Required for real-time collaboration)
NEXT_PUBLIC_ABLY_API_KEY=your-ably-api-key-here

# Database Configuration (Required)
DATABASE_URL=your-neon-database-url-here

# Auth Configuration (Required for authentication)
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=http://localhost:3000
```

4. Set up the database:

Run the database initialization script:
```bash
# Execute the SQL files in the scripts directory
psql $DATABASE_URL -f scripts/001-init-database.sql
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## 🎯 Usage

### Creating Your First Project

1. **Sign Up/Login**: Create an account or log in
2. **Create Project**: Click "New Project" and set canvas size
3. **Start Drawing**: Use the tools palette to create your pixel art
4. **Add Layers**: Create multiple layers for complex artwork
5. **Save**: Projects auto-save as you work

### Creating Animations

1. **Open Project**: Open any existing project or create a new one
2. **Open Frames Panel**: Click the Film icon in the toolbar
3. **Add Frames**: Click "Add Frame" to create new animation frames
4. **Configure Timing**: Adjust FPS and frame duration
5. **Preview**: Click Play to preview your animation
6. **Export**: Use the Export button to download as PNG sequence

### Collaboration

1. **Enable Collaboration**: In project settings, enable "Collaborative"
2. **Share Link**: Share the project URL with collaborators
3. **Real-time Editing**: All users can edit simultaneously
4. **See Cursors**: View where other users are working

### Folder Organization

1. **Create Folders**: Organize projects into folders
2. **Nested Folders**: Create subfolders for better organization
3. **Share Folders**: Invite collaborators to entire folders
4. **Color & Icons**: Customize folder appearance

## 🛠️ Development

### Available Scripts

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# WebSocket server (local development)
npm run ws
```

### Project Structure

```
tinti/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin panel
│   ├── p/                 # Project pages
│   └── page.tsx           # Main application
├── components/            # React components
│   ├── editor/           # Editor-specific components
│   ├── export/           # Export functionality
│   ├── gallery/          # Gallery components
│   ├── ui/               # UI components
│   └── views/            # Main views
├── contexts/             # React contexts
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── database.ts       # Database types and queries
│   ├── pixel-engine.ts   # Pixel art engine
│   ├── websocket.ts      # WebSocket client
│   └── language.ts       # i18n support
├── public/               # Static assets
│   ├── icons/           # App icons
│   └── lang/            # Language files
├── server/              # Backend servers
│   └── websocket.js     # WebSocket server
├── scripts/             # Database scripts
└── styles/              # Global styles
```

### Key Technologies

- **Pixel Engine**: Custom canvas-based rendering engine with layer support
- **WebSocket**: Real-time synchronization using Ably or local WebSocket server
- **Database**: Serverless PostgreSQL with Neon for scalability
- **Compression**: pako for efficient data compression
- **PWA**: Progressive Web App support with service workers

## 🔧 Configuration

### Ably Setup

1. Sign up at [ably.com](https://ably.com)
2. Create a new application
3. Copy your API key
4. Add to `.env.local` as `NEXT_PUBLIC_ABLY_API_KEY`

### Database Setup

The application uses Neon (serverless PostgreSQL). You can also use any PostgreSQL-compatible database.

Required tables:
- `users`: User accounts and profiles
- `projects`: Pixel art projects
- `folders`: Project organization
- `folder_collaborators`: Folder sharing
- `project_collaborators`: Project sharing
- `comments`: Project comments
- `likes`: Project likes
- `reports`: Content moderation

See `scripts/001-init-database.sql` for the complete schema.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_ABLY_API_KEY` | Ably API key for real-time features | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for JWT token signing | Yes |
| `NEXTAUTH_URL` | Base URL of the application | Yes |

## 📝 Documentation

Additional documentation is available in the repository:

- [Ably Migration Guide](ABLY_MIGRATION.md) - WebSocket migration documentation
- [Animation Features](ANIMATION_FEATURE.md) - Animation system documentation
- [Frame Sync](FRAME_SYNC_DOCUMENTATION.md) - Frame synchronization details
- [Color Replace](COLOR_REPLACE_DOCUMENTATION.md) - Color replacement tool
- [Palette Enhancements](PALETTE_ENHANCEMENTS.md) - Color palette features
- [Language Implementation](LANGUAGE_IMPLEMENTATION.md) - i18n system

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [Radix UI](https://www.radix-ui.com/)
- Real-time powered by [Ably](https://ably.com/)
- Database by [Neon](https://neon.tech/)
- Icons from [Lucide](https://lucide.dev/)

## 📞 Support

For support, please open an issue in the GitHub repository.

---

Made with ❤️ by the Tinti.art community
