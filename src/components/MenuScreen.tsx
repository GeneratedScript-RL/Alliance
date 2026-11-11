import { useRef } from 'react';
import { Flag } from './Flag';
import { IconChevronRight, IconFlag, IconSave } from './icons';

interface MenuScreenProps {
  onCreate: () => void;
  onLoadFile: (file: File) => void;
  error: string | null;
}

export function MenuScreen({ onCreate, onLoadFile, error }: MenuScreenProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="menu-screen">
      <div className="menu-card">
        <div className="brand">
          <span className="brand-mark">
            <IconFlag width={26} height={26} />
          </span>
          <div>
            <h1>Alliance</h1>
            <p>Game coordinator board</p>
          </div>
        </div>

        <div className="menu-flags" aria-hidden="true">
          {[0, 5, 2, 11, 3, 7, 14, 9].map((flag) => (
            <Flag key={flag} index={flag} alt="" />
          ))}
        </div>

        <div className="menu-actions">
          <button type="button" className="btn primary large" onClick={onCreate}>
            Create new game
            <IconChevronRight />
          </button>
          <button type="button" className="btn secondary large" onClick={() => inputRef.current?.click()}>
            <IconSave />
            Load save (.json)
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onLoadFile(file);
              event.target.value = '';
            }}
          />
        </div>

        {error && <p className="menu-error">{error}</p>}
      </div>
      <footer className="menu-footer">No backend · saves are plain JSON files</footer>
    </div>
  );
}
