import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create Supabase client
let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
    if (!supabaseClient) {
        if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
            throw new Error('Supabase URL and Anon Key must be configured in .env');
        }
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        });
    }
    return supabaseClient;
};

// Database types
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                };
                Update: {
                    full_name?: string | null;
                    avatar_url?: string | null;
                };
            };
            notes: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    content: string;
                    plain_text_content: string | null;
                    tags: string[] | null;
                    is_pinned: boolean;
                    is_locked: boolean;
                    encrypted: any | null;
                    reminder: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    title?: string;
                    content?: string;
                    plain_text_content?: string | null;
                    tags?: string[] | null;
                    is_pinned?: boolean;
                    is_locked?: boolean;
                    encrypted?: any | null;
                    reminder?: string | null;
                };
                Update: {
                    title?: string;
                    content?: string;
                    plain_text_content?: string | null;
                    tags?: string[] | null;
                    is_pinned?: boolean;
                    is_locked?: boolean;
                    encrypted?: any | null;
                    reminder?: string | null;
                };
            };
            note_history: {
                Row: {
                    id: string;
                    note_id: string;
                    user_id: string;
                    title: string;
                    content: string;
                    timestamp: string;
                };
                Insert: {
                    note_id: string;
                    user_id: string;
                    title: string;
                    content: string;
                };
            };
            user_settings: {
                Row: {
                    user_id: string;
                    model: string;
                    temperature: number;
                    top_k: number;
                    top_p: number;
                    api_provider: string;
                    auto_save: boolean;
                    max_tokens: number | null;
                    custom_patterns: any;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    model?: string;
                    temperature?: number;
                    top_k?: number;
                    top_p?: number;
                    api_provider?: string;
                    auto_save?: boolean;
                    max_tokens?: number | null;
                    custom_patterns?: any;
                };
                Update: {
                    model?: string;
                    temperature?: number;
                    top_k?: number;
                    top_p?: number;
                    api_provider?: string;
                    auto_save?: boolean;
                    max_tokens?: number | null;
                    custom_patterns?: any;
                };
            };
            user_api_keys: {
                Row: {
                    id: string;
                    user_id: string;
                    provider: string;
                    encrypted_key: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    user_id: string;
                    provider: string;
                    encrypted_key: string;
                };
                Update: {
                    encrypted_key?: string;
                };
            };
        };
    };
}
