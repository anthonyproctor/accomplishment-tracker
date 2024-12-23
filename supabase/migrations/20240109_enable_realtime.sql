-- Enable real-time for accomplishments table
alter publication supabase_realtime add table accomplishments;

-- Enable row level security for real-time
alter table accomplishments replica identity full;
