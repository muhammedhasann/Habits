
import { HealthMetrics, GamificationState, UserProfile, Badge } from '../types';
import { BADGES } from '../constants';

// --- HEALTH DATA SIMULATION ---
// In a real app, this would connect to Google Fit API or Oura Cloud API
export const syncHealthData = async (): Promise<HealthMetrics> => {
    // Simulate API Latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate realistic scientific data based on random variance
    const hrv = Math.floor(Math.random() * (80 - 30) + 30); // 30-80 ms
    const rhr = Math.floor(Math.random() * (65 - 45) + 45); // 45-65 bpm
    const sleepHours = Number((Math.random() * (9 - 5) + 5).toFixed(1)); // 5-9 hours
    const steps = Math.floor(Math.random() * (12000 - 2000) + 2000);
    
    // Calculate scores
    let sleepScore = Math.min(100, Math.floor((sleepHours / 8) * 100));
    if (sleepHours < 6) sleepScore -= 20;

    const activityScore = Math.min(100, Math.floor((steps / 10000) * 100));

    // Save to local storage for persistence
    const metrics: HealthMetrics = {
        hrv,
        restingHeartRate: rhr,
        sleepScore,
        sleepHours,
        activityScore,
        steps,
        readinessScore: 0, // Will be calculated by AI later
        lastSynced: new Date().toISOString()
    };
    
    localStorage.setItem('neuroflow-health-metrics', JSON.stringify(metrics));
    return metrics;
};

// --- GAMIFICATION ENGINE ---

const XP_TABLE = {
    HABIT_COMPLETE: 50,
    JOURNAL_ENTRY: 100,
    VISUALIZATION: 30,
    STATE_SHIFT: 25
};

export const getGamificationState = (): GamificationState => {
    const saved = localStorage.getItem('neuroflow-gamification');
    if (saved) return JSON.parse(saved);
    return { xp: 0, level: 1, streak: 0, badges: [], unlockedItems: [] };
};

export const addXP = (amount: number): { newState: GamificationState, leveledUp: boolean, newBadges: Badge[] } => {
    const state = getGamificationState();
    const oldLevel = state.level;
    
    state.xp += amount;
    // Level formula: Level = floor(sqrt(XP / 100))
    // Let's use a simpler linear curve for early game gratification: Level = 1 + floor(XP / 500)
    state.level = 1 + Math.floor(state.xp / 500);
    
    const leveledUp = state.level > oldLevel;
    const newBadges: Badge[] = [];

    // Check for badges
    BADGES.forEach(badge => {
        if (!state.badges.includes(badge.id)) {
            if (badge.xpThreshold && state.xp >= badge.xpThreshold) {
                state.badges.push(badge.id);
                newBadges.push(badge);
            }
        }
    });

    localStorage.setItem('neuroflow-gamification', JSON.stringify(state));
    return { newState: state, leveledUp, newBadges };
};

// --- PROFILE MANAGEMENT ---
export const getUserProfile = (): UserProfile => {
    const saved = localStorage.getItem('neuroflow-profile');
    if (saved) return JSON.parse(saved);
    return { 
        name: 'User', 
        email: 'user@example.com',
        chronotype: 'Third Bird', 
        mainGoal: 'Productivity', 
        onboarded: false,
        theme: 'cyber'
    };
};

export const saveUserProfile = (profile: UserProfile) => {
    localStorage.setItem('neuroflow-profile', JSON.stringify(profile));
};
