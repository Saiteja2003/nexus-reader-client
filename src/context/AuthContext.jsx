// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Read the current session baseline state on initialization
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen to authentication changes purely to adjust the data state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        setIsAppReady(false);
        // THE FIX: Removed the immediate navigate("/login") call that was corrupting registration route contexts
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = (userData) => {
    setUser(userData.user);
    setIsAppReady(false);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAppReady(false);
    sessionStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, loading, isAppReady, setIsAppReady }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
