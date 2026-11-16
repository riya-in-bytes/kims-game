import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useFeedback } from '@/feedback/useFeedback';
import type { ModeDefinition } from '@/game/types';
import type { ModeProgress } from '@/storage/progress';
import { colors, radius, spacing, type, withAlpha } from '@/theme/tokens';

interface Props {
  mode: ModeDefinition;
  progress?: ModeProgress;
  index: number;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ModeCard({ mode, progress, index, onPress }: Props) {
  const feedback = useFeedback();
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(120 + index * 90).springify().damping(18)}
      onPressIn={() => {
        scale.set(withSpring(0.97));
      }}
      onPressOut={() => {
        scale.set(withSpring(1));
      }}
      onPress={() => {
        feedback.tap('medium');
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${mode.title}. ${mode.tagline}`}
      style={[styles.card, { borderColor: withAlpha(mode.accent, 0.35) }, pressStyle]}>
      <LinearGradient
        colors={[withAlpha(mode.accent, 0.28), withAlpha(mode.accent, 0.04)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.iconWrap, { backgroundColor: withAlpha(mode.accent, 0.25) }]}>
        <Text style={styles.icon}>{mode.icon}</Text>
      </View>
      <View style={styles.body}>
        <Text style={type.heading}>{mode.title}</Text>
        <Text style={[type.bodyMuted, styles.tagline]}>{mode.tagline}</Text>
        <View style={styles.stats}>
          <Stat label="Best" value={progress?.bestScore ?? 0} />
          <Stat label="Level" value={progress?.bestLevel ?? 0} />
          <Stat label="Played" value={progress?.gamesPlayed ?? 0} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 30 },
  body: { flex: 1, gap: spacing.xs },
  tagline: { fontSize: 14, lineHeight: 19 },
  stats: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  stat: { gap: 1 },
  statValue: { color: colors.text, fontSize: 16, fontWeight: '700' },
  statLabel: { color: colors.textFaint, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
});
