import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);


export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState('todos');

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("focuslyUser");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.warn('Failed to parse stored user:', error);
          localStorage.removeItem("focuslyUser");
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);


  const login = (userData, token) => {
    localStorage.setItem('focuslyUser', JSON.stringify(userData));
    setUser(userData);
  }
  const logout = () => {
    localStorage.removeItem('focuslyUser');
    setUser(null);
    setLoading(false);
  };

  

  return (
    <AppContext.Provider value={{
      user,
      login,
      logout,
      page,
      setPage,
      loading,
    }}>
      {children}
    </AppContext.Provider>
  );
}


