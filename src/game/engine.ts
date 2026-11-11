import type {
  ActionKind,
  Arrow,
  Cell,
  GameConfig,
  GameState,
  Marker,
  Nation,
} from '../types';
import { nationName } from './flags';

export const DEFAULT_CONFIG: GameConfig = {
  cols: 15,
  rows: 15,
  playerCount: 3,
  rangeOnStart: 3,
  maxRange: 5,
  startingHp: 3,
  startingAp: 1,
  apGainPerTurn: 1,
  attackDamage: 1,
  healAmount: 1,
  apCosts: {
    transfer: 1,
    attack: 1,
    heal: 1,
    move: 1,
    increaseRange: 1,
  },
};

export const LIMITS = {
  cols: [2, 20],
  rows: [2, 20],
  playerCount: [2, 20],
  rangeOnStart: [0, 12],
  maxRange: [0, 12],
  startingHp: [1, 99],
  startingAp: [0, 99],
  apGainPerTurn: [0, 20],
  attackDamage: [1, 99],
  healAmount: [1, 99],
  apCost: [0, 99],
} as const;

export type Outcome =
  | {
      ok: true;
      kind: ActionKind;
      state: GameState;
      title: string;
      detail: string;
      arrows: Arrow[];
      markers: Marker[];
    }
  | { ok: false; error: string };

function fail(error: string): Outcome {
  return { ok: false, error };
}

function done(
  state: GameState,
  kind: ActionKind,
  title: string,
  detail: string,
  arrows: Arrow[] = [],
  markers: Marker[] = [],
): Outcome {
  return { ok: true, kind, state, title, detail, arrows, markers };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function int(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? Math.round(n) : fallback;
}

export function normalizeConfig(input?: Partial<GameConfig> | null): GameConfig {
  const raw = (input ?? {}) as Partial<GameConfig>;
  const rawCosts = (raw.apCosts ?? {}) as Partial<GameConfig['apCosts']>;
  const costs = { ...DEFAULT_CONFIG.apCosts, ...rawCosts };

  const config: GameConfig = {
    cols: clamp(int(raw.cols, DEFAULT_CONFIG.cols), LIMITS.cols[0], LIMITS.cols[1]),
    rows: clamp(int(raw.rows, DEFAULT_CONFIG.rows), LIMITS.rows[0], LIMITS.rows[1]),
    playerCount: clamp(int(raw.playerCount, DEFAULT_CONFIG.playerCount), LIMITS.playerCount[0], LIMITS.playerCount[1]),
    rangeOnStart: clamp(int(raw.rangeOnStart, DEFAULT_CONFIG.rangeOnStart), LIMITS.rangeOnStart[0], LIMITS.rangeOnStart[1]),
    maxRange: clamp(int(raw.maxRange, DEFAULT_CONFIG.maxRange), LIMITS.maxRange[0], LIMITS.maxRange[1]),
    startingHp: clamp(int(raw.startingHp, DEFAULT_CONFIG.startingHp), LIMITS.startingHp[0], LIMITS.startingHp[1]),
    startingAp: clamp(int(raw.startingAp, DEFAULT_CONFIG.startingAp), LIMITS.startingAp[0], LIMITS.startingAp[1]),
    apGainPerTurn: clamp(int(raw.apGainPerTurn, DEFAULT_CONFIG.apGainPerTurn), LIMITS.apGainPerTurn[0], LIMITS.apGainPerTurn[1]),
    attackDamage: clamp(int(raw.attackDamage, DEFAULT_CONFIG.attackDamage), LIMITS.attackDamage[0], LIMITS.attackDamage[1]),
    healAmount: clamp(int(raw.healAmount, DEFAULT_CONFIG.healAmount), LIMITS.healAmount[0], LIMITS.healAmount[1]),
    apCosts: {
      transfer: clamp(int(costs.transfer, 1), LIMITS.apCost[0], LIMITS.apCost[1]),
      attack: clamp(int(costs.attack, 1), LIMITS.apCost[0], LIMITS.apCost[1]),
      heal: clamp(int(costs.heal, 1), LIMITS.apCost[0], LIMITS.apCost[1]),
      move: clamp(int(costs.move, 1), LIMITS.apCost[0], LIMITS.apCost[1]),
      increaseRange: clamp(int(costs.increaseRange, 1), LIMITS.apCost[0], LIMITS.apCost[1]),
    },
  };

  config.playerCount = Math.min(config.playerCount, config.cols * config.rows);
  config.maxRange = Math.max(config.maxRange, config.rangeOnStart);
  return config;
}

export function chebyshev(a: Cell, b: Cell): number {
  return Math.max(Math.abs(a.col - b.col), Math.abs(a.row - b.row));
}

export function isAdjacent(a: Cell, b: Cell): boolean {
  const dx = Math.abs(a.col - b.col);
  const dy = Math.abs(a.row - b.row);
  return (dx !== 0 || dy !== 0) && dx <= 1 && dy <= 1;
}

export function squareAt(state: GameState, col: number, row: number): Nation | undefined {
  return state.nations.find((n) => n.col === col && n.row === row);
}

export function fileLabel(col: number): string {
  return String.fromCharCode(97 + col);
}

export function cellLabel(cell: Cell, rows: number): string {
  return `${fileLabel(cell.col)}${rows - cell.row}`;
}

export function cellsWithin(config: GameConfig, origin: Cell, range: number): Cell[] {
  const out: Cell[] = [];
  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      const cell = { col, row };
      if (cell.col === origin.col && cell.row === origin.row) continue;
      if (chebyshev(cell, origin) <= range) out.push(cell);
    }
  }
  return out;
}

export function targetsInRange(state: GameState, actor: Nation): Nation[] {
  return state.nations.filter(
    (n) => n.id !== actor.id && chebyshev(n, actor) <= actor.range,
  );
}

export function occupiedCells(state: GameState): Set<string> {
  return new Set(state.nations.map((n) => `${n.col},${n.row}`));
}

function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createGame(configInput: GameConfig): GameState {
  const config = normalizeConfig(configInput);
  const cells: Cell[] = [];
  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) cells.push({ col, row });
  }

  const spots = shuffled(cells).slice(0, Math.min(config.playerCount, cells.length));
  const nations: Nation[] = spots.map((cell, index) => ({
    id: uid(),
    flag: index,
    name: nationName(index),
    col: cell.col,
    row: cell.row,
    hp: config.startingHp,
    ap: config.startingAp,
    range: config.rangeOnStart,
  }));

  return { config, nations };
}

function replaceNation(state: GameState, id: string, patch: Partial<Nation>): GameState {
  return { ...state, nations: state.nations.map((n) => (n.id === id ? { ...n, ...patch } : n)) };
}

export function moveNation(state: GameState, id: string, to: Cell): Outcome {
  const nation = state.nations.find((n) => n.id === id);
  if (!nation) return fail('That nation no longer exists.');
  if (nation.col === to.col && nation.row === to.row) return fail('That nation is already there.');
  if (!isAdjacent(nation, to)) return fail('Nations can only move to an adjacent square (diagonals count).');
  if (squareAt(state, to.col, to.row)) return fail('That square is occupied.');

  const cost = state.config.apCosts.move;
  if (nation.ap < cost) return fail(`${nation.name} needs ${cost} AP to move (has ${nation.ap}).`);

  const next = replaceNation(state, id, { col: to.col, row: to.row, ap: nation.ap - cost });
  return done(
    next,
    'move',
    `${nation.name} moved`,
    `${cellLabel(nation, state.config.rows)} → ${cellLabel(to, state.config.rows)} · −${cost} AP (${nation.ap - cost} left)`,
    [{ from: { col: nation.col, row: nation.row }, to, tone: 'move' }],
  );
}

export function freeMoveNation(state: GameState, id: string, to: Cell): Outcome {
  const nation = state.nations.find((n) => n.id === id);
  if (!nation) return fail('That nation no longer exists.');
  if (nation.col === to.col && nation.row === to.row) return fail('That nation is already there.');
  if (squareAt(state, to.col, to.row)) return fail('That square is occupied.');

  const next = replaceNation(state, id, { col: to.col, row: to.row });
  return done(
    next,
    'move',
    `${nation.name} moved freely`,
    `${cellLabel(nation, state.config.rows)} → ${cellLabel(to, state.config.rows)} · no AP cost`,
    [{ from: { col: nation.col, row: nation.row }, to, tone: 'move' }],
  );
}

export function attackNation(state: GameState, actorId: string, targetId: string): Outcome {
  const actor = state.nations.find((n) => n.id === actorId);
  if (!actor) return fail('That nation no longer exists.');
  const target = state.nations.find((n) => n.id === targetId);
  if (!target) return fail('There is no nation on that square.');
  if (target.id === actor.id) return fail('A nation cannot attack itself.');

  const distance = chebyshev(actor, target);
  if (distance > actor.range) {
    return fail(`${target.name} is out of range (distance ${distance}, ${actor.name} has range ${actor.range}).`);
  }

  const cost = state.config.apCosts.attack;
  if (actor.ap < cost) return fail(`${actor.name} needs ${cost} AP to attack (has ${actor.ap}).`);

  const damage = state.config.attackDamage;
  const hpAfter = target.hp - damage;
  const destroyed = hpAfter <= 0;

  let next: GameState = replaceNation(state, actor.id, { ap: actor.ap - cost });
  if (destroyed) {
    next = { ...next, nations: next.nations.filter((n) => n.id !== target.id) };
  } else {
    next = replaceNation(next, target.id, { hp: hpAfter });
  }

  const detail = destroyed
    ? `destroyed (${target.name}) · −${cost} AP`
    : `−${damage} HP (${hpAfter}/${state.config.startingHp}) · −${cost} AP`;

  return done(
    next,
    'attack',
    `${actor.name} attacked ${target.name}`,
    detail,
    [{ from: { col: actor.col, row: actor.row }, to: { col: target.col, row: target.row }, tone: 'attack' }],
    [{ at: { col: target.col, row: target.row }, tone: destroyed ? 'delete' : 'attack', label: destroyed ? '✕' : `−${damage}` }],
  );
}

export function healNation(state: GameState, id: string): Outcome {
  const nation = state.nations.find((n) => n.id === id);
  if (!nation) return fail('That nation no longer exists.');

  const cost = state.config.apCosts.heal;
  if (nation.hp >= state.config.startingHp) return fail(`${nation.name} is already at full HP.`);
  if (nation.ap < cost) return fail(`${nation.name} needs ${cost} AP to heal (has ${nation.ap}).`);

  const healed = Math.min(state.config.startingHp, nation.hp + state.config.healAmount);
  const gained = healed - nation.hp;
  const next = replaceNation(state, id, { hp: healed, ap: nation.ap - cost });

  return done(
    next,
    'heal',
    `${nation.name} healed`,
    `+${gained} HP (${healed}/${state.config.startingHp}) · −${cost} AP`,
    [],
    [{ at: { col: nation.col, row: nation.row }, tone: 'heal', label: `+${gained}` }],
  );
}

export function transferAp(state: GameState, actorId: string, targetId: string): Outcome {
  const actor = state.nations.find((n) => n.id === actorId);
  if (!actor) return fail('That nation no longer exists.');
  const target = state.nations.find((n) => n.id === targetId);
  if (!target) return fail('There is no nation on that square.');
  if (target.id === actor.id) return fail('Pick a different nation to transfer AP to.');

  const cost = state.config.apCosts.transfer;
  if (chebyshev(actor, target) > actor.range) return fail(`${target.name} is out of range.`);
  if (actor.ap < cost) return fail(`${actor.name} needs ${cost} AP to transfer (has ${actor.ap}).`);

  let next = replaceNation(state, actor.id, { ap: actor.ap - cost });
  next = replaceNation(next, target.id, { ap: target.ap + cost });

  return done(
    next,
    'transfer',
    `${actor.name} → ${target.name}`,
    `gifted ${cost} AP · −${cost} AP (${actor.ap - cost} left)`,
    [{ from: { col: actor.col, row: actor.row }, to: { col: target.col, row: target.row }, tone: 'transfer' }],
    [{ at: { col: target.col, row: target.row }, tone: 'transfer', label: `+${cost}` }],
  );
}

export function upgradeRange(state: GameState, id: string): Outcome {
  const nation = state.nations.find((n) => n.id === id);
  if (!nation) return fail('That nation no longer exists.');

  const cost = state.config.apCosts.increaseRange;
  if (nation.range >= state.config.maxRange) {
    return fail(`${nation.name} is already at max range (${state.config.maxRange}).`);
  }
  if (nation.ap < cost) return fail(`${nation.name} needs ${cost} AP to increase range (has ${nation.ap}).`);

  const next = replaceNation(state, id, { range: nation.range + 1, ap: nation.ap - cost });
  return done(
    next,
    'range',
    `${nation.name} upgraded range`,
    `range ${nation.range} → ${nation.range + 1} · −${cost} AP`,
    [],
    [{ at: { col: nation.col, row: nation.row }, tone: 'range', label: `R${nation.range + 1}` }],
  );
}

export function adjustAp(state: GameState, id: string, delta: number): Outcome {
  const nation = state.nations.find((n) => n.id === id);
  if (!nation) return fail('That nation no longer exists.');

  const value = Math.max(0, nation.ap + delta);
  if (value === nation.ap) return fail(`${nation.name} has no AP to remove.`);

  const next = replaceNation(state, id, { ap: value });
  return done(
    next,
    'ap',
    delta > 0 ? `Coordinator added AP` : `Coordinator removed AP`,
    `${nation.name} ${delta > 0 ? '+' : '−'}${Math.abs(delta)} AP (now ${value})`,
    [],
    [{ at: { col: nation.col, row: nation.row }, tone: 'ap', label: delta > 0 ? `+${delta}` : `−${Math.abs(delta)}` }],
  );
}

export function setNationFlag(state: GameState, id: string, flag: number): Outcome {
  const nation = state.nations.find((n) => n.id === id);
  if (!nation) return fail('That nation no longer exists.');

  const name = nationName(flag);
  const next = replaceNation(state, id, { flag, name });
  return done(
    next,
    'flag',
    `Flag changed`,
    `${nation.name} → ${name}`,
    [],
    [{ at: { col: nation.col, row: nation.row }, tone: 'flag', label: '⚑' }],
  );
}

export function deleteNation(state: GameState, id: string): Outcome {
  const nation = state.nations.find((n) => n.id === id);
  if (!nation) return fail('That nation no longer exists.');

  const next = { ...state, nations: state.nations.filter((n) => n.id !== id) };
  return done(
    next,
    'delete',
    `${nation.name} removed`,
    `square ${cellLabel(nation, state.config.rows)} cleared`,
    [],
    [{ at: { col: nation.col, row: nation.row }, tone: 'delete', label: '✕' }],
  );
}

export function grantTurnAp(state: GameState): Outcome {
  const gain = state.config.apGainPerTurn;
  if (gain <= 0) return fail('AP gain per turn is set to 0.');

  const next: GameState = {
    ...state,
    nations: state.nations.map((n) => ({ ...n, ap: n.ap + gain })),
  };

  return done(
    next,
    'turn',
    `Turn AP granted`,
    `+${gain} AP to every nation`,
    [],
    state.nations.map((n) => ({ at: { col: n.col, row: n.row }, tone: 'turn' as ActionKind, label: `+${gain}` })),
  );
}
