import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { FlameIcon, PlayIcon, TargetIcon, ZapIcon, ClockIcon } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { useStore } from '@/src/lib/store';
import { Card, Eyebrow, ProgressBar, SectionTitle } from '@/components/ui';
import { computeLevel } from '@/src/lib/gamification';

cssInterop(FlameIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(PlayIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(TargetIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(ZapIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(ClockIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const router = useRouter();
  const { state } = useStore();
  const { profile, goals, assignments, settings } = state;
  const levelInfo = computeLevel(profile.xp);

  const activeGoals = goals.filter((g) => !g.done);
  const deadlineItems = [...assignments]
    .filter((assignment) => !assignment.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between pt-4 pb-6">
          <View className="flex-row items-center gap-3">
            <LinearGradient
              colors={['#8B5CF6', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 46,
                height: 46,
                borderRadius: 16,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Text className="text-white text-lg font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View>
              <Text className="text-sm text-muted-foreground">{greeting()},</Text>
              <Text className="text-lg font-bold text-foreground">{profile.name}</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-1.5 bg-card rounded-full px-3 py-1.5">
            <FlameIcon size={16} className="text-primary" />
            <Text className="text-sm font-semibold text-foreground">{profile.streak}</Text>
          </View>
        </View>

        {/* Level / XP hero */}
        <LinearGradient
          colors={settings.darkMode ? ['#1B1530', '#141126'] : ['#FFFFFF', '#F3F4FA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 24,
            padding: 20,
            marginBottom: 20,
            borderWidth: settings.darkMode ? 0 : 1,
            borderColor: '#E7E6F0',
          }}
        >
          <View className="flex-row items-start justify-between mb-4">
            <View>
              <Eyebrow>Level {levelInfo.level}</Eyebrow>
              <Text className="text-3xl font-bold text-foreground mt-1">
                {profile.xp} XP
              </Text>
            </View>
            <View className="items-center bg-primary/10 rounded-2xl px-3 py-2">
              <ZapIcon size={20} className="text-primary" />
              <Text className="text-xs font-semibold text-primary mt-1">+25/session</Text>
            </View>
          </View>

          <ProgressBar progress={levelInfo.progress} />
          <View className="flex-row justify-between mt-2">
            <Text className="text-xs text-muted-foreground">
              {levelInfo.xpIntoLevel} XP
            </Text>
            <Text className="text-xs text-muted-foreground">
              {levelInfo.xpNeeded} XP to Level {levelInfo.level + 1}
            </Text>
          </View>
        </LinearGradient>

        {/* Quick stats */}
        <View className="flex-row gap-3 mb-6">
          <Card className="flex-1">
            <ClockIcon size={18} className="text-primary mb-2" />
            <Text className="text-xl font-bold text-foreground">
              {profile.todayFocusMinutes}m
            </Text>
            <Text className="text-xs text-muted-foreground">Today's study</Text>
          </Card>
          <Card className="flex-1">
            <TargetIcon size={18} className="text-primary mb-2" />
            <Text className="text-xl font-bold text-foreground">
              {profile.sessionsCompleted}
            </Text>
            <Text className="text-xs text-muted-foreground">Sessions</Text>
          </Card>
        </View>

        <View className="mb-6">
          <SectionTitle>Upcoming Deadlines</SectionTitle>
          <View className="gap-3">
            {deadlineItems.length === 0 ? (
              <Card>
                <Text className="text-sm text-muted-foreground text-center py-2">
                  No upcoming assignments — you’re caught up.
                </Text>
              </Card>
            ) : (
              deadlineItems.map((assignment) => {
                const dueDate = new Date(assignment.dueDate);
                const today = new Date();
                const diffDays = Math.ceil((dueDate.getTime() - today.setHours(0, 0, 0, 0)) / 86400000);
                const isUrgent = assignment.priority === 'High' || diffDays <= 1;
                const label = diffDays < 0 ? 'Overdue' : diffDays === 0 ? 'Due today' : diffDays <= 7 ? `Due in ${diffDays}d` : 'Upcoming';

                return (
                  <Card
                    key={assignment.id}
                    className={isUrgent ? 'border border-destructive bg-primary/5' : ''}
                  >
                    <View className="flex-row items-center justify-between gap-3">
                      <View className="flex-1">
                        <Text className="font-semibold text-foreground">{assignment.title}</Text>
                        <Text className="text-xs text-muted-foreground mt-1">
                          {assignment.courseId} · {assignment.priority}
                        </Text>
                      </View>
                      <Text className={isUrgent ? 'text-xs font-semibold text-destructive' : 'text-xs font-semibold text-primary'}>
                        {label}
                      </Text>
                    </View>
                  </Card>
                );
              })
            )}
          </View>
        </View>

        {/* Quick start button */}
        <Pressable
          onPress={() => router.push('/(app)/(tabs)/timer')}
          className="active:scale-[0.97]"
        >
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ borderRadius: 18, padding: 18, marginBottom: 24 }}
            className="flex-row items-center justify-center gap-2"
          >
            <PlayIcon size={20} color="#fff" fill="#fff" />
            <Text className="text-white font-bold text-base">Quick Start Focus Session</Text>
          </LinearGradient>
        </Pressable>

        {/* Active goals */}
        <SectionTitle>Active Goals</SectionTitle>
        {activeGoals.length === 0 ? (
          <Card>
            <Text className="text-sm text-muted-foreground text-center py-4">
              No active goals — add one in Settings to stay on track! 🎯
            </Text>
          </Card>
        ) : (
          <View className="gap-3">
            {activeGoals.map((goal) => {
              const p = Math.min(goal.progressMinutes / goal.targetMinutes, 1);
              return (
                <Card key={goal.id}>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="font-semibold text-foreground flex-1 pr-3">
                      {goal.title}
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                      {goal.progressMinutes}/{goal.targetMinutes}m
                    </Text>
                  </View>
                  <ProgressBar progress={p} barClassName="bg-gradient-to-r from-primary to-chart-2" />
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
