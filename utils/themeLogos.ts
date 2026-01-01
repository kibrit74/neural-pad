/**
 * Theme-based logo mapping utility
 * Maps each theme to its corresponding logo file
 */

import type { Theme } from '../contexts/ThemeContext';

// Get the base path for assets - works in both dev and production (Electron)
const getBasePath = (): string => {
    // In Electron production, we need to handle file:// protocol
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
        // Extract the base path from the current location
        const href = window.location.href;
        const lastSlash = href.lastIndexOf('/');
        return href.substring(0, lastSlash + 1);
    }
    // In dev mode or web, use relative path
    return './';
};

// Logo filenames for each theme
const logoFiles: Record<Theme, string> = {
    coral: 'Logo7.png',     // Kırmızı/Coral tonlu logo
    emerald: 'Logo2.png',   // Yeşil/Emerald tonlu logo
    gold: 'Logo3.png',      // Altın/Gold tonlu logo
    teal: 'Logo4.png',      // Turkuaz/Teal tonlu logo
    azure: 'Logo5.png',     // Mavi/Azure tonlu logo
    midnight: 'Logo6.png',  // Gri/Midnight tonlu logo
};

// Logo paths for each theme - computed with base path
export const themeLogos: Record<Theme, string> = Object.fromEntries(
    Object.entries(logoFiles).map(([theme, file]) => [theme, getBasePath() + file])
) as Record<Theme, string>;

// Helper function to get logo path for current theme
export const getLogoForTheme = (theme: Theme): string => {
    const basePath = getBasePath();
    const file = logoFiles[theme] || logoFiles.coral;
    return basePath + file;
};

// Default logo for fallback (coral theme)
export const defaultLogo = getBasePath() + 'Logo7.png';
