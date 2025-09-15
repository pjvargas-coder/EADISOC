import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('eadisoc_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    // Mock authentication - In real app, this would be an API call
    const users = [
      { username: 'admin', password: 'admin123', role: 'admin', name: 'admin' },
      { username: 'doctor1', password: 'doctor123', role: 'doctor', name: 'doctor1' },
      { username: 'doctor2', password: 'doctor123', role: 'doctor', name: 'doctor2' },
      { username: 'usuario1', password: 'usuario123', role: 'user', name: 'usuario1' },
      { username: 'usuario2', password: 'usuario123', role: 'user', name: 'usuario2' }
    ];

    const foundUser = users.find(u => u.username === username && u.password === password);
    
    if (foundUser) {
      const userSession = { 
        username: foundUser.username, 
        role: foundUser.role, 
        name: foundUser.name 
      };
      setUser(userSession);
      localStorage.setItem('eadisoc_user', JSON.stringify(userSession));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eadisoc_user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};