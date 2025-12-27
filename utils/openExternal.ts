/**
 * Utility for opening external URLs in Electron and browser environments
 */

// Declare the electron global for TypeScript
declare global {
    interface Window {
        electron?: {
            openExternal?: (url: string) => Promise<{ success: boolean; error?: string }>;
        };
    }
}

/**
 * Opens an external URL in the default browser.
 * Uses Electron's shell.openExternal via IPC.
 */
export const openExternalUrl = async (url: string): Promise<boolean> => {
    console.log('[openExternalUrl] Attempting to open:', url);

    // Check if we're in Electron with the openExternal API
    if (typeof window !== 'undefined' && window.electron?.openExternal) {
        console.log('[openExternalUrl] Using Electron IPC');
        try {
            const result = await window.electron.openExternal(url);
            console.log('[openExternalUrl] IPC result:', result);
            if (result.success) {
                return true;
            } else {
                console.error('[openExternalUrl] IPC returned failure:', result.error);
            }
        } catch (error) {
            console.error('[openExternalUrl] IPC call failed:', error);
        }
    } else {
        console.log('[openExternalUrl] Not in Electron or openExternal not available');
        // In browser environment, use window.open
        if (typeof window !== 'undefined') {
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
            if (newWindow) {
                return true;
            }
        }
    }

    console.error('[openExternalUrl] Failed to open URL:', url);
    return false;
};
