import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    // Check system preference if no saved theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [isSystemTheme, setIsSystemTheme] = useState(() => {
    return !localStorage.getItem('theme');
  });

  // Initial theme setup - runs only once
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    let initialTheme = savedTheme;
    
    if (!savedTheme) {
      // Check system preference if no saved theme
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        initialTheme = 'dark';
      } else {
        initialTheme = 'light';
      }
      setIsSystemTheme(true);
    } else {
      setIsSystemTheme(false);
    }
    
    // Set the initial theme state
    setTheme(initialTheme);
    

  }, []); // Empty dependency array - runs only once

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const savedTheme = localStorage.getItem('theme');
      // Only auto-switch if user hasn't manually set a theme
      if (!savedTheme) {
        const newTheme = e.matches ? 'dark' : 'light';
        setTheme(newTheme);
        setIsSystemTheme(true);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document and localStorage whenever theme changes
  useEffect(() => {
    // Force immediate application with a small delay to ensure DOM is ready
    const applyTheme = () => {
      // Remove both classes first
      document.documentElement.classList.remove('light', 'dark');
      
      // Add the current theme class
      document.documentElement.classList.add(theme);
      
      // Also apply to body as backup
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(theme);
      
      // Save to localStorage
      localStorage.setItem('theme', theme);
      
      // Update system theme status
      setIsSystemTheme(false);
      

    };
    
    // Apply immediately
    applyTheme();
    
    // Also apply after a small delay to ensure everything is rendered
    const timeoutId = setTimeout(applyTheme, 100);
    
    return () => clearTimeout(timeoutId);
  }, [theme]);

  const toggleTheme = () => {
    
    const newTheme = theme === 'light' ? 'dark' : 'light';
    
    // Force immediate application to both html and body
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(newTheme);
    
    // Save to localStorage
    localStorage.setItem('theme', newTheme);
    
    // Update state
    setTheme(newTheme);
    

  };

  const resetToSystemTheme = () => {
    localStorage.removeItem('theme');
    const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    setTheme(systemTheme);
    setIsSystemTheme(true);
  };

  const forceApplyTheme = () => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  };

  const value = {
    theme,
    toggleTheme,
    resetToSystemTheme,
    forceApplyTheme,
    isDark: theme === 'dark',
    isSystemTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
