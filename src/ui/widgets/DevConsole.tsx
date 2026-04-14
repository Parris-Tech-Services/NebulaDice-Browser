import { FormEvent, useState } from "react";

import { useGameStore } from "../../store/useGameStore";

export function DevConsole(): JSX.Element {
  const [text, setText] = useState("");
  const { sendAction } = useGameStore();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = text.trim();
    if (!value) {
      return;
    }
    void sendAction({ type: "COMMAND", payload: { text: value } });
    setText("");
  };

  return (
    <form onSubmit={onSubmit} className="panel flex items-center gap-2 p-2">
      <input
        className="w-full rounded-lg border border-cyan-300/20 bg-slate-900/50 px-2 py-1 text-sm"
        placeholder="Dev command..."
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <button className="rounded bg-cyan-500/20 px-3 py-1 text-xs" type="submit">
        Send
      </button>
    </form>
  );
}
