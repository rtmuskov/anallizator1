import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authAPI } from '../api/auth';

interface User {
  id: number;
  email: string;
  role: string;
  // Добавьте другие поля пользователя, если они возвращаются бэкендом
}

interface AuthContextType {
  user: User | null;
  isAuth: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  registration: (email: string, password: string, profileData: any) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Состояние загрузки для проверки аутентификации при старте

  // Проверка аутентификации при загрузке приложения
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Отправляем запрос на бэкенд для проверки валидности токена и получения данных пользователя
        const userData = await authAPI.checkAuth();
        setUser(userData as User); // Преобразуем к типу User
        setIsAuth(true);
      } else {
        setIsAuth(false);
        setUser(null);
      }
    } catch (e) {
      console.error('Ошибка проверки аутентификации:', e);
      setIsAuth(false);
      setUser(null);
      localStorage.removeItem('token'); // Удаляем невалидный токен
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      await authAPI.login(email, password);
      // authAPI.login уже сохраняет токен в localStorage
      await checkAuth(); // Перепроверяем аутентификацию после входа для получения данных пользователя
      return user as User; // Возвращаем данные пользователя из состояния
    } catch (e) {
      setIsAuth(false);
      setUser(null);
      localStorage.removeItem('token');
      throw e; // Перебрасываем ошибку для обработки в компоненте
    } finally {
       setIsLoading(false);
    }
  };

  const registration = async (email: string, password: string, profileData: any): Promise<User> => {
    setIsLoading(true);
    try {
      await authAPI.registration(email, password, profileData);
      // authAPI.registration уже сохраняет токен в localStorage
      await checkAuth(); // Перепроверяем аутентификацию после регистрации
      return user as User; // Возвращаем данные пользователя из состояния
    } catch (e) {
      setIsAuth(false);
      setUser(null);
      localStorage.removeItem('token');
      throw e; // Перебрасываем ошибку
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
    setUser(null);
    // Возможно, добавить запрос на бэкенд для инвалидации токена, если такая функциональность есть
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuth,
      isLoading,
      login,
      registration,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 