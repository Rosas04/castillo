
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('prestamos_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    // Usuario preconfigurado
    if (username === 'admin' && password === 'admin123') {
      const userData = {
        id: 1,
        username: 'admin',
        name: 'Administrador',
        role: 'admin'
      };
      setUser(userData);
      localStorage.setItem('prestamos_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, error: 'Credenciales incorrectas' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('prestamos_user');
  };

  const changePassword = async (currentPassword, newPassword) => {
    if (currentPassword === 'admin123') {
      // En una implementación real, aquí actualizarías la contraseña en la base de datos
      return { success: true };
    }
    return { success: false, error: 'Contraseña actual incorrecta' };
  };

  const value = {
    user,
    login,
    logout,
    changePassword,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
