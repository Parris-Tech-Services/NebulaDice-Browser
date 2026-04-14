import { motion } from "framer-motion";

import { useGameStore } from "../../store/useGameStore";

export function SceneView(): JSX.Element {
  const { snapshot, selectedTargetId, setTarget, sendAction } = useGameStore();
  if (!snapshot) {
    return <section className="panel flex min-h-[320px] items-center justify-center p-4">No active scene.</section>;
  }
  const selectedTarget = snapshot.entities.find((entity) => entity.id === selectedTargetId) ?? null;
  return (
    <section className="panel min-h-[420px] overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{snapshot.location.room_name}</h2>
        <span className="text-xs text-cyan-100/70">Round {snapshot.turn.round}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {snapshot.entities.map((entity) => (
          <motion.button
            whileHover={{ scale: 1.01 }}
            key={entity.id}
            className={`rounded-xl border p-3 text-left ${
              selectedTargetId === entity.id ? "border-amber-400 bg-amber-500/10" : "border-cyan-300/20 bg-slate-900/50"
            }`}
            onClick={() => setTarget(entity.id)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{entity.name}</span>
              <span className="text-xs text-cyan-100/70">{entity.id}</span>
            </div>
            <div className="mt-2 h-2 rounded bg-slate-700">
              <div
                className="h-2 rounded bg-cyan-400"
                style={{ width: `${Math.max(0, Math.min(100, (entity.hp / Math.max(1, entity.max_hp)) * 100))}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-cyan-100/75">
              HP {entity.hp}/{entity.max_hp} | AC {entity.ac}
            </p>
          </motion.button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {snapshot.interactables.map((obj) => (
          <div key={obj.id} className="rounded-lg border border-cyan-300/25 bg-slate-900/40 p-2">
            <p className="text-xs text-cyan-100">{obj.name}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <button
                className="rounded bg-cyan-500/20 px-2 py-1 text-xs"
                onClick={() => void sendAction({ type: "EXAMINE", payload: { interactable_id: obj.id } })}
              >
                Examine
              </button>
              <button
                className="rounded bg-indigo-500/20 px-2 py-1 text-xs"
                onClick={() => void sendAction({ type: "INTERACT", payload: { interactable_id: obj.id } })}
              >
                Interact
              </button>
              <button
                className="rounded bg-emerald-500/20 px-2 py-1 text-xs"
                onClick={() => void sendAction({ type: "LOOT", payload: { interactable_id: obj.id } })}
              >
                Loot
              </button>
              <button
                className="rounded bg-amber-500/20 px-2 py-1 text-xs"
                onClick={() => void sendAction({ type: "UNLOCK", payload: { interactable_id: obj.id } })}
              >
                Unlock
              </button>
            </div>
          </div>
        ))}
      </div>
      {selectedTarget ? (
        <div className="mt-4 rounded-xl border border-cyan-300/25 bg-slate-900/40 p-3">
          <p className="text-sm font-semibold">Target: {selectedTarget.name}</p>
          <p className="text-xs text-cyan-100/70">
            HP {selectedTarget.hp}/{selectedTarget.max_hp} | AC {selectedTarget.ac}
          </p>
          <div className="mt-2 flex gap-2">
            <button
              className="rounded bg-red-500/20 px-2 py-1 text-xs"
              onClick={() => void sendAction({ type: "ATTACK", payload: { target_id: selectedTarget.id } })}
            >
              Attack
            </button>
            <button
              className="rounded bg-fuchsia-500/20 px-2 py-1 text-xs"
              onClick={() => void sendAction({ type: "CAST", payload: { spell: "time stop", target_id: selectedTarget.id } })}
            >
              Cast
            </button>
            <button
              className="rounded bg-cyan-500/20 px-2 py-1 text-xs"
              onClick={() => void sendAction({ type: "COMMAND", payload: { text: `talk ${selectedTarget.id}` } })}
            >
              Talk
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
