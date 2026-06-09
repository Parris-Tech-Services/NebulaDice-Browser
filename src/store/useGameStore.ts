import { create } from "zustand";

import { getState, listSaves, loadSession, newSession, postAction } from "../api/client";
import { connect, type WSController } from "../api/ws";
import type { ActionResponse, ConnectionStatus, GameSnapshot, UIAction } from "../api/types";

type LogKind = "narrative" | "system" | "combat" | "meta";

type StoreState = {
  sessionId: string | null;
  connected: ConnectionStatus;
  snapshot: GameSnapshot | null;
  log: { kind: LogKind; text: string; t: number }[];
  selectedTargetId: string | null;
  activePanel: "QUEST" | "INVENTORY" | "CHARACTER" | "JOURNAL";
  ui: {
    showDialogue: boolean;
    dialogueNpcId?: string;
    dialogueChoices?: Array<{ id: string; text: string }>;
  };
  busy: boolean;
  error?: string;
  ws?: WSController;
  startNewSession: (seed?: number) => Promise<void>;
  loadSessionByPath: (savePath: string) => Promise<void>;
  loadLatestSave: () => Promise<void>;
  connectWS: () => void;
  disconnectWS: () => void;
  applyServerUpdate: (response: ActionResponse) => void;
  sendAction: (action: UIAction) => Promise<void>;
  setTarget: (id: string | null) => void;
  togglePanel: (panel: "QUEST" | "INVENTORY" | "CHARACTER" | "JOURNAL") => void;
  openDialogue: (npcId: string) => void;
  closeDialogue: () => void;
  clearLog: () => void;
};

export const useGameStore = create<StoreState>((set, get) => ({
  sessionId: null,
  connected: "DISCONNECTED",
  snapshot: null,
  log: [],
  selectedTargetId: null,
  activePanel: "QUEST",
  ui: { showDialogue: false },
  busy: false,
  error: undefined,
  ws: undefined,
  async startNewSession(seed?: number) {
    set({ busy: true, error: undefined });
    try {
      get().disconnectWS();
      const sessionId = await newSession(seed, false, "webui");
      const snapshot = await getState(sessionId);
      set({ sessionId, snapshot, busy: false, error: undefined });
      get().connectWS();
    } catch (error) {
      set({ busy: false, error: String(error) });
    }
  },
  async loadSessionByPath(savePath: string) {
    set({ busy: true, error: undefined });
    try {
      get().disconnectWS();
      const sessionId = await loadSession(savePath);
      const snapshot = await getState(sessionId);
      set({ sessionId, snapshot, busy: false, error: undefined });
      get().connectWS();
    } catch (error) {
      set({ busy: false, error: String(error) });
    }
  },
  async loadLatestSave() {
    const sessionId = get().sessionId;
    set({ busy: true, error: undefined });
    try {
      const saves = await listSaves(sessionId ?? "browser");
      if (!saves.length) {
        set({ busy: false, error: "No saves available yet. Make a move to create the local autosave." });
        return;
      }
      await get().loadSessionByPath(saves[0]);
    } catch (error) {
      set({ busy: false, error: String(error) });
    }
  },
  connectWS() {
    const sessionId = get().sessionId;
    if (!sessionId) {
      return;
    }
    get().ws?.close();
    const ws = connect(
      sessionId,
      (response) => get().applyServerUpdate(response),
      (status) => set({ connected: status })
    );
    set({ ws });
  },
  disconnectWS() {
    get().ws?.close();
    set({ ws: undefined, connected: "DISCONNECTED" });
  },
  applyServerUpdate(response) {
    const incoming = response.messages.map((text) => ({ kind: "narrative" as LogKind, text, t: Date.now() }));
    const merged = [...get().log, ...incoming].slice(-200);
    set({ snapshot: response.snapshot, log: merged, busy: false, error: response.ok ? undefined : response.messages.join("\n") });
  },
  async sendAction(action) {
    const sessionId = get().sessionId;
    if (!sessionId || get().busy) {
      return;
    }
    set({ busy: true });
    const payload: UIAction = { ...action, client_time: new Date().toISOString() };
    const ws = get().ws;
    if (ws && get().connected === "CONNECTED") {
      ws.send(payload);
      return;
    }
    try {
      const response = await postAction(sessionId, payload);
      get().applyServerUpdate(response);
    } catch (error) {
      set({ busy: false, error: String(error) });
    }
  },
  setTarget(id) {
    set({ selectedTargetId: id });
  },
  togglePanel(panel) {
    set({ activePanel: panel });
  },
  openDialogue(npcId) {
    set({ ui: { showDialogue: true, dialogueNpcId: npcId, dialogueChoices: [] } });
  },
  closeDialogue() {
    set({ ui: { showDialogue: false } });
  },
  clearLog() {
    set({ log: [] });
  }
}));
