"use client";

import { createContext, useContext } from "react";
import { authClient } from "@/lib/auth-client";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: string;
  username?: string | null;
  bio?: string | null;
};

interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isPending } = authClient.useSession();

  return (
    <AuthContext.Provider
      value={{
        user: (session?.user as SessionUser | undefined) ?? null,
        loading: isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
