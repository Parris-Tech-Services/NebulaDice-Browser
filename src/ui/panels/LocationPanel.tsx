import { useGameStore } from "../../store/useGameStore";

export function LocationPanel(): JSX.Element {
  const { snapshot, sendAction } = useGameStore();
  if (!snapshot) {
    return <section className="panel p-4">Start a session to view location.</section>;
  }
  return (
    <section className="panel space-y-3 p-4">
      <div>
        <h2 className="text-lg font-semibold">{snapshot.location.room_name}</h2>
        <p className="text-xs text-cyan-100/75">{snapshot.location.room_id}</p>
      </div>
      <p className="text-sm text-cyan-50/90">{snapshot.location.description}</p>
      <div>
        <h3 className="mb-2 text-xs uppercase tracking-wide text-cyan-200/80">Exits</h3>
        <div className="flex flex-wrap gap-2">
          {snapshot.location.exits.map((direction) => (
            <button
              key={direction}
              className="rounded-lg bg-cyan-500/20 px-3 py-1 text-sm hover:bg-cyan-400/30"
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
