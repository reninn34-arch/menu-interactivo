import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  adminPassword: string;
  setAdminPassword: (password: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'admin_session';
const PASSWORD_KEY = 'admin_password';
const DEFAULT_PASSWORD = 'admin123'; // Contraseña por defecto

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const [adminPassword, setAdminPasswordState] = useState<string>(() => {
    return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isAuthenticated.toString());
  }, [isAuthenticated]);

  const login = (password: string): boolean => {
    if (password === adminPassword) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const setAdminPassword = (password: string) => {
    setAdminPasswordState(password);
    localStorage.setItem(PASSWORD_KEY, password);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      adminPassword,
      setAdminPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
