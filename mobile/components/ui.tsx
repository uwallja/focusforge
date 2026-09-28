import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={`bg-card rounded-2xl p-4 ${className}`}>
      {children}
    </View>
  );
}

export function SectionTitle({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-xl font-semibold text-foreground">{children}</Text>
      {right}
    </View>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-xs font-semibold uppercase tracking-widest text-primary">
      {children}
    </Text>
  );
}

export function ProgressBar({
  progress,
  className = '',
  barClassName = '',
}: {
  progress: number; // 0..1
  className?: string;
  barClassName?: string;
}) {
  const pct = Math.max(0, Math.min(progress, 1)) * 100;
  return (
    <View className={`w-full h-2.5 rounded-full bg-muted overflow-hidden ${className}`}>
      <LinearGradient
        colors={['#8B5CF6', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: `${pct}%`, height: '100%', borderRadius: 999 }}
        className={barClassName as any}
      />
    </View>
  );
}

export function Metric({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <View className="flex-1 items-start">
      <Text className="text-xs text-muted-foreground mb-1">{label}</Text>
      <Text
        className={
          accent
            ? 'text-2xl font-bold text-primary'
            : 'text-2xl font-bold text-foreground'
        }
      >
        {value}
      </Text>
      {sub ? <Text className="text-xs text-muted-foreground mt-0.5">{sub}</Text> : null}
    </View>
  );
}
