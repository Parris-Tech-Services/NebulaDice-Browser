import { useGameStore } from "../../store/useGameStore";

export function GlitchOverlay(): JSX.Element | null {
  const level = useGameStore((state) => state.snapshot?.meta.glitch_level ?? "STABLE");
  if (level === "STABLE") {
    return null;
  }
  const opacity = level === "DEGRADED" ? "opacity-15" : level === "COMPROMISED" ? "opacity-30" : "opacity-45";
  const border = level === "COLLAPSE" ? "border-red-500" : "border-fuchsia-500";
  return (
    <div className={`pointer-events-none fixed inset-0 z-30 ${opacity}`}>
      <div className={`h-full w-full border-[6px] ${border}`}>
        <div className="h-full w-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.06)_3px)]" />
      </div>
    </div>
  );
}
