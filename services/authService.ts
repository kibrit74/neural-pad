import { getSupabaseClient } from './supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthUser {
    id: string;
    email: string;
    fullName?: string;
    avatarUrl?: string;
    createdAt?: string;
}

class AuthService {
    private user: AuthUser | null = null;
    private listeners: Set<(user: AuthUser | null) => void> = new Set();

    constructor() {
        this.initializeAuth();
    }

    private async initializeAuth() {
        try {
            const supabase = getSupabaseClient();

            // Get current session
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await this.setUserFromSession(session);
            }

            // Listen for auth changes
            supabase.auth.onAuthStateChange(async (_event, session) => {
                if (session?.user) {
                    await this.setUserFromSession(session);
                } else {
                    this.setUser(null);
                }
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
        }
    }

    private async setUserFromSession(session: Session) {
        const supabase = getSupabaseClient();

        // Fetch user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        this.setUser({
            id: session.user.id,
            email: session.user.email!,
            fullName: profile?.full_name,
            avatarUrl: profile?.avatar_url,
        });
    }

    private setUser(user: AuthUser | null) {
        this.user = user;
        this.listeners.forEach(listener => listener(user));
    }

    // Subscribe to auth changes
    onAuthStateChange(callback: (user: AuthUser | null) => void) {
        this.listeners.add(callback);
        // Immediately call with current state
        callback(this.user);

        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback);
        };
    }

    // Get current user
    getCurrentUser(): AuthUser | null {
        return this.user;
    }

    // Sign up with email/password
    async signUp(email: string, password: string, fullName?: string): Promise<{ success: boolean; error?: string }> {
        try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    // Sign in with email/password
    async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
        try {
            const supabase = getSupabaseClient();
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    // Sign out
    async signOut(): Promise<void> {
        const supabase = getSupabaseClient();
        await supabase.auth.signOut();
    }

    // Reset password
    async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
        try {
            const supabase = getSupabaseClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) throw error;

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    // Update profile
    async updateProfile(updates: { fullName?: string; avatarUrl?: string }): Promise<{ success: boolean; error?: string }> {
        try {
            const supabase = getSupabaseClient();
            const user = this.getCurrentUser();

            if (!user) throw new Error('Not authenticated');

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: updates.fullName,
                    avatar_url: updates.avatarUrl,
                })
                .eq('id', user.id);

            if (error) throw error;

            // Update local user
            this.setUser({
                ...user,
                fullName: updates.fullName || user.fullName,
                avatarUrl: updates.avatarUrl || user.avatarUrl,
            });

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        return this.user !== null;
    }
}

// Singleton instance
export const authService = new AuthService();
