-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text not null,
  role text not null check (role in ('organizer', 'attendee')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  primary key (id)
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create events table
create table public.events (
  id uuid default gen_random_uuid() not null primary key,
  organizer_id uuid not null references public.profiles on delete cascade,
  title text not null,
  description text not null,
  date timestamp with time zone not null,
  location text not null,
  image_url text,
  category text not null default 'OTHER',
  is_published boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.events enable row level security;

create policy "Anyone can view published events."
  on events for select
  using ( is_published = true );

create policy "Organizers can view their own events."
  on events for select
  using ( auth.uid() = organizer_id );

create policy "Organizers can insert their own events."
  on events for insert
  with check ( auth.uid() = organizer_id );

create policy "Organizers can update their own events."
  on events for update
  using ( auth.uid() = organizer_id );

create policy "Organizers can delete their own events."
  on events for delete
  using ( auth.uid() = organizer_id );

-- Create ticket_tiers table
create table public.ticket_tiers (
  id uuid default gen_random_uuid() not null primary key,
  event_id uuid not null references public.events on delete cascade,
  name text not null,
  price numeric not null,
  quantity integer not null,
  sold integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.ticket_tiers enable row level security;

create policy "Anyone can view ticket tiers for published events."
  on ticket_tiers for select
  using ( exists (
    select 1 from events
    where events.id = ticket_tiers.event_id
    and events.is_published = true
  ));

create policy "Organizers can view ticket tiers for their events."
  on ticket_tiers for select
  using ( exists (
    select 1 from events
    where events.id = ticket_tiers.event_id
    and events.organizer_id = auth.uid()
  ));

create policy "Organizers can insert ticket tiers for their events."
  on ticket_tiers for insert
  with check ( exists (
    select 1 from events
    where events.id = ticket_tiers.event_id
    and events.organizer_id = auth.uid()
  ));

create policy "Organizers can update ticket tiers for their events."
  on ticket_tiers for update
  using ( exists (
    select 1 from events
    where events.id = ticket_tiers.event_id
    and events.organizer_id = auth.uid()
  ));

-- Create orders table
create table public.orders (
  id uuid default gen_random_uuid() not null primary key,
  user_id uuid not null references public.profiles on delete cascade,
  event_id uuid not null references public.events on delete cascade,
  ticket_tier_id uuid not null references public.ticket_tiers on delete cascade,
  quantity integer not null,
  total_price numeric not null,
  status text not null check (status in ('pending', 'completed', 'cancelled')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.orders enable row level security;

create policy "Users can view their own orders."
  on orders for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own orders."
  on orders for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own orders."
  on orders for update
  using ( auth.uid() = user_id );

create policy "Organizers can view orders for their events."
  on orders for select
  using ( exists (
    select 1 from events
    where events.id = orders.event_id
    and events.organizer_id = auth.uid()
  ));

create policy "Organizers can update orders for their events."
  on orders for update
  using ( exists (
    select 1 from events
    where events.id = orders.event_id
    and events.organizer_id = auth.uid()
  ));

-- Create RPC function to increment ticket sold
create or replace function public.increment_ticket_sold(tier_id uuid, increment_amount integer)
returns void
language plpgsql
as $$
begin
  update public.ticket_tiers
  set sold = sold + increment_amount
  where id = tier_id;
end;
$$;

-- Set up realtime
alter publication supabase_realtime add table events, ticket_tiers, orders;

-- Create storage bucket for event images
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true);

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'event-images' );

create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'event-images' and auth.role() = 'authenticated' );

create policy "Users can update their own objects"
  on storage.objects for update
  using ( bucket_id = 'event-images' and auth.uid() = owner );

create policy "Users can delete their own objects"
  on storage.objects for delete
  using ( bucket_id = 'event-images' and auth.uid() = owner );
