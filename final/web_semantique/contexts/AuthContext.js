"use client";
import { createContext, useState, useContext, useEffect } from 'react';
import { initFakeDB, findUser, getUsers, addUser } from '@/lib/fakeDB'; // Added getUsers and addUser

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null); // null = logged out, or 'admin'/'user'/'psychologist'

  useEffect(() => {
    initFakeDB();
    // Check for persisted login (e.g., from localStorage)
    const storedRole = localStorage.getItem('userRole');
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);

  const login = (username, password) => {
    const user = findUser(username, password);
    if (user) {
      setUserRole(user.role);
      localStorage.setItem('userRole', user.role); // Persist role
      return true;
    }
    return false;
  };

  const logout = () => {
    setUserRole(null);
    localStorage.removeItem('userRole');
  };

  const register = (username, password, role) => {
    const users = getUsers();
    if (users.find(u => u.username === username)) {
      return false; // Username taken
    }
    addUser({ username, password, role });
    return true;
  };

  console.log('AuthProvider rendered'); // Add this for debugging – check browser console

  return (
    <AuthContext.Provider value={{ userRole, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};