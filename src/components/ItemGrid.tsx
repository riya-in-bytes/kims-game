import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import type { GameItem } from '@/game/types';
import { spacing } from '@/theme/tokens';
import { ItemTile, type TileState } from './ItemTile';

interface Props {
  items: readonly GameItem[];
  columns: number;
  accent?: string;
  gap?: number;
  stateFor?: (item: GameItem) => TileState;
  onPress?: (id: string) => void;
}

/** Lays items out in a wrapping grid, sizing tiles to the available width. */
export function ItemGrid({ items, columns, accent, gap = spacing.md, stateFor, onPress }: Props) {
  const [width, setWidth] = useState(0);
  const tileSize = width > 0 ? Math.floor((width - gap * (columns - 1)) / columns) : 0;

  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  return (
    <View onLayout={onLayout} style={[styles.grid, { gap }]}>
      {tileSize > 0 &&
        items.map((item, index) => (
          <ItemTile
            key={item.id}
            item={item}
            size={tileSize}
            index={index}
            accent={accent}
            state={stateFor?.(item)}
            onPress={onPress}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: '100%' },
});
