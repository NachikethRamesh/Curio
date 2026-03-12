# Curio

**Linktree, but for your X tweets.**

Curio lets creators organize their best tweets into topic-based collections and share them through a single profile link. Instead of letting the timeline bury your work, Curio gives you a permanent, curated showcase — organized by theme, not by time.

## The Problem

Feed-based social platforms force content into chronological order. Great threads on hiring, marketing frameworks, or technical insights get buried within days. Creators resort to periodic recap posts just to keep things visible. Curio fixes this.

## How It Works

1. **Sign up** — claim your username with your X handle
2. **Create collections** — named topic buckets like "Hiring Advice" or "Marketing Frameworks"
3. **Paste your tweet URLs** — add your tweets to collections. Curio fetches and renders them as rich embeds.
4. **Drag to reorder** — arrange tweets and collections in exactly the order you want
5. **Share your profile** — one link in your bio, all your best content, always accessible

Only your own tweets can be saved — Curio verifies handle ownership at signup and enforces it on every import.

## Features

- **Own-tweets-only verification** — X handle verified at signup, enforced on every import
- **Rich tweet embeds** — live Twitter widgets rendered via `twttr.widgets.createTweet()`
- **Drag-and-drop reordering** — @dnd-kit powered reordering for tweets within collections
- **Dynamic OG images** — auto-generated social preview cards for profiles and collections (edge runtime)
- **Social sharing** — share on X or copy link with one click
- **Collection URL slugs** — clean, readable URLs (`/username/hiring-advice` instead of UUIDs)
- **Glassmorphic design** — warm glass aesthetic with DM Sans + Newsreader font pairing, animated gradient background
- **Fully mobile responsive** — optimized layouts across all breakpoints (mobile, tablet, desktop)
- **SEO-ready** — server-rendered public pages with Open Graph and Twitter Card meta tags
- **Near-zero cost** — free oEmbed API, Supabase free tier, Vercel hobby plan

## Tech Stack

| Layer        | Technology              | Purpose                                          |
|--------------|-------------------------|--------------------------------------------------|
| Framework    | Next.js 16 (App Router) | SSR for public profiles, React SPA for dashboard |
| Language     | TypeScript              | Type safety across frontend and API routes        |
| Styling      | Tailwind CSS 4          | Utility-first CSS with responsive breakpoints     |
| Auth         | Supabase Auth           | Email/password authentication                     |
| Database     | Supabase PostgreSQL     | Relational store with Row Level Security          |
| Tweet Data   | X oEmbed API (free)     | Fetch tweet embeds — no API key required          |
| Drag & Drop  | @dnd-kit                | Sortable tweet cards with pointer sensor          |
| Fonts        | DM Sans + Newsreader    | Sans-serif body + serif italic headings           |
| Hosting      | Vercel                  | Edge deployment with automatic CI/CD              |

## Project Structure

```
src/
├── app/
│   ├── page.tsx                              # Landing page (hero, how-it-works, features, CTA)
│   ├── layout.tsx                            # Root layout (DM Sans + Newsreader fonts)
│   ├── globals.css                           # Design tokens, animated gradient background
│   ├── login/page.tsx                        # Login form
│   ├── signup/page.tsx                       # Signup with X handle input
│   ├── dashboard/
│   │   ├── layout.tsx                        # Forces dynamic rendering
│   │   ├── page.tsx                          # Collections dashboard (CRUD)
│   │   └── collections/[id]/page.tsx         # Collection editor (drag-and-drop, add/remove tweets)
│   ├── [username]/
│   │   ├── page.tsx                          # Public profile (SSR)
│   │   ├── opengraph-image.tsx               # Dynamic OG image for profiles (edge)
│   │   └── [collection]/
│   │       ├── page.tsx                      # Public collection view (SSR)
│   │       └── opengraph-image.tsx           # Dynamic OG image for collections (edge)
│   └── api/
│       ├── auth/callback/route.ts            # Supabase auth callback
│       └── tweets/fetch/route.ts             # oEmbed fetcher + ownership check + DB caching
├── components/
│   ├── TweetCard.tsx                         # Renders live tweet embeds via Twitter widgets.js
│   ├── CollectionCard.tsx                    # Collection preview card with hover effects
│   ├── CollectionDropdown.tsx                # Collection switcher dropdown (nav)
│   ├── ShareButton.tsx                       # Share on X / copy link dropdown
│   └── LandingNav.tsx                        # Auth-aware landing page nav
├── lib/
│   ├── supabase/
│   │   ├── client.ts                         # Browser client
│   │   ├── server.ts                         # Server client (cookies-based)
│   │   └── middleware.ts                     # Session refresh + route protection
│   └── utils.ts                              # Tweet URL parsing, slug generation, handle utilities
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

## Design System

Curio uses a warm glassmorphic aesthetic:

- **Fonts**: DM Sans (body/UI) + Newsreader (italic serif headings and logo)
- **Palette**: warm off-white base (`#fcfaf8`), dark brown text (`#2a2826`), muted brown secondary (`#787470`)
- **Cards**: frosted glass (`bg-white/75 backdrop-blur-[24px]`) with white borders and soft shadows
- **Nav**: floating glass pill, centered horizontally, rounded-full with backdrop blur
- **Background**: animated radial gradient with slow breathing keyframe animation
- **Tweet cards**: alternating mint/sky glass tints
- **Responsive**: 3-breakpoint system (mobile-first, `sm:640px`, `lg:1024px`)

## Key Design Decisions

### Own Tweets Only + Handle Verification

Curio is for showcasing **your own** body of work. During signup, users provide their X handle. Every tweet import checks authorship via oEmbed — the API returns the tweet's author, and we compare it to the stored handle.

This prevents impersonation and keeps profiles authentic without requiring X OAuth.

### oEmbed Instead of X API

The X API Basic tier costs $200/month. The [oEmbed endpoint](https://developer.x.com/en/docs/x-for-websites/oembed-api) is completely free and requires no authentication. Trade-off: we get rendered HTML embeds instead of structured data (no raw metrics), but the visual result is identical to embedded tweets elsewhere on the web. This brings operating costs to near-zero.

### Live Tweet Rendering

Tweet embeds are rendered client-side via Twitter's `widgets.js` library (`twttr.widgets.createTweet()`). This fetches the latest tweet appearance directly from Twitter, ensuring up-to-date styling, engagement counts, and media. The oEmbed HTML stored in the database serves as a fallback reference.

### Row Level Security

All tables have RLS policies. Users can only modify their own data. Public profiles and collections are readable by anyone. The middleware layer handles session refresh and route protection (redirecting unauthenticated users away from `/dashboard`).

## Routes

| Route                             | Type    | Description                                    |
|-----------------------------------|---------|------------------------------------------------|
| `/`                               | Static  | Landing page                                   |
| `/login`                          | Static  | Login form                                     |
| `/signup`                         | Static  | Signup with X handle input                     |
| `/dashboard`                      | Dynamic | Collections manager (auth required)            |
| `/dashboard/collections/[id]`     | Dynamic | Collection editor with drag-and-drop (auth required) |
| `/[username]`                     | Dynamic | Public profile (SSR) + dynamic OG image        |
| `/[username]/[collection]`        | Dynamic | Public collection view (SSR) + dynamic OG image |
| `/api/auth/callback`              | API     | Supabase auth callback                         |
| `/api/tweets/fetch`               | API     | Fetch, verify ownership, cache tweet via oEmbed |

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
