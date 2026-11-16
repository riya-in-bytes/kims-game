import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { colors, radius } from '@/theme/tokens';

interface Props {
  durationMs: number;
  /** Time left; the bar starts from remainingMs / durationMs full. */
  remainingMs: number;
  paused?: boolean;
  color: string;
}

/** A bar that drains to empty over the remaining time, and freezes while paused. */
export function CountdownBar({ durationMs, remainingMs, paused = false, color }: Props) {
  const progress = useSharedValue(1);

  useEffect(() => {
    if (paused) {
      cancelAnimation(progress);
      return;
    }
    progress.set(durationMs > 0 ? remainingMs / durationMs : 0);
    progress.set(withTiming(0, { duration: remainingMs, easing: Easing.linear }));
  }, [durationMs, remainingMs, paused, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceStrong,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
});
