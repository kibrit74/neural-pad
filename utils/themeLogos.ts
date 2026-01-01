/**
 * Theme-based logo mapping utility
 * Maps each theme to its corresponding logo file
 */

import type { Theme } from '../contexts/ThemeContext';

// Logo paths for each theme
export const themeLogos: Record<Theme, string> = {
    coral: '/Logo7.png',     // Kırmızı/Coral tonlu logo
    emerald: '/Logo2.png',   // Yeşil/Emerald tonlu logo
    gold: '/logo3.png',      // Altın/Gold tonlu logo
    teal: '/Logo4.png',      // Turkuaz/Teal tonlu logo
    azure: '/Logo5.png',     // Mavi/Azure tonlu logo
    midnight: '/Logo6.png',  // Gri/Midnight tonlu logo
};

// Helper function to get logo path for current theme
export const getLogoForTheme = (theme: Theme): string => {
    return themeLogos[theme] || themeLogos.coral;
};

// Default logo for fallback (coral theme)
export const defaultLogo = '/Logo7.png';
