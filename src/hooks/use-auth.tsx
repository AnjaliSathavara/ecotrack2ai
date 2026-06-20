import { useEffect, useState, createContext, useContext, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Represents the user's profile metadata stored in the database.
 */
export type Profile = {
  /** The unique identifier matching the user's Supabase auth ID */
  id: string;
  /** The user's display name or nickname, if set */
  display_name: string | null;
  /** The URL pointing to the user's avatar image, if uploaded */
  avatar_url: string | null;
  /** The ISO timestamp of when the profile was created */
  created_at: string;
};

type AuthCtx = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
});

/**
 * Context provider that manages authentication state, listening to Supabase
 * auth events and keeping the session, user, and profile information in sync.
 *
 * It automatically fetches user profile details from the database when a user is signed in
 * and cleans up session and profile states when the user signs out.
 *
 * @param {object} props - The component props.
 * @param {ReactNode} props.children - The child components that need access to authentication state.
 * @returns {JSX.Element} The provider component wrapping children with the AuthCtx context.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, created_at")
      .eq("id", uid)
      .maybeSingle();
    setProfile(data ?? null);
  };

  useEffect(() => {
    // Listen first
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // defer profile fetch
        setTimeout(() => loadProfile(sess.user.id), 0);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadProfile(data.session.user.id);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) await loadProfile(user.id);
  };

  return (
    <Ctx.Provider value={{ session, user, profile, loading, refreshProfile }}>
      {children}
    </Ctx.Provider>
  );
}

/**
 * Custom hook to access the current authentication state, user metadata,
 * user database profile, loading status, and profile refresh action.
 * Must be wrapped inside an `<AuthProvider>` to function correctly.
 *
 * @returns {AuthCtx} The authentication context state and actions.
 */
export function useAuth() {
  return useContext(Ctx);
}
