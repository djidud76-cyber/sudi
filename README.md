# Sudi - The Modern Link Infrastructure

Sudi is an open-source, powerful, and beautifully designed alternative for link management, inspired by Dub.co. It provides everything you need to create, manage, and track short links with enterprise-grade features wrapped in a stunning user interface.

**Note:** This application was built using **Bolt**.

## Features

- 🔗 **Advanced Link Management**: Shorten links, add custom slugs, and organize them into folders.
- 🏷️ **Tags & Filtering**: Easily categorize and search through your links using tags.
- 📊 **Detailed Analytics**: Track clicks in real-time, including data on country, city, device, browser, and OS.
- 📱 **QR Codes**: Automatically generate customizable QR codes for every link you create.
- 🔒 **Security & Control**: Protect your links with passwords or set expiration dates.
- 🌐 **Custom Domains**: Connect your own domains to create branded short links.
- 🎨 **Beautiful UI & Dark Mode**: A stunning, modern interface with seamless dark mode support across all pages.
- ⚡ **Lightning Fast**: Built with React, Vite, and Tailwind CSS for instant interactions.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons), Recharts (Analytics)
- **Routing**: React Router v6
- **Backend/Database**: Supabase (PostgreSQL, Auth, RLS)

## Getting Started

Follow these steps to run the project locally.

### 1. Clone & Install
```bash
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and add your Supabase credentials. If you skip this step, the app will run in "Demo Mode" with local storage for theme preferences but backend features will be disabled.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## Database Setup

To enable the backend features, you must execute the provided SQL files in your Supabase project's SQL Editor in this order:

1. `supabase.sql` - Core tables (Profiles, Links, Clicks, QR Codes) and RLS policies.
2. `supabase-v3.sql` - Workspaces, Team Members, Invites, and Subscription Plans.
3. `supabase-folders-plans.sql` - Folders, Tags, Custom Domains support.
4. `supabase-theme-features.sql` - Theme preferences, API keys, Webhooks.

## Development

- `npm run build` - Builds the app for production.
- `npm run lint` - Runs ESLint to check for code issues.
- `npm run preview` - Previews the production build locally.

## License
MIT License
