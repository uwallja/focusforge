import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Vibration, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PlayIcon, PauseIcon, RotateCcwIcon, CoffeeIcon, BrainIcon } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { useStore } from '@/src/lib/store';
import { CircularProgress } from '@/components/CircularProgress';
import { Card, SectionTitle } from '@/components/ui';

cssInterop(PlayIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(PauseIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(RotateCcwIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(CoffeeIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(BrainIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Timer() {
  const { state, completeSession } = useStore();
  const { settings } = state;

  const [phase, setPhase] = useState<'focus' | 'break'>('focus');
  const [secondsLeft, setSecondsLeft] = useState(settings.focusMinutes * 60);
  const [running, setRunning] = useState(false);
  const [finishedFocus, setFinishedFocus] = useState(false);
  const [completionNotice, setCompletionNotice] = useState('');
  const soundPlayedRef = useRef(false);

  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const secondsRef = useRef(secondsLeft);
  secondsRef.current = secondsLeft;

  const totalSeconds = phase === 'focus' ? settings.focusMinutes * 60 : settings.breakMinutes * 60;

  const triggerCompletionFeedback = useCallback((message: string) => {
    setCompletionNotice(message);
    if (Platform.OS !== 'web') {
      Vibration.vibrate([120, 80, 120]);
    }

    if (typeof window !== 'undefined') {
      const AudioCtor = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtor && !soundPlayedRef.current) {
        soundPlayedRef.current = true;
        const audioContext = new AudioCtor();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        const now = audioContext.currentTime;

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(660, now);
        oscillator.frequency.exponentialRampToValueAtTime(440, now + 0.18);

        gainNode.gain.setValueAtTime(0.0001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.22, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.3);
      }
    }
  }, []);

  // Reset when settings change (custom intervals for premium)
  useEffect(() => {
    if (!running) {
      const t = phase === 'focus' ? settings.focusMinutes * 60 : settings.breakMinutes * 60;
      setSecondsLeft(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.focusMinutes, settings.breakMinutes]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          if (phaseRef.current === 'focus') {
            const minutes = settings.focusMinutes;
            completeSession(minutes);
            setFinishedFocus(true);
            triggerCompletionFeedback('Focus session complete! +25 XP');
            setPhase('break');
            soundPlayedRef.current = false;
            return settings.breakMinutes * 60;
          }

          triggerCompletionFeedback('Break complete — ready to focus again.');
          setPhase('focus');
          soundPlayedRef.current = false;
          return settings.focusMinutes * 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, settings.focusMinutes, settings.breakMinutes, completeSession, triggerCompletionFeedback]);

  const progress = 1 - secondsLeft / totalSeconds;

  const startPause = () => setRunning((r) => !r);

  const reset = () => {
    setRunning(false);
    setFinishedFocus(false);
    setCompletionNotice('');
    soundPlayedRef.current = false;
    const t = phase === 'focus' ? settings.focusMinutes * 60 : settings.breakMinutes * 60;
    setSecondsLeft(t);
  };

  const switchPhase = (p: 'focus' | 'break') => {
    setRunning(false);
    setFinishedFocus(false);
    setCompletionNotice('');
    soundPlayedRef.current = false;
    setPhase(p);
    setSecondsLeft(p === 'focus' ? settings.focusMinutes * 60 : settings.breakMinutes * 60);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-foreground pt-4 pb-2">Focus Timer</Text>
        <Text className="text-sm text-muted-foreground mb-6">
          {phase === 'focus' ? 'Deep work session' : 'Take a breather'}
        </Text>

        {/* Phase toggle */}
        <View className="flex-row bg-card rounded-full p-1 mb-8">
          {(['focus', 'break'] as const).map((p) => (
            <Pressable
              key={p}
              onPress={() => switchPhase(p)}
              className="flex-1 py-2.5 rounded-full items-center active:scale-[0.97]"
            >
              {phase === p ? (
                <LinearGradient
                  colors={p === 'focus' ? ['#8B5CF6', '#6366F1'] : ['#14B8A6', '#10B981']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 999,
                    paddingVertical: 10,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  className="items-center"
                >
                  <Text className="text-white font-semibold">
                    {p === 'focus' ? 'Focus' : 'Break'}
                  </Text>
                </LinearGradient>
              ) : (
                <Text className="text-muted-foreground font-medium">
                  {p === 'focus' ? 'Focus' : 'Break'}
                </Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* Timer circle */}
        <View className="items-center mb-8">
          <CircularProgress progress={progress} size={300} strokeWidth={16}>
            <View className="items-center">
              <Text className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                {phase === 'focus' ? 'Focusing' : 'Break'}
              </Text>
              <Text className="text-6xl font-bold text-foreground tabular-nums">
                {fmt(secondsLeft)}
              </Text>
              <Text className="text-sm text-muted-foreground mt-3">
                {phase === 'focus' ? 'Stay locked in 🔒' : 'Recharge your mind ✨'}
              </Text>
            </View>
          </CircularProgress>
        </View>

        {/* Controls */}
        <View className="flex-row items-center justify-center gap-5 mb-8">
          <Pressable
            onPress={reset}
            className="w-16 h-16 rounded-full bg-card items-center justify-center active:scale-[0.95]"
          >
            <RotateCcwIcon size={26} className="text-muted-foreground" />
          </Pressable>

          <Pressable onPress={startPause} className="active:scale-[0.95]">
            <LinearGradient
              colors={['#8B5CF6', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 84,
                height: 84,
                borderRadius: 42,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              className="items-center justify-center"
            >
              {running ? (
                <PauseIcon size={36} color="#fff" />
              ) : (
                <PlayIcon size={36} color="#fff" fill="#fff" />
              )}
            </LinearGradient>
          </Pressable>

          <View className="w-16 h-16" />
        </View>

        {(finishedFocus || Boolean(completionNotice)) && (
          <Card className="mb-6 border border-primary/20">
            <Text className="text-base font-semibold text-primary mb-1">
              {completionNotice || '🎉 Session complete! +25 XP'}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {phase === 'focus'
                ? 'Great work — take a break and come back stronger.'
                : 'Break finished — your next focus block is ready.'}
            </Text>
          </Card>
        )}

        {/* Stats */}
        <SectionTitle>Today's Stats</SectionTitle>
        <View className="flex-row gap-3">
          <Card className="flex-1">
            <BrainIcon size={18} className="text-primary mb-2" />
            <Text className="text-xl font-bold text-foreground">
              {state.profile.sessionsCompleted}
            </Text>
            <Text className="text-xs text-muted-foreground">Sessions</Text>
          </Card>
          <Card className="flex-1">
            <CoffeeIcon size={18} className="text-chart-2 mb-2" />
            <Text className="text-xl font-bold text-foreground">
              {state.profile.todayFocusMinutes}m
            </Text>
            <Text className="text-xs text-muted-foreground">Today</Text>
          </Card>
          <Card className="flex-1">
            <BrainIcon size={18} className="text-chart-3 mb-2" />
            <Text className="text-xl font-bold text-foreground">
              {state.profile.totalFocusMinutes}m
            </Text>
            <Text className="text-xs text-muted-foreground">Total</Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
