import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureProfile(user: User): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("id, email, display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return data as Profile;

  const insert = {
    id: user.id,
    email: user.email ?? null,
    display_name:
      (user.user_metadata?.["display_name"] as string | undefined) ??
      (user.user_metadata?.["full_name"] as string | undefined) ??
      null,
    avatar_url: null,
  };
  const { data: created } = await supabase
    .from("profiles")
    .insert(insert)
    .select("id, email, display_name, avatar_url")
    .maybeSingle();
  return (created as Profile | null) ?? null;
}

export async function logAccountEvent(
  user: User,
  eventType: "signup" | "login" | "avatar_changed" | "profile_updated",
) {
  await supabase
    .from("account_events")
    .insert({ user_id: user.id, email: user.email ?? null, event_type: eventType });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
      if (nextSession?.user) {
        void ensureProfile(nextSession.user).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      if (data.session?.user) void ensureProfile(data.session.user).then(setProfile);
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    setProfile(await ensureProfile(data.user));
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      loading,
      refreshProfile,
      signOut,
    }),
    [session, profile, loading, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
