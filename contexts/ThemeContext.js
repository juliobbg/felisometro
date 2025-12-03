import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('auto'); // 'light', 'dark', 'auto'
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    cargarPreferencia();
  }, []);

  useEffect(() => {
    if (themeMode === 'auto') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode, systemColorScheme]);

  const cargarPreferencia = async () => {
    try {
      const preferencia = await AsyncStorage.getItem('@theme_mode');
      if (preferencia) {
        setThemeMode(preferencia);
      }
    } catch (error) {
      console.error('Error cargando tema:', error);
    }
  };

  const cambiarTema = async (nuevoModo) => {
    try {
      await AsyncStorage.setItem('@theme_mode', nuevoModo);
      setThemeMode(nuevoModo);
    } catch (error) {
      console.error('Error guardando tema:', error);
    }
  };

  const colors = {
    // Colores principales
    primary: isDark ? '#b3d9d9' : '#99cccc',
    primaryDark: isDark ? '#99cccc' : '#80b3b3',

    // Fondos
    background: isDark ? '#111827' : '#f3f4f6',
    surface: isDark ? '#1f2937' : '#ffffff',
    surfaceVariant: isDark ? '#374151' : '#f9fafb',

    // Textos
    text: isDark ? '#f9fafb' : '#111827',
    textSecondary: isDark ? '#d1d5db' : '#6b7280',
    textTertiary: isDark ? '#9ca3af' : '#9ca3af',

    // Bordes
    border: isDark ? '#374151' : '#e5e7eb',
    borderLight: isDark ? '#4b5563' : '#f3f4f6',

    // Estados
    success: isDark ? '#34d399' : '#10b981',
    warning: isDark ? '#fbbf24' : '#f59e0b',
    error: isDark ? '#f87171' : '#ef4444',
    info: isDark ? '#60a5fa' : '#3b82f6',

    // Específicos
    card: isDark ? '#1f2937' : '#ffffff',
    cardBorder: isDark ? '#374151' : 'transparent',

    // Overlays
    overlay: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',

    // Input
    inputBackground: isDark ? '#374151' : '#f3f4f6',
    inputBorder: isDark ? '#4b5563' : '#d1d5db',
    placeholder: isDark ? '#6b7280' : '#9ca3af',
  };

  const value = {
    isDark,
    themeMode,
    cambiarTema,
    colors
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
