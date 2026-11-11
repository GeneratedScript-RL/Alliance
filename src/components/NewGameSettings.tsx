import { useMemo, useState } from 'react';
import type { GameConfig } from '../types';
import { DEFAULT_CONFIG, LIMITS, normalizeConfig } from '../game/engine';
import { IconChevronRight } from './icons';

type FormKey =
  | 'cols'
  | 'rows'
  | 'playerCount'
  | 'rangeOnStart'
  | 'maxRange'
  | 'startingHp'
  | 'startingAp'
  | 'apGainPerTurn'
  | 'transfer'
  | 'attack'
  | 'heal'
  | 'move'
  | 'increaseRange'
  | 'attackDamage'
  | 'healAmount';

type Form = Record<FormKey, string>;

interface FieldDef {
  key: FormKey;
  label: string;
  hint: string;
  min: number;
  max: number;
}

const GROUPS: { title: string; note?: string; fields: FieldDef[] }[] = [
  {
    title: 'Board',
    note: 'Squares are placed randomly at the start.',
    fields: [
      { key: 'cols', label: 'Grid columns', hint: `${LIMITS.cols[0]} – ${LIMITS.cols[1]}`, min: LIMITS.cols[0], max: LIMITS.cols[1] },
      { key: 'rows', label: 'Grid rows', hint: `${LIMITS.rows[0]} – ${LIMITS.rows[1]}`, min: LIMITS.rows[0], max: LIMITS.rows[1] },
      { key: 'playerCount', label: 'Player count', hint: 'nation squares spawned', min: LIMITS.playerCount[0], max: LIMITS.playerCount[1] },
    ],
  },
  {
    title: 'Nations',
    fields: [
      { key: 'rangeOnStart', label: 'Range on start', hint: 'king-move distance', min: LIMITS.rangeOnStart[0], max: LIMITS.rangeOnStart[1] },
      { key: 'maxRange', label: 'Max range', hint: 'upgrade ceiling', min: LIMITS.maxRange[0], max: LIMITS.maxRange[1] },
      { key: 'startingHp', label: 'Starting HP', hint: 'health per nation', min: LIMITS.startingHp[0], max: LIMITS.startingHp[1] },
      { key: 'startingAp', label: 'Starting AP', hint: 'action points at spawn', min: LIMITS.startingAp[0], max: LIMITS.startingAp[1] },
      { key: 'apGainPerTurn', label: 'AP gain per turn', hint: 'granted by “Next turn”', min: LIMITS.apGainPerTurn[0], max: LIMITS.apGainPerTurn[1] },
    ],
  },
  {
    title: 'AP cost per action',
    note: '0 makes an action free.',
    fields: [
      { key: 'transfer', label: 'Transfer', hint: 'also the AP gifted', min: LIMITS.apCost[0], max: LIMITS.apCost[1] },
      { key: 'attack', label: 'Attack', hint: 'per attack', min: LIMITS.apCost[0], max: LIMITS.apCost[1] },
      { key: 'heal', label: 'Heal', hint: 'per heal', min: LIMITS.apCost[0], max: LIMITS.apCost[1] },
      { key: 'move', label: 'Move', hint: 'per adjacent step', min: LIMITS.apCost[0], max: LIMITS.apCost[1] },
      { key: 'increaseRange', label: 'Increase range', hint: '+1 range', min: LIMITS.apCost[0], max: LIMITS.apCost[1] },
    ],
  },
  {
    title: 'Advanced',
    note: 'Combat values — keep the defaults if unsure.',
    fields: [
      { key: 'attackDamage', label: 'Damage per attack', hint: 'HP removed', min: LIMITS.attackDamage[0], max: LIMITS.attackDamage[1] },
      { key: 'healAmount', label: 'HP per heal', hint: 'HP restored', min: LIMITS.healAmount[0], max: LIMITS.healAmount[1] },
    ],
  },
];

const ALL_FIELDS = GROUPS.flatMap((group) => group.fields);

function toForm(config: GameConfig): Form {
  return {
    cols: String(config.cols),
    rows: String(config.rows),
    playerCount: String(config.playerCount),
    rangeOnStart: String(config.rangeOnStart),
    maxRange: String(config.maxRange),
    startingHp: String(config.startingHp),
    startingAp: String(config.startingAp),
    apGainPerTurn: String(config.apGainPerTurn),
    transfer: String(config.apCosts.transfer),
    attack: String(config.apCosts.attack),
    heal: String(config.apCosts.heal),
    move: String(config.apCosts.move),
    increaseRange: String(config.apCosts.increaseRange),
    attackDamage: String(config.attackDamage),
    healAmount: String(config.healAmount),
  };
}

function parseForm(form: Form): { config: GameConfig | null; errors: string[] } {
  const errors: string[] = [];
  const values = {} as Record<FormKey, number>;

  for (const field of ALL_FIELDS) {
    const raw = (form[field.key] ?? '').trim();
    const value = Number(raw);
    if (raw === '' || !Number.isFinite(value)) {
      errors.push(`${field.label} must be a number.`);
      continue;
    }
    if (!Number.isInteger(value)) {
      errors.push(`${field.label} must be a whole number.`);
      continue;
    }
    if (value < field.min || value > field.max) {
      errors.push(`${field.label} must be between ${field.min} and ${field.max}.`);
      continue;
    }
    values[field.key] = value;
  }

  if (errors.length > 0) return { config: null, errors };

  if (values.playerCount > values.cols * values.rows) {
    errors.push('Player count cannot exceed the number of squares on the board.');
  }
  if (values.maxRange < values.rangeOnStart) {
    errors.push('Max range must be at least the starting range.');
  }
  if (errors.length > 0) return { config: null, errors };

  const config = normalizeConfig({
    cols: values.cols,
    rows: values.rows,
    playerCount: values.playerCount,
    rangeOnStart: values.rangeOnStart,
    maxRange: values.maxRange,
    startingHp: values.startingHp,
    startingAp: values.startingAp,
    apGainPerTurn: values.apGainPerTurn,
    attackDamage: values.attackDamage,
    healAmount: values.healAmount,
    apCosts: {
      transfer: values.transfer,
      attack: values.attack,
      heal: values.heal,
      move: values.move,
      increaseRange: values.increaseRange,
    },
  });

  return { config, errors: [] };
}

interface NewGameSettingsProps {
  onStart: (config: GameConfig) => void;
  onBack: () => void;
}

export function NewGameSettings({ onStart, onBack }: NewGameSettingsProps) {
  const [form, setForm] = useState<Form>(() => toForm(DEFAULT_CONFIG));
  const [showErrors, setShowErrors] = useState(false);

  const parsed = useMemo(() => parseForm(form), [form]);

  const update = (key: FormKey, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = () => {
    if (!parsed.config) {
      setShowErrors(true);
      return;
    }
    onStart(parsed.config);
  };

  return (
    <div className="setup-screen">
      <div className="setup-card">
        <header className="setup-head">
          <button type="button" className="btn ghost" onClick={onBack}>
            Back
          </button>
          <div>
            <h1>New game</h1>
            <p>Configure the board and the AP economy before spawning nations.</p>
          </div>
        </header>

        <div className="settings-groups">
          {GROUPS.map((group) => (
            <section key={group.title} className="settings-group">
              <div className="settings-group-head">
                <h2>{group.title}</h2>
                {group.note && <p>{group.note}</p>}
              </div>
              <div className="field-grid">
                {group.fields.map((field) => (
                  <label key={field.key} className="field">
                    <span className="field-label">{field.label}</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={form[field.key]}
                      min={field.min}
                      max={field.max}
                      onChange={(event) => update(field.key, event.target.value)}
                      onFocus={(event) => event.currentTarget.select()}
                    />
                    <span className="field-hint">{field.hint}</span>
                  </label>
                ))}
              </div>
            </section>
          ))}
        </div>

        {showErrors && parsed.errors.length > 0 && (
          <ul className="setup-errors">
            {parsed.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        <footer className="setup-foot">
          <button type="button" className="btn secondary" onClick={onBack}>
            Cancel
          </button>
          <button type="button" className="btn primary" onClick={submit}>
            Start game
            <IconChevronRight />
          </button>
        </footer>
      </div>
    </div>
  );
}
