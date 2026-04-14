import { useMemo } from "react";

import { useGameStore } from "../../store/useGameStore";

export function LogFeed(): JSX.Element {
  const { log, clearLog } = useGameStore();
  const rows = useMemo(() => log.slice(-30), [log]);
  return (
    <section className="panel max-h-[260px] overflow-auto p-3">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs uppercase tracking-wide text-cyan-200/80">Log Feed</h3>
        <button
          className="rounded bg-slate-700/60 px-2 py-1 text-xs text-cyan-100 hover:bg-slate-600/70"
          onClick={clearLog}
        >
          Clear Log
        </button>
      </div>
      <div className="space-y-1 text-sm">
        {rows.map((entry, index) => (
          <p
            key={`${entry.t}-${index}`}
            className={
              entry.kind === "combat"
                ? "font-semibold text-orange-200"
                : entry.kind === "meta"
                  ? "text-fuchsia-200"
                  : entry.kind === "system"
                    ? "text-cyan-100/70"
                    : "text-cyan-50"
            }
          >
            {entry.text}
          </p>
        ))}
      </div>
    </section>
  );
}
