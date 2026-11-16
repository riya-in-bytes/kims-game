import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { IconButton } from '@/components/IconButton';
import { ModeCard } from '@/components/ModeCard';
import { Screen } from '@/components/Screen';
import { useFeedback } from '@/feedback/useFeedback';
import { DIFFICULTY_TUNING } from '@/game/difficulty';
import { MODES } from '@/game/modes';
import { useProgress } from '@/hooks/useProgress';
import { useSettings } from '@/settings/SettingsProvider';
import { colors, radius, spacing, type } from '@/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const progress = useProgress();
  const feedback = useFeedback();
  const { difficulty } = useSettings().settings;
  const bests = progress[difficulty] ?? {};

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={type.label}>Observation training</Text>
            <View style={styles.icons}>
              <IconButton glyph="📊" label="Stats" onPress={() => router.push('/stats')} />
              <IconButton glyph="⚙️" label="Settings" onPress={() => router.push('/settings')} />
            </View>
          </View>
          <Text style={type.display}>Kim&apos;s Game</Text>
          <Text style={type.bodyMuted}>
            Study the tray. Remember what you saw. Three mistakes and the game is over.
          </Text>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="button"
            accessibilityLabel={`Difficulty: ${DIFFICULTY_TUNING[difficulty].label}. Change in settings.`}
            style={styles.chip}>
            <Text style={styles.chipText}>Difficulty · {DIFFICULTY_TUNING[difficulty].label}</Text>
          </Pressable>
        </Animated.View>

        <View style={styles.cards}>
          {MODES.map((mode, index) => (
            <ModeCard
              key={mode.id}
              mode={mode}
              index={index}
              progress={bests[mode.id]}
              onPress={() => router.push({ pathname: '/play/[mode]', params: { mode: mode.id } })}
            />
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(120 + MODES.length * 90).springify().damping(18)}>
          <Pressable
            onPress={() => {
              feedback.tap('medium');
              router.push('/party');
            }}
            accessibilityRole="button"
            accessibilityLabel="Pass and Play. Take turns with friends on the same device."
            style={({ pressed }) => [styles.party, pressed && styles.partyPressed]}>
            <Text style={styles.partyIcon}>👥</Text>
            <View style={styles.partyBody}>
              <Text style={type.heading}>Pass &amp; Play</Text>
              <Text style={[type.bodyMuted, styles.partyText]}>
                2–4 players take turns on the same trays. Highest score after 5 rounds wins.
              </Text>
            </View>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingVertical: spacing.xl, gap: spacing.xl },
  header: { gap: spacing.sm },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  icons: { flexDirection: 'row', gap: spacing.sm },
  chip: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  cards: { gap: spacing.md },
  party: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  partyPressed: { backgroundColor: colors.surfaceStrong },
  partyIcon: { fontSize: 30, width: 56, textAlign: 'center' },
  partyBody: { flex: 1, gap: spacing.xs },
  partyText: { fontSize: 14, lineHeight: 19 },
});
