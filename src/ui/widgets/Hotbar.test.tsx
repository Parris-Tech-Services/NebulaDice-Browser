import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useGameStore } from "../../store/useGameStore";
import { Hotbar } from "./Hotbar";

function setupSnapshot(endTurn: boolean) {
  useGameStore.setState({
    sessionId: "session-1",
    connected: "DISCONNECTED",
    snapshot: {
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
      available_actions: { movement: ["south"], interact: [], hotbar: [], dialogue_choices: [], end_turn: endTurn },
      log: { recent: [] }
    },
    log: [],
    selectedTargetId: null,
    activePanel: "QUEST",
    ui: { showDialogue: false },
    busy: false,
    error: undefined,
    ws: undefined
  });
}

describe("Hotbar", () => {
  it("disables End Turn when unavailable", () => {
    setupSnapshot(false);
    render(<Hotbar />);
    const endTurnButton = screen.getByTestId("hotbar-3");
    expect(endTurnButton.hasAttribute("disabled")).toBe(true);
  });

  it("enables End Turn when available", () => {
    setupSnapshot(true);
    render(<Hotbar />);
    const endTurnButton = screen.getByTestId("hotbar-3");
    expect(endTurnButton.hasAttribute("disabled")).toBe(false);
  });
});
