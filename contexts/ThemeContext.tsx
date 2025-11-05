import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';

export type Theme = 'default' | 'twilight' | 'ocean' | 'forest' | 'blossom' | 'dusk';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

// Export the raw context to allow optional access without throwing
export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme;
        // Validate that the saved theme is one of the allowed values
        if (['default', 'twilight', 'ocean', 'forest', 'blossom', 'dusk'].includes(savedTheme)) {
            return savedTheme;
        }
        return 'default'; // Default theme
    });

    useEffect(() => {
        // Set the data-theme attribute on the root element
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const value = useMemo(() => ({ theme, setTheme }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};