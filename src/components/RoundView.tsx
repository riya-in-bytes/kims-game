import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import type { PhaseTimer } from '@/hooks/usePhaseTimer';
import type { GameItem, ModeDefinition, Round, RoundResult } from '@/game/types';
import { colors, radius, spacing, type } from '@/theme/tokens';
import { Button } from './Button';
import { CountdownBar } from './CountdownBar';
import { ItemGrid } from './ItemGrid';
import type { TileState } from './ItemTile';

export type RoundStatus = 'study' | 'hidden' | 'answer' | 'result';

interface Props {
  mode: ModeDefinition;
  status: RoundStatus;
  round: Round;
  selected: readonly string[];
  result: RoundResult | null;
  timer: PhaseTimer;
  onHide: () => void;
  onToggle: (id: string) => void;
  onSubmit: () => void;
  /** Buttons shown under the tray once the round is scored. */
  resultActions: ReactNode;
}

/** One round of play: study the tray, wait while it is covered, answer, see the result. */
export function RoundView({ mode, status, round, selected, result, timer, onHide, onToggle, onSubmit, resultActions }: Props) {
  if (status === 'study') {
    if (timer.paused) return <PausedOverlay accent={mode.accent} onResume={timer.resume} />;
    return (
      <View style={styles.fill}>
        <View style={styles.studyHeader}>
          <Prompt text={mode.prompts.study} style={styles.studyPrompt} />
          <Pressable
            onPress={timer.pause}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Pause"
            style={styles.pauseButton}>
            <Text style={styles.pauseGlyph}>❚❚</Text>
          </Pressable>
        </View>
        <CountdownBar
          durationMs={timer.durationMs}
          remainingMs={timer.remainingMs}
          paused={timer.paused}
          color={mode.accent}
        />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ItemGrid items={round.board} columns={round.config.columns} accent={mode.accent} />
        </ScrollView>
        <Button label="I've got it" variant="ghost" onPress={onHide} />
      </View>
    );
  }

  if (status === 'hidden') {
    return (
      <Animated.View entering={FadeIn.duration(250)} style={styles.centered}>
        <Animated.Text entering={ZoomIn.springify()} style={styles.bigIcon}>
          🫣
        </Animated.Text>
        <Text style={[type.title, styles.centerText]}>Tray covered…</Text>
      </Animated.View>
    );
  }

  const targets = new Set(round.targetIds);
  const picked = new Set(selected);
  const answerState = (item: GameItem): TileState => {
    if (status === 'answer') return picked.has(item.id) ? 'selected' : 'default';
    const isTarget = targets.has(item.id);
    const isPicked = picked.has(item.id);
    if (isTarget && isPicked) return 'correct';
    if (!isTarget && isPicked) return 'wrong';
    if (isTarget) return 'missed';
    return 'default';
  };
  const toggle = status === 'answer' ? onToggle : undefined;
  const boardIsAnswerable = mode.answerSource === 'board';
  const { targetCount } = round.config;

  return (
    <View style={styles.fill}>
      {status === 'answer' && <Prompt text={`${mode.prompts.answer}  ·  ${selected.length}/${targetCount}`} />}
      {status === 'result' && result && <ResultBanner perfect={result.perfect} points={result.points} />}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {round.answerBoard.length > 0 && (
          <ItemGrid
            items={round.answerBoard}
            columns={round.config.columns}
            accent={mode.accent}
            stateFor={boardIsAnswerable ? answerState : undefined}
            onPress={boardIsAnswerable ? toggle : undefined}
          />
        )}
        {round.choices.length > 0 && (
          <Animated.View entering={FadeInUp.delay(150)} style={styles.choices}>
            {round.answerBoard.length > 0 && <Text style={[type.label, styles.centerText]}>Choose from</Text>}
            <ItemGrid items={round.choices} columns={4} accent={mode.accent} stateFor={answerState} onPress={toggle} />
          </Animated.View>
        )}
      </ScrollView>

      {status === 'answer' && (
        <Button
          label={selected.length === targetCount ? 'Check answer' : `Pick ${targetCount - selected.length} more`}
          accent={mode.accent}
          disabled={selected.length !== targetCount}
          onPress={onSubmit}
        />
      )}
      {status === 'result' && <View style={styles.resultActions}>{resultActions}</View>}
    </View>
  );
}

function PausedOverlay({ accent, onResume }: { accent: string; onResume: () => void }) {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.centered}>
      <Text style={styles.bigIcon}>⏸️</Text>
      <Text style={[type.title, styles.centerText]}>Paused</Text>
      <Text style={[type.bodyMuted, styles.centerText]}>The tray is hidden. Your remaining study time is saved.</Text>
      <Button label="Resume" accent={accent} onPress={onResume} style={styles.cta} />
    </Animated.View>
  );
}

function Prompt({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  return (
    <Animated.Text entering={FadeIn} style={[type.heading, styles.prompt, style]}>
      {text}
    </Animated.Text>
  );
}

function ResultBanner({ perfect, points }: { perfect: boolean; points: number }) {
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(14)}
      style={[styles.banner, { backgroundColor: perfect ? colors.success : colors.danger }]}>
      <Text style={styles.bannerText}>{perfect ? 'Perfect!' : 'Not quite'}</Text>
      <Text style={styles.bannerText}>+{points}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, gap: spacing.md, paddingBottom: spacing.sm },
  studyHeader: { flexDirection: 'row', alignItems: 'center' },
  pauseButton: {
    position: 'absolute',
    right: 0,
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pauseGlyph: { color: colors.text, fontSize: 12, fontWeight: '800', letterSpacing: -1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingBottom: spacing.xxxl },
  centerText: { textAlign: 'center' },
  bigIcon: { fontSize: 72 },
  cta: { alignSelf: 'stretch', marginTop: spacing.lg },
  prompt: { textAlign: 'center' },
  studyPrompt: { flex: 1, paddingHorizontal: spacing.xxl },
  scroll: { paddingVertical: spacing.sm, gap: spacing.lg },
  choices: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  banner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  bannerText: { color: colors.bg, fontSize: 18, fontWeight: '800' },
  resultActions: { gap: spacing.sm },
});
