import { Capacitor } from '@capacitor/core';

export const isElectron = typeof window !== 'undefined' && (window as any).electron;

export const isNative = Capacitor.isNativePlatform();

export const isAndroid = Capacitor.getPlatform() === 'android';
export const isIOS = Capacitor.getPlatform() === 'ios';
export const isWeb = !isElectron && !isNative;

export const getPlatform = () => {
    if (isElectron) return 'electron';
    if (isAndroid) return 'android';
    if (isIOS) return 'ios';
    return 'web';
};
