
import { UserProfile } from '../types';
import { saveUserProfile } from './integrationService';

const STORAGE_KEY = 'neuroflow-auth-user';

export const loginWithGoogle = async (): Promise<UserProfile> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUser: UserProfile = {
        name: 'Neuro Explorer',
        email: 'explorer@neuroflow.ai',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neuro',
        chronotype: 'Third Bird',
        mainGoal: 'Productivity',
        onboarded: false,
        theme: 'cyber'
    };
    
    // Check if we have an existing profile to merge
    const existing = localStorage.getItem('neuroflow-profile');
    if (existing) {
        const p = JSON.parse(existing);
        Object.assign(mockUser, p);
    } else {
        saveUserProfile(mockUser);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    return mockUser;
};

export const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
};

export const getAuthUser = (): UserProfile | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
};

export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem(STORAGE_KEY);
};
