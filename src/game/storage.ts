import type { ActionKind, Arrow, GameState, HistoryEntry, Marker, Nation, SaveFile } from '../types';
import { clamp, normalizeConfig, uid } from './engine';
import { nationName } from './flags';

const KINDS: ActionKind[] = ['start', 'move', 'attack', 'transfer', 'heal', 'range', 'ap', 'flag', 'delete', 'turn'];

function asKind(value: unknown): ActionKind {
  return KINDS.includes(value as ActionKind) ? (value as ActionKind) : 'start';
}

function num(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function sanitizeState(raw: unknown): GameState {
  const source = (raw ?? {}) as { config?: unknown; nations?: unknown };
  const config = normalizeConfig(source.config as never);
  const rawNations = Array.isArray(source.nations) ? source.nations : [];

  const nations: Nation[] = rawNations.map((item, index) => {
    const raw = (item ?? {}) as Record<string, unknown>;
    const flag = Math.max(0, Math.round(num(raw.flag, index)));
    return {
      id: typeof raw.id === 'string' && raw.id ? raw.id : uid(),
      flag,
      name: typeof raw.name === 'string' && raw.name ? raw.name : nationName(flag),
      col: clamp(Math.round(num(raw.col, 0)), 0, config.cols - 1),
      row: clamp(Math.round(num(raw.row, 0)), 0, config.rows - 1),
      hp: Math.max(0, Math.round(num(raw.hp, config.startingHp))),
      ap: Math.max(0, Math.round(num(raw.ap, config.startingAp))),
      range: Math.max(0, Math.round(num(raw.range, config.rangeOnStart))),
    };
  });

  return { config, nations };
}

function sanitizeCell(raw: unknown): { col: number; row: number } {
  const cell = (raw ?? {}) as Record<string, unknown>;
  return { col: Math.max(0, Math.round(num(cell.col, 0))), row: Math.max(0, Math.round(num(cell.row, 0))) };
}

function sanitizeArrows(raw: unknown): Arrow[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      const a = (item ?? {}) as Record<string, unknown>;
      return {
        from: sanitizeCell(a.from),
        to: sanitizeCell(a.to),
        tone: asKind(a.tone),
        dashed: a.dashed === true,
      } satisfies Arrow;
    })
    .filter((a) => a.from.col !== a.to.col || a.from.row !== a.to.row);
}

function sanitizeMarkers(raw: unknown): Marker[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const m = (item ?? {}) as Record<string, unknown>;
    return {
      at: sanitizeCell(m.at),
      tone: asKind(m.tone),
      label: typeof m.label === 'string' ? m.label : '',
    } satisfies Marker;
  });
}

function sanitizeEntry(raw: unknown, index: number): HistoryEntry {
  const entry = (raw ?? {}) as Record<string, unknown>;
  return {
    id: typeof entry.id === 'string' && entry.id ? entry.id : uid(),
    kind: asKind(entry.kind),
    title: typeof entry.title === 'string' && entry.title ? entry.title : `Action ${index}`,
    detail: typeof entry.detail === 'string' ? entry.detail : '',
    time: num(entry.time, Date.now()),
    state: sanitizeState(entry.state),
    arrows: sanitizeArrows(entry.arrows),
    markers: sanitizeMarkers(entry.markers),
  };
}

export function parseSaveFile(text: string): { history: HistoryEntry[]; undone: HistoryEntry[] } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }

  const raw = (data ?? {}) as Record<string, unknown>;
  if (raw.app !== 'alliance') {
    throw new Error('That file was not exported by Alliance.');
  }
  if (!Array.isArray(raw.history) || raw.history.length === 0) {
    throw new Error('The save file contains no history.');
  }

  const history = raw.history.map(sanitizeEntry);
  const last = history[history.length - 1];
  if (!last.state || last.state.nations.length === 0) {
    throw new Error('The save file has no nations on the board.');
  }

  const undone = Array.isArray(raw.undone) ? raw.undone.map(sanitizeEntry) : [];
  return { history, undone };
}

export function buildSaveFile(
  config: GameState['config'],
  history: HistoryEntry[],
  undone: HistoryEntry[],
): SaveFile {
  return {
    app: 'alliance',
    version: 1,
    savedAt: new Date().toISOString(),
    config,
    history,
    undone,
  };
}

export function downloadJson(fileName: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function saveFileName(): string {
  const stamp = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '');
  return `alliance-${stamp}.json`;
}
