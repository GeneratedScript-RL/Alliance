import { useMemo, useRef, useState } from 'react';
import { FLAG_COUNT, flagCode, nationName } from '../game/flags';
import { addCustomFlag, removeCustomFlag, renameCustomFlag, useCustomFlags } from '../game/customFlags';
import { Flag } from './Flag';
import { IconTrash, IconUpload } from './icons';
import { Modal } from './Modal';

interface FlagPickerProps {
  current: number;
  squareLabel: string;
  onPick: (flag: number) => void;
  onRenamed?: (flag: number) => void;
  onClose: () => void;
}

const ALL_FLAGS = Array.from({ length: FLAG_COUNT }, (_, index) => ({
  index,
  name: nationName(index),
  code: flagCode(index),
}));

export function FlagPicker({ current, squareLabel, onPick, onRenamed, onClose }: FlagPickerProps) {
  const custom = useCustomFlags();
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const q = query.trim().toLowerCase();
  const countries = useMemo(
    () => (q ? ALL_FLAGS.filter((flag) => flag.name.toLowerCase().includes(q) || flag.code === q) : ALL_FLAGS),
    [q],
  );
  const mine = useMemo(() => (q ? custom.filter((flag) => flag.name.toLowerCase().includes(q)) : custom), [custom, q]);

  const choose = (flag: number) => {
    onPick(flag);
    onClose();
  };

  const commitName = (index: number, previous: string, value: string) => {
    const next = value.trim().slice(0, 40);
    if (!next || next === previous) return;
    renameCustomFlag(index, next);
    if (index === current) onRenamed?.(index);
  };

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    const added: number[] = [];
    const problems: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const flag = await addCustomFlag(file);
        added.push(flag.index);
      } catch (issue) {
        problems.push(issue instanceof Error ? issue.message : `${file.name} could not be added.`);
      }
    }
    setBusy(false);
    if (fileInput.current) fileInput.current.value = '';
    if (problems.length > 0) setError(problems.join(' '));
    if (added.length === 1) choose(added[0]);
  };

  return (
    <Modal
      title="Edit flag"
      subtitle={`Choose the nation that occupies ${squareLabel}.`}
      onClose={onClose}
      width={700}
    >
      <div className="flag-toolbar">
        <input
          className="flag-search"
          type="search"
          placeholder="Search flags…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="button" className="btn secondary small" disabled={busy} onClick={() => fileInput.current?.click()}>
          <IconUpload />
          {busy ? 'Adding…' : 'Upload flag'}
        </button>
        <input
          ref={fileInput}
          className="flag-file"
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => void upload(event.target.files)}
        />
      </div>

      {error && <p className="flag-error">{error}</p>}

      {mine.length > 0 && (
        <section className="flag-section">
          <h3>
            Your flags <span>{mine.length}</span>
          </h3>
          <div className="flag-grid">
            {mine.map((flag) => (
              <div key={flag.index} className="flag-tile">
                <button
                  type="button"
                  className={`flag-option ${flag.index === current ? 'selected' : ''}`}
                  aria-label={`Use ${flag.name}`}
                  onClick={() => choose(flag.index)}
                >
                  <img src={flag.dataUrl} alt="" draggable={false} />
                </button>
                <button
                  type="button"
                  className="flag-remove"
                  title={`Remove ${flag.name}`}
                  aria-label={`Remove ${flag.name}`}
                  onClick={() => removeCustomFlag(flag.index)}
                >
                  <IconTrash width={13} height={13} />
                </button>
                <input
                  className="flag-rename"
                  defaultValue={flag.name}
                  aria-label={`Rename ${flag.name}`}
                  maxLength={40}
                  onBlur={(event) => commitName(flag.index, flag.name, event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') event.currentTarget.blur();
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flag-section">
        <h3>
          Countries <span>{countries.length}</span>
        </h3>
        <div className="flag-grid">
          {countries.map((flag) => (
            <button
              key={flag.index}
              type="button"
              className={`flag-option ${flag.index === current ? 'selected' : ''}`}
              onClick={() => choose(flag.index)}
            >
              <Flag index={flag.index} alt={flag.name} />
              <span>{flag.name}</span>
            </button>
          ))}
          {countries.length === 0 && mine.length === 0 && <p className="flag-empty">Nothing matches that search.</p>}
        </div>
      </section>

      <p className="flag-hint">Uploaded flags are embedded in the save file, so whoever opens your save sees them too.</p>
    </Modal>
  );
}
