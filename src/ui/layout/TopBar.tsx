import { useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

import { useGameStore } from "../../store/useGameStore";
import { listSaves } from "../../api/client";

export function TopBar(): JSX.Element {
  const { busy, connected, sessionId, startNewSession, loadLatestSave, loadSessionByPath } = useGameStore();
  const [saveList, setSaveList] = useState<string[]>([]);
  const [saveMenuOpen, setSaveMenuOpen] = useState(false);
  const [loadingSaves, setLoadingSaves] = useState(false);

  const startRandomRun = () => {
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    void startNewSession(seed);
  };

  const toggleSaveMenu = async () => {
    if (saveMenuOpen) {
      setSaveMenuOpen(false);
      return;
    }
    setLoadingSaves(true);
    try {
      setSaveList(await listSaves(sessionId ?? 'browser'));
    } catch {
      setSaveList([]);
    } finally {
      setLoadingSaves(false);
      setSaveMenuOpen(true);
    }
  };

  const handleLoadSave = async (savePath: string) => {
    setSaveMenuOpen(false);
    await loadSessionByPath(savePath);
  };

  return (
    <header className="panel flex flex-wrap items-center justify-between gap-4 px-4 py-3 shadow-glow">
      <div>
        <h1 className="text-xl font-semibold tracking-wide">The Nebula Dice</h1>
        <p className="text-xs text-cyan-100/70">Modern RPG HUD</p>
      </div>
      <div className="relative flex items-center gap-2 text-sm">
        <button
          className="rounded-lg bg-cyan-500/20 px-3 py-1 hover:bg-cyan-400/30 disabled:cursor-wait disabled:opacity-50"
          disabled={busy}
          onClick={startRandomRun}
        >
          New
        </button>
        <button
          className="rounded-lg bg-indigo-500/20 px-3 py-1 hover:bg-indigo-400/30 disabled:cursor-wait disabled:opacity-50"
          disabled={busy}
          onClick={() => void loadLatestSave()}
        >
          Load
        </button>
        <button
          className="rounded-lg bg-slate-500/20 px-3 py-1 hover:bg-slate-400/30 disabled:cursor-wait disabled:opacity-50"
          disabled={busy}
          onClick={() => void toggleSaveMenu()}
        >
          {saveMenuOpen ? 'Hide saves' : 'Saves'}
        </button>
        <button
          className="rounded-lg bg-fuchsia-500/20 px-3 py-1 hover:bg-fuchsia-400/30 disabled:cursor-wait disabled:opacity-50"
          disabled={busy}
          onClick={() => void startNewSession(12345)}
        >
          Demo
        </button>
        {saveMenuOpen && (
          <div className="absolute left-0 top-full z-20 mt-2 w-64 rounded border border-slate-700 bg-slate-950/95 p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
              <span>Local saves</span>
              <button
                type="button"
                onClick={() => setSaveMenuOpen(false)}
                className="text-slate-400 hover:text-slate-100"
              >
                Close
              </button>
            </div>
            {loadingSaves ? (
              <div className="text-xs text-slate-400">Loading...</div>
            ) : saveList.length ? (
              <ul className="space-y-2 text-xs">
                {saveList.map((savePath) => (
                  <li key={savePath}>
                    <button
                      type="button"
                      className="w-full rounded bg-slate-800 px-2 py-2 text-left text-slate-100 hover:bg-slate-700"
                      onClick={() => void handleLoadSave(savePath)}
                    >
                      {savePath.replace(/^nebula-dice-browser-save:/, '')}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-slate-400">No saves found yet.</div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="rounded-full border border-cyan-400/40 px-2 py-1">
          {connected === "CONNECTED" ? (
            <span className="flex items-center gap-1 text-cyan-200">
              <Wifi size={14} /> {connected}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-orange-200">
              <WifiOff size={14} /> {connected}
            </span>
          )}
        </span>
        <span className="text-right text-xs text-cyan-100/70">
          {busy ? "Preparing run..." : sessionId ? `Session: ${sessionId.slice(0, 8)}` : "No session"}
          <span className="block text-[10px] text-cyan-100/50">Autosaves locally after every action</span>
        </span>
      </div>
    </header>
  );
}
