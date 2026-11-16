import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { Button } from '@/components/Button';
import { RoundView } from '@/components/RoundView';
import { Screen } from '@/components/Screen';
import { Segmented } from '@/components/Segmented';
import { TopBar } from '@/components/TopBar';
import { useFeedback } from '@/feedback/useFeedback';
import { DIFFICULTY_TUNING } from '@/game/difficulty';
import { DEFAULT_PACK } from '@/game/items';
import { MATCH_ROUNDS, MAX_PLAYERS, MIN_PLAYERS, standings, useMatch, type Player } from '@/game/match';
import { MODES } from '@/game/modes';
import type { ModeDefinition, ModeId } from '@/game/types';
import { useRoundTimers } from '@/hooks/useRoundTimers';
import { useSettings } from '@/settings/SettingsProvider';
import { colors, radius, spacing, type, withAlpha } from '@/theme/tokens';

const MEDALS = ['🥇', '🥈', '🥉', '4️⃣'];

interface MatchSetup {
  modeId: ModeId;
  names: string[];
}

/** Pass-and-play: set up players, then run a match. Local state only, no saved stats. */
export default function PartyScreen() {
  // The last setup is kept so "Change players" reopens the form already filled in.
  const [setup, setSetup] = useState<MatchSetup>({ modeId: MODES[0].id, names: ['Player 1', 'Player 2'] });
  const [playing, setPlaying] = useState(false);
  const [matchKey, setMatchKey] = useState(0);

  if (!playing) {
    return (
      <SetupView
        initial={setup}
        onStart={(next) => {
          setSetup(next);
          setMatchKey((key) => key + 1);
          setPlaying(true);
        }}
      />
    );
  }
  const mode = MODES.find((m) => m.id === setup.modeId) ?? MODES[0];
  return <MatchView key={matchKey} mode={mode} names={setup.names} onNewPlayers={() => setPlaying(false)} />;
}

function SetupView({ initial, onStart }: { initial: MatchSetup; onStart: (setup: MatchSetup) => void }) {
  const router = useRouter();
  const { difficulty } = useSettings().settings;
  const [modeId, setModeId] = useState<ModeId>(initial.modeId);
  const [names, setNames] = useState<string[]>(initial.names);
  const mode = MODES.find((m) => m.id === modeId) ?? MODES[0];

  const setName = (index: number, value: string) =>
    setNames((current) => current.map((name, i) => (i === index ? value : name)));

  const start = () =>
    onStart({ modeId, names: names.map((name, i) => name.trim() || `Player ${i + 1}`) });

  return (
    <Screen>
      <TopBar title="👥 Pass & Play" subtitle={DIFFICULTY_TUNING[difficulty].label} onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
        <ScrollView contentContainerStyle={styles.setup} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={type.label}>Game</Text>
            <Segmented
              options={MODES.map((m) => ({ value: m.id, label: m.icon }))}
              value={modeId}
              onChange={setModeId}
              accent={mode.accent}
            />
            <Text style={type.heading}>{mode.title}</Text>
            <Text style={type.bodyMuted}>{mode.tagline}</Text>
          </View>

          <View style={styles.section}>
            <Text style={type.label}>Players</Text>
            {names.map((name, index) => (
              <View key={index} style={styles.playerRow}>
                <TextInput
                  value={name}
                  onChangeText={(value) => setName(index, value)}
                  placeholder={`Player ${index + 1}`}
                  placeholderTextColor={colors.textFaint}
                  maxLength={16}
                  autoCapitalize="words"
                  returnKeyType="done"
                  style={styles.input}
                  accessibilityLabel={`Player ${index + 1} name`}
                />
                {names.length > MIN_PLAYERS && (
                  <Pressable
                    onPress={() => setNames((current) => current.filter((_, i) => i !== index))}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove player ${index + 1}`}
                    style={styles.remove}>
                    <Text style={styles.removeText}>✕</Text>
                  </Pressable>
                )}
              </View>
            ))}
            {names.length < MAX_PLAYERS && (
              <Button
                label="+ Add player"
                variant="ghost"
                onPress={() => setNames((current) => [...current, `Player ${current.length + 1}`])}
              />
            )}
          </View>

          <Text style={[type.bodyMuted, styles.centerText]}>
            {MATCH_ROUNDS} rounds, getting harder each round. Everyone plays the same tray, so look away when it
            isn&apos;t your turn.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.footer}>
        <Button label="Start match" accent={mode.accent} onPress={start} />
      </View>
    </Screen>
  );
}

function MatchView({ mode, names, onNewPlayers }: { mode: ModeDefinition; names: string[]; onNewPlayers: () => void }) {
  const router = useRouter();
  const feedback = useFeedback();
  const { difficulty } = useSettings().settings;
  const [state, dispatch] = useMatch(mode, DEFAULT_PACK, difficulty, names);
  const { phase, players, turn, roundIndex, round, selected, result } = state;
  const player = players[turn];

  const hide = useCallback(() => dispatch({ type: 'HIDE' }), [dispatch]);
  const reveal = useCallback(() => dispatch({ type: 'REVEAL' }), [dispatch]);
  const timer = useRoundTimers({ status: phase, round, onHide: hide, onReveal: reveal, onTick: feedback.tick });

  const announced = useRef(result);
  useEffect(() => {
    if (!result || result === announced.current) return;
    announced.current = result;
    if (result.perfect) feedback.success();
    else feedback.error();
  }, [result, feedback]);

  const lastTurnOfRound = turn === players.length - 1;
  const nextLabel = !lastTurnOfRound
    ? `Pass to ${players[turn + 1].name} →`
    : roundIndex + 1 < MATCH_ROUNDS
      ? `Round ${roundIndex + 2} →`
      : 'See final scores →';

  return (
    <Screen>
      <TopBar
        title={`${mode.icon} ${mode.title}`}
        subtitle={phase === 'final' ? 'Final' : `Round ${roundIndex + 1}/${MATCH_ROUNDS}`}
        onBack={() => router.back()}
      />

      {phase !== 'final' && (
        <View style={styles.hud}>
          <Text style={[styles.turnName, { color: mode.accent }]} numberOfLines={1}>
            {player.name}
          </Text>
          <Text style={styles.turnScore}>{player.score} pts</Text>
        </View>
      )}

      {phase === 'handoff' && (
        <Animated.View key={`${roundIndex}-${turn}`} entering={FadeInDown.springify().damping(18)} style={styles.centered}>
          <Animated.Text entering={ZoomIn.springify()} style={styles.bigIcon}>
            📱
          </Animated.Text>
          <Text style={[type.title, styles.centerText]}>Pass to {player.name}</Text>
          <Text style={[type.bodyMuted, styles.centerText]}>
            Everyone else, look away! Round {roundIndex + 1} · {round.config.itemCount} items
          </Text>
          <Scoreboard players={players} highlight={turn} accent={mode.accent} />
          <Button
            label={`I'm ${player.name}, start`}
            accent={mode.accent}
            onPress={() => dispatch({ type: 'BEGIN_TURN' })}
            style={styles.cta}
          />
        </Animated.View>
      )}

      {(phase === 'study' || phase === 'hidden' || phase === 'answer' || phase === 'result') && (
        <RoundView
          mode={mode}
          status={phase}
          round={round}
          selected={selected}
          result={result}
          timer={timer}
          onHide={hide}
          onToggle={(id) => dispatch({ type: 'TOGGLE', id })}
          onSubmit={() => dispatch({ type: 'SUBMIT' })}
          resultActions={<Button label={nextLabel} accent={mode.accent} onPress={() => dispatch({ type: 'NEXT' })} />}
        />
      )}

      {phase === 'final' && (
        <FinalView
          players={players}
          accent={mode.accent}
          onRematch={() => dispatch({ type: 'REMATCH' })}
          onNewPlayers={onNewPlayers}
          onHome={() => router.back()}
        />
      )}
    </Screen>
  );
}

function Scoreboard({ players, highlight, accent }: { players: Player[]; highlight?: number; accent: string }) {
  return (
    <View style={styles.scoreboard}>
      {players.map((p, index) => (
        <View
          key={index}
          style={[styles.scoreRow, index === highlight && { backgroundColor: withAlpha(accent, 0.18) }]}>
          <Text style={[type.body, styles.scoreName]} numberOfLines={1}>
            {p.name}
          </Text>
          <Text style={styles.scoreValue}>{p.score}</Text>
        </View>
      ))}
    </View>
  );
}

function FinalView({
  players,
  accent,
  onRematch,
  onNewPlayers,
  onHome,
}: {
  players: Player[];
  accent: string;
  onRematch: () => void;
  onNewPlayers: () => void;
  onHome: () => void;
}) {
  const ranked = standings(players);
  const top = ranked[0].score;
  const winners = ranked.filter((p) => p.score === top);
  const headline = winners.length > 1 ? "It's a tie!" : `${winners[0].name} wins!`;

  return (
    <ScrollView contentContainerStyle={styles.final} showsVerticalScrollIndicator={false}>
      <Animated.Text entering={ZoomIn.springify()} style={styles.bigIcon}>
        🏆
      </Animated.Text>
      <Text style={[type.title, styles.centerText]}>{headline}</Text>
      <View style={styles.scoreboard}>
        {ranked.map((p, index) => {
          // Tied players share a place.
          const place = ranked.findIndex((other) => other.score === p.score);
          return (
            <Animated.View
              key={`${p.name}-${index}`}
              entering={FadeInDown.delay(200 + index * 120).springify().damping(16)}
              style={[styles.scoreRow, place === 0 && { backgroundColor: withAlpha(accent, 0.18) }]}>
              <Text style={styles.medal}>{MEDALS[place]}</Text>
              <View style={styles.scoreName}>
                <Text style={type.body} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={styles.perfects}>
                  {p.perfectRounds}/{MATCH_ROUNDS} perfect
                </Text>
              </View>
              <Text style={styles.scoreValue}>{p.score}</Text>
            </Animated.View>
          );
        })}
      </View>
      <View style={styles.finalActions}>
        <Button label="Rematch" accent={accent} onPress={onRematch} />
        <Button label="Change players" variant="ghost" onPress={onNewPlayers} />
        <Button label="Home" variant="ghost" onPress={onHome} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  setup: { paddingVertical: spacing.xl, gap: spacing.xxl },
  section: { gap: spacing.md },
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  remove: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  removeText: { color: colors.textMuted, fontSize: 16, fontWeight: '700' },
  footer: { paddingVertical: spacing.sm },
  hud: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', paddingVertical: spacing.md },
  turnName: { fontSize: 20, fontWeight: '800', flex: 1 },
  turnScore: { color: colors.textMuted, fontSize: 16, fontWeight: '700' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingBottom: spacing.xxl },
  centerText: { textAlign: 'center' },
  bigIcon: { fontSize: 72, textAlign: 'center' },
  cta: { alignSelf: 'stretch', marginTop: spacing.md },
  scoreboard: { alignSelf: 'stretch', gap: spacing.xs },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  scoreName: { flex: 1 },
  scoreValue: { color: colors.text, fontSize: 18, fontWeight: '800' },
  medal: { fontSize: 24 },
  perfects: { color: colors.textFaint, fontSize: 12, fontWeight: '600' },
  final: { paddingVertical: spacing.xl, gap: spacing.lg, alignItems: 'center' },
  finalActions: { alignSelf: 'stretch', gap: spacing.sm, marginTop: spacing.md },
});
