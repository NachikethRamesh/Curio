-- Curio: Initial database schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

-- 1. Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Collections table
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  emoji text,
  position int not null default 0,
  is_public boolean default true,
  created_at timestamptz default now()
);

-- 3. Tweets table (cached tweet data from oEmbed)
create table if not exists public.tweets (
  id text primary key,
  author_handle text,
  author_name text,
  content text,
  embed_html text,
  tweet_url text not null,
  created_at timestamptz,
  fetched_at timestamptz default now()
);

-- 4. Collection-Tweets junction table
create table if not exists public.collection_tweets (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid references public.collections(id) on delete cascade not null,
  tweet_id text references public.tweets(id) not null,
  position int not null default 0,
  added_at timestamptz default now(),
  unique(collection_id, tweet_id)
);

-- ═══════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.tweets enable row level security;
alter table public.collection_tweets enable row level security;

-- Profiles: anyone can read, owners can update
create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Collections: public ones readable by all, owners can CRUD
create policy "Public collections are viewable by everyone"
  on public.collections for select using (is_public = true or auth.uid() = user_id);

create policy "Users can create their own collections"
  on public.collections for insert with check (auth.uid() = user_id);

create policy "Users can update their own collections"
  on public.collections for update using (auth.uid() = user_id);

create policy "Users can delete their own collections"
  on public.collections for delete using (auth.uid() = user_id);

-- Tweets: anyone can read (they're public tweets), authenticated users can insert
create policy "Tweets are viewable by everyone"
  on public.tweets for select using (true);

create policy "Authenticated users can insert tweets"
  on public.tweets for insert with check (auth.role() = 'authenticated');

-- Collection_tweets: viewable if collection is visible, owners can manage
create policy "Collection tweets are viewable if collection is accessible"
  on public.collection_tweets for select using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id
      and (c.is_public = true or c.user_id = auth.uid())
    )
  );

create policy "Users can add tweets to their collections"
  on public.collection_tweets for insert with check (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  );

create policy "Users can remove tweets from their collections"
  on public.collection_tweets for delete using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  );

create policy "Users can reorder tweets in their collections"
  on public.collection_tweets for update using (
    exists (
      select 1 from public.collections c
      where c.id = collection_id and c.user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════
-- Indexes
-- ═══════════════════════════════════════════════════════

create index if not exists idx_collections_user_id on public.collections(user_id);
create index if not exists idx_collections_position on public.collections(user_id, position);
create index if not exists idx_collection_tweets_collection on public.collection_tweets(collection_id, position);
create index if not exists idx_profiles_username on public.profiles(username);
