import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useFeedback } from '@/feedback/useFeedback';
import { colors, radius, spacing } from '@/theme/tokens';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  accent?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ label, onPress, variant = 'primary', accent = colors.primary, disabled, style }: Props) {
  const feedback = useFeedback();
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const primary = variant === 'primary';

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={() => {
        scale.set(withSpring(0.96));
      }}
      onPressOut={() => {
        scale.set(withSpring(1));
      }}
      onPress={() => {
        feedback.tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={[
        styles.base,
        primary ? { backgroundColor: accent } : styles.ghost,
        disabled && styles.disabled,
        pressStyle,
        style,
      ]}>
      <Text style={[styles.label, !primary && { color: colors.text }]}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghost: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabled: { opacity: 0.35 },
  label: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', letterSpacing: 0.2 },
});
