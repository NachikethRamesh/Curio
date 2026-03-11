# Curio

**Linktree, but for your X tweets.**

Curio lets creators organize their best tweets into topic-based collections and share them through a single profile link. Instead of letting the timeline bury your work, Curio gives you a permanent, curated showcase — organized by theme, not by time.

## The Problem

Feed-based social platforms force content into chronological order. Great threads on hiring, marketing frameworks, or technical insights get buried within days. Creators resort to periodic recap posts just to keep things visible. Curio fixes this.

## How It Works

1. **Sign up** — claim your username and verify your X handle by pasting one of your tweets
2. **Create collections** — named topic buckets like "Hiring Advice" or "Marketing Frameworks"
3. **Paste your tweet URLs** — add your tweets to collections. Curio fetches and caches the embed.
4. **Share your profile** — one link in your bio, all your best content, always accessible

Only your own tweets can be saved — Curio verifies handle ownership at signup and enforces it on every import.

## Tech Stack

| Layer      | Technology                | Purpose                                       |
|------------|---------------------------|-----------------------------------------------|
| Framework  | Next.js 16 (App Router)   | SSR for public profiles, React SPA for dashboard |
| Language   | TypeScript                | Type safety across frontend and API routes     |
| Styling    | Tailwind CSS 4            | Utility-first CSS                              |
| Auth       | Supabase Auth             | Email/password authentication                  |
| Database   | Supabase PostgreSQL       | Relational store with Row Level Security       |
| Tweet Data | X oEmbed API (free)       | Fetch tweet embeds — no API key required       |
| Hosting    | Vercel                    | Edge deployment with automatic CI/CD           |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                              # Landing page
│   ├── layout.tsx                            # Root layout
│   ├── globals.css                           # Global styles + CSS variables
│   ├── login/page.tsx                        # Login form
│   ├── signup/page.tsx                       # Signup with X handle verification
│   ├── dashboard/
│   │   ├── layout.tsx                        # Forces dynamic rendering
│   │   ├── page.tsx                          # Collections dashboard (CRUD)
│   │   └── collections/[id]/page.tsx         # Collection editor (add/remove tweets)
│   ├── [username]/
│   │   ├── page.tsx                          # Public profile (SSR)
│   │   └── [collection]/page.tsx             # Public collection view (SSR)
│   └── api/
│       ├── auth/callback/route.ts            # Supabase auth callback
│       └── tweets/fetch/route.ts             # oEmbed fetcher + ownership check + DB caching
├── components/
│   ├── TweetCard.tsx                         # Renders tweet embeds via Twitter widgets
│   ├── CollectionCard.tsx                    # Collection preview card
│   ├── CollectionDropdown.tsx                # Collection switcher dropdown
│   ├── ShareButton.tsx                       # Share on X / copy link dropdown
│   └── LandingNav.tsx                        # Auth-aware landing page nav
├── lib/
│   ├── supabase/
│   │   ├── client.ts                         # Browser client
│   │   ├── server.ts                         # Server client (cookies-based)
│   │   └── middleware.ts                     # Session refresh + route protection
│   └── utils.ts                              # Tweet URL parsing, oEmbed fetcher, handle utilities
├── types/
│   └── index.ts                              # TypeScript interfaces
└── middleware.ts                              # Next.js middleware entry point

supabase/
└── migrations/
    └── 001_initial_schema.sql                # Tables, RLS policies, indexes
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A [Supabase](https://supabase.com) account (free tier works)

### 1. Install dependencies

```bash
cd curio
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor** and run the contents of `supabase/migrations/001_initial_schema.sql`
3. Then run: `alter table public.profiles add column x_handle text;`
4. Go to **Authentication > Providers > Email** and turn off "Confirm email" (for development)
5. Under **Authentication > URL Configuration**, set the Site URL to `http://localhost:3000` and add `http://localhost:3000/api/auth/callback` to the Redirect URLs

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials (found in **Settings > API**):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Schema

Four tables with Row Level Security enabled on all:

**profiles** — User accounts with verified X handle

| Column       | Type        | Notes                       |
|--------------|-------------|-----------------------------|
| id           | uuid        | PK, references `auth.users` |
| username     | text        | Unique, URL slug            |
| display_name | text        |                             |
| bio          | text        |                             |
| avatar_url   | text        |                             |
| x_handle     | text        | Verified X handle (without @) |
| created_at   | timestamptz | Default `now()`             |

**collections** — Topic buckets owned by a user

| Column      | Type        | Notes                      |
|-------------|-------------|----------------------------|
| id          | uuid        | PK, auto-generated         |
| user_id     | uuid        | FK -> profiles             |
| name        | text        | Not null                   |
| slug        | text        | URL-safe name (e.g. `tech_tweets`) |
| description | text        | Optional                   |
| emoji       | text        | Optional icon              |
| position    | int         | Display order              |
| is_public   | boolean     | Default `true`             |
| created_at  | timestamptz | Default `now()`            |

**tweets** — Cached tweet data from oEmbed

| Column        | Type        | Notes               |
|---------------|-------------|----------------------|
| id            | text        | PK, tweet ID from X |
| author_handle | text        | From oEmbed          |
| author_name   | text        | Display name         |
| embed_html    | text        | Full oEmbed HTML     |
| tweet_url     | text        | Original URL         |
| fetched_at    | timestamptz | When we cached it    |

**collection_tweets** — Junction table

| Column        | Type        | Notes                           |
|---------------|-------------|---------------------------------|
| id            | uuid        | PK, auto-generated              |
| collection_id | uuid        | FK -> collections               |
| tweet_id      | text        | FK -> tweets                    |
| position      | int         | Display order within collection |
| added_at      | timestamptz | Default `now()`                 |

Unique constraint on `(collection_id, tweet_id)` prevents duplicates.

## Key Design Decisions

### Own Tweets Only + Handle Verification

Curio is for showcasing **your own** body of work. During signup, users provide their X handle and prove ownership by pasting a link to one of their own tweets. The oEmbed API returns the tweet's author — we compare it to the claimed handle. Every subsequent tweet import is also checked against the stored handle.

This prevents impersonation and keeps profiles authentic without requiring X OAuth.

### oEmbed Instead of X API

The X API Basic tier costs $200/month. The [oEmbed endpoint](https://developer.x.com/en/docs/x-for-websites/oembed-api) is completely free and requires no authentication. Trade-off: we get rendered HTML embeds instead of structured data (no raw metrics), but the visual result is identical to embedded tweets elsewhere on the web. This brings operating costs to near-zero.

### Fetch Once, Cache Forever

When a user pastes a tweet URL, we call oEmbed once and store the HTML in our database. All subsequent page loads serve from the cache. This means:

- Near-zero ongoing API usage
- Fast page loads (no external calls on render)
- Tweets remain visible even if the original is deleted (cached HTML persists)

### Row Level Security

All tables have RLS policies. Users can only modify their own data. Public profiles and collections are readable by anyone. The middleware layer handles session refresh and route protection (redirecting unauthenticated users away from `/dashboard`).

## Routes

| Route                             | Type    | Description                                    |
|-----------------------------------|---------|------------------------------------------------|
| `/`                               | Static  | Landing page                                   |
| `/login`                          | Static  | Login form                                     |
| `/signup`                         | Static  | Signup with X handle verification              |
| `/dashboard`                      | Dynamic | Collections manager (auth required)            |
| `/dashboard/collections/[id]`     | Dynamic | Collection editor (auth required)              |
| `/[username]`                     | Dynamic | Public profile with verified X handle (SSR)    |
| `/[username]/[collection]`        | Dynamic | Public collection view (SSR)                   |
| `/api/auth/callback`              | API     | Supabase auth callback                         |
| `/api/tweets/fetch`               | API     | Fetch, verify ownership, cache tweet via oEmbed|

## Deployment

### Vercel (Recommended)

1. Push the repo to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard
4. Deploy

### Production Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Update your Supabase project's **Authentication > URL Configuration**:
- Set **Site URL** to your production domain
- Add `https://yourdomain.com/api/auth/callback` to **Redirect URLs**

## License

MIT
