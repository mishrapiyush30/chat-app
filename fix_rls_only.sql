
-- First, check existing policies
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  tablename = 'messages';

-- Drop existing policies if they exist
drop policy if exists "Users can insert their own messages" on public.messages;
drop policy if exists "Users can view all messages" on public.messages;
drop policy if exists "Users can delete their own messages" on public.messages;

-- Create insert policy
create policy "Users can insert their own messages"
  on public.messages for insert
  with check (auth.uid() = user_id);

-- Create select policy
create policy "Users can view all messages"
  on public.messages for select
  using (true);

-- Create delete policy
create policy "Users can delete their own messages"
  on public.messages for delete
  using (auth.uid() = user_id);

