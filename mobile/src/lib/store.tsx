import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, useCallback, useMemo, createContext, useContext, type ReactNode } from 'react';
import type { AppState, Course, StudySession, Badge, DailyGoal, Assignment, AssignmentPriority } from './types';
import {
  XP_PER_SESSION,
  XP_STREAK_BONUS,
  computeLevel,
  buildDefaultBadges,
  BADGE_DEFINITIONS,
  dateKey,
  weekKey,
} from './gamification';

const STORAGE_KEY = 'focusforge_state_v1';

const daysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const defaultAssignments: Assignment[] = [
  {
    id: 'assignment-1',
    courseId: 'course-1',
    title: 'Calculus problem set 4',
    dueDate: daysFromNow(1),
    priority: 'High',
    notes: 'Finish questions 1–6 before class.',
    completed: false,
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'assignment-2',
    courseId: 'course-2',
    title: 'Data structures lab review',
    dueDate: daysFromNow(3),
    priority: 'Medium',
    notes: 'Check the queue and graph traversal sections.',
    completed: false,
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'assignment-3',
    courseId: 'course-3',
    title: 'Physics reading notes',
    dueDate: daysFromNow(5),
    priority: 'Low',
    notes: 'Summarize the chapter and highlight formulas.',
    completed: true,
    createdAt: Date.now() - 86400000,
  },
];

const defaultState: AppState = {
  profile: {
    name: 'Student',
    xp: 160,
    level: 2,
    streak: 2,
    longestStreak: 4,
    sessionsCompleted: 6,
    totalFocusMinutes: 150,
    weekFocusMinutes: 90,
    todayFocusMinutes: 25,
    lastStudyDate: null,
  },
  courses: [
    {
      id: 'course-1',
      name: 'Calculus I',
      color: 'purple',
      assignments: 1,
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'course-2',
      name: 'Data Structures',
      color: 'blue',
      assignments: 1,
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'course-3',
      name: 'Physics 101',
      color: 'green',
      assignments: 1,
      createdAt: Date.now() - 86400000,
    },
  ],
  assignments: defaultAssignments,
  sessions: [],
  badges: buildDefaultBadges().map((b) =>
    b.id === 'first-session' || b.id === 'streak-3'
      ? { ...b, unlockedAt: Date.now() - 86400000 }
      : b,
  ),
  goals: [
    {
      id: 'goal-1',
      title: 'Study 60 minutes today',
      targetMinutes: 60,
      progressMinutes: 25,
      done: false,
    },
    {
      id: 'goal-2',
      title: 'Finish 2 assignments',
      targetMinutes: 90,
      progressMinutes: 0,
      done: false,
    },
  ],
  settings: {
    darkMode: true,
    notifications: true,
    premium: false,
    focusMinutes: 25,
    breakMinutes: 5,
    premiumTheme: 'aurora',
  },
};

export interface Store {
  state: AppState;
  hydrated: boolean;
  // profile / gamification
  addXp: (amount: number) => void;
  completeSession: (focusMinutes: number) => void;
  completeGoal: (goalId: string) => void;
  addGoal: (title: string, targetMinutes: number) => void;
  // courses
  addCourse: (name: string, color: Course['color']) => boolean;
  removeCourse: (id: string) => void;
  updateCourseAssignments: (id: string, delta: number) => void;
  addAssignment: (
    courseId: string,
    title: string,
    dueDate: string,
    priority: AssignmentPriority,
    notes?: string,
  ) => boolean;
  updateAssignment: (assignmentId: string, nextValues: Partial<Assignment>) => void;
  deleteAssignment: (assignmentId: string) => void;
  toggleAssignmentComplete: (assignmentId: string) => void;
  // settings
  setSetting: <K extends keyof AppState['settings']>(
    key: K,
    value: AppState['settings'][K],
  ) => void;
  updateProfileName: (name: string) => void;
  unlockPremium: () => void;
}

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  const syncCourseAssignmentCounts = useCallback((next: AppState) => ({
    ...next,
    courses: next.courses.map((course) => ({
      ...course,
      assignments: next.assignments.filter((assignment) => assignment.courseId === course.id).length,
    })),
  }), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw && mounted) {
          const parsed = JSON.parse(raw) as AppState;
          const hydratedState = {
            ...defaultState,
            ...parsed,
            assignments: Array.isArray(parsed.assignments) ? parsed.assignments : defaultAssignments,
          };
          setState(syncCourseAssignmentCounts(hydratedState));
        }
      } catch {
        // ignore corrupt storage, fall back to defaults
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(syncCourseAssignmentCounts(state))).catch(() => {});
  }, [state, hydrated, syncCourseAssignmentCounts]);

  const setStatePartial = useCallback(
    (updater: (prev: AppState) => AppState) => {
      setState((prev) => updater(prev));
    },
    [],
  );

  const reevaluateBadges = useCallback(
    (profile: AppState['profile'], badges: Badge[], assignments: Assignment[]): Badge[] => {
      const now = Date.now();
      const completedAssignmentsCount = assignments.filter((assignment) => assignment.completed).length;
      return badges.map((badge) => {
        if (badge.unlockedAt) return badge;
        const def = BADGE_DEFINITIONS.find((d) => d.id === badge.id);
        if (!def) return badge;
        const unlocked = def.check({
          streak: profile.streak,
          longestStreak: profile.longestStreak,
          sessionsCompleted: profile.sessionsCompleted,
          totalFocusMinutes: profile.totalFocusMinutes,
          completedAssignmentsCount,
          totalAssignments: assignments.length,
        });
        return unlocked ? { ...badge, unlockedAt: now } : badge;
      });
    },
    [],
  );

  const addXp = useCallback(
    (amount: number) => {
      setStatePartial((prev) => ({
        ...prev,
        profile: { ...prev.profile, xp: prev.profile.xp + amount },
      }));
    },
    [setStatePartial],
  );

  const completeSession = useCallback(
    (focusMinutes: number) => {
      setStatePartial((prev) => {
        const p = prev.profile;
        const today = dateKey();
        const thisWeek = weekKey();
        const isNewDay = p.lastStudyDate !== today;
        // Streak: if last studied yesterday, increment; if already today keep; else reset to 1
        let streak = p.streak;
        if (isNewDay) {
          const yesterday = dateKey(new Date(Date.now() - 86400000));
          streak = p.lastStudyDate === yesterday ? p.streak + 1 : 1;
        }
        const longestStreak = Math.max(p.longestStreak, streak);

        const session: StudySession = {
          id: `s-${Date.now()}`,
          startAt: Date.now() - focusMinutes * 60000,
          durationMinutes: focusMinutes,
          xpAwarded: XP_PER_SESSION,
          completedAt: Date.now(),
        };

        const newProfile = {
          ...p,
          xp: p.xp + XP_PER_SESSION + XP_STREAK_BONUS(streak),
          sessionsCompleted: p.sessionsCompleted + 1,
          totalFocusMinutes: p.totalFocusMinutes + focusMinutes,
          weekFocusMinutes: isNewDay ? p.weekFocusMinutes + focusMinutes : p.weekFocusMinutes + focusMinutes,
          todayFocusMinutes: isNewDay ? focusMinutes : p.todayFocusMinutes + focusMinutes,
          streak,
          longestStreak,
          lastStudyDate: today,
        };

        const badges = reevaluateBadges(newProfile, prev.badges, prev.assignments);
        return {
          ...prev,
          profile: newProfile,
          sessions: [session, ...prev.sessions].slice(0, 100),
          badges,
        };
      });
    },
    [setStatePartial, reevaluateBadges],
  );

  const completeGoal = useCallback(
    (goalId: string) => {
      setStatePartial((prev) => {
        const goal = prev.goals.find((g) => g.id === goalId);
        if (!goal || goal.done) return prev;
        const xp = 50;
        const newProfile = { ...prev.profile, xp: prev.profile.xp + xp };
        return {
          ...prev,
          profile: newProfile,
          goals: prev.goals.map((g) =>
            g.id === goalId ? { ...g, done: true, progressMinutes: g.targetMinutes } : g,
          ),
          badges: reevaluateBadges(newProfile, prev.badges, prev.assignments),
        };
      });
    },
    [setStatePartial, reevaluateBadges],
  );

  const addGoal = useCallback(
    (title: string, targetMinutes: number) => {
      setStatePartial((prev) => ({
        ...prev,
        goals: [
          ...prev.goals,
          { id: `goal-${Date.now()}`, title, targetMinutes, progressMinutes: 0, done: false },
        ],
      }));
    },
    [setStatePartial],
  );

  const addCourse = useCallback(
    (name: string, color: Course['color']): boolean => {
      let created = false;
      setStatePartial((prev) => {
        if (!prev.settings.premium && prev.courses.length >= 3) return prev;
        created = true;
        const course = { id: `course-${Date.now()}`, name, color, assignments: 0, createdAt: Date.now() };
        return syncCourseAssignmentCounts({
          ...prev,
          courses: [...prev.courses, course],
        });
      });
      return created;
    },
    [setStatePartial, syncCourseAssignmentCounts],
  );

  const addAssignment = useCallback(
    (courseId: string, title: string, dueDate: string, priority: AssignmentPriority, notes = ''): boolean => {
      if (!title.trim()) return false;
      setStatePartial((prev) => {
        const assignment: Assignment = {
          id: `assignment-${Date.now()}`,
          courseId,
          title: title.trim(),
          dueDate,
          priority,
          notes: notes.trim(),
          completed: false,
          createdAt: Date.now(),
        };
        const next = {
          ...prev,
          assignments: [assignment, ...prev.assignments],
        };
        return syncCourseAssignmentCounts(next);
      });
      return true;
    },
    [setStatePartial, syncCourseAssignmentCounts],
  );

  const updateAssignment = useCallback(
    (assignmentId: string, nextValues: Partial<Assignment>) => {
      setStatePartial((prev) => {
        const next = {
          ...prev,
          assignments: prev.assignments.map((assignment) =>
            assignment.id === assignmentId ? { ...assignment, ...nextValues } : assignment,
          ),
        };
        return syncCourseAssignmentCounts(next);
      });
    },
    [setStatePartial, syncCourseAssignmentCounts],
  );

  const deleteAssignment = useCallback(
    (assignmentId: string) => {
      setStatePartial((prev) => {
        const next = {
          ...prev,
          assignments: prev.assignments.filter((assignment) => assignment.id !== assignmentId),
        };
        return syncCourseAssignmentCounts(next);
      });
    },
    [setStatePartial, syncCourseAssignmentCounts],
  );

  const toggleAssignmentComplete = useCallback(
    (assignmentId: string) => {
      setStatePartial((prev) => {
        const assignment = prev.assignments.find((item) => item.id === assignmentId);
        if (!assignment) return prev;

        const toggled = { ...assignment, completed: !assignment.completed };
        const updatedAssignments = prev.assignments.map((item) =>
          item.id === assignmentId ? toggled : item,
        );

        const gainedXp = toggled.completed && !assignment.completed
          ? 30 + (toggled.priority === 'High' ? 20 : toggled.priority === 'Medium' ? 10 : 0)
          : 0;

        const nextProfile = {
          ...prev.profile,
          xp: prev.profile.xp + gainedXp,
        };

        return syncCourseAssignmentCounts({
          ...prev,
          assignments: updatedAssignments,
          profile: nextProfile,
          badges: reevaluateBadges(nextProfile, prev.badges, updatedAssignments),
        });
      });
    },
    [setStatePartial, reevaluateBadges, syncCourseAssignmentCounts],
  );

  const removeCourse = useCallback(
    (id: string) => {
      setStatePartial((prev) => ({
        ...prev,
        assignments: prev.assignments.filter((assignment) => assignment.courseId !== id),
        courses: prev.courses.filter((c) => c.id !== id),
      }));
    },
    [setStatePartial],
  );

  const updateCourseAssignments = useCallback(
    (id: string, delta: number) => {
      setStatePartial((prev) => {
        const courseAssignments = prev.assignments.filter((assignment) => assignment.courseId === id);
        if (courseAssignments.length === 0 && delta < 0) return prev;
        if (delta > 0) {
          const newAssignment: Assignment = {
            id: `assignment-${Date.now()}`,
            courseId: id,
            title: `New assignment ${courseAssignments.length + 1}`,
            dueDate: daysFromNow(7),
            priority: 'Medium',
            notes: '',
            completed: false,
            createdAt: Date.now(),
          };
          const next = {
            ...prev,
            assignments: [newAssignment, ...prev.assignments],
          };
          return syncCourseAssignmentCounts(next);
        }
        const nextAssignmentId = courseAssignments[0]?.id;
        if (!nextAssignmentId) return prev;
        const next = {
          ...prev,
          assignments: prev.assignments.filter((assignment) =>
            assignment.id !== nextAssignmentId,
          ),
        };
        return syncCourseAssignmentCounts(next);
      });
    },
    [setStatePartial, syncCourseAssignmentCounts],
  );

  const setSetting = useCallback(
    <K extends keyof AppState['settings'],>(key: K, value: AppState['settings'][K]) => {
      setStatePartial((prev) => ({
        ...prev,
        settings: { ...prev.settings, [key]: value },
      }));
    },
    [setStatePartial],
  );

  const updateProfileName = useCallback(
    (name: string) => {
      setStatePartial((prev) => ({
        ...prev,
        profile: { ...prev.profile, name },
      }));
    },
    [setStatePartial],
  );

  const unlockPremium = useCallback(() => {
    setStatePartial((prev) => ({
      ...prev,
      settings: { ...prev.settings, premium: true },
    }));
  }, [setStatePartial]);

  const value = useMemo<Store>(
    () => ({
      state,
      hydrated,
      addXp,
      completeSession,
      completeGoal,
      addGoal,
      addCourse,
      removeCourse,
      updateCourseAssignments,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      toggleAssignmentComplete,
      setSetting,
      updateProfileName,
      unlockPremium,
    }),
    [
      state,
      hydrated,
      addXp,
      completeSession,
      completeGoal,
      addGoal,
      addCourse,
      removeCourse,
      updateCourseAssignments,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      toggleAssignmentComplete,
      setSetting,
      updateProfileName,
      unlockPremium,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
