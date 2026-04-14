import { describe, expect, test } from "vitest";

import { getBrowserState, newBrowserSession, postBrowserAction } from "./browserClient";

describe("browserClient", () => {
  test("starts a browser session with the opening quest stage", async () => {
    const sessionId = await newBrowserSession(12345);
    const snapshot = await getBrowserState(sessionId);

    expect(snapshot.location.room_id).toBe("ROOM_001");
    expect(snapshot.quests.stage_id).toBe("STAGE_1_POST_SEVERANCE");
    expect(snapshot.available_actions.movement).toContain("south");
  });

  test("can progress from Mira contact to defeating the ritual triad", async () => {
    const sessionId = await newBrowserSession(12345);

    await postBrowserAction(sessionId, { type: "EXAMINE", payload: { interactable_id: "obj_viewport" } });
    await postBrowserAction(sessionId, { type: "MOVE", payload: { direction: "south" } });
    await postBrowserAction(sessionId, { type: "MOVE", payload: { direction: "west" } });

    let snapshot = await getBrowserState(sessionId);
    expect(snapshot.quests.stage_id).toBe("STAGE_2_ELVES_RITUAL");

    await postBrowserAction(sessionId, { type: "MOVE", payload: { direction: "east" } });
    await postBrowserAction(sessionId, { type: "MOVE", payload: { direction: "east" } });
    await postBrowserAction(sessionId, { type: "INTERACT", payload: { interactable_id: "obj_hardline" } });
    await postBrowserAction(sessionId, { type: "ATTACK", payload: { target_id: "E-005-ALPHA" } });
    await postBrowserAction(sessionId, { type: "ATTACK", payload: { target_id: "E-005-ALPHA" } });
    await postBrowserAction(sessionId, { type: "ATTACK", payload: { target_id: "E-005-ALPHA" } });
    await postBrowserAction(sessionId, { type: "ATTACK", payload: { target_id: "E-005-BETA" } });
    await postBrowserAction(sessionId, { type: "ATTACK", payload: { target_id: "E-005-BETA" } });
    await postBrowserAction(sessionId, { type: "ATTACK", payload: { target_id: "E-005-BETA" } });
    await postBrowserAction(sessionId, { type: "ATTACK", payload: { target_id: "E-005-GAMMA" } });
    await postBrowserAction(sessionId, { type: "ATTACK", payload: { target_id: "E-005-GAMMA" } });
    await postBrowserAction(sessionId, { type: "ATTACK", payload: { target_id: "E-005-GAMMA" } });

    snapshot = await getBrowserState(sessionId);
    expect(snapshot.narrative.flags.ELVES_STATUS).toBe("Defeated");
    expect(snapshot.quests.stage_id).toBe("STAGE_3_GRID_DECISION");
  });
});
