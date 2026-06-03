import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://vgykpybqwtxfugqcyqmw.supabase.co',
  'sb_publishable_2HQEF4dZ3PzytVZwFa5OzQ_CIY4kxi7'
)

/*
  Required Supabase table (run in SQL editor):

  CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    trial_start TIMESTAMPTZ DEFAULT NOW(),
    is_subscribed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

  CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

  CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);
*/
