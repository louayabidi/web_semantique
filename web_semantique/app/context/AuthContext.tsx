"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  username: string;
  role: "admin" | "user" | "psychology";
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  signup: (username: string, password: string, role: "admin" | "user" | "psychology") => boolean;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const getUsers = (): Array<{ username: string; password: string; role: string }> => {
    const storedUsers = localStorage.getItem("users");
    return storedUsers ? JSON.parse(storedUsers) : [];
  };

  const saveUsers = (users: Array<{ username: string; password: string; role: string }>) => {
    localStorage.setItem("users", JSON.stringify(users));
  };

  const login = (username: string, password: string): boolean => {
    const users = getUsers();
    const foundUser = users.find((u) => u.username === username && u.password === password);
    if (foundUser) {
      const userData: User = { username: foundUser.username, role: foundUser.role as User["role"] };
      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));
      router.push("/");
      return true;
    }
    return false;
  };

  const signup = (username: string, password: string, role: "admin" | "user" | "psychology"): boolean => {
    const users = getUsers();
    if (users.some((u) => u.username === username)) {
      return false; // User exists
    }
    const newUser = { username, password, role };
    users.push(newUser);
    saveUsers(users);
    return login(username, password); // Auto-login after signup
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
    router.push("/login");
  };

  return <AuthContext.Provider value={{ user, login, signup, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};