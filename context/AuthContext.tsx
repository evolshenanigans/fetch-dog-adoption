"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  userInfo: {
    name: string;
    email: string;
  } | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Check authentication status on initial load
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
      setIsAuthenticated(true);
    } else if (pathname !== "/" && pathname !== "/login") {
      router.push("/");
    }
  }, [pathname, router]);

  const login = async (name: string, email: string) => {
    try {
      const response = await fetch("https://frontend-take-home-service.fetch.com/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      // Store user info locally
      const user = { name, email };
      localStorage.setItem("userInfo", JSON.stringify(user));
      setUserInfo(user);
      setIsAuthenticated(true);
      router.push("/search");
    } catch (error) {
      console.error("Authentication error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("https://frontend-take-home-service.fetch.com/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Logout failed on server, but proceeding with client logout");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem("userInfo");
      setUserInfo(null);
      setIsAuthenticated(false);
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}