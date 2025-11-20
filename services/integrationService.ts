
import { HealthMetrics, GamificationState, UserProfile, Badge } from '../types';
import { BADGES } from '../constants';
import { getAuthUser, updateCurrentUser } from './authService';

// --- DATA LAYER ABSTRACTION (Multi-Tenancy) ---
// Prefixes all storage keys with the current User ID to separate data

const getStorageKey = (key: string) => {
    const user = getAuthUser();
    const uid = user ? user.id : 'guest';
    return `nf_${uid}_${key}`;
};

export const getUserData = <T>(key: string): T | null => {
    const fullKey = getStorageKey(key);
    const data = localStorage.getItem(fullKey);
    return data ? JSON.parse(data) : null;
};

export const saveUserData = (key: string, data: any) => {
    const fullKey = getStorageKey(key);
    localStorage.setItem(fullKey, JSON.stringify(data));
};

// --- HEALTH DATA SIMULATION ---
export const syncHealthData = async (): Promise<HealthMetrics> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const hrv = Math.floor(Math.random() * (80 - 30) + 30);
    const rhr = Math.floor(Math.random() * (65 - 45) + 45);
    const sleepHours = Number((Math.random() * (9 - 5) + 5).toFixed(1));
    const steps = Math.floor(Math.random() * (12000 - 2000) + 2000);
    
    let sleepScore = Math.min(100, Math.floor((sleepHours / 8) * 100));
    if (sleepHours < 6) sleepScore -= 20;

    const activityScore = Math.min(100, Math.floor((steps / 10000) * 100));

    const metrics: HealthMetrics = {
        hrv,
        restingHeartRate: rhr,
        sleepScore,
        sleepHours,
        activityScore,
        steps,
        readinessScore: 0,
        lastSynced: new Date().toISOString()
    };
    
    saveUserData('health-metrics', metrics);
    return metrics;
};

export const getHealthMetrics = (): HealthMetrics | null => {
    return getUserData<HealthMetrics>('health-metrics');
};

// --- GAMIFICATION ENGINE ---
export const getGamificationState = (): GamificationState => {
    const state = getUserData<GamificationState>('gamification');
    if (state) return state;
    return { xp: 0, level: 1, streak: 0, badges: [], unlockedItems: [] };
};

export const addXP = (amount: number): { newState: GamificationState, leveledUp: boolean, newBadges: Badge[] } => {
    const state = getGamificationState();
    const oldLevel = state.level;
    
    state.xp += amount;
    state.level = 1 + Math.floor(state.xp / 500);
    
    const leveledUp = state.level > oldLevel;
    const newBadges: Badge[] = [];

    BADGES.forEach(badge => {
        if (!state.badges.includes(badge.id)) {
            if (badge.xpThreshold && state.xp >= badge.xpThreshold) {
                state.badges.push(badge.id);
                newBadges.push(badge);
            }
        }
    });

    saveUserData('gamification', state);
    return { newState: state, leveledUp, newBadges };
};

// --- PROFILE MANAGEMENT ---
export const getUserProfile = (): UserProfile => {
    const user = getAuthUser();
    if (user) return user;
    
    // Fallback for types safety, though app should be authed
    return { 
        id: 'guest',
        name: 'Guest', 
        email: 'guest',
        chronotype: 'Third Bird', 
        mainGoal: 'Productivity', 
        onboarded: false,
        theme: 'cyber'
    };
};

export const saveUserProfile = (profile: UserProfile) => {
    updateCurrentUser(profile);
};
