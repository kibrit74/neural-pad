import { getSupabaseClient } from './supabaseClient';

export interface UserSubscription {
    userId: string;
    planType: 'free' | 'pro' | 'enterprise';
    apiCreditsTotal: number;
    apiCreditsUsed: number;
    renewalDate: Date;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
}

export interface UserStats {
    totalNotes: number;
    todayNotes: number;
    totalTags: number;
    lastActivity?: Date;
}

class StatsService {
    async getSubscriptionInfo(userId: string): Promise<UserSubscription | null> {
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('user_subscriptions')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !data) return null;

        return {
            userId: data.user_id,
            planType: data.plan_type,
            apiCreditsTotal: data.api_credits_total,
            apiCreditsUsed: data.api_credits_used,
            renewalDate: new Date(data.renewal_date),
            stripeCustomerId: data.stripe_customer_id,
            stripeSubscriptionId: data.stripe_subscription_id,
        };
    }

    async getUserStats(userId: string): Promise<UserStats> {
        const supabase = getSupabaseClient();

        // Get note stats
        const { data: notes, error } = await supabase
            .from('notes')
            .select('created_at, tags')
            .eq('user_id', userId);

        if (error || !notes) {
            return {
                totalNotes: 0,
                todayNotes: 0,
                totalTags: 0,
            };
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayNotes = notes.filter(note => {
            const created = new Date(note.created_at);
            created.setHours(0, 0, 0, 0);
            return created.getTime() === today.getTime();
        }).length;

        // Get unique tags
        const allTags = new Set<string>();
        notes.forEach(note => {
            if (note.tags && Array.isArray(note.tags)) {
                note.tags.forEach(tag => allTags.add(tag));
            }
        });

        // Last activity (most recent note)
        const lastActivity = notes.length > 0
            ? new Date(Math.max(...notes.map(n => new Date(n.created_at).getTime())))
            : undefined;

        return {
            totalNotes: notes.length,
            todayNotes,
            totalTags: allTags.size,
            lastActivity,
        };
    }

    async incrementApiUsage(userId: string, amount: number = 1): Promise<void> {
        const supabase = getSupabaseClient();

        const { data } = await supabase
            .from('user_subscriptions')
            .select('api_credits_used')
            .eq('user_id', userId)
            .single();

        if (data) {
            await supabase
                .from('user_subscriptions')
                .update({ api_credits_used: data.api_credits_used + amount })
                .eq('user_id', userId);
        }
    }
}

export const statsService = new StatsService();
