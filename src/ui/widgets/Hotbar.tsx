import { useGameStore } from "../../store/useGameStore";

const slots = [
  { label: "Investigate", action: { type: "COMMAND", payload: { text: "investigate" } } },
  { label: "Cast Time Stop", action: { type: "CAST", payload: { spell: "time stop" } } },
  { label: "Quest", action: { type: "COMMAND", payload: { text: "quest" } } },
  { label: "End Turn", action: { type: "END_TURN", payload: {} } }
] as const;

export function Hotbar(): JSX.Element {
  const { sendAction, busy, snapshot } = useGameStore();
  const endTurnAllowed = snapshot?.available_actions.end_turn ?? false;
  return (
    <section className="panel fixed bottom-3 left-1/2 z-20 flex w-[92vw] max-w-5xl -translate-x-1/2 gap-2 px-3 py-3">
      {slots.map((slot, index) => {
        const isEndTurn = slot.action.type === "END_TURN";
        const disabled = busy || (isEndTurn && !endTurnAllowed);
        const reason = isEndTurn && !endTurnAllowed ? "End turn unavailable in this state." : undefined;
        return (
        <button
          key={slot.label}
          disabled={disabled}
          title={reason}
          data-testid={`hotbar-${index}`}
          className="flex-1 rounded-xl bg-cyan-500/20 px-3 py-2 text-sm hover:bg-cyan-400/30 disabled:opacity-40"
          onClick={() => void sendAction(slot.action)}
        >
          <span className="mr-1 text-xs text-cyan-100/60">{index + 1}</span>
          {slot.label}
        </button>
        );
      })}
    </section>
  );
}
