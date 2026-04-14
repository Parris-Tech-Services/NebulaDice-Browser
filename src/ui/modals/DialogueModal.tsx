import { useGameStore } from "../../store/useGameStore";

export function DialogueModal(): JSX.Element | null {
  const { ui, closeDialogue, sendAction } = useGameStore();
  if (!ui.showDialogue) {
    return null;
  }
  const npcId = ui.dialogueNpcId ?? "E-002";
  const choices = ui.dialogueChoices ?? [
    { id: "professional", text: "Keep it professional." },
    { id: "sentimental", text: "Say something personal." }
  ];
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60">
      <div className="panel w-[92vw] max-w-xl p-4">
        <h3 className="text-lg font-semibold">Dialogue: {npcId}</h3>
        <div className="mt-3 space-y-2">
          {choices.map((choice) => (
            <button
              key={choice.id}
              className="w-full rounded-lg bg-cyan-500/20 px-3 py-2 text-left"
              onClick={() => {
                void sendAction({
                  type: "DIALOGUE_CHOICE",
                  payload: { npc_id: npcId, choice_id: choice.id }
                });
                closeDialogue();
              }}
            >
              {choice.text}
            </button>
          ))}
        </div>
        <button className="mt-3 rounded bg-slate-600/40 px-3 py-1 text-sm" onClick={closeDialogue}>
          Close
        </button>
      </div>
    </div>
  );
}
