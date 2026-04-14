import { useGameStore } from "../../store/useGameStore";

export function TurnTracker(): JSX.Element {
  const { snapshot } = useGameStore();
  if (!snapshot) {
    return <section className="panel p-4 text-sm">Turn data unavailable.</section>;
  }
  return (
    <section className="panel p-4">
      <h3 className="mb-3 text-xs uppercase tracking-wide text-cyan-200/80">Turn</h3>
      <p className="text-sm">Round {snapshot.turn.round}</p>
      <p className="mb-2 text-xs text-cyan-100/75">
        {snapshot.combat.in_combat ? "In Combat" : "Exploration"}
      </p>
      <div className="space-y-1">
        {snapshot.combat.initiative_order.map((id) => (
          <div
            key={id}
            className={`rounded px-2 py-1 text-xs ${
              id === snapshot.turn.active_entity_id ? "bg-amber-500/30" : "bg-cyan-500/10"
            }`}
          >
            {id}
          </div>
        ))}
      </div>
    </section>
  );
}
