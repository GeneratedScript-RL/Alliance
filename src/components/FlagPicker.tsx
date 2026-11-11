import { useMemo, useState } from 'react';
import { FLAG_COUNT, flagCode, nationName } from '../game/flags';
import { Flag } from './Flag';
import { Modal } from './Modal';

interface FlagPickerProps {
  current: number;
  squareLabel: string;
  onPick: (flag: number) => void;
  onClose: () => void;
}

const ALL_FLAGS = Array.from({ length: FLAG_COUNT }, (_, index) => ({
  index,
  name: nationName(index),
  code: flagCode(index),
}));

export function FlagPicker({ current, squareLabel, onPick, onClose }: FlagPickerProps) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_FLAGS;
    return ALL_FLAGS.filter((flag) => flag.name.toLowerCase().includes(q) || flag.code === q);
  }, [query]);

  return (
    <Modal
      title="Edit flag"
      subtitle={`Choose the nation that occupies ${squareLabel}.`}
      onClose={onClose}
      width={640}
    >
      <input
        className="flag-search"
        type="search"
        placeholder="Search countries…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="flag-grid">
        {results.map((flag) => (
          <button
            key={flag.index}
            type="button"
            className={`flag-option ${flag.index === current ? 'selected' : ''}`}
            onClick={() => {
              onPick(flag.index);
              onClose();
            }}
          >
            <Flag index={flag.index} alt={flag.name} />
            <span>{flag.name}</span>
          </button>
        ))}
        {results.length === 0 && <p className="flag-empty">No country matches that search.</p>}
      </div>
    </Modal>
  );
}
