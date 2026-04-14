import { useGameStore } from "../../store/useGameStore";

export function MiniMap(): JSX.Element {
  const { snapshot, sendAction } = useGameStore();
  if (!snapshot) {
    return <section className="panel p-4 text-sm">Minimap unavailable.</section>;
  }
  return (
    <section className="panel p-4">
      <h3 className="mb-3 text-xs uppercase tracking-wide text-cyan-200/80">MiniMap</h3>
      <div className="space-y-2">
        <div className="rounded-lg border border-cyan-300/30 bg-cyan-500/10 p-2 text-sm">
          {snapshot.location.room_name}
        </div>
        <div className="flex flex-wrap gap-2">
          {snapshot.location.exits.map((direction) => (
            <button
              key={direction}
              className="rounded bg-indigo-500/20 px-2 py-1 text-xs"
              onClick={() => void sendAction({ type: "MOVE", payload: { direction } })}
            >
              {direction}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
