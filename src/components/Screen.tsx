import { LinearGradient } from 'expo-linear-gradient';
import type { PropsWithChildren } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/theme/tokens';

interface Props extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}

export function Screen({ children, style }: Props) {
  return (
    <LinearGradient colors={[colors.gradientTop, colors.gradientBottom]} style={styles.fill}>
      <SafeAreaView edges={['top', 'bottom']} style={[styles.fill, styles.inner, style]}>
        {children}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  inner: { paddingHorizontal: spacing.lg },
});
