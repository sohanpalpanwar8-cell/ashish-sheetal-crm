/**
 * Global Application Context
 * Controls Current User Role, Language (English/Hindi), Theme, Active Navigation, and Alerts
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, DynamicModule } from '../types';
import { storage } from '../services/storage';
import { Language, translations } from '../utils/i18n';

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  isAuthenticated: boolean;
  login: (userId: string, pin: string) => { success: boolean; message: string };
  logout: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  appName: string;
  appSubtitle: string;
  updateBrandInfo: (name: string, subtitle: string) => void;
  t: typeof translations['en'];
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  modules: DynamicModule[];
  reloadModules: () => void;
  refreshKey: number;
  triggerRefresh: () => void;
  toasts: ToastNotification[];
  showToast: (message: string, type?: ToastNotification['type']) => void;
  removeToast: (id: string) => void;
}


const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [currentUserId, setCurrentUserId] = useState<string>(() => storage.getCurrentUserId());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('as_auth_session') === 'true';
  });
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('as_lang') as Language) || 'en';
  });
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('as_theme') as 'light' | 'dark') || 'light';
  });
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [modules, setModules] = useState<DynamicModule[]>(() => storage.getModules());
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const [appName, setAppNameState] = useState<string>(() => {
    return localStorage.getItem('as_app_name') || 'ASHISH SHEETAL ALL-IN-ONE';
  });
  const [appSubtitle, setAppSubtitleState] = useState<string>(() => {
    return localStorage.getItem('as_app_subtitle') || 'Personal & Business Management Platform';
  });

  const updateBrandInfo = (name: string, subtitle: string) => {
    const trimmedName = name.trim() || 'ASHISH SHEETAL ALL-IN-ONE';
    const trimmedSubtitle = subtitle.trim() || 'Personal & Business Management Platform';
    setAppNameState(trimmedName);
    setAppSubtitleState(trimmedSubtitle);
    localStorage.setItem('as_app_name', trimmedName);
    localStorage.setItem('as_app_subtitle', trimmedSubtitle);
  };

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('as_theme', theme);
  }, [theme]);

  // Check URL query parameters on load for direct agent links
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const targetAgentId = params.get('crm') || params.get('agent') || params.get('user');
      if (targetAgentId) {
        const matched = storage.getUsers().find((u) => u.id === targetAgentId);
        if (matched) {
          storage.setCurrentUserId(matched.id);
          setCurrentUserId(matched.id);
        }
      }
    }
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('as_lang', lang);
  };

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const login = (userId: string, enteredPin: string): { success: boolean; message: string } => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'User account not found' };
    }

    if (!targetUser.active) {
      return { success: false, message: 'Account is deactivated. Contact Main Admin.' };
    }

    const expectedPin = targetUser.pin || '1234';
    if (enteredPin.trim() !== expectedPin.trim()) {
      return { success: false, message: 'Invalid 4-digit PIN! Please check and try again.' };
    }

    // Success
    storage.setCurrentUserId(targetUser.id);
    setCurrentUserId(targetUser.id);
    setIsAuthenticated(true);
    localStorage.setItem('as_auth_session', 'true');
    storage.logAudit(targetUser, 'LOGIN', 'UserSession', `Authenticated into workspace (${targetUser.role})`);
    showToast(`Welcome back, ${targetUser.name}!`, 'success');
    return { success: true, message: 'Login successful' };
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('as_auth_session');
    showToast('Logged out securely', 'info');
  };

  const switchUser = (userId: string) => {
    storage.setCurrentUserId(userId);
    setCurrentUserId(userId);
    setUsers(storage.getUsers());
    triggerRefresh();
    showToast(`Switched workspace to ${users.find((u) => u.id === userId)?.name}`, 'info');
  };


  const reloadModules = () => {
    setModules(storage.getModules());
  };

  const triggerRefresh = () => {
    setRefreshKey((k) => k + 1);
    setUsers(storage.getUsers());
    reloadModules();
  };

  const showToast = (message: string, type: ToastNotification['type'] = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const t = {
    ...translations[language],
    appName,
    appSubtitle,
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        isAuthenticated,
        login,
        logout,
        language,
        setLanguage,
        appName,
        appSubtitle,
        updateBrandInfo,
        t,
        theme,
        toggleTheme,
        activeTab,
        setActiveTab,
        selectedCustomerId,
        setSelectedCustomerId,
        modules,
        reloadModules,
        refreshKey,
        triggerRefresh,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
