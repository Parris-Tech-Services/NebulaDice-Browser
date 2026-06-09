import { Wifi, WifiOff } from "lucide-react";

import { useGameStore } from "../../store/useGameStore";

export function TopBar(): JSX.Element {
  const { busy, connected, sessionId, startNewSession, loadLatestSave } = useGameStore();
  const startRandomRun = () => {
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    void startNewSession(seed);
  };

  return (
    <header className="panel flex flex-wrap items-center justify-between gap-4 px-4 py-3 shadow-glow">
      <div>
        <h1 className="text-xl font-semibold tracking-wide">The Nebula Dice</h1>
        <p className="text-xs text-cyan-100/70">Modern RPG HUD</p>
      </div>
      <div className="flex items-center gap-2 text-sm">
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
          className="rounded-lg bg-fuchsia-500/20 px-3 py-1 hover:bg-fuchsia-400/30 disabled:cursor-wait disabled:opacity-50"
          disabled={busy}
          onClick={() => void startNewSession(12345)}
        >
          Demo
        </button>
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
