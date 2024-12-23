-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null,
  name text,
  constraint profiles_email_key unique (email)
);

-- Create accomplishments table
create table if not exists public.accomplishments (
  id uuid default gen_random_uuid() primary key not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text not null,
  date date not null,
  user_id uuid references public.profiles(id) on delete cascade not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.accomplishments enable row level security;

-- Create policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can view own accomplishments"
  on public.accomplishments for select
  using (auth.uid() = user_id);

create policy "Users can insert own accomplishments"
  on public.accomplishments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own accomplishments"
  on public.accomplishments for update
  using (auth.uid() = user_id);

create policy "Users can delete own accomplishments"
  on public.accomplishments for delete
  using (auth.uid() = user_id);

-- Create function to handle new user profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set up realtime
alter publication supabase_realtime add table public.accomplishments;
