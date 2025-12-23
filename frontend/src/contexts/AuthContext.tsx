import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { authApi } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('protrack_user');
        const token = localStorage.getItem('protrack_token');
        
        if (savedUser && token) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error loading user from localStorage:', error);
        localStorage.removeItem('protrack_user');
        localStorage.removeItem('protrack_token');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const response = await authApi.login(email, password, role);
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        // Transform backend user format to frontend format
        let transformedRole: UserRole = 'student';
        if (userData.role === 'SUPER_ADMIN') {
          transformedRole = 'super_admin';
        } else if (userData.role === 'TEACHER') {
          transformedRole = 'teacher';
        } else if (userData.role === 'STUDENT') {
          transformedRole = 'student';
        }

        const frontendUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: transformedRole,
          designation: userData.designation,
          avatar: userData.avatar || undefined,
          createdAt: new Date(userData.createdAt),
        };

        // Store user and token
        localStorage.setItem('protrack_user', JSON.stringify(frontendUser));
        localStorage.setItem('protrack_token', token);
        setUser(frontendUser);
        
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      // Error message will be shown by the component via toast
      throw error; // Re-throw so component can show the error message
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const response = await authApi.signup(name, email, password, role);
      
      if (response.success && response.data) {
        const { user: userData, token } = response.data;
        
        // Transform backend user format to frontend format
        let transformedRole: UserRole = 'student';
        if (userData.role === 'SUPER_ADMIN') {
          transformedRole = 'super_admin';
        } else if (userData.role === 'TEACHER') {
          transformedRole = 'teacher';
        } else if (userData.role === 'STUDENT') {
          transformedRole = 'student';
        }

        const frontendUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: transformedRole,
          designation: userData.designation,
          avatar: userData.avatar || undefined,
          createdAt: new Date(userData.createdAt),
        };

        // Store user and token
        localStorage.setItem('protrack_user', JSON.stringify(frontendUser));
        localStorage.setItem('protrack_token', token);
        setUser(frontendUser);
        
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Signup error:', error);
      // Error message will be shown by the component via toast
      throw error; // Re-throw so component can show the error message
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('protrack_user');
    localStorage.removeItem('protrack_token');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
