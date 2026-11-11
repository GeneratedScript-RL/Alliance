import { useState } from 'react';
import type { GameConfig, HistoryEntry } from './types';
import { createGame } from './game/engine';
import { startEntry } from './game/session';
import { parseSaveFile } from './game/storage';
import { GameScreen } from './components/GameScreen';
import { MenuScreen } from './components/MenuScreen';
import { NewGameSettings } from './components/NewGameSettings';

type Screen = 'menu' | 'setup' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [undone, setUndone] = useState<HistoryEntry[]>([]);
  const [gameId, setGameId] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const startGame = (config: GameConfig) => {
    const state = createGame(config);
    setHistory([startEntry(state)]);
    setUndone([]);
    setGameId((id) => id + 1);
    setLoadError(null);
    setScreen('game');
  };

  const loadFile = async (file: File) => {
    try {
      const text = await file.text();
      const save = parseSaveFile(text);
      setHistory(save.history);
      setUndone(save.undone);
      setGameId((id) => id + 1);
      setLoadError(null);
      setScreen('game');
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not read that save file.');
    }
  };

  if (screen === 'game') {
    return (
      <GameScreen
        key={gameId}
        initialHistory={history}
        initialUndone={undone}
        onExit={() => setScreen('menu')}
      />
    );
  }

  if (screen === 'setup') {
    return <NewGameSettings onStart={startGame} onBack={() => setScreen('menu')} />;
  }

  return (
    <MenuScreen
      onCreate={() => {
        setLoadError(null);
        setScreen('setup');
      }}
      onLoadFile={loadFile}
      error={loadError}
    />
  );
}
