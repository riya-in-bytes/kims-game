import { StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { STARTING_LIVES } from '@/game/scoring';
import { colors, radius, spacing } from '@/theme/tokens';

interface Props {
  level: number;
  score: number;
  lives: number;
  accent: string;
}

export function Hud({ level, score, lives, accent }: Props) {
  return (
    <View style={styles.row}>
      <Pill label="Level" value={String(level)} accent={accent} />
      <Pill label="Score" value={String(score)} accent={accent} />
      <View style={styles.lives} accessibilityLabel={`${lives} lives left`}>
        {Array.from({ length: STARTING_LIVES }, (_, i) =>
          // Emoji glyphs ignore `color`, so swap the glyph itself rather than tinting it.
          i < lives ? (
            <Text key={`full-${i}`} style={styles.heart}>
              ❤️
            </Text>
          ) : (
            <Animated.Text key={`lost-${i}`} entering={ZoomIn.springify().damping(10)} style={[styles.heart, styles.heartLost]}>
              💔
            </Animated.Text>
          ),
        )}
      </View>
    </View>
  );
}

function Pill({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={[styles.pillValue, { color: accent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  pillValue: { fontSize: 16, fontWeight: '800' },
  lives: { flexDirection: 'row', marginLeft: 'auto', gap: 2 },
  heart: { fontSize: 18 },
  heartLost: { opacity: 0.45 },
});
