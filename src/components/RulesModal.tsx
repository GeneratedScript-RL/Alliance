import { nationName } from '../game/flags';
import { Flag } from './Flag';
import { Modal } from './Modal';

const TONE_SWATCHES: { color: string; label: string }[] = [
  { color: '#7ad15a', label: 'Move' },
  { color: '#f2564a', label: 'Attack' },
  { color: '#59a8e8', label: 'Transfer' },
  { color: '#3fcf8e', label: 'Heal' },
  { color: '#b48cf2', label: 'Range up' },
  { color: '#f2c14e', label: 'AP change' },
  { color: '#e0575a', label: 'Removed' },
];

interface RulesModalProps {
  onClose: () => void;
  costs: { move: number; attack: number; heal: number; transfer: number; increaseRange: number };
  apGainPerTurn: number;
  maxRange: number;
  startingHp: number;
}

export function RulesModal({ onClose, costs, apGainPerTurn, maxRange, startingHp }: RulesModalProps) {
  return (
    <Modal title="Coordinator reference" subtitle="Local board — no turn order is enforced." onClose={onClose} width={620}>
      <div className="rules">
        <ul className="rules-list">
          <li>
            <strong>Drag</strong> a nation onto a neighbouring square (diagonals included) to move it — costs{' '}
            <b>{costs.move} AP</b>.
          </li>
          <li>
            <strong>Right-click</strong> a nation for every action: attack, transfer, heal, range, AP and flag edits.
          </li>
          <li>
            <strong>Edit flag</strong> opens the flag library — pick any country or upload your own image, which travels
            inside the save file.
          </li>
          <li>
            <strong>Attack</strong> ({costs.attack} AP) picks a target inside the attacker&apos;s range; a red line follows
            your cursor until you click.
          </li>
          <li>
            <strong>Transfer</strong> ({costs.transfer} AP) gifts that much AP to a nation in range.
          </li>
          <li>
            <strong>Heal</strong> ({costs.heal} AP) restores HP up to {startingHp}.
          </li>
          <li>
            <strong>Upgrade range</strong> ({costs.increaseRange} AP) raises range by 1, capped at {maxRange}.
          </li>
          <li>
            <strong>Next turn</strong> hands every nation +{apGainPerTurn} AP. Distances are measured in king moves.
          </li>
          <li>
            <strong>Ctrl+Z</strong> undoes, <strong>Ctrl+Y</strong> redoes, and the history panel rewinds to any moment.
          </li>
        </ul>

        <div className="legend">
          {TONE_SWATCHES.map((swatch) => (
            <span key={swatch.label} className="legend-item">
              <span className="legend-dot" style={{ background: swatch.color }} />
              {swatch.label}
            </span>
          ))}
        </div>

        <div className="flag-strip">
          {Array.from({ length: 8 }, (_, index) => (
            <Flag key={index} index={index} title={nationName(index)} />
          ))}
        </div>
      </div>
    </Modal>
  );
}
