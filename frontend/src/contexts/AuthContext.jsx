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
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger le token au démarrage
  useEffect(() => {
    const savedToken = localStorage.getItem('kbeauty_token');
    const savedUser = localStorage.getItem('kbeauty_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Inscription
  const signup = async (userData) => {
    const response = await fetch('http://localhost:8000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Erreur lors de l\'inscription');
    }

    localStorage.setItem('kbeauty_token', data.access_token);
    localStorage.setItem('kbeauty_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);

    return data;
  };

  // Connexion
  const login = async (email, password) => {
    const response = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Email ou mot de passe incorrect');
    }

    localStorage.setItem('kbeauty_token', data.access_token);
    localStorage.setItem('kbeauty_user', JSON.stringify(data.user));
    setToken(data.access_token);
    setUser(data.user);

    return data;
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('kbeauty_token');
    localStorage.removeItem('kbeauty_user');
    setToken(null);
    setUser(null);
  };

  // Mettre à jour le profil
  const updateProfile = async (updates) => {
    const response = await fetch('http://localhost:8000/api/auth/me', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.detail || 'Erreur lors de la mise à jour');
    }

    const updatedUser = { ...user, ...updates };
    localStorage.setItem('kbeauty_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    signup,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};