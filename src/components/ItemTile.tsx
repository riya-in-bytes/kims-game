import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, ZoomIn } from 'react-native-reanimated';
import { useFeedback } from '@/feedback/useFeedback';
import type { GameItem } from '@/game/types';
import { colors, withAlpha } from '@/theme/tokens';
import { ItemVisual } from './ItemVisual';

export type TileState = 'default' | 'selected' | 'correct' | 'wrong' | 'missed' | 'muted';

interface Props {
  item: GameItem;
  size: number;
  state?: TileState;
  index?: number;
  accent?: string;
  onPress?: (id: string) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const ItemTile = React.memo(function ItemTile({
  item,
  size,
  state = 'default',
  index = 0,
  accent = colors.primary,
  onPress,
}: Props) {
  const feedback = useFeedback();
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const look = LOOKS[state](accent);

  return (
    <AnimatedPressable
      entering={ZoomIn.delay(index * 30).springify().damping(16)}
      disabled={!onPress}
      onPressIn={() => {
        scale.set(withSpring(0.9, { damping: 15 }));
      }}
      onPressOut={() => {
        scale.set(withSpring(1, { damping: 12 }));
      }}
      onPress={() => {
        feedback.select();
        onPress?.(item.id);
      }}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: state === 'selected' }}
      style={[
        styles.tile,
        { width: size, height: size, borderRadius: size * 0.24 },
        look.container,
        pressStyle,
      ]}>
      <ItemVisual item={item} size={size * 0.5} />
      {look.badge && (
        <View style={[styles.badge, { backgroundColor: look.badge.color }]}>
          <Text style={styles.badgeText}>{look.badge.glyph}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
});

interface Look {
  container: object;
  badge?: { glyph: string; color: string };
}

const LOOKS: Record<TileState, (accent: string) => Look> = {
  default: () => ({ container: {} }),
  muted: () => ({ container: { opacity: 0.4 } }),
  selected: (accent) => ({
    container: {
      backgroundColor: withAlpha(accent, 0.22),
      borderColor: accent,
      shadowColor: accent,
      shadowOpacity: 0.6,
      shadowRadius: 12,
      elevation: 8,
    },
  }),
  correct: () => ({
    container: { backgroundColor: withAlpha(colors.success, 0.18), borderColor: colors.success },
    badge: { glyph: '✓', color: colors.success },
  }),
  wrong: () => ({
    container: { backgroundColor: withAlpha(colors.danger, 0.18), borderColor: colors.danger },
    badge: { glyph: '✕', color: colors.danger },
  }),
  missed: () => ({
    container: { borderColor: colors.warning, borderStyle: 'dashed' },
    badge: { glyph: '!', color: colors.warning },
  }),
};

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.bg, fontSize: 13, fontWeight: '800' },
});
