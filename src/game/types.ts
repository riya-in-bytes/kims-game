export type ModeId = 'recall' | 'missing' | 'changed';

/**
 * A thing that can appear on the tray. Phase 1 ships emoji; the `kind`
 * discriminator is the extension point for illustrated or photographic packs.
 */
export type GameItem = { id: string; label: string } & (
  | { kind: 'emoji'; value: string }
  | { kind: 'image'; source: number | { uri: string } }
);

export interface ItemPack {
  id: string;
  name: string;
  items: readonly GameItem[];
}

export interface LevelConfig {
  level: number;
  /** Items shown on the tray during the study phase. */
  itemCount: number;
  /** How many selections the player must make. */
  targetCount: number;
  /** Unseen items mixed into the choice tray. */
  distractorCount: number;
  studyMs: number;
  /** Whether the tray is re-ordered before the answer phase. */
  shuffleOnReveal: boolean;
  columns: number;
}

export interface Round {
  config: LevelConfig;
  /** What the player studies. */
  board: GameItem[];
  /** What is shown on the tray during the answer phase (may be empty). */
  answerBoard: GameItem[];
  /** A separate tray of options to pick from (may be empty). */
  choices: GameItem[];
  /** Ids the player should select. */
  targetIds: string[];
}

export type AnswerSource = 'board' | 'choices';

export interface ModeDefinition {
  id: ModeId;
  title: string;
  tagline: string;
  howToPlay: string;
  icon: string;
  accent: string;
  prompts: { study: string; answer: string };
  answerSource: AnswerSource;
  levelFor(level: number): LevelConfig;
  buildRound(config: LevelConfig, pack: ItemPack, rng: Rng): Round;
}

export type Rng = () => number;

export interface RoundResult {
  hits: string[];
  falsePicks: string[];
  missed: string[];
  perfect: boolean;
  points: number;
}
