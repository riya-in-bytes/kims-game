import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button } from '@/components/Button';
import { Hud } from '@/components/Hud';
import { RoundView } from '@/components/RoundView';
import { Screen } from '@/components/Screen';
import { TopBar } from '@/components/TopBar';
import { useFeedback } from '@/feedback/useFeedback';
import { DIFFICULTY_TUNING } from '@/game/difficulty';
import { useGame } from '@/game/engine';
import { DEFAULT_PACK } from '@/game/items';
import { getMode } from '@/game/modes';
import type { ModeDefinition } from '@/game/types';
import { useRoundTimers } from '@/hooks/useRoundTimers';
import { useSettings } from '@/settings/SettingsProvider';
import { recordRound } from '@/storage/progress';
import { spacing, type } from '@/theme/tokens';

export default function PlayRoute() {
  const { mode: modeId } = useLocalSearchParams<{ mode: string }>();
  const mode = getMode(modeId);
  if (!mode) return <Redirect href="/" />;
  return <PlayScreen mode={mode} />;
}

function PlayScreen({ mode }: { mode: ModeDefinition }) {
  const router = useRouter();
  const feedback = useFeedback();
  const { difficulty } = useSettings().settings;
  const [state, dispatch] = useGame(mode, DEFAULT_PACK, difficulty);
  const { status, round, selected, result, level, score, lives } = state;

  const hide = useCallback(() => dispatch({ type: 'HIDE' }), [dispatch]);
  const reveal = useCallback(() => dispatch({ type: 'REVEAL' }), [dispatch]);
  const timer = useRoundTimers({ status, round, onHide: hide, onReveal: reveal, onTick: feedback.tick });

  // Record each scored round exactly once, and give feedback as it lands.
  const recorded = useRef(result);
  useEffect(() => {
    if (!result || result === recorded.current) return;
    recorded.current = result;
    if (result.perfect) feedback.success();
    else feedback.error();
    recordRound(difficulty, mode.id, { result, score, level, gameOver: lives <= 0 });
  }, [result, feedback, difficulty, mode.id, score, level, lives]);

  return (
    <Screen>
      <TopBar
        title={`${mode.icon} ${mode.title}`}
        subtitle={DIFFICULTY_TUNING[difficulty].label}
        onBack={() => router.back()}
      />
      <View style={styles.hud}>
        <Hud level={level} score={score} lives={lives} accent={mode.accent} />
      </View>

      {status === 'intro' && (
        <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.centered}>
          <Text style={styles.bigIcon}>{mode.icon}</Text>
          <Text style={[type.title, styles.centerText]}>{mode.title}</Text>
          <Text style={[type.bodyMuted, styles.centerText]}>{mode.howToPlay}</Text>
          <Button label="Start" accent={mode.accent} onPress={() => dispatch({ type: 'START' })} style={styles.cta} />
        </Animated.View>
      )}

      {status !== 'intro' && round && (
        <RoundView
          mode={mode}
          status={status}
          round={round}
          selected={selected}
          result={result}
          timer={timer}
          onHide={hide}
          onToggle={(id) => dispatch({ type: 'TOGGLE', id })}
          onSubmit={() => dispatch({ type: 'SUBMIT' })}
          resultActions={
            lives <= 0 ? (
              <>
                <Text style={[type.bodyMuted, styles.centerText]}>
                  Game over · Final score {score} · Reached level {level}
                </Text>
                <Button label="Play again" accent={mode.accent} onPress={() => dispatch({ type: 'NEXT' })} />
                <Button label="Home" variant="ghost" onPress={() => router.back()} />
              </>
            ) : (
              <Button
                label={result?.perfect ? `Level ${level + 1} →` : 'Try again'}
                accent={mode.accent}
                onPress={() => dispatch({ type: 'NEXT' })}
              />
            )
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hud: { paddingVertical: spacing.md },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingBottom: spacing.xxxl },
  centerText: { textAlign: 'center' },
  bigIcon: { fontSize: 72 },
  cta: { alignSelf: 'stretch', marginTop: spacing.lg },
});
