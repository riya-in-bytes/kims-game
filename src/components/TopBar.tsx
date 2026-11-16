import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, type } from '@/theme/tokens';

interface Props {
  title: string;
  subtitle?: string;
  onBack: () => void;
  /** Optional element on the right, such as an icon button. */
  right?: ReactNode;
}

export function TopBar({ title, subtitle, onBack, right }: Props) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
        <Text style={styles.back}>‹</Text>
      </Pressable>
      <Text style={[type.heading, styles.title]} numberOfLines={1}>
        {title}
      </Text>
      {subtitle && <Text style={type.label}>{subtitle}</Text>}
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingTop: spacing.sm },
  back: { color: colors.text, fontSize: 36, lineHeight: 38, paddingHorizontal: spacing.xs },
  title: { flex: 1 },
});
