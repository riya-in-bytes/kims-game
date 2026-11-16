import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFeedback } from '@/feedback/useFeedback';
import { colors, radius, spacing } from '@/theme/tokens';

interface Props<T extends string | number> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  accent?: string;
}

/** A row of mutually exclusive options. */
export function Segmented<T extends string | number>({ options, value, onChange, accent = colors.primary }: Props<T>) {
  const feedback = useFeedback();
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => {
              feedback.tap();
              onChange(option.value);
            }}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            style={[styles.segment, active && { backgroundColor: accent }]}>
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: spacing.xs,
    gap: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segment: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.pill, alignItems: 'center' },
  label: { color: colors.textMuted, fontSize: 15, fontWeight: '700' },
  labelActive: { color: '#FFFFFF' },
});
