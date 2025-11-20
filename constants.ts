
import { Habit, Badge, MarketplaceItem } from './types';
import { Palette, Zap, Music, Shield, Smile, Activity, Layout } from 'lucide-react';

export const STATE_SHIFTERS: Habit[] = [
  { id: 'ss-1', title: '❄️ Cold Surge', description: '2-min cold shower', benefit: 'Energy', category: 'State Shifter', type: 'on-demand', videoId: 'VaMjhwFE1Zw' },
  { id: 'ss-2', title: '🌬️ Oxygen Flood', description: '30 power breaths (Wim Hof)', benefit: 'Alertness', category: 'State Shifter', type: 'on-demand', videoId: 'tybOi4hjZFQ' },
  { id: 'ss-3', title: '🔥 Heat Shock', description: '20-min sauna/hot bath', benefit: 'Relaxation', category: 'State Shifter', type: 'on-demand' },
  { id: 'ss-4', title: '⚡ Power Nap', description: '20 mins max', benefit: 'Reboot', category: 'State Shifter', type: 'on-demand', videoId: '5MuIMqhT8DM' },
  { id: 'ss-5', title: '👁️ Visual Anchor', description: 'Stare at a point for 30s', benefit: 'Focus', category: 'State Shifter', type: 'on-demand' },
  { id: 'ss-6', title: '🎧 40Hz Sync', description: 'Binaural beats listening', benefit: 'Concentration', category: 'State Shifter', type: 'on-demand', videoId: '1UAzQnsW1eE' },
  { id: 'ss-7', title: '📵 Digital Detox', description: 'Phone in another room', benefit: 'Clarity', category: 'State Shifter', type: 'on-demand' },
  { id: 'ss-8', title: '🧘 NSDR Reset', description: '10-min Yoga Nidra', benefit: 'Dopamine Recovery', category: 'State Shifter', type: 'on-demand', videoId: 'pL02HRFk2vo' },
  { id: 'ss-10', title: '🧱 Eat the Frog', description: 'Do 1 hated task now', benefit: 'Grit', category: 'State Shifter', type: 'on-demand' },
  { id: 'ss-11', title: '🌪️ Motion Shift', description: '10 Squats + Shake', benefit: 'Wake Up', category: 'State Shifter', type: 'on-demand' },
  { id: 'ss-12', title: '👀 Horizon Gaze', description: 'Look at distance outside', benefit: 'Calm', category: 'State Shifter', type: 'on-demand' },
];

export const DAILY_PROTOCOL: Habit[] = [
  // Morning
  { id: 'dp-1', time: '06:30', title: '🛌 Wake Up', description: 'Feet on floor immediately', category: 'Morning', type: 'daily' },
  { id: 'dp-2', time: '06:35', title: '🕌 Spirit Anchor', description: 'Prayer / Meditation', category: 'Morning', type: 'daily', videoId: 'inpok4MKVLM' },
  { id: 'dp-3', time: '06:50', title: '📝 Top 3 Goals', description: 'Write them down', category: 'Morning', type: 'daily' },
  { id: 'dp-4', time: '07:00', title: '☀️ Morning Light', description: 'Get sun in eyes (10m)', category: 'Morning', type: 'daily', videoId: '5YV_iKnzDRg' },
  { id: 'dp-5', time: '07:50', title: '🎯 Define MIT', description: 'Most Important Task', category: 'Morning', type: 'daily' },
  // Deep Work
  { id: 'dp-7', time: '08:30', title: '🐸 Deep Work Block', description: '90m hard focus', category: 'Deep Work', type: 'daily' },
  { id: 'dp-9', time: '10:15', title: '🧠 Skill Practice', description: 'Learning session', category: 'Deep Work', type: 'daily' },
  { id: 'dp-11', time: '12:30', title: '🔌 Brain Break', description: 'Walk or NSDR', category: 'Deep Work', type: 'daily', videoId: 'pL02HRFk2vo' },
  // Afternoon
  { id: 'dp-13', time: '14:30', title: '🏋️ Movement', description: 'Pushups / Squats', category: 'Afternoon', type: 'daily', videoId: 'iodx4n62p28' },
  { id: 'dp-14', time: '14:45', title: '📥 Admin Block', description: 'Emails & Chores', category: 'Afternoon', type: 'daily' },
  // Evening
  { id: 'dp-18', time: '20:00', title: '📊 Daily Review', description: 'Log wins & plan', category: 'Evening', type: 'daily' },
  { id: 'dp-19', time: '20:30', title: '📵 Screens Off', description: 'Dim Lights', category: 'Evening', type: 'daily' },
  { id: 'dp-20', time: '21:30', title: '😴 Sleep', description: 'Cool room', category: 'Evening', type: 'daily' },
];

export const BADGES: Badge[] = [
  { id: 'b-1', name: 'Novice Monk', description: 'Reach Level 3', icon: '🌱', xpThreshold: 300 },
  { id: 'b-2', name: 'Dopamine Master', description: 'Reach Level 10', icon: '🧠', xpThreshold: 1000 },
  { id: 'b-3', name: 'Deep Worker', description: 'Complete 5 Deep Work blocks', icon: '⚡', xpThreshold: 500 },
  { id: 'b-4', name: 'Sleep Architect', description: 'Consistent sleep schedule', icon: '🌙', streakThreshold: 7 },
  { id: 'b-5', name: 'Neural Ninja', description: 'Complete all daily habits', icon: '🥷', streakThreshold: 1 },
];

export const MARKETPLACE_ITEMS: MarketplaceItem[] = [
    { id: 'm-1', name: 'Zen Mode', description: 'Minimalist B&W interface.', cost: 0, type: 'theme', icon: Palette },
    { id: 'm-2', name: 'Matrix Mode', description: 'Digital rain aesthetic.', cost: 0, type: 'theme', icon: Zap },
    { id: 'm-3', name: 'Focus Sounds', description: 'Rain, Fire, White Noise.', cost: 0, type: 'module', icon: Music },
    { id: 'm-5', name: 'Cyber Avatar', description: 'Neon profile border.', cost: 0, type: 'feature', icon: Shield },
    { id: 'm-6', name: 'Dashboard Pro', description: 'Advanced charts (Unlocked)', cost: 0, type: 'feature', icon: Layout },
];
