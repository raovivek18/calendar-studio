# Calendar studio

**Calendar studio is an open-source project!** A minimalist, modern social media planning and task scheduling dashboard, built as a production-ready SaaS application.

**Live Demo:** [https://calendar-studio-one.vercel.app](https://calendar-studio-one.vercel.app)

## Features

- **Authentication:** Powered by Clerk (Next.js App Router).
- **Database:** Supabase PostgreSQL with Edge Functions for all data mutations.
- **Drag & Drop Calendar:** Built with `@dnd-kit/core` with optimistic UI updates and beautiful drag overlays.
- **Global Command Palette:** Hit `Cmd+K` from anywhere to quickly navigate or search posts.
- **Global Shortcuts:** Press `N` to quickly open the New Post dialog. Press `/` to search.
- **Accessibility:** Fully accessible interface with `aria-labels`, focus management, and keyboard navigation.
- **Performance Optimized:** Memoized React components and optimized TanStack Query settings.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Auth:** Clerk
- **Backend:** Supabase + Deno Edge Functions
- **State:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React

## Setup & Local Development

### 1. Environment Variables

Copy the provided `.env.example` file to create your local `.env.local` file:

```bash
cp .env.example .env.local
```

You will need to fill in the keys from both [Clerk](https://clerk.com) (for Authentication) and [Supabase](https://supabase.com) (for Database) in your new `.env.local` file.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Edge Functions

All database writes are handled securely via Supabase Edge Functions.

To test Edge Functions locally, make sure you have the Supabase CLI installed, then run:

```bash
supabase start
supabase functions serve
```

*Note: Make sure to push the Supabase database migrations before running locally.*

## Production Deployment

This project is optimized for deployment on Vercel. 

1. Push your code to a GitHub repository.
2. Import the project in Vercel.
3. Add the environment variables from your `.env.local` file.
4. Deploy!
