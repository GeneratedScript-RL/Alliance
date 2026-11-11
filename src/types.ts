export interface Cell {
  col: number;
  row: number;
}

export interface ApCosts {
  transfer: number;
  attack: number;
  heal: number;
  move: number;
  increaseRange: number;
}

export interface GameConfig {
  cols: number;
  rows: number;
  playerCount: number;
  rangeOnStart: number;
  maxRange: number;
  startingHp: number;
  startingAp: number;
  apGainPerTurn: number;
  attackDamage: number;
  healAmount: number;
  apCosts: ApCosts;
}

export interface Nation {
  id: string;
  flag: number;
  name: string;
  col: number;
  row: number;
  hp: number;
  ap: number;
  range: number;
}

export interface GameState {
  config: GameConfig;
  nations: Nation[];
}

export interface CustomFlag {
  index: number;
  name: string;
  dataUrl: string;
}

export type ActionKind =
  | 'start'
  | 'move'
  | 'attack'
  | 'transfer'
  | 'heal'
  | 'range'
  | 'ap'
  | 'flag'
  | 'delete'
  | 'turn';

export interface Arrow {
  from: Cell;
  to: Cell;
  tone: ActionKind;
  dashed?: boolean;
}

export interface Marker {
  at: Cell;
  tone: ActionKind;
  label: string;
}

export interface HistoryEntry {
  id: string;
  kind: ActionKind;
  title: string;
  detail: string;
  time: number;
  state: GameState;
  arrows: Arrow[];
  markers: Marker[];
}

export interface SaveFile {
  app: 'alliance';
  version: 1;
  savedAt: string;
  config: GameConfig;
  history: HistoryEntry[];
  undone: HistoryEntry[];
  customFlags?: CustomFlag[];
}

export type Mode =
  | { type: 'idle' }
  | { type: 'attack'; actorId: string }
  | { type: 'transfer'; actorId: string }
  | { type: 'free-move'; actorId: string };
