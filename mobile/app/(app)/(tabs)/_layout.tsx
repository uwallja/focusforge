import { Tabs } from 'expo-router';
import {
  LayoutDashboardIcon,
  TimerIcon,
  BookOpenIcon,
  TrendingUpIcon,
  SettingsIcon,
} from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { useTheme } from '@/src/providers/ThemeProvider';

cssInterop(LayoutDashboardIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(TimerIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(BookOpenIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(TrendingUpIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(SettingsIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

export default function TabsLayout() {
  const { isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#0E0E18' : '#FFFFFF',
          borderTopColor: isDark ? '#1E1B2E' : '#ECECF3',
        },
        tabBarActiveTintColor: isDark ? '#A78BFA' : '#7C3AED',
        tabBarInactiveTintColor: isDark ? '#5A5A72' : '#9A9AB0',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }) => (
            <LayoutDashboardIcon
              className={focused ? 'text-primary' : 'text-muted-foreground'}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="timer"
        options={{
          title: 'Timer',
          tabBarIcon: ({ focused }) => (
            <TimerIcon
              className={focused ? 'text-primary' : 'text-muted-foreground'}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: 'Courses',
          tabBarIcon: ({ focused }) => (
            <BookOpenIcon
              className={focused ? 'text-primary' : 'text-muted-foreground'}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused }) => (
            <TrendingUpIcon
              className={focused ? 'text-primary' : 'text-muted-foreground'}
              size={24}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <SettingsIcon
              className={focused ? 'text-primary' : 'text-muted-foreground'}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  );
}
