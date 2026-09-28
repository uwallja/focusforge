import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  SparklesIcon,
  FlameIcon,
  TrophyIcon,
  CrownIcon,
  ShieldIcon,
  TargetIcon,
  HammerIcon,
  LockIcon,
  ZapIcon,
  TimerIcon,
} from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { useStore } from '@/src/lib/store';
import { Card, SectionTitle, Metric, ProgressBar } from '@/components/ui';
import { computeLevel } from '@/src/lib/gamification';

cssInterop(SparklesIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(FlameIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(TrophyIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(CrownIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(ShieldIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(TargetIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(HammerIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(LockIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(ZapIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(TimerIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

const ICON_MAP: Record<string, any> = {
  SparklesIcon,
  FlameIcon,
  TrophyIcon,
  CrownIcon,
  ShieldIcon,
  TargetIcon,
  HammerIcon,
};

export default function Progress() {
  const { state } = useStore();
  const { profile, badges } = state;
  const levelInfo = computeLevel(profile.xp);

  const unlocked = badges.filter((b) => b.unlockedAt);
  const locked = badges.filter((b) => !b.unlockedAt);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-foreground pt-4 pb-6">Progress</Text>

        {/* Level card */}
        <LinearGradient
          colors={['#1B1530', '#101B33']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 24, padding: 20, marginBottom: 20 }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-xl bg-primary/20 items-center justify-center">
                <ZapIcon size={24} className="text-primary" />
              </View>
              <View>
                <Text className="text-3xl font-bold text-foreground">
                  Level {levelInfo.level}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  {profile.xp} total XP
                </Text>
              </View>
            </View>
          </View>
          <ProgressBar progress={levelInfo.progress} />
          <Text className="text-xs text-muted-foreground mt-2">
            {levelInfo.xpNeeded - levelInfo.xpIntoLevel} XP to Level {levelInfo.level + 1}
          </Text>
        </LinearGradient>

        {/* Stats grid */}
        <SectionTitle>Your Stats</SectionTitle>
        <Card className="mb-3 flex-row flex-wrap gap-y-5">
          <View className="w-1/2">
            <Metric label="Sessions" value={String(profile.sessionsCompleted)} />
          </View>
          <View className="w-1/2">
            <Metric label="Current Streak" value={`${profile.streak} days`} accent />
          </View>
          <View className="w-1/2">
            <Metric label="Longest Streak" value={`${profile.longestStreak} days`} />
          </View>
          <View className="w-1/2">
            <Metric label="This Week" value={`${profile.weekFocusMinutes}m`} />
          </View>
        </Card>

        <Card className="mb-6 flex-row items-center gap-3">
          <TimerIcon size={20} className="text-primary" />
          <Text className="text-sm text-foreground flex-1">Total focus time</Text>
          <Text className="text-base font-bold text-foreground">
            {Math.floor(profile.totalFocusMinutes / 60)}h {profile.totalFocusMinutes % 60}m
          </Text>
        </Card>

        {/* Achievements */}
        <SectionTitle right={<Text className="text-xs text-muted-foreground">{unlocked.length}/{badges.length}</Text>}>
          Achievements
        </SectionTitle>

        {/* Unlocked */}
        {unlocked.length > 0 && (
          <View className="gap-3 mb-4">
            {unlocked.map((badge) => {
              const Icon = ICON_MAP[badge.icon] ?? TrophyIcon;
              return (
                <Card key={badge.id} className="flex-row items-center gap-3">
                  <LinearGradient
                    colors={['#F59E0B', '#F97316']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} color="#fff" />
                  </LinearGradient>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">{badge.title}</Text>
                    <Text className="text-xs text-muted-foreground">{badge.description}</Text>
                  </View>
                  {badge.unlockedAt && (
                    <Text className="text-[10px] text-muted-foreground">
                      {new Date(badge.unlockedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <View className="gap-3">
            {locked.map((badge) => {
              const Icon = ICON_MAP[badge.icon] ?? TrophyIcon;
              return (
                <Card key={badge.id} className="flex-row items-center gap-3 opacity-60">
                  <View
                    className="w-[46px] h-[46px] rounded-xl bg-muted"
                    style={{
                      width: 46,
                      height: 46,
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <LockIcon size={20} className="text-muted-foreground" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">{badge.title}</Text>
                    <Text className="text-xs text-muted-foreground">{badge.description}</Text>
                  </View>
                  <LockIcon size={16} className="text-muted-foreground" />
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
