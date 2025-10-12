# Dealtown

A modern web application for discovering local deals and fuel prices, built with Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Features

- 🎯 Browse active local deals from restaurants, bars, and venues
- ⛽ Check current fuel prices at nearby gas stations
- 📱 Responsive design with modern UI components
- 🔐 Server-side data fetching with Supabase
- 🎨 Beautiful UI built with Tailwind CSS and shadcn/ui
- 🚀 Built on Next.js 14 App Router with TypeScript

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Database:** Supabase (PostgreSQL)
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd dealtown
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Project Settings > API to find your project URL and anon key
   - Run the migration to create the database schema:
     - Go to the SQL Editor in your Supabase dashboard
     - Copy and paste the contents of `supabase/migrations/0001_init.sql`
     - Execute the query
   - Optionally, seed the database with sample data:
     - Copy and paste the contents of `supabase/seed/seed.sql`
     - Execute the query

4. **Configure environment variables**

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
dealtown/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── DealCard.tsx       # Deal display card
│   │   ├── SiteHeader.tsx     # Site header/navigation
│   │   └── SiteFooter.tsx     # Site footer
│   └── lib/                   # Utility functions
│       ├── supabase/          # Supabase client utilities
│       ├── types.ts           # TypeScript type definitions
│       └── utils.ts           # Helper functions
├── supabase/
│   ├── migrations/            # Database migrations
│   └── seed/                  # Seed data
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
└── next.config.mjs
```

## Database Schema

### Tables

- **venues**: Local businesses and establishments
- **deals**: Special offers and promotions from venues
- **fuel_prices**: Current gas prices from local stations

See `supabase/migrations/0001_init.sql` for the complete schema definition.

## Features to Implement

This is a minimal working scaffold. Consider adding:

- User authentication (Supabase Auth)
- Deal search and filtering
- Location-based features (geocoding, maps)
- Admin CRUD operations for managing venues and deals
- Deal categories and tags
- User favorites and saved deals
- Email notifications for new deals
- Mobile app (React Native)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project to Vercel
3. Add your environment variables
4. Deploy!

### Other Platforms

This is a standard Next.js app and can be deployed to any platform that supports Node.js:

- Netlify
- Railway
- Render
- Self-hosted with PM2

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
