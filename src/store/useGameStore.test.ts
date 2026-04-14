import { beforeEach, describe, expect, it, vi } from "vitest";

const postActionMock = vi.fn();
const connectMock = vi.fn();

vi.mock("../api/client", () => ({
  getState: vi.fn(),
  listSaves: vi.fn(),
  loadSession: vi.fn(),
  newSession: vi.fn(),
  postAction: (...args: unknown[]) => postActionMock(...args)
}));

vi.mock("../api/ws", () => ({
  connect: (...args: unknown[]) => connectMock(...args)
}));

import { useGameStore } from "./useGameStore";

function baseSnapshot() {
  return {
    session_id: "s1",
    timestamp: "t",
    mode: "TURN_BASED",
    prompt: "Quixon@NebulaDice:~$ ",
    location: { room_id: "ROOM_001", room_name: "Airlock", description: "desc", exits: ["south"] },
    entities: [],
    turn: { round: 1, active_entity_id: "E-001", initiative_index: 0 },
    combat: { in_combat: false, initiative_order: [], round: 1 },
    inventory: { carried: [], worn: [], weight: { current: 0, capacity: 50 } },
    quests: { stage_id: "S1", stage_title: "Stage", objectives: [] },
    narrative: { flags: {}, last_events: [] },
    meta: { immersion_integrity: 100, glitch_level: "STABLE" },
    resonance: { heat: 0, state: "COLD" },
    interactables: [],
    available_actions: { movement: ["south"], interact: [], hotbar: [], dialogue_choices: [], end_turn: true },
    log: { recent: [] }
  };
}

describe("useGameStore", () => {
  beforeEach(() => {
    postActionMock.mockReset();
    connectMock.mockReset();
    useGameStore.setState({
      sessionId: "session-1",
      connected: "DISCONNECTED",
      snapshot: baseSnapshot(),
      log: [],
      selectedTargetId: null,
      activePanel: "QUEST",
      ui: { showDialogue: false },
      busy: false,
      error: undefined,
      ws: undefined
    });
  });

  it("merges server messages into log and updates snapshot", () => {
    const response = { ok: true, messages: ["line1", "line2"], snapshot: baseSnapshot() };
    useGameStore.getState().applyServerUpdate(response);
    const state = useGameStore.getState();
    expect(state.log.length).toBe(2);
    expect(state.snapshot?.session_id).toBe("s1");
    expect(state.busy).toBe(false);
  });

  it("uses REST postAction when websocket is not connected", async () => {
    postActionMock.mockResolvedValue({ ok: true, messages: ["ok"], snapshot: baseSnapshot() });
    await useGameStore.getState().sendAction({ type: "COMMAND", payload: { text: "help" } });
    expect(postActionMock).toHaveBeenCalledTimes(1);
  });

  it("uses websocket send when connected", async () => {
    const send = vi.fn();
    useGameStore.setState({
      connected: "CONNECTED",
      ws: { send, close: vi.fn() }
    });
    await useGameStore.getState().sendAction({ type: "COMMAND", payload: { text: "help" } });
    expect(send).toHaveBeenCalledTimes(1);
    expect(postActionMock).not.toHaveBeenCalled();
  });
});
