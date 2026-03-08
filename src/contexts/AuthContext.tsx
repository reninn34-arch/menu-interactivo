import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { authApi, getAuthToken } from '../services/api';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string, username?: string) => Promise<boolean>;
  logout: () => void;
  adminPassword: string;
  setAdminPassword: (password: string) => void;
  isLoading: boolean;
  error: string | null;
  username: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'admin_session';
const PASSWORD_KEY = 'admin_password';
const USERNAME_KEY = 'admin_username';
const DEFAULT_PASSWORD = 'admin1234';
const DEFAULT_USERNAME = 'admin';

const STORAGE_MODE = import.meta.env.VITE_STORAGE_MODE || 'localStorage';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (STORAGE_MODE === 'api') {
      return !!getAuthToken();
    }
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const [adminPassword, setAdminPasswordState] = useState<string>(() => {
    return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD;
  });

  const [username, setUsername] = useState<string | null>(() => {
    return localStorage.getItem(USERNAME_KEY) || null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (STORAGE_MODE === 'localStorage') {
      localStorage.setItem(STORAGE_KEY, isAuthenticated.toString());
    }
  }, [isAuthenticated]);

  const login = async (password: string, usernameParam?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      if (STORAGE_MODE === 'api') {
        const user = usernameParam || DEFAULT_USERNAME;
        const result = await authApi.login(user, password);
        setIsAuthenticated(true);
        setUsername(result.user.username);
        localStorage.setItem(USERNAME_KEY, result.user.username);
        return true;
      } else {
        if (password === adminPassword) {
          setIsAuthenticated(true);
          return true;
        }
        setError('Invalid password');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (STORAGE_MODE === 'api') {
      authApi.logout();
      setUsername(null);
      localStorage.removeItem(USERNAME_KEY);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setIsAuthenticated(false);
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
      isLoading,
      error,
      username,
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
