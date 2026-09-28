export type CourseColor = 'purple' | 'blue' | 'green' | 'pink' | 'orange' | 'teal';
export type AssignmentPriority = 'Low' | 'Medium' | 'High';

export interface Course {
  id: string;
  name: string;
  color: CourseColor;
  assignments: number;
  createdAt: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueDate: string;
  priority: AssignmentPriority;
  notes: string;
  completed: boolean;
  createdAt: number;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: number | null;
}

export interface StudySession {
  id: string;
  startAt: number;
  durationMinutes: number;
  xpAwarded: number;
  completedAt: number;
}

export interface DailyGoal {
  id: string;
  title: string;
  targetMinutes: number;
  progressMinutes: number;
  done: boolean;
}

export interface Profile {
  name: string;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  sessionsCompleted: number;
  totalFocusMinutes: number;
  weekFocusMinutes: number;
  todayFocusMinutes: number;
  lastStudyDate: string | null;
}

export interface Settings {
  darkMode: boolean;
  notifications: boolean;
  premium: boolean;
  focusMinutes: number;
  breakMinutes: number;
  premiumTheme: string;
}

export interface AppState {
  profile: Profile;
  courses: Course[];
  assignments: Assignment[];
  sessions: StudySession[];
  badges: Badge[];
  goals: DailyGoal[];
  settings: Settings;
}
