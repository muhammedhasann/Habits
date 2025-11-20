
import { UserProfile } from '../types';

const SESSION_KEY = 'neuroflow-session-user';
const USERS_DB_KEY = 'neuroflow-users-db';

// --- HELPER: Database Access ---
const getUsers = (): UserProfile[] => {
    const stored = localStorage.getItem(USERS_DB_KEY);
    return stored ? JSON.parse(stored) : [];
};

const saveUser = (user: UserProfile) => {
    const users = getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
        users[existingIndex] = user;
    } else {
        users.push(user);
    }
    
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

// --- AUTH ACTIONS ---

export const registerUser = async (name: string, email: string, password: string): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Sim latency

    const users = getUsers();
    if (users.find(u => u.email === email)) {
        throw new Error("Email already registered.");
    }

    const newUser: UserProfile = {
        id: `user_${Date.now()}`,
        name,
        email,
        password, // In real app, hash this
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        chronotype: 'Third Bird',
        mainGoal: 'Productivity',
        onboarded: false,
        theme: 'cyber'
    };

    saveUser(newUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return newUser;
};

export const loginWithEmail = async (email: string, password: string): Promise<UserProfile> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        throw new Error("Invalid credentials.");
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
};

export const loginWithGoogle = async (): Promise<UserProfile> => {
    // Simulates Google OAuth
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Since we can't get a real Google User without a backend/clientId in this env,
    // We simulate a "Google User" account.
    const email = "google_user@example.com";
    const users = getUsers();
    let user = users.find(u => u.email === email);

    if (!user) {
        user = {
            id: 'user_google_default',
            name: 'Google User',
            email: email,
            password: '', 
            avatar: 'https://lh3.googleusercontent.com/a/default-user',
            chronotype: 'Third Bird',
            mainGoal: 'Productivity',
            onboarded: false,
            theme: 'cyber'
        };
        saveUser(user);
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
};

export const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = '/';
};

export const getAuthUser = (): UserProfile | null => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
};

export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem(SESSION_KEY);
};

export const updateCurrentUser = (updates: Partial<UserProfile>) => {
    const current = getAuthUser();
    if (current) {
        const updated = { ...current, ...updates };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        saveUser(updated); // Sync to DB
    }
};
