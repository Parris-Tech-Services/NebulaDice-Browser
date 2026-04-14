import { useGameStore } from "../../store/useGameStore";

export function QuestPanel(): JSX.Element {
  const { snapshot, sendAction } = useGameStore();
  if (!snapshot) {
    return <section className="panel p-4">No quest data.</section>;
  }
  return (
    <section className="panel h-full p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Quests</h3>
        <button
          className="rounded-lg bg-cyan-500/20 px-3 py-1 text-xs"
          onClick={() => void sendAction({ type: "COMMAND", payload: { text: "quest" } })}
        >
          What now?
        </button>
      </div>
      <p className="text-sm text-cyan-100/80">{snapshot.quests.stage_title}</p>
      <ul className="mt-3 space-y-2">
        {snapshot.quests.objectives.map((objective) => (
          <li key={objective.id} className="rounded-lg border border-cyan-300/20 bg-slate-900/40 p-2 text-sm">
            <p>{objective.text}</p>
            <p className="text-xs text-cyan-100/70">{objective.status}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
