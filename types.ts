
export interface Habit {
  id: string;
  title: string;
  time?: string;
  category: 'Morning' | 'Deep Work' | 'Afternoon' | 'Evening' | 'State Shifter';
  description?: string;
  benefit?: string; // e.g., "Dopamine +250%"
  type: 'daily' | 'on-demand';
  videoId?: string; // YouTube ID
}

export interface LogEntry {
  date: string;
  completedHabitIds: string[];
  journalEntry?: string;
  moodScore?: number;
  stats?: DailyStats;
  plan?: { mit: string; top3: string[]; quote: string };
}

export interface DailyStats {
  focus: number; // 1-100
  energy: number; // 1-100
  mood: number; // 1-100
  wins: string[];
  aiAdvice: string;
  tags?: string[]; // New: AI generated tags
  selectedMood?: string; // New: User selected mood
}

export interface VisionItem {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  timestamp: number;
}

export enum AIModelMode {
  FAST_CHAT = 'Fast Chat', // Flash Lite
  SMART_CHAT = 'Smart Assistant', // Flash
  DEEP_THINK = 'Deep Thinker', // Pro (Thinking)
  RESEARCH = 'Researcher', // Flash (Search)
  ARTIST = 'Artist', // Imagen
  DIRECTOR = 'Director', // Veo
  SPEAKER = 'Speaker', // TTS
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioData?: string; // Base64
  isThinking?: boolean;
  timestamp: number;
  groundingLinks?: { title: string; uri: string }[];
}

export interface AudioContextType {
  audioContext: AudioContext | null;
}

// --- NEW TYPES FOR V2.0 ---

export interface UserProfile {
  id: string; // Unique ID
  name: string;
  email: string;
  password?: string; // Stored for simulation
  avatar?: string;
  chronotype: 'Lark' | 'Owl' | 'Third Bird';
  mainGoal: string; // e.g., "Productivity", "Health", "Learning"
  onboarded: boolean;
  theme: 'cyber' | 'zen' | 'matrix';
}

export interface HealthMetrics {
  hrv: number; // ms
  restingHeartRate: number; // bpm
  sleepScore: number; // 0-100
  sleepHours: number;
  activityScore: number; // 0-100
  steps: number;
  readinessScore: number; // 0-100 (AI Calculated)
  lastSynced: string;
}

export interface GamificationState {
  xp: number;
  level: number;
  streak: number;
  badges: string[]; // IDs of earned badges
  unlockedItems: string[]; // Marketplace IDs
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  xpThreshold?: number;
  streakThreshold?: number;
}

export interface HabitSuggestion {
    title: string;
    description: string;
    benefit: string;
    reason: string; // Why AI suggested it
    videoId?: string;
}

export interface MarketplaceItem {
    id: string;
    name: string;
    description: string;
    cost: number; // Now 0 for most
    type: 'theme' | 'module' | 'feature';
    icon: any;
}

// --- REVIEW SYSTEM ---
export interface WeeklyReviewData {
  startDate: string;
  endDate: string;
  bigWins: string[];
  lessonsLearned: string;
  sleepMatrix: { sleep: number; focus: number; date: string }[];
  nextWeekGoals: string[];
  aiAnalysis?: string;
}
