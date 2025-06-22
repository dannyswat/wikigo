import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SettingContext } from '../features/setup/SettingProvider';

interface ThemeContextType {
    theme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const { setting } = useContext(SettingContext);
    const theme = setting?.theme || 'default';
    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const updateActualTheme = () => {
            if (theme === 'default') {
                const defaultPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                setActualTheme(defaultPrefersDark ? 'dark' : 'light');
            } else {
                if (theme === 'light' || theme === 'dark') {
                    setActualTheme(theme);
                }
                else setActualTheme('light');
            }
        };

        updateActualTheme();

        if (theme === 'default') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addEventListener('change', updateActualTheme);
            return () => mediaQuery.removeEventListener('change', updateActualTheme);
        }
    }, [theme]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(actualTheme);
    }, [actualTheme]);

    return (
        <ThemeContext.Provider value={{ theme: actualTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
