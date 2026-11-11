import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
import type { Cell, HistoryEntry, Mode, Nation } from '../types';
import {
  adjustAp,
  attackNation,
  cellLabel,
  deleteNation,
  grantTurnAp,
  healNation,
  moveNation,
  setNationFlag,
  transferAp,
  uid,
  upgradeRange,
  type Outcome,
} from '../game/engine';
import { useGameSession } from '../game/session';
import { buildSaveFile, downloadJson, saveFileName } from '../game/storage';
import { Board } from './Board';
import { ContextMenu, type MenuItem } from './ContextMenu';
import { FlagPicker } from './FlagPicker';
import { HistorySidebar } from './HistorySidebar';
import { RulesModal } from './RulesModal';
import {
  IconAttack,
  IconFlag,
  IconHeal,
  IconHelp,
  IconHome,
  IconMinus,
  IconPlus,
  IconRange,
  IconRedo,
  IconSave,
  IconTransfer,
  IconTrash,
  IconTurn,
  IconUndo,
} from './icons';

interface GameScreenProps {
  initialHistory: HistoryEntry[];
  initialUndone: HistoryEntry[];
  onExit: () => void;
}

export function GameScreen({ initialHistory, initialUndone, onExit }: GameScreenProps) {
  const api = useGameSession(initialHistory, initialUndone);
  const { live, display, interactive, viewingIndex, displayEntry, arrows, markers } = api;

  const [mode, setMode] = useState<Mode>({ type: 'idle' });
  const [menu, setMenu] = useState<{ x: number; y: number; id: string } | null>(null);
  const [flagTarget, setFlagTarget] = useState<string | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<{ id: string; text: string }[]>([]);

  const { commit, undo, redo, preview } = api;

  const pushToast = useCallback((text: string) => {
    const id = uid();
    setToasts((list) => [...list, { id, text }]);
    window.setTimeout(() => {
      setToasts((list) => list.filter((toast) => toast.id !== id));
    }, 2600);
  }, []);

  const run = useCallback(
    (outcome: Outcome): boolean => {
      if (!outcome.ok) {
        pushToast(outcome.error);
        return false;
      }
      commit(outcome);
      return true;
    },
    [commit, pushToast],
  );

  useEffect(() => {
    if (!interactive) setMode({ type: 'idle' });
  }, [interactive]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (mod && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && key === 'y') {
        event.preventDefault();
        redo();
        return;
      }
      if (event.key === 'Escape') {
        setMode({ type: 'idle' });
        setMenu(null);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  const handleHoverChange = useCallback((id: string | null) => setHoverId(id), []);

  const handleMove = useCallback(
    (id: string, to: Cell) => {
      if (!interactive) {
        pushToast('Rewinding — return to live to make changes.');
        return;
      }
      const nation = live.nations.find((n) => n.id === id);
      if (!nation) return;
      if (nation.col === to.col && nation.row === to.row) return;
      run(moveNation(live, id, to));
    },
    [interactive, live, pushToast, run],
  );

  const handleCellClick = useCallback(
    (cell: Cell, nation: Nation | undefined) => {
      if (mode.type === 'idle') return;
      const actor = live.nations.find((n) => n.id === mode.actorId);
      if (!actor) {
        setMode({ type: 'idle' });
        return;
      }
      if (nation && nation.id === actor.id) {
        setMode({ type: 'idle' });
        return;
      }
      if (!nation) {
        pushToast(`No nation on ${cellLabel(cell, live.config.rows)}.`);
        return;
      }
      const outcome =
        mode.type === 'attack'
          ? attackNation(live, actor.id, nation.id)
          : transferAp(live, actor.id, nation.id);
      if (run(outcome)) setMode({ type: 'idle' });
    },
    [live, mode, pushToast, run],
  );

  const handleSquareMenu = useCallback(
    (nation: Nation, x: number, y: number) => {
      if (!interactive) {
        pushToast('Rewinding — return to live to make changes.');
        return;
      }
      setMode({ type: 'idle' });
      setMenu({ x, y, id: nation.id });
    },
    [interactive, pushToast],
  );

  const handleSave = useCallback(() => {
    downloadJson(saveFileName(), buildSaveFile(live.config, api.session.history, api.session.undone));
    pushToast('Save file downloaded.');
  }, [api.session.history, api.session.undone, live.config, pushToast]);

  const handleExit = useCallback(() => {
    if (window.confirm('Leave this game? Unsaved progress will be lost.')) onExit();
  }, [onExit]);

  const costs = live.config.apCosts;
  const menuNation = menu ? live.nations.find((n) => n.id === menu.id) : undefined;

  const menuItems: MenuItem[] = useMemo(() => {
    if (!menuNation) return [];
    const id = menuNation.id;
    return [
      {
        key: 'attack',
        label: 'Attack',
        icon: <IconAttack />,
        cost: `−${costs.attack} AP`,
        disabled: menuNation.ap < costs.attack,
        onClick: () => setMode({ type: 'attack', actorId: id }),
      },
      {
        key: 'transfer',
        label: 'Transfer AP',
        icon: <IconTransfer />,
        cost: `−${costs.transfer} AP`,
        disabled: menuNation.ap < costs.transfer,
        onClick: () => setMode({ type: 'transfer', actorId: id }),
      },
      {
        key: 'heal',
        label: 'Heal',
        icon: <IconHeal />,
        cost: `+${live.config.healAmount} HP`,
        disabled: menuNation.ap < costs.heal || menuNation.hp >= live.config.startingHp,
        onClick: () => run(healNation(live, id)),
      },
      {
        key: 'range',
        label: 'Upgrade range',
        icon: <IconRange />,
        cost: `−${costs.increaseRange} AP`,
        disabled: menuNation.ap < costs.increaseRange || menuNation.range >= live.config.maxRange,
        onClick: () => run(upgradeRange(live, id)),
      },
      {
        key: 'add-ap',
        label: 'Add AP',
        icon: <IconPlus />,
        cost: '+1',
        dividerBefore: true,
        onClick: () => run(adjustAp(live, id, 1)),
      },
      {
        key: 'remove-ap',
        label: 'Remove AP',
        icon: <IconMinus />,
        cost: '−1',
        disabled: menuNation.ap <= 0,
        onClick: () => run(adjustAp(live, id, -1)),
      },
      {
        key: 'flag',
        label: 'Edit flag',
        icon: <IconFlag />,
        onClick: () => setFlagTarget(id),
      },
      {
        key: 'delete',
        label: 'Delete square',
        icon: <IconTrash />,
        danger: true,
        dividerBefore: true,
        onClick: () => run(deleteNation(live, id)),
      },
    ];
  }, [costs, live, menuNation, run]);

  const hoveredNation = hoverId ? display.nations.find((n) => n.id === hoverId) : undefined;
  const actor = mode.type !== 'idle' ? live.nations.find((n) => n.id === mode.actorId) : undefined;

  let hud: ReactNode;
  if (!interactive) {
    hud = (
      <>
        Rewinding history — pick an action on the right or{' '}
        <button type="button" className="link" onClick={() => preview(null)}>
          return to live
        </button>
        .
      </>
    );
  } else if (mode.type !== 'idle' && actor) {
    hud =
      mode.type === 'attack' ? (
        <>
          Attacking with <b>{actor.name}</b> (range {actor.range}) — click a nation in range · Esc to cancel
        </>
      ) : (
        <>
          Transferring from <b>{actor.name}</b> (range {actor.range}) — click a nation in range · Esc to cancel
        </>
      );
  } else if (hoveredNation) {
    hud = (
      <>
        <b>{hoveredNation.name}</b> · HP {hoveredNation.hp}/{live.config.startingHp} · range {hoveredNation.range} ·{' '}
        {hoveredNation.ap} AP
      </>
    );
  } else {
    hud = 'Right-click a nation for actions · drag a nation to an adjacent square';
  }

  const flagNation = flagTarget ? live.nations.find((n) => n.id === flagTarget) : undefined;

  return (
    <div className="game-screen">
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-mark small">
            <IconFlag width={20} height={20} />
          </span>
          <div className="topbar-title">
            <strong>Alliance</strong>
            <span>
              {live.config.cols} × {live.config.rows} · {live.nations.length} nations · {api.history.length - 1} actions
            </span>
          </div>
        </div>

        <div className="topbar-actions">
          <button type="button" className="icon-btn" onClick={undo} disabled={!api.canUndo} title="Undo (Ctrl+Z)">
            <IconUndo />
          </button>
          <button type="button" className="icon-btn" onClick={redo} disabled={!api.canRedo} title="Redo (Ctrl+Y)">
            <IconRedo />
          </button>
          <button type="button" className="btn secondary" onClick={handleSave}>
            <IconSave />
            Save
          </button>
          <button type="button" className="icon-btn" onClick={() => setRulesOpen(true)} title="Rules & legend">
            <IconHelp />
          </button>
          <button type="button" className="btn ghost" onClick={handleExit}>
            <IconHome />
            Menu
          </button>
        </div>
      </header>

      <div className="game-body">
        <section className="board-col">
          <div className="board-toolbar">
            <span className="hud">{hud}</span>
            <div className="board-toolbar-actions">
              {mode.type !== 'idle' && (
                <button type="button" className="btn subtle small" onClick={() => setMode({ type: 'idle' })}>
                  Cancel
                </button>
              )}
              <button
                type="button"
                className="btn subtle small"
                onClick={() => run(grantTurnAp(live))}
                disabled={!interactive || live.config.apGainPerTurn <= 0}
                title="Give every nation the configured AP gain"
              >
                <IconTurn />
                Next turn +{live.config.apGainPerTurn}
              </button>
            </div>
          </div>

          {viewingIndex !== null && (
            <div className="preview-banner">
              <span>
                Viewing <b>{displayEntry.title}</b>
                {displayEntry.detail ? ` — ${displayEntry.detail}` : ''}
              </span>
              <button type="button" className="btn primary small" onClick={() => preview(null)}>
                Return to live
              </button>
            </div>
          )}

          <div
            className="board-shell"
            style={{ ['--ratio' as string]: live.config.cols / live.config.rows } as CSSProperties}
          >
            <Board
              state={display}
              interactive={interactive}
              mode={mode}
              arrows={arrows}
              markers={markers}
              onMove={handleMove}
              onCellClick={handleCellClick}
              onSquareMenu={handleSquareMenu}
              onHoverChange={handleHoverChange}
            />
          </div>
        </section>

        <HistorySidebar
          history={api.history}
          viewingIndex={viewingIndex}
          onSelect={(index) => preview(index)}
          onUndo={undo}
          onRedo={redo}
          canUndo={api.canUndo}
          canRedo={api.canRedo}
          onSave={handleSave}
        />
      </div>

      {menu && menuNation && menuItems.length > 0 && (
        <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />
      )}

      {flagNation && (
        <FlagPicker
          current={flagNation.flag}
          squareLabel={`${cellLabel(flagNation, live.config.rows)} (${flagNation.name})`}
          onPick={(flag) => run(setNationFlag(live, flagNation.id, flag))}
          onClose={() => setFlagTarget(null)}
        />
      )}

      {rulesOpen && (
        <RulesModal
          onClose={() => setRulesOpen(false)}
          costs={costs}
          apGainPerTurn={live.config.apGainPerTurn}
          maxRange={live.config.maxRange}
          startingHp={live.config.startingHp}
        />
      )}

      <div className="toasts">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            {toast.text}
          </div>
        ))}
      </div>
    </div>
  );
}
