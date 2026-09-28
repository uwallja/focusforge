import type { Badge } from './types';

export const XP_PER_SESSION = 25;
export const XP_PER_GOAL = 50;
export const XP_STREAK_BONUS = (streak: number) =>
  streak > 0 && streak % 3 === 0 ? 20 : 0;

// Level 1..50 with progressive XP requirements
// xpNeeded(level) = XP required to go from `level` to `level + 1`
export function xpNeeded(level: number): number {
  // Progressive curve: base 100, grows ~22% per level
  return Math.round(100 * Math.pow(level, 1.5));
}

// Total XP required to reach `level` (cumulative from level 1)
export function xpForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += xpNeeded(i);
  }
  return total;
}

export interface LevelInfo {
  level: number;
  xpIntoLevel: number;
  xpNeeded: number;
  progress: number; // 0..1
  levelUp: boolean;
}

export function computeLevel(totalXp: number): LevelInfo {
  let level = 1;
  let remaining = totalXp;
  while (level < 50) {
    const need = xpNeeded(level);
    if (remaining < need) break;
    remaining -= need;
    level++;
  }
  const need = xpNeeded(level);
  return {
    level,
    xpIntoLevel: level >= 50 ? need : remaining,
    xpNeeded: need,
    progress: level >= 50 ? 1 : Math.min(remaining / need, 1),
    levelUp: remaining >= need,
  };
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (state: {
    streak: number;
    longestStreak: number;
    sessionsCompleted: number;
    totalFocusMinutes: number;
    completedAssignmentsCount: number;
    totalAssignments: number;
  }) => boolean;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first-session',
    title: 'First Focus Session',
    description: 'Complete your first study session',
    icon: 'SparklesIcon',
    check: (s) => s.sessionsCompleted >= 1,
  },
  {
    id: 'streak-3',
    title: '3-Day Streak',
    description: 'Study for 3 days in a row',
    icon: 'FlameIcon',
    check: (s) => s.streak >= 3,
  },
  {
    id: 'streak-7',
    title: '7-Day Streak',
    description: 'Study for 7 days in a row',
    icon: 'TrophyIcon',
    check: (s) => s.streak >= 7,
  },
  {
    id: 'streak-30',
    title: '30-Day Streak',
    description: 'Maintain a month-long streak',
    icon: 'CrownIcon',
    check: (s) => s.longestStreak >= 30,
  },
  {
    id: 'study-warrior',
    title: 'Study Warrior',
    description: 'Complete 20 focus sessions',
    icon: 'ShieldIcon',
    check: (s) => s.sessionsCompleted >= 20,
  },
  {
    id: 'focus-master',
    title: 'Focus Master',
    description: 'Accumulate 1000 focus minutes',
    icon: 'TargetIcon',
    check: (s) => s.totalFocusMinutes >= 1000,
  },
  {
    id: 'first-assignment-completed',
    title: 'First Assignment Completed',
    description: 'Check off your first assignment',
    icon: 'BadgeIcon',
    check: (s) => s.completedAssignmentsCount >= 1,
  },
  {
    id: 'assignment-finisher',
    title: 'Assignment Finisher',
    description: 'Complete 5 assignments',
    icon: 'HammerIcon',
    check: (s) => s.completedAssignmentsCount >= 5,
  },
  {
    id: 'deadline-crusher',
    title: 'Deadline Crusher',
    description: 'Finish an assignment before its due date',
    icon: 'ClockIcon',
    check: (s) => s.completedAssignmentsCount >= 3,
  },
  {
    id: 'assignments-7',
    title: '7 Assignments Completed',
    description: 'Complete 7 assignments total',
    icon: 'StarIcon',
    check: (s) => s.completedAssignmentsCount >= 7,
  },
  {
    id: 'assignments-25',
    title: '25 Assignments Completed',
    description: 'Complete 25 assignments total',
    icon: 'CrownIcon',
    check: (s) => s.completedAssignmentsCount >= 25,
  },
];

export function buildDefaultBadges(): Badge[] {
  return BADGE_DEFINITIONS.map((b) => ({
    id: b.id,
    title: b.title,
    description: b.description,
    icon: b.icon,
    unlockedAt: null,
  }));
}

export function dateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function weekKey(d = new Date()): string {
  const date = new Date(d);
  const day = date.getDay(); // 0 Sun .. 6 Sat
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  date.setDate(diff);
  return dateKey(date);
}

export type CourseColor = 'purple' | 'blue' | 'green' | 'pink' | 'orange' | 'teal';

export const COURSE_COLORS: Record<CourseColor, { base: string; soft: string }> = {
  purple: { base: '#8B5CF6', soft: 'rgba(139,92,246,0.16)' },
  blue: { base: '#3B82F6', soft: 'rgba(59,130,246,0.16)' },
  green: { base: '#10B981', soft: 'rgba(16,185,129,0.16)' },
  pink: { base: '#EC4899', soft: 'rgba(236,72,153,0.16)' },
  orange: { base: '#F59E0B', soft: 'rgba(245,158,11,0.16)' },
  teal: { base: '#14B8A6', soft: 'rgba(20,184,166,0.16)' },
};
