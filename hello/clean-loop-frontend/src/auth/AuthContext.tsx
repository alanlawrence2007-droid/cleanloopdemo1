import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, setUnauthorizedHandler, tokenStore } from "../api/client";
import type { Role, User } from "../api/types";

// The app opens straight away – there is no login screen.
// Pages that call protected endpoints (complaints, analytics) need a JWT from the backend.
// To have those work without anyone typing credentials, set VITE_DEMO_EMAIL / VITE_DEMO_PASSWORD
// (the app then signs in silently in the background). NOTE: values prefixed VITE_ are public in the bundle.
const DEMO_EMAIL = import.meta.env.VITE_DEMO_EMAIL as string | undefined;
const DEMO_PASSWORD = import.meta.env.VITE_DEMO_PASSWORD as string | undefined;

const now = new Date().toISOString();
const GUEST: User = {
  id: "guest",
  email: "",
  full_name: "Guest",
  phone: null,
  role: "admin", // shows every screen; the API still enforces its own permissions
  is_active: true,
  created_at: now,
  updated_at: now,
};

interface AuthState {
  user: User;
  isGuest: boolean;
  loading: boolean;
  isStaff: boolean;
  hasRole: (...roles: Role[]) => boolean;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      tokenStore.clear();
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        if (!tokenStore.get() && DEMO_EMAIL && DEMO_PASSWORD) {
          tokenStore.set((await api.login(DEMO_EMAIL, DEMO_PASSWORD)).access_token);
        }
        if (tokenStore.get()) setUser(await api.me());
      } catch {
        tokenStore.clear();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const value = useMemo<AuthState>(() => {
    const u = user ?? GUEST;
    return {
      user: u,
      isGuest: !user,
      loading,
      isStaff: u.role === "municipal_staff" || u.role === "admin",
      hasRole: (...roles) => roles.includes(u.role),
    };
  }, [user, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
