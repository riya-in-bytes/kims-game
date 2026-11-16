import { Image, StyleSheet, Text } from 'react-native';
import type { GameItem } from '@/game/types';

interface Props {
  item: GameItem;
  size: number;
}

/** Renders a game item. Switches on `kind` so new pack types plug in here. */
export function ItemVisual({ item, size }: Props) {
  switch (item.kind) {
    case 'emoji':
      return (
        <Text allowFontScaling={false} style={[styles.emoji, { fontSize: size, lineHeight: size * 1.3 }]}>
          {item.value}
        </Text>
      );
    case 'image':
      return (
        <Image source={item.source} resizeMode="contain" style={{ width: size * 1.4, height: size * 1.4 }} />
      );
  }
}

const styles = StyleSheet.create({
  emoji: { textAlign: 'center', includeFontPadding: false },
});
