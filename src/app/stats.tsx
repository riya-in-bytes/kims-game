import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { TopBar } from '@/components/TopBar';
import { DIFFICULTIES, DIFFICULTY_TUNING, type Difficulty } from '@/game/difficulty';
import { MODES } from '@/game/modes';
import { useProgress } from '@/hooks/useProgress';
import { useSettings } from '@/settings/SettingsProvider';
import { accuracy, progressFor } from '@/storage/progress';
import { colors, radius, spacing, type, withAlpha } from '@/theme/tokens';

export default function StatsScreen() {
  const router = useRouter();
  const progress = useProgress();
  const { settings } = useSettings();
  const [difficulty, setDifficulty] = useState<Difficulty>(settings.difficulty);

  return (
    <Screen>
      <TopBar title="Stats" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Segmented
          options={DIFFICULTIES.map((value) => ({ value, label: DIFFICULTY_TUNING[value].label }))}
          value={difficulty}
          onChange={setDifficulty}
        />
        {MODES.map((mode, index) => {
          const p = progressFor(progress, difficulty, mode.id);
          const acc = accuracy(p);
          return (
            <Animated.View
              key={`${difficulty}-${mode.id}`}
              entering={FadeInDown.delay(index * 70).springify().damping(18)}
              style={[styles.card, { borderColor: withAlpha(mode.accent, 0.35) }]}>
              <Text style={type.heading}>
                {mode.icon} {mode.title}
              </Text>
              {p.roundsPlayed === 0 ? (
                <Text style={type.bodyMuted}>Not played on {DIFFICULTY_TUNING[difficulty].label} yet.</Text>
              ) : (
                <View style={styles.grid}>
                  <Stat label="Best score" value={p.bestScore} accent={mode.accent} />
                  <Stat label="Best level" value={p.bestLevel} accent={mode.accent} />
                  <Stat label="Accuracy" value={acc === null ? '–' : `${Math.round(acc * 100)}%`} accent={mode.accent} />
                  <Stat label="Items remembered" value={p.itemsHit} accent={mode.accent} />
                  <Stat label="Current streak" value={p.currentStreak} accent={mode.accent} />
                  <Stat label="Longest streak" value={p.longestStreak} accent={mode.accent} />
                  <Stat label="Perfect rounds" value={`${p.perfectRounds}/${p.roundsPlayed}`} accent={mode.accent} />
                  <Stat label="Games played" value={p.gamesPlayed} accent={mode.accent} />
                </View>
              )}
            </Animated.View>
          );
        })}
        <Text style={styles.note}>Streaks count perfect rounds in a row and carry over between games.</Text>
      </ScrollView>
    </Screen>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color: accent }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: spacing.xl, gap: spacing.lg },
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: colors.surface,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.md },
  stat: { width: '50%', gap: 2 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.textFaint, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  note: { color: colors.textFaint, fontSize: 13, textAlign: 'center' },
});
