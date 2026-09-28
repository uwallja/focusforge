import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MoonIcon,
  BellIcon,
  CrownIcon,
  RotateCcwIcon,
  InfoIcon,
  ChevronRightIcon,
  XIcon,
  CheckIcon,
  UserIcon,
} from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { useStore } from '@/src/lib/store';
import { Card, SectionTitle } from '@/components/ui';
import {
  DEMO_MODE_MESSAGE,
  getOfferings,
  purchaseOffering,
  restorePurchases,
  type PremiumOffering,
} from '@/src/lib/purchases';

cssInterop(MoonIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(BellIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(CrownIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(RotateCcwIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(InfoIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(ChevronRightIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(XIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(CheckIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });
cssInterop(UserIcon, { className: { target: 'style', nativeStyleToProp: { color: true } } });

function SettingRow({
  icon,
  label,
  sub,
  right,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  right?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3.5">
      {icon}
      <View className="flex-1">
        <Text className="text-foreground font-medium">{label}</Text>
        {sub ? <Text className="text-xs text-foreground/70">{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export default function Settings() {
  const { state, setSetting, updateProfileName, unlockPremium } = useStore();
  const { settings, profile } = state;

  const [paywallOpen, setPaywallOpen] = useState(false);
  const [offerings, setOfferings] = useState<PremiumOffering[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<string>('premium_yearly');
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [status, setStatus] = useState('');
  const [editingName, setEditingName] = useState(profile.name);
  const [nameOpen, setNameOpen] = useState(false);

  useEffect(() => {
    if (paywallOpen) {
      getOfferings().then((o) => setOfferings(o)).catch(() => setOfferings([]));
    }
  }, [paywallOpen]);

  const handlePurchase = async () => {
    setPurchasing(true);
    setStatus('');
    const result = await purchaseOffering(selectedOffering);
    if (result.success) {
      unlockPremium();
      setStatus('Premium unlocked! 🎉');
      setTimeout(() => setPaywallOpen(false), 900);
    } else {
      setStatus('Purchase failed. Please try again.');
    }
    setPurchasing(false);
  };

  const handleRestore = async () => {
    setRestoring(true);
    setStatus('');
    const restored = await restorePurchases();
    if (restored) {
      unlockPremium();
      setStatus('Purchases restored.');
    } else {
      setStatus('No previous purchases found.');
    }
    setRestoring(false);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-foreground pt-4 pb-6">Settings</Text>

        {/* Profile */}
        <SectionTitle>Profile</SectionTitle>
        <Pressable onPress={() => setNameOpen(true)} className="active:scale-[0.99]">
          <Card className="flex-row items-center gap-3 mb-5">
            <LinearGradient
              colors={['#8B5CF6', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 50,
                height: 50,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Text className="text-white text-xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View className="flex-1">
              <Text className="font-semibold text-foreground">{profile.name}</Text>
              <Text className="text-xs text-muted-foreground">
                Level {Math.max(1, Math.floor(profile.xp / 100) + 1)} · {profile.xp} XP
              </Text>
            </View>
            <ChevronRightIcon size={20} className="text-muted-foreground" />
          </Card>
        </Pressable>

        {/* Preferences */}
        <SectionTitle>Preferences</SectionTitle>
        <Card className="mb-5 overflow-hidden">
          <SettingRow
            icon={<MoonIcon size={20} className="text-primary" />}
            label="Dark mode"
            sub="Easier on the eyes at night"
            right={
              <Switch
                value={settings.darkMode}
                onValueChange={(v) => setSetting('darkMode', v)}
                trackColor={{ true: '#8B5CF6', false: '#3f3f52' }}
                thumbColor="#fff"
              />
            }
          />
          <View className="h-px bg-border mx-4" />
          <SettingRow
            icon={<BellIcon size={20} className="text-primary" />}
            label="Notifications"
            sub="Reminders to stay on track"
            right={
              <Switch
                value={settings.notifications}
                onValueChange={(v) => setSetting('notifications', v)}
                trackColor={{ true: '#8B5CF6', false: '#3f3f52' }}
                thumbColor="#fff"
              />
            }
          />
        </Card>

        {/* Premium */}
        <SectionTitle>Subscription</SectionTitle>
        <Card className="mb-5">
          {settings.premium ? (
            <View className="px-4 py-3.5 flex-row items-center gap-3">
              <CrownIcon size={20} className="text-primary" />
              <View className="flex-1">
                <Text className="font-medium text-foreground">Premium active</Text>
                <Text className="text-xs text-muted-foreground">
                  Unlimited courses · custom intervals · analytics
                </Text>
              </View>
              <CheckIcon size={20} className="text-primary" />
            </View>
          ) : (
            <>
              <Pressable onPress={() => setPaywallOpen(true)} className="active:scale-[0.99]">
                <SettingRow
                  icon={<CrownIcon size={20} className="text-primary" />}
                  label="FocusForge Premium"
                  sub="Unlock everything"
                  right={<ChevronRightIcon size={20} className="text-muted-foreground" />}
                />
              </Pressable>
              <Pressable onPress={handleRestore} className="active:scale-[0.99] px-4 py-3">
                <Text className="text-primary font-medium text-sm">
                  {restoring ? 'Restoring…' : 'Restore purchases'}
                </Text>
              </Pressable>
            </>
          )}
        </Card>

        {/* About */}
        <SectionTitle>About</SectionTitle>
        <Card className="overflow-hidden">
          <SettingRow
            icon={<InfoIcon size={20} className="text-primary" />}
            label="About FocusForge"
            sub="Version 1.0.0"
            right={<ChevronRightIcon size={20} className="text-muted-foreground" />}
          />
        </Card>
      </ScrollView>

      {/* Edit name modal */}
      <Modal visible={nameOpen} transparent animationType="slide" onRequestClose={() => setNameOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setNameOpen(false)} />
          <View className="bg-card rounded-t-3xl px-5 pt-6 pb-10">
            <View className="w-10 h-1 rounded-full bg-muted self-center mb-6" />
            <Text className="text-xl font-bold text-foreground mb-4">Edit Name</Text>
            <TextInput
              value={editingName}
              onChangeText={setEditingName}
              placeholder="Your name"
              placeholderTextColor="#9A9AB0"
              className="bg-background border border-border rounded-xl px-4 py-3.5 text-foreground mb-4"
            />
            <Pressable
              onPress={() => {
                updateProfileName(editingName.trim() || 'Student');
                setNameOpen(false);
              }}
              className="active:scale-[0.97]"
            >
              <LinearGradient
                colors={['#8B5CF6', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 14, padding: 16 }}
                className="items-center"
              >
                <Text className="text-white font-bold">Save</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Paywall modal */}
      <Modal visible={paywallOpen} transparent animationType="slide" onRequestClose={() => setPaywallOpen(false)}>
        <View className="flex-1 justify-end">
          <Pressable
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
            onPress={() => setPaywallOpen(false)}
          />
          <LinearGradient
            colors={['#1B1530', '#101B33']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <CrownIcon size={28} color="#C4B5FD" />
              <Pressable
                onPress={() => setPaywallOpen(false)}
                className="w-9 h-9 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
              >
                <XIcon size={20} color="#FFFFFF" />
              </Pressable>
            </View>

            <Text className="text-3xl font-bold text-white mb-1">FocusForge Premium</Text>
            <Text className="text-white/75 mb-2">
              Supercharge your study and stay consistent.
            </Text>
            <Text className="text-sm mb-6" style={{ color: '#C4B5FD' }}>
              {DEMO_MODE_MESSAGE}
            </Text>

            {/* Offerings */}
            <View className="gap-3 mb-6">
              {offerings.map((o) => (
                <Pressable
                  key={o.id}
                  onPress={() => setSelectedOffering(o.id)}
                  style={{
                    borderWidth: 2,
                    borderColor: selectedOffering === o.id ? '#8B5CF6' : 'transparent',
                    backgroundColor: 'rgba(139,92,246,0.08)',
                    borderRadius: 16,
                    padding: 16,
                  }}
                  className="active:scale-[0.98]"
                >
                  <View className="flex-row items-center justify-between">
                    <View>
                      <Text className="text-base font-semibold text-white">{o.title}</Text>
                      <Text className="text-xs text-white/70">{o.period}</Text>
                    </View>
                    <Text className="text-2xl font-bold" style={{ color: '#C4B5FD' }}>
                      {o.price}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Perks */}
            <View className="gap-2 mb-6">
              {offerings[0]?.perks.map((perk) => (
                <View key={perk} className="flex-row items-center gap-2">
                  <CheckIcon size={16} color="#C4B5FD" />
                  <Text className="text-sm text-white">{perk}</Text>
                </View>
              ))}
            </View>

            {status ? (
              <Text className="text-center text-sm text-primary mb-3">{status}</Text>
            ) : null}

            <Pressable onPress={handlePurchase} disabled={purchasing} className="active:scale-[0.97]">
              <LinearGradient
                colors={['#8B5CF6', '#3B82F6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ borderRadius: 16, padding: 18, opacity: purchasing ? 0.6 : 1 }}
                className="items-center"
              >
                <Text className="text-white font-bold text-base">
                  {purchasing ? 'Processing…' : 'Start Premium'}
                </Text>
              </LinearGradient>
            </Pressable>

            <Pressable onPress={handleRestore} className="mt-4">
              <Text className="text-center text-white/75">
                {restoring ? 'Restoring…' : 'Restore purchases'}
              </Text>
            </Pressable>
          </LinearGradient>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
