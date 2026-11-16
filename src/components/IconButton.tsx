import { Pressable, StyleSheet, Text } from 'react-native';
import { useFeedback } from '@/feedback/useFeedback';
import { colors, radius } from '@/theme/tokens';

interface Props {
  glyph: string;
  label: string;
  onPress: () => void;
}

/** A round button holding a single emoji or symbol. */
export function IconButton({ glyph, label, onPress }: Props) {
  const feedback = useFeedback();
  return (
    <Pressable
      onPress={() => {
        feedback.tap();
        onPress();
      }}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.glyph}>{glyph}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { backgroundColor: colors.surfaceStrong },
  glyph: { fontSize: 20 },
});
