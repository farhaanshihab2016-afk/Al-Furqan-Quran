CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.account_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email text,
  event_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.account_events TO authenticated;
GRANT ALL ON public.account_events TO service_role;
ALTER TABLE public.account_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own account events" ON public.account_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can log their own account events" ON public.account_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Users can read their own avatar" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);