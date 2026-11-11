import { useCallback, useEffect, useRef, useState } from 'react';
import type { Arrow, Cell, GameState, Marker, Mode, Nation } from '../types';
import { cellsWithin, fileLabel, isAdjacent, squareAt } from '../game/engine';
import { Flag } from './Flag';

export const TONE_COLORS: Record<string, string> = {
  start: '#9aa0a6',
  move: '#7ad15a',
  attack: '#f2564a',
  transfer: '#59a8e8',
  heal: '#3fcf8e',
  range: '#b48cf2',
  ap: '#f2c14e',
  flag: '#e6e6e6',
  delete: '#e0575a',
  turn: '#9aa0a6',
};

const DRAG_THRESHOLD = 6;

interface BoardProps {
  state: GameState;
  interactive: boolean;
  mode: Mode;
  arrows: Arrow[];
  markers: Marker[];
  onMove: (id: string, to: Cell) => void;
  onCellClick: (cell: Cell, nation: Nation | undefined) => void;
  onSquareMenu: (nation: Nation, x: number, y: number) => void;
  onHoverChange: (id: string | null) => void;
}

export function Board({
  state,
  interactive,
  mode,
  arrows,
  markers,
  onMove,
  onCellClick,
  onSquareMenu,
  onHoverChange,
}: BoardProps) {
  const { cols, rows } = state.config;
  const boardRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ id: string; sx: number; sy: number; active: boolean } | null>(null);
  const handlers = useRef({ onMove, onCellClick, onSquareMenu });
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [hoverCell, setHoverCell] = useState<Cell | null>(null);

  useEffect(() => {
    handlers.current = { onMove, onCellClick, onSquareMenu };
  });

  const cellFromPoint = useCallback(
    (clientX: number, clientY: number): Cell | null => {
      const el = boardRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientY < rect.top ||
        clientX >= rect.right ||
        clientY >= rect.bottom ||
        rect.width === 0 ||
        rect.height === 0
      ) {
        return null;
      }
      const col = Math.floor(((clientX - rect.left) / rect.width) * cols);
      const row = Math.floor(((clientY - rect.top) / rect.height) * rows);
      return {
        col: Math.min(cols - 1, Math.max(0, col)),
        row: Math.min(rows - 1, Math.max(0, row)),
      };
    },
    [cols, rows],
  );

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      const cell = cellFromPoint(event.clientX, event.clientY);
      setHoverCell(cell);
      const drag = dragRef.current;
      if (drag && !drag.active) {
        const travelled = Math.hypot(event.clientX - drag.sx, event.clientY - drag.sy);
        if (travelled > DRAG_THRESHOLD) {
          drag.active = true;
          setDragActive(true);
        }
      }
    };

    const handleUp = (event: PointerEvent) => {
      const drag = dragRef.current;
      dragRef.current = null;
      setDragId(null);
      setDragActive(false);
      if (drag?.active) {
        const cell = cellFromPoint(event.clientX, event.clientY);
        if (cell) handlers.current.onMove(drag.id, cell);
      }
    };

    const handleLeave = () => {
      if (!dragRef.current) setHoverCell(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    window.addEventListener('pointerleave', handleLeave);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
      window.removeEventListener('pointerleave', handleLeave);
    };
  }, [cellFromPoint]);

  const hoveredNation = hoverCell ? squareAt(state, hoverCell.col, hoverCell.row) : undefined;
  const hoveredId = hoveredNation?.id ?? null;

  useEffect(() => {
    onHoverChange(hoveredId);
  }, [hoveredId, onHoverChange]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const cell = cellFromPoint(event.clientX, event.clientY);
    if (!cell) return;

    if (mode.type !== 'idle') {
      handlers.current.onCellClick(cell, squareAt(state, cell.col, cell.row));
      return;
    }
    if (!interactive) return;

    const nation = squareAt(state, cell.col, cell.row);
    if (nation) {
      dragRef.current = { id: nation.id, sx: event.clientX, sy: event.clientY, active: false };
      setDragId(nation.id);
    }
  };

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const cell = cellFromPoint(event.clientX, event.clientY);
    if (!cell) return;
    const nation = squareAt(state, cell.col, cell.row);
    if (nation) handlers.current.onSquareMenu(nation, event.clientX, event.clientY);
  };

  const rangeSource =
    mode.type !== 'idle' ? state.nations.find((n) => n.id === mode.actorId) ?? null : hoveredNation ?? null;
  const rangeCells = rangeSource ? cellsWithin(state.config, rangeSource, rangeSource.range) : [];
  const rangeSet = new Set(rangeCells.map((c) => `${c.col},${c.row}`));

  const dragSource = dragId ? state.nations.find((n) => n.id === dragId) ?? null : null;
  const dragTarget = dragActive ? hoverCell : null;
  const dragValid =
    dragSource && dragTarget
      ? isAdjacent(dragSource, dragTarget) &&
        !squareAt(state, dragTarget.col, dragTarget.row) &&
        dragSource.ap >= state.config.apCosts.move
      : false;
  const dragSet = new Set<string>();
  if (dragActive && dragSource) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (isAdjacent(dragSource, { col, row }) && !squareAt(state, col, row)) dragSet.add(`${col},${row}`);
      }
    }
  }

  const liveArrow: Arrow | null =
    mode.type !== 'idle' && rangeSource && hoverCell
      ? {
          from: { col: rangeSource.col, row: rangeSource.row },
          to: hoverCell,
          tone: mode.type,
          dashed: true,
        }
      : null;

  const cellFor = (cell: Cell): React.CSSProperties => ({
    left: `${(cell.col / cols) * 100}%`,
    top: `${(cell.row / rows) * 100}%`,
    width: `${100 / cols}%`,
    height: `${100 / rows}%`,
  });

  const allArrows = liveArrow ? [...arrows, liveArrow] : arrows;

  return (
    <div
      className={`board ${mode.type !== 'idle' ? 'is-targeting' : ''} ${dragActive ? 'is-dragging' : ''}`}
      ref={boardRef}
      style={{ aspectRatio: `${cols} / ${rows}` }}
      onPointerDown={handlePointerDown}
      onContextMenu={handleContextMenu}
    >
      <div className="board-cells" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: rows * cols }, (_, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const key = `${col},${row}`;
          const classes = ['cell', (col + row) % 2 === 0 ? 'light' : 'dark'];
          if (rangeSet.has(key)) classes.push('hl-range');
          if (dragSet.has(key)) classes.push('hl-drop');
          if (dragTarget && dragTarget.col === col && dragTarget.row === row) {
            classes.push(dragValid ? 'hl-valid' : 'hl-invalid');
          }
          return (
            <div key={key} className={classes.join(' ')}>
              {row === rows - 1 && <span className="coord coord-file">{fileLabel(col)}</span>}
              {col === 0 && <span className="coord coord-rank">{rows - row}</span>}
            </div>
          );
        })}
      </div>

      <svg className="board-svg arrows" viewBox={`0 0 ${cols} ${rows}`} preserveAspectRatio="none">
        <defs>
          {Object.entries(TONE_COLORS).map(([tone, color]) => (
            <marker
              key={tone}
              id={`arrowhead-${tone}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="3.4"
              markerHeight="3.4"
              markerUnits="strokeWidth"
              orient="auto-start-reverse"
            >
              <path d="M1 0.5 L9.5 5 L1 9.5 z" fill={color} />
            </marker>
          ))}
        </defs>
        {allArrows.map((arrow, index) => (
          <line
            key={`${arrow.from.col}-${arrow.from.row}-${arrow.to.col}-${arrow.to.row}-${index}`}
            x1={arrow.from.col + 0.5}
            y1={arrow.from.row + 0.5}
            x2={arrow.to.col + 0.5}
            y2={arrow.to.row + 0.5}
            stroke={TONE_COLORS[arrow.tone] ?? '#fff'}
            strokeWidth={arrow.dashed ? 0.075 : 0.1}
            strokeLinecap="round"
            strokeDasharray={arrow.dashed ? '0.22 0.16' : undefined}
            markerEnd={`url(#arrowhead-${arrow.tone})`}
            opacity={arrow.dashed ? 0.85 : 0.95}
          />
        ))}
      </svg>

      {state.nations.map((nation) => {
        const isHovered = nation.id === hoveredId;
        const isActor = mode.type !== 'idle' && mode.actorId === nation.id;
        const showPips = isHovered || isActor;
        return (
          <div
            key={nation.id}
            className={`nation-slot ${dragId === nation.id && dragActive ? 'is-lifted' : ''}`}
            style={cellFor(nation)}
          >
            {showPips && (
              <div className="ap-pips" title={`${nation.ap} AP`}>
                {Array.from({ length: Math.min(nation.ap, 6) }, (_, i) => (
                  <span key={i} className="ap-pip" />
                ))}
                {nation.ap > 6 && <span className="ap-pip-more">+{nation.ap - 6}</span>}
                {nation.ap === 0 && <span className="ap-pip-empty">0 AP</span>}
              </div>
            )}
            <div className="nation-token">
              <Flag index={nation.flag} alt={nation.name} />
            </div>
            <div className="nation-hp" title={`${nation.hp} HP · range ${nation.range}`}>
              <span className="hp-heart">♥</span>
              {nation.hp}
            </div>
          </div>
        );
      })}

      <svg className="board-svg markers" viewBox={`0 0 ${cols} ${rows}`} preserveAspectRatio="none">
        {markers.map((marker, index) => (
          <g key={`${marker.at.col}-${marker.at.row}-${index}`}>
            <circle
              cx={marker.at.col + 0.5}
              cy={marker.at.row + 0.5}
              r={0.27}
              fill={TONE_COLORS[marker.tone] ?? '#fff'}
              opacity={0.95}
            />
            <circle
              cx={marker.at.col + 0.5}
              cy={marker.at.row + 0.5}
              r={0.27}
              fill="none"
              stroke="rgba(0,0,0,.35)"
              strokeWidth={0.03}
            />
            <text
              x={marker.at.col + 0.5}
              y={marker.at.row + 0.5}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={0.3}
              fontWeight={700}
              fill="#161513"
            >
              {marker.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
