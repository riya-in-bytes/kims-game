import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { TopBar } from '@/components/TopBar';
import { DIFFICULTIES, DIFFICULTY_TUNING } from '@/game/difficulty';
import { useSettings } from '@/settings/SettingsProvider';
import { resetProgress } from '@/storage/progress';
import { colors, radius, spacing, type } from '@/theme/tokens';

export default function SettingsScreen() {
  const router = useRouter();
  const { settings, update } = useSettings();
  const [resetDone, setResetDone] = useState(false);

  const confirmReset = () => {
    Alert.alert('Reset all progress?', 'Best scores and stats for every mode and difficulty will be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await resetProgress();
          setResetDone(true);
        },
      },
    ]);
  };

  return (
    <Screen>
      <TopBar title="Settings" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Section title="Difficulty">
          <Segmented
            options={DIFFICULTIES.map((value) => ({ value, label: DIFFICULTY_TUNING[value].label }))}
            value={settings.difficulty}
            onChange={(difficulty) => update({ difficulty })}
          />
          <Text style={type.bodyMuted}>{DIFFICULTY_TUNING[settings.difficulty].description}</Text>
          <Text style={styles.note}>Each difficulty keeps its own best scores.</Text>
        </Section>

        <Section title="Feedback">
          <Row label="Sound effects">
            <Switch
              value={settings.sound}
              onValueChange={(sound) => update({ sound })}
              trackColor={{ true: colors.primary, false: colors.surfaceStrong }}
            />
          </Row>
          <Row label="Vibration">
            <Switch
              value={settings.haptics}
              onValueChange={(haptics) => update({ haptics })}
              trackColor={{ true: colors.primary, false: colors.surfaceStrong }}
            />
          </Row>
        </Section>

        <Section title="Data">
          <Button
            label={resetDone ? 'Progress reset' : 'Reset progress'}
            variant="ghost"
            disabled={resetDone}
            onPress={confirmReset}
          />
        </Section>
      </ScrollView>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={type.label}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={type.body}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: spacing.xl, gap: spacing.xxl },
  section: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  note: { color: colors.textFaint, fontSize: 13 },
});
