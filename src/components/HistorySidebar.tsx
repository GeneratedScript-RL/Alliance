import { useEffect, useRef, type ReactNode } from 'react';
import type { ActionKind, HistoryEntry } from '../types';
import {
  IconAttack,
  IconFlag,
  IconHeal,
  IconMove,
  IconPlus,
  IconRange,
  IconRedo,
  IconStar,
  IconTransfer,
  IconTrash,
  IconTurn,
  IconUndo,
} from './icons';

const KIND_ICON: Record<ActionKind, ReactNode> = {
  start: <IconStar />,
  move: <IconMove />,
  attack: <IconAttack />,
  transfer: <IconTransfer />,
  heal: <IconHeal />,
  range: <IconRange />,
  ap: <IconPlus />,
  flag: <IconFlag />,
  delete: <IconTrash />,
  turn: <IconTurn />,
};

interface HistorySidebarProps {
  history: HistoryEntry[];
  viewingIndex: number | null;
  onSelect: (index: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
}

export function HistorySidebar({
  history,
  viewingIndex,
  onSelect,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
}: HistorySidebarProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const activeIndex = viewingIndex ?? history.length - 1;

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const active = list.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <h2>History</h2>
        <span className="sidebar-badge">{history.length - 1} actions</span>
      </div>

      <div className="history-list" ref={listRef}>
        {history.map((entry, index) => (
          <button
            key={entry.id}
            type="button"
            data-index={index}
            className={`history-row ${index === activeIndex ? 'active' : ''} ${entry.kind === 'start' ? 'is-start' : ''}`}
            onClick={() => onSelect(index)}
            title={new Date(entry.time).toLocaleTimeString()}
          >
            <span className="history-index">{index === 0 ? '·' : index}</span>
            <span className={`history-icon tone-${entry.kind}`}>{KIND_ICON[entry.kind]}</span>
            <span className="history-text">
              <strong>{entry.title}</strong>
              {entry.detail && <small>{entry.detail}</small>}
            </span>
          </button>
        ))}
      </div>

      <div className="sidebar-foot">
        <div className="sidebar-buttons">
          <button type="button" className="btn subtle" onClick={onUndo} disabled={!canUndo}>
            <IconUndo /> Undo
          </button>
          <button type="button" className="btn subtle" onClick={onRedo} disabled={!canRedo}>
            <IconRedo /> Redo
          </button>
        </div>
        <button type="button" className="btn secondary wide" onClick={onSave}>
          Save game (.json)
        </button>
        <p className="sidebar-hint">Click any entry to rewind the board. Ctrl+Z / Ctrl+Y also work.</p>
      </div>
    </aside>
  );
}
