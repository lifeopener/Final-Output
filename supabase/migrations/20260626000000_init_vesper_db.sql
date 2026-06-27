-- Enable pgvector extension
create extension if not exists vector with schema extensions;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  avatar_url text,
  full_name text
);

-- Set up RLS on profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Create heritage_logs table for vector storage
create table public.heritage_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  content text not null,
  embedding vector(1536), -- OpenAI gpt-4o-mini embeddings are 1536 dims
  created_at timestamp with time zone default now()
);

-- Set up RLS on heritage_logs
alter table public.heritage_logs enable row level security;
create policy "Users can view own logs." on heritage_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs." on heritage_logs for insert with check (auth.uid() = user_id);
