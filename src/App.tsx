import { useEffect } from "react";

import { useGameStore } from "./store/useGameStore";
import { TopBar } from "./ui/layout/TopBar";
import { DialogueModal } from "./ui/modals/DialogueModal";
import { InventoryPanel } from "./ui/panels/InventoryPanel";
import { LocationPanel } from "./ui/panels/LocationPanel";
import { LogFeed } from "./ui/panels/LogFeed";
import { QuestPanel } from "./ui/panels/QuestPanel";
import { GlitchOverlay } from "./ui/overlays/GlitchOverlay";
import { ResonanceBar } from "./ui/overlays/ResonanceBar";
import { Hotbar } from "./ui/widgets/Hotbar";
import { MiniMap } from "./ui/widgets/MiniMap";
import { TurnTracker } from "./ui/widgets/TurnTracker";
import { SceneView } from "./ui/panels/SceneView";
import { DevConsole } from "./ui/widgets/DevConsole";

export default function App(): JSX.Element {
  const { snapshot, error, activePanel, togglePanel, startNewSession } = useGameStore();

  useEffect(() => {
    if (!snapshot) {
      void startNewSession(12345);
    }
  }, [snapshot, startNewSession]);

  return (
    <div className="min-h-screen bg-nebula-ink p-3 pb-32 text-cyan-50">
      <TopBar />
      <div className="mt-3 grid gap-3 lg:grid-cols-[320px_1fr_360px]">
        <aside className="space-y-3">
          <MiniMap />
          <TurnTracker />
          <LocationPanel />
          <ResonanceBar />
        </aside>
        <main className="space-y-3">
          <SceneView />
          <LogFeed />
          <DevConsole />
          {error ? <div className="panel border border-red-500/60 p-3 text-sm text-red-100">{error}</div> : null}
        </main>
        <aside className="space-y-3">
          <div className="panel flex gap-2 p-2 text-xs">
            {(["QUEST", "INVENTORY", "CHARACTER", "JOURNAL"] as const).map((panel) => (
              <button
                key={panel}
                onClick={() => togglePanel(panel)}
                className={`rounded px-2 py-1 ${activePanel === panel ? "bg-cyan-500/30" : "bg-slate-700/40"}`}
              >
                {panel}
              </button>
            ))}
          </div>
          {activePanel === "QUEST" ? <QuestPanel /> : null}
          {activePanel === "INVENTORY" ? <InventoryPanel /> : null}
          {activePanel === "CHARACTER" ? <div className="panel p-4 text-sm">Character sheet coming in Prompt 13.</div> : null}
          {activePanel === "JOURNAL" ? <div className="panel p-4 text-sm">Journal panel coming in Prompt 13.</div> : null}
        </aside>
      </div>
      <Hotbar />
      <DialogueModal />
      <GlitchOverlay />
    </div>
  );
}
