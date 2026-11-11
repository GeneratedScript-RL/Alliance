import { useCallback, useMemo, useState } from 'react';
import type { GameState, HistoryEntry } from '../types';
import type { Outcome } from './engine';
import { uid } from './engine';

export interface Session {
  history: HistoryEntry[];
  undone: HistoryEntry[];
  viewIndex: number | null;
}

export function makeEntry(outcome: Extract<Outcome, { ok: true }>): HistoryEntry {
  return {
    id: uid(),
    kind: outcome.kind,
    title: outcome.title,
    detail: outcome.detail,
    time: Date.now(),
    state: outcome.state,
    arrows: outcome.arrows,
    markers: outcome.markers,
  };
}

export function startEntry(state: GameState): HistoryEntry {
  const { cols, rows } = state.config;
  return {
    id: uid(),
    kind: 'start',
    title: 'Game created',
    detail: `${cols}×${rows} board · ${state.nations.length} nations`,
    time: Date.now(),
    state,
    arrows: [],
    markers: [],
  };
}

export function useGameSession(initialHistory: HistoryEntry[], initialUndone: HistoryEntry[] = []) {
  const [session, setSession] = useState<Session>(() => ({
    history: initialHistory,
    undone: initialUndone,
    viewIndex: null,
  }));

  const liveEntry = session.history[session.history.length - 1];
  const viewingEntry = session.viewIndex === null ? null : session.history[session.viewIndex] ?? null;
  const displayEntry = viewingEntry ?? liveEntry;

  const commit = useCallback((outcome: Extract<Outcome, { ok: true }>) => {
    const entry = makeEntry(outcome);
    setSession((s) => ({ history: [...s.history, entry], undone: [], viewIndex: null }));
  }, []);

  const undo = useCallback(() => {
    setSession((s) => {
      if (s.history.length <= 1) return s;
      const removed = s.history[s.history.length - 1];
      return {
        history: s.history.slice(0, -1),
        undone: [...s.undone, removed],
        viewIndex: null,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setSession((s) => {
      if (s.undone.length === 0) return s;
      const entry = s.undone[s.undone.length - 1];
      return {
        history: [...s.history, entry],
        undone: s.undone.slice(0, -1),
        viewIndex: null,
      };
    });
  }, []);

  const preview = useCallback((index: number | null) => {
    setSession((s) => {
      if (index === null) return { ...s, viewIndex: null };
      const clamped = Math.max(0, Math.min(index, s.history.length - 1));
      return { ...s, viewIndex: clamped === s.history.length - 1 ? null : clamped };
    });
  }, []);

  return useMemo(
    () => ({
      session,
      history: session.history,
      live: liveEntry.state,
      display: displayEntry.state,
      displayEntry,
      viewingIndex: session.viewIndex,
      interactive: session.viewIndex === null,
      arrows: displayEntry.arrows,
      markers: displayEntry.markers,
      commit,
      undo,
      redo,
      preview,
      canUndo: session.history.length > 1,
      canRedo: session.undone.length > 0,
    }),
    [session, liveEntry, displayEntry, commit, undo, redo, preview],
  );
}
