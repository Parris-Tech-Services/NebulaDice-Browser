import { motion } from "framer-motion";

import { useGameStore } from "../../store/useGameStore";

export function ResonanceBar(): JSX.Element {
  const { snapshot } = useGameStore();
  const heat = snapshot?.resonance.heat ?? 0;
  const state = snapshot?.resonance.state ?? "COLD";
  const color =
    state === "CRITICAL" || state === "MELTDOWN"
      ? "bg-red-500"
      : state === "RESONANT"
        ? "bg-fuchsia-500"
        : state === "WARM"
          ? "bg-amber-500"
          : "bg-cyan-400";
  return (
    <section className="panel p-3">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span>Resonance</span>
        <span>
          {Math.round(heat)} | {state}
        </span>
      </div>
      <div className="h-2 rounded bg-slate-700">
        <motion.div
          className={`h-2 rounded ${color}`}
          animate={{ width: `${Math.max(0, Math.min(100, heat))}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 26 }}
        />
      </div>
    </section>
  );
}
