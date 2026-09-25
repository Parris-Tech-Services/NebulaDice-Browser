import type { ActionResponse, GameSnapshot, SnapshotEntity, UIAction } from "./types";

type ObjectiveState = {
  id: string;
  text: string;
  status: string;
  required?: boolean;
};

type BrowserInteractable = {
  id: string;
  name: string;
  description: string;
  type: string;
  state: string;
  locked?: boolean;
  loot?: string[];
};

type BrowserRoom = {
  id: string;
  name: string;
  description: string;
  exits: Record<string, string>;
  interactables: BrowserInteractable[];
  npcs: string[];
};

type BrowserSession = {
  sessionId: string;
  seed?: number;
  roomId: string;
  round: number;
  stageIndex: number;
  flags: Record<string, string>;
  resonanceHeat: number;
  immersionIntegrity: number;
  prompt: string;
  narrativeEvents: string[];
  log: { kind: string; text: string }[];
  inventory: Record<string, { item_id: string; name: string; qty: number }>;
  worn: Record<string, { item_id: string; name: string; qty: number }>;
  interactableStates: Record<string, { state: string; locked: boolean; looted: boolean }>;
  entities: Record<string, SnapshotEntity & { roomId: string; hostile?: boolean }>;
  objectives: ObjectiveState[][];
};

const SAVE_PREFIX = "nebula-dice-browser-save:";

const memoryStorage = new Map<string, string>();

function getStorage(): Pick<Storage, "getItem" | "setItem" | "removeItem" | "key"> & { length: number } {
  if (typeof globalThis.localStorage !== "undefined") {
    return globalThis.localStorage;
  }
  return {
    get length() {
      return memoryStorage.size;
    },
    getItem: (key) => memoryStorage.get(key) ?? null,
    setItem: (key, value) => {
      memoryStorage.set(key, value);
    },
    removeItem: (key) => {
      memoryStorage.delete(key);
    },
    key: (index) => [...memoryStorage.keys()][index] ?? null,
  };
}

const ITEM_NAMES: Record<string, string> = {
  item_ion_cola: "Ion Cola",
  item_stardust_syrup: "Stardust Syrup",
  item_credits: "Emergency Credits",
  item_holdout_blaster: "Holdout Blaster",
  item_datapad_encrypted: "Encrypted Logbook",
  item_keycard_blue: "Blue Keycard",
  item_spare_parts: "Spare Parts",
  item_void_grenade: "Void Grenade",
  item_illegal_modded_d20: "Illegal Modded d20",
};

const ROOMS: Record<string, BrowserRoom> = {
  ROOM_001: {
    id: "ROOM_001",
    name: "Airlock",
    description:
      "Emergency strips strobe amber across the airlock. The blast shield is half-sealed and trembling while frozen dust drifts beyond the glass.",
    exits: { south: "ROOM_002" },
    interactables: [
      {
        id: "obj_viewport",
        name: "Blast Shield Viewport",
        description:
          "Mars hangs below like a dead ember. Three overlapping circles are etched into the rim, warning that the Severance began here.",
        type: "SCENERY",
        state: "ACTIVE",
      },
    ],
    npcs: ["E-003"],
  },
  ROOM_002: {
    id: "ROOM_002",
    name: "Quantum Counter",
    description:
      "Power fluctuations ripple through the counter. Glassware vibrates with residual arc-light, and every mirror shows the room half a second late.",
    exits: { north: "ROOM_001", east: "ROOM_003", west: "ROOM_BACK_ROOM", south: "ROOM_STORAGE" },
    interactables: [
      {
        id: "obj_taps",
        name: "Quantum Taps",
        description:
          "Rows of precision taps hum with trapped charge. Their last pour still glows faint blue in the drain channels.",
        type: "LOOT",
        state: "ACTIVE",
        loot: ["item_ion_cola", "item_stardust_syrup"],
      },
      {
        id: "obj_register",
        name: "Quantum Register",
        description:
          "A translucent till projecting transaction glyphs and sealed emergency chits. It flashes KEYCARD ACCESS ONLY.",
        type: "CONTAINER",
        state: "LOCKED",
        locked: true,
        loot: ["item_credits", "item_holdout_blaster"],
      },
      {
        id: "obj_patron_map",
        name: "Patron Route Map",
        description:
          "A brass-backed station map marks the cellar, back room, and private booths. Mira left a note: reroute through the root switch.",
        type: "LORE_TRIGGER",
        state: "ACTIVE",
      },
    ],
    npcs: ["E-002"],
  },
  ROOM_003: {
    id: "ROOM_003",
    name: "Booth 5",
    description:
      "Sparks crawl over the hardline port. Arcane static crackles where the ritual was severed, and the privacy glass shows a cathedral-sized lattice beyond the wall.",
    exits: { west: "ROOM_002" },
    interactables: [
      {
        id: "obj_hardline",
        name: "Hardline Ritual Port",
        description:
          "A direct link to the station holo-grid core. Push it too far and the whole lattice will overload.",
        type: "DEVICE",
        state: "ACTIVE",
      },
      {
        id: "obj_sigils",
        name: "Fractured Sigils",
        description:
          "Silver sigils burned into the booth floor describe a bargain between the AI host and three oathbound operators.",
        type: "LORE_TRIGGER",
        state: "ACTIVE",
      },
    ],
    npcs: ["E-005-ALPHA", "E-005-BETA", "E-005-GAMMA"],
  },
  ROOM_BACK_ROOM: {
    id: "ROOM_BACK_ROOM",
    name: "Back Room",
    description:
      "The back room smells of ozone and candlewax. Mira's terminal is awake, and a root-switch is wrapped in silver grounding wire.",
    exits: { east: "ROOM_002" },
    interactables: [
      {
        id: "obj_mira_terminal",
        name: "Mira's Terminal",
        description:
          "A rune-inscribed terminal flickers with encrypted chat windows and a stalled scrub bar waiting for manual confirmation.",
        type: "DEVICE",
        state: "ACTIVE",
      },
      {
        id: "obj_root_switch",
        name: "Root Switch",
        description:
          "A copper-heavy bypass tied into the holo-grid's clean backup loop. It can stabilise the station once the ritual pressure breaks.",
        type: "DEVICE",
        state: "ACTIVE",
      },
      {
        id: "obj_logbook",
        name: "Encrypted Logbook",
        description:
          "The shift log names the cybernetic elves as former maintenance adepts. Mira's last entry warns Quixon against the first easy ending.",
        type: "LOOT",
        state: "ACTIVE",
        loot: ["item_datapad_encrypted", "item_keycard_blue"],
      },
    ],
    npcs: ["E-006"],
  },
  ROOM_STORAGE: {
    id: "ROOM_STORAGE",
    name: "Cellar Stacks",
    description:
      "Crates lean at unsafe angles beneath flickering lumen strips. Frost rims the pipework, and a hidden crawlspace gapes behind a broken rack.",
    exits: { north: "ROOM_002" },
    interactables: [
      {
        id: "obj_supply_cache",
        name: "Supply Cache",
        description:
          "A dusty maintenance trunk with old station issue supplies and one carefully hidden contraband cylinder.",
        type: "LOOT",
        state: "ACTIVE",
        loot: ["item_spare_parts", "item_void_grenade"],
      },
      {
        id: "obj_maintenance_rack",
        name: "Maintenance Rack",
        description:
          "The rack has been shoved aside to conceal crawlspace markings and emergency routes into the private rooms.",
        type: "SCENERY",
        state: "ACTIVE",
      },
    ],
    npcs: [],
  },
};

const BASE_OBJECTIVES: ObjectiveState[][] = [
  [
    {
      id: "OBJ_ORIENT",
      text: "Examine your surroundings and confirm system state.",
      status: "VISIBLE",
      required: true,
    },
    {
      id: "OBJ_FIND_MIRA",
      text: "Access the Back Room or establish contact with Mira.",
      status: "VISIBLE",
      required: true,
    },
  ],
  [
    {
      id: "OBJ_INTERRUPT_RITUAL",
      text: "Interrupt ritual channeling at Booth 5.",
      status: "VISIBLE",
      required: true,
    },
    {
      id: "OBJ_DEFEAT_ELVES",
      text: "Defeat or neutralize the Elf triad.",
      status: "VISIBLE",
      required: true,
    },
  ],
  [
    {
      id: "OBJ_REPAIR_GRID",
      text: "Repair the holo-grid from the Back Room root switch.",
      status: "VISIBLE",
      required: false,
    },
    {
      id: "OBJ_OR_OVERLOAD",
      text: "Overload the holo-grid through the ritual port and force the simulation's edge.",
      status: "VISIBLE",
      required: false,
    },
  ],
  [
    {
      id: "OBJ_BLUE_PILL_READY",
      text: "Blue Pill readiness: Elves defeated, grid repaired, Mira informed.",
      status: "VISIBLE",
      required: false,
    },
    {
      id: "OBJ_RED_PILL_TRIGGER",
      text: "Red Pill trigger: overload the grid or leave the triad active.",
      status: "VISIBLE",
      required: false,
    },
    {
      id: "OBJ_NULL_POINTER",
      text: "Null Pointer route: push resonance into meltdown.",
      status: "VISIBLE",
      required: false,
    },
  ],
];

const STAGE_META = [
  { id: "STAGE_1_POST_SEVERANCE", title: "Stabilise the Shift" },
  { id: "STAGE_2_ELVES_RITUAL", title: "Stop the Cybernetic Elves" },
  { id: "STAGE_3_GRID_DECISION", title: "Repair or Overload the Holo-Grid" },
  { id: "STAGE_4_EXIT_PROTOCOL", title: "Choose Your Ending" },
];

function cloneObjectives(): ObjectiveState[][] {
  return BASE_OBJECTIVES.map((stage) => stage.map((objective) => ({ ...objective })));
}

function seedEntities(): BrowserSession["entities"] {
  return {
    "E-001": {
      id: "E-001",
      name: "Quixon",
      hp: 112,
      max_hp: 112,
      ac: 12,
      disposition: "NEUTRAL",
      is_player: true,
      is_alive: true,
      conditions: [],
      roomId: "ROOM_002",
    },
    "E-002": {
      id: "E-002",
      name: "Zara-7",
      hp: 99,
      max_hp: 99,
      ac: 18,
      disposition: "ALLY",
      is_player: false,
      is_alive: true,
      conditions: [],
      roomId: "ROOM_002",
    },
    "E-003": {
      id: "E-003",
      name: "Kael",
      hp: 68,
      max_hp: 68,
      ac: 17,
      disposition: "NEUTRAL",
      is_player: false,
      is_alive: true,
      conditions: [],
      roomId: "ROOM_001",
    },
    "E-005-ALPHA": {
      id: "E-005-ALPHA",
      name: "Unit Alpha",
      hp: 45,
      max_hp: 45,
      ac: 13,
      disposition: "HOSTILE",
      is_player: false,
      is_alive: true,
      conditions: [],
      roomId: "ROOM_003",
      hostile: true,
    },
    "E-005-BETA": {
      id: "E-005-BETA",
      name: "Unit Beta",
      hp: 45,
      max_hp: 45,
      ac: 13,
      disposition: "HOSTILE",
      is_player: false,
      is_alive: true,
      conditions: [],
      roomId: "ROOM_003",
      hostile: true,
    },
    "E-005-GAMMA": {
      id: "E-005-GAMMA",
      name: "Unit Gamma",
      hp: 45,
      max_hp: 45,
      ac: 13,
      disposition: "HOSTILE",
      is_player: false,
      is_alive: true,
      conditions: [],
      roomId: "ROOM_003",
      hostile: true,
    },
    "E-006": {
      id: "E-006",
      name: "Mira",
      hp: 58,
      max_hp: 58,
      ac: 14,
      disposition: "ALLY",
      is_player: false,
      is_alive: true,
      conditions: [],
      roomId: "ROOM_BACK_ROOM",
    },
    "E-009": {
      id: "E-009",
      name: "The AI Host",
      hp: 240,
      max_hp: 240,
      ac: 20,
      disposition: "THREAT",
      is_player: false,
      is_alive: true,
      conditions: [],
      roomId: "ROOM_003",
      hostile: true,
    },
  };
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `session-${Math.random().toString(36).slice(2, 10)}`;
}

function pushLog(session: BrowserSession, text: string, kind = "narrative"): void {
  session.log.push({ kind, text });
  session.narrativeEvents.push(text);
  session.log = session.log.slice(-40);
  session.narrativeEvents = session.narrativeEvents.slice(-40);
}

function addItem(session: BrowserSession, itemId: string, qty = 1): void {
  const existing = session.inventory[itemId];
  if (existing) {
    existing.qty += qty;
    return;
  }
  session.inventory[itemId] = {
    item_id: itemId,
    name: ITEM_NAMES[itemId] ?? itemId,
    qty,
  };
}

function hasItem(session: BrowserSession, itemId: string): boolean {
  return Boolean(session.inventory[itemId]?.qty);
}

function currentStage(session: BrowserSession): ObjectiveState[] {
  return session.objectives[session.stageIndex];
}

function setObjective(session: BrowserSession, objectiveId: string, status: string): boolean {
  for (const stage of session.objectives) {
    const objective = stage.find((entry) => entry.id === objectiveId);
    if (objective && objective.status !== status) {
      objective.status = status;
      return true;
    }
  }
  return false;
}

function evaluateStageProgress(session: BrowserSession): void {
  if (session.flags.ELVES_STATUS === "Defeated") {
    setObjective(session, "OBJ_DEFEAT_ELVES", "COMPLETE");
  }
  if (session.flags.GRID_STATUS === "Repaired") {
    setObjective(session, "OBJ_REPAIR_GRID", "COMPLETE");
    setObjective(session, "OBJ_BLUE_PILL_READY", "COMPLETE");
  }
  if (session.flags.GRID_STATUS === "Overloaded") {
    setObjective(session, "OBJ_OR_OVERLOAD", "COMPLETE");
    setObjective(session, "OBJ_RED_PILL_TRIGGER", "COMPLETE");
  }
  if (session.resonanceHeat >= 100) {
    setObjective(session, "OBJ_NULL_POINTER", "COMPLETE");
  }

  const stage = currentStage(session);
  const required = stage.filter((objective) => objective.required);
  const allRequiredDone = required.length > 0 && required.every((objective) => objective.status === "COMPLETE");
  const anyDone = stage.some((objective) => objective.status === "COMPLETE");

  if (session.stageIndex === 0 && allRequiredDone) {
    session.stageIndex = 1;
    pushLog(session, "Quest advanced: the triad at Booth 5 is now your highest priority.", "system");
  } else if (session.stageIndex === 1 && allRequiredDone) {
    session.stageIndex = 2;
    pushLog(session, "Quest advanced: choose whether to repair the lattice or force it to the edge.", "system");
  } else if (session.stageIndex === 2 && anyDone) {
    session.stageIndex = 3;
    pushLog(session, "Quest advanced: the station will now remember what kind of ending you chose.", "system");
  }
}

function interactableState(session: BrowserSession, interactable: BrowserInteractable) {
  const existing = session.interactableStates[interactable.id];
  if (existing) return existing;
  const state = {
    state: interactable.state,
    locked: Boolean(interactable.locked),
    looted: false,
  };
  session.interactableStates[interactable.id] = state;
  return state;
}

function getRoomEntities(session: BrowserSession): SnapshotEntity[] {
  const entities = Object.values(session.entities).filter(
    (entity) => entity.is_player || entity.roomId === session.roomId,
  );
  return entities.map(({ roomId: _roomId, hostile: _hostile, ...entity }) => entity);
}

function getInteractables(session: BrowserSession) {
  return ROOMS[session.roomId].interactables.map((interactable) => {
    const state = interactableState(session, interactable);
    return {
      id: interactable.id,
      name: interactable.name,
      type: interactable.type,
      state: state.state,
      locked: state.locked,
    };
  });
}

function buildSnapshot(session: BrowserSession): GameSnapshot {
  const stageMeta = STAGE_META[session.stageIndex];
  const room = ROOMS[session.roomId];
  const entities = getRoomEntities(session);
  return {
    session_id: session.sessionId,
    timestamp: new Date().toISOString(),
    mode: "TURN_BASED",
    prompt: session.prompt,
    location: {
      room_id: room.id,
      room_name: room.name,
      description: room.description,
      exits: Object.keys(room.exits),
    },
    entities,
    turn: {
      round: session.round,
      active_entity_id: "E-001",
      initiative_index: 0,
    },
    combat: {
      in_combat: entities.some((entity) => !entity.is_player && entity.disposition === "HOSTILE" && entity.is_alive),
      initiative_order: entities.map((entity) => entity.id),
      round: session.round,
    },
    inventory: {
      carried: Object.values(session.inventory),
      worn: Object.values(session.worn),
      weight: {
        current: Number((Object.values(session.inventory).reduce((sum, item) => sum + item.qty * 0.5, 0)).toFixed(2)),
        capacity: 50,
      },
    },
    quests: {
      stage_id: stageMeta.id,
      stage_title: stageMeta.title,
      objectives: currentStage(session).map((objective) => ({ ...objective })),
    },
    narrative: {
      flags: { ...session.flags },
      last_events: [...session.narrativeEvents].slice(-12),
    },
    meta: {
      immersion_integrity: session.immersionIntegrity,
      glitch_level:
        session.immersionIntegrity > 75 ? "STABLE" : session.immersionIntegrity > 45 ? "FRACTURE" : "COLLAPSE",
    },
    resonance: {
      heat: Number(session.resonanceHeat.toFixed(1)),
      state:
        session.resonanceHeat >= 80 ? "MELTDOWN" : session.resonanceHeat >= 40 ? "UNSTABLE" : "COLD",
    },
    interactables: getInteractables(session),
    available_actions: {
      movement: Object.keys(room.exits),
      interact: room.interactables.map((interactable) => interactable.id),
      hotbar: ["cast", "use", "attack", "help"],
      dialogue_choices: [],
      end_turn: true,
    },
    log: {
      recent: [...session.log].slice(-20),
    },
  };
}

function saveSession(session: BrowserSession, slot = "webui"): void {
  const key = `${SAVE_PREFIX}${slot}`;
  getStorage().setItem(key, JSON.stringify(session));
}

function cloneSession<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const sessions = new Map<string, BrowserSession>();

function createSession(seed?: number): BrowserSession {
  const session: BrowserSession = {
    sessionId: newId(),
    seed,
    roomId: "ROOM_001",
    round: 0,
    stageIndex: 0,
    flags: {
      KAEL_STATUS: "Alive",
      ELVES_STATUS: "Active",
      GRID_STATUS: "Offline",
      MIRA_CONTACT: "False",
      ENDING_PATH: "Undecided",
    },
    resonanceHeat: 0,
    immersionIntegrity: 100,
    prompt: "Quixon@NebulaDice:~$ ",
    narrativeEvents: [],
    log: [],
    inventory: {},
    worn: {},
    interactableStates: {},
    entities: seedEntities(),
    objectives: cloneObjectives(),
  };
  pushLog(session, "Nebula Dice browser session initialized.", "system");
  pushLog(
    session,
    "You wake in the airlock under emergency amber light. The station is intact enough to lie to you.",
    "narrative",
  );
  sessions.set(session.sessionId, session);
  saveSession(session);
  return session;
}

function getSession(sessionId: string): BrowserSession {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found.`);
  }
  return session;
}

function completeFindMira(session: BrowserSession): void {
  if (setObjective(session, "OBJ_FIND_MIRA", "COMPLETE")) {
    session.flags.MIRA_CONTACT = "True";
    addItem(session, "item_illegal_modded_d20");
    pushLog(session, "Mira answers through static and slips you an illegal modded d20 for the long night ahead.");
  }
}

function handleMove(session: BrowserSession, direction: string): string[] {
  const room = ROOMS[session.roomId];
  const nextRoomId = room.exits[direction];
  if (!nextRoomId) {
    return ["No valid route found."];
  }
  session.roomId = nextRoomId;
  if (nextRoomId === "ROOM_BACK_ROOM") {
    completeFindMira(session);
  }
  const nextRoom = ROOMS[nextRoomId];
  return [`You move ${direction} into ${nextRoom.name}.`, nextRoom.description];
}

function handleExamine(session: BrowserSession, interactableId?: string): string[] {
  const room = ROOMS[session.roomId];
  const interactable = room.interactables.find((entry) => entry.id === interactableId) ?? room.interactables[0];
  if (!interactable) {
    return [room.description];
  }
  setObjective(session, "OBJ_ORIENT", "COMPLETE");
  if (interactable.id === "obj_sigils") {
    session.immersionIntegrity = Math.max(45, session.immersionIntegrity - 8);
    session.resonanceHeat = Math.min(100, session.resonanceHeat + 6);
  }
  return [interactable.description];
}

function handleLoot(session: BrowserSession, interactableId: string): string[] {
  const room = ROOMS[session.roomId];
  const interactable = room.interactables.find((entry) => entry.id === interactableId);
  if (!interactable) {
    return ["There is nothing there to loot."];
  }
  const state = interactableState(session, interactable);
  if (state.locked) {
    return [`${interactable.name} is locked.`];
  }
  if (state.looted) {
    return [`${interactable.name} has already been stripped clean.`];
  }
  if (!interactable.loot?.length) {
    return [`${interactable.name} yields nothing but atmosphere.`];
  }
  state.looted = true;
  for (const itemId of interactable.loot) {
    addItem(session, itemId);
  }
  if (interactable.id === "obj_logbook") {
    completeFindMira(session);
  }
  return [`You recover ${interactable.loot.map((itemId) => ITEM_NAMES[itemId] ?? itemId).join(", ")}.`];
}

function handleUnlock(session: BrowserSession, interactableId: string): string[] {
  const room = ROOMS[session.roomId];
  const interactable = room.interactables.find((entry) => entry.id === interactableId);
  if (!interactable) {
    return ["Nothing here responds to your keying sequence."];
  }
  const state = interactableState(session, interactable);
  if (!state.locked) {
    return [`${interactable.name} is already unlocked.`];
  }
  if (!hasItem(session, "item_keycard_blue")) {
    return ["You need a valid keycard before that mechanism will trust you."];
  }
  state.locked = false;
  state.state = "ACTIVE";
  return [`You unlock ${interactable.name}.`];
}

function handleInteract(session: BrowserSession, interactableId: string): string[] {
  const room = ROOMS[session.roomId];
  const interactable = room.interactables.find((entry) => entry.id === interactableId);
  if (!interactable) {
    return ["Nothing there answers your touch."];
  }
  if (interactable.id === "obj_mira_terminal") {
    completeFindMira(session);
    session.immersionIntegrity = Math.min(100, session.immersionIntegrity + 4);
    return [
      "Mira's terminal unseals. Her voice comes through in clipped bursts: break the ritual, then choose what kind of truth this station deserves.",
    ];
  }
  if (interactable.id === "obj_root_switch") {
    if (session.flags.ELVES_STATUS !== "Defeated") {
      return ["The root switch bucks against your hand. The ritual triad still has too much pressure on the grid."];
    }
    session.flags.GRID_STATUS = "Repaired";
    session.immersionIntegrity = Math.min(100, session.immersionIntegrity + 6);
    return ["You throw the root switch. Backup current stabilises the lattice and the station exhales."];
  }
  if (interactable.id === "obj_hardline") {
    if (session.stageIndex <= 1) {
      setObjective(session, "OBJ_INTERRUPT_RITUAL", "COMPLETE");
      session.resonanceHeat = Math.min(100, session.resonanceHeat + 18);
      return ["You spike the hardline and the ritual channel stutters, throwing the triad out of rhythm."];
    }
    session.flags.GRID_STATUS = "Overloaded";
    session.resonanceHeat = Math.min(100, session.resonanceHeat + 24);
    session.immersionIntegrity = Math.max(20, session.immersionIntegrity - 10);
    return ["You drive the hardline past tolerance. Every mirror in the station lags a second further behind reality."];
  }
  return [interactable.description];
}

function hostileCounterattack(session: BrowserSession): string[] {
  const hostiles = Object.values(session.entities).filter(
    (entity) => entity.roomId === session.roomId && entity.hostile && entity.is_alive,
  );
  if (!hostiles.length) {
    return [];
  }
  const player = session.entities["E-001"];
  const damage = Math.max(4, 6 + hostiles.length * 2);
  player.hp = Math.max(0, player.hp - damage);
  if (player.hp === 0) {
    session.immersionIntegrity = Math.max(5, session.immersionIntegrity - 20);
    player.hp = Math.floor(player.max_hp * 0.45);
    return [
      `The triad tears through Quixon's defenses for ${damage} damage.`,
      "The timeline shudders, then folds you back from the brink. Nebula Dice refuses to let the scene end cheaply.",
    ];
  }
  return [`Hostile feedback slams Quixon for ${damage} damage.`];
}

function handleAttack(session: BrowserSession, targetId: string): string[] {
  const target = session.entities[targetId];
  if (!target || !target.is_alive || target.roomId !== session.roomId) {
    return ["No target found in the current scene."];
  }
  const damage = target.hostile ? 18 : 10;
  target.hp = Math.max(0, target.hp - damage);
  if (target.hp === 0) {
    target.is_alive = false;
    target.conditions = ["DEFEATED"];
    target.disposition = "DEFEATED";
  }
  const messages = [`Quixon strikes ${target.name} for ${damage} damage.`];
  if (!target.is_alive) {
    messages.push(`${target.name} collapses out of the initiative lattice.`);
  }
  const elves = ["E-005-ALPHA", "E-005-BETA", "E-005-GAMMA"].map((id) => session.entities[id]);
  if (elves.every((entity) => !entity.is_alive)) {
    session.flags.ELVES_STATUS = "Defeated";
    addItem(session, "item_void_grenade");
    messages.push("The elf triad is broken. The ritual pressure across Booth 5 finally releases.");
  }
  return [...messages, ...hostileCounterattack(session)];
}

function handleCast(session: BrowserSession, targetId?: string): string[] {
  session.resonanceHeat = Math.min(100, session.resonanceHeat + 16);
  session.prompt = session.resonanceHeat >= 80 ? "Josh@Windows11:~$ " : "Quixon@NebulaDice:~$ ";
  const target =
    (targetId ? session.entities[targetId] : undefined) ??
    Object.values(session.entities).find((entity) => entity.roomId === session.roomId && entity.hostile && entity.is_alive);
  if (!target) {
    return ["Time Stop blooms around Quixon, but there is no immediate threat to pin inside the glassy second."];
  }
  target.hp = Math.max(0, target.hp - 24);
  if (target.hp === 0) {
    target.is_alive = false;
    target.conditions = ["FROZEN", "DEFEATED"];
    target.disposition = "DEFEATED";
  }
  return [
    `Chronurgy bites into ${target.name}. Frozen seconds shear ${target.name} for 24 damage.`,
    ...hostileCounterattack(session),
  ];
}

function handleCommand(session: BrowserSession, text: string): string[] {
  const command = text.trim().toLowerCase();
  if (!command) {
    return ["Objective ping refreshed."];
  }
  if (command === "quest" || command === "objective" || command === "what now") {
    return [currentStage(session).map((objective) => `${objective.status}: ${objective.text}`).join(" | ")];
  }
  if (command === "investigate" || command === "look") {
    return handleExamine(session);
  }
  if (command === "help") {
    return [
      "Commands: investigate, quest, talk mira, talk zara, attack <id>, cast time stop, move north/south/east/west.",
    ];
  }
  if (command.startsWith("talk")) {
    if (command.includes("mira") || command.includes("e-006")) {
      completeFindMira(session);
      return ["Mira warns that every clean ending here is hiding blood under the polish."]; 
    }
    if (command.includes("zara") || command.includes("e-002")) {
      return ["Zara-7 says the station can be stabilised, but only after the ritual channel goes dark."];
    }
    return ["No one answers, or they are pretending not to hear you."];
  }
  if (command.startsWith("attack ")) {
    return handleAttack(session, text.trim().split(/\s+/).slice(1).join(" "));
  }
  if (command.startsWith("cast") && command.includes("time stop")) {
    return handleCast(session);
  }
  return [`Command accepted (${text.trim()}).`];
}

function applyActionToSession(session: BrowserSession, action: UIAction): ActionResponse {
  session.round += 1;
  let messages: string[] = [];
  switch (action.type) {
    case "MOVE":
      messages = handleMove(session, String(action.payload.direction ?? ""));
      break;
    case "EXAMINE":
      messages = handleExamine(session, String(action.payload.interactable_id ?? ""));
      break;
    case "INTERACT":
      messages = handleInteract(session, String(action.payload.interactable_id ?? ""));
      break;
    case "LOOT":
      messages = handleLoot(session, String(action.payload.interactable_id ?? ""));
      break;
    case "UNLOCK":
      messages = handleUnlock(session, String(action.payload.interactable_id ?? ""));
      break;
    case "ATTACK":
      messages = handleAttack(session, String(action.payload.target_id ?? ""));
      break;
    case "CAST":
      messages = handleCast(session, String(action.payload.target_id ?? ""));
      break;
    case "END_TURN":
      messages = hostileCounterattack(session);
      if (!messages.length) messages = ["You hold position and let the station breathe for one turn."];
      break;
    case "COMMAND":
      messages = handleCommand(session, String(action.payload.text ?? ""));
      break;
    default:
      messages = ["That action is not yet wired into the browser build."];
      break;
  }

  for (const message of messages) {
    pushLog(session, message, message.includes("Command accepted") ? "system" : "narrative");
  }
  evaluateStageProgress(session);
  saveSession(session);
  return {
    ok: true,
    messages,
    snapshot: buildSnapshot(session),
  };
}

function loadSavedSession(savePath: string): BrowserSession {
  const raw = getStorage().getItem(savePath);
  if (!raw) {
    throw new Error(`Save ${savePath} not found.`);
  }
  const parsed = JSON.parse(raw) as BrowserSession;
  sessions.set(parsed.sessionId, parsed);
  return parsed;
}

export async function newBrowserSession(seed?: number): Promise<string> {
  const session = createSession(seed);
  return session.sessionId;
}

export async function loadBrowserSession(savePath: string): Promise<string> {
  const session = loadSavedSession(savePath);
  return session.sessionId;
}

export async function getBrowserState(sessionId: string): Promise<GameSnapshot> {
  return buildSnapshot(getSession(sessionId));
}

export async function postBrowserAction(sessionId: string, action: UIAction): Promise<ActionResponse> {
  return applyActionToSession(getSession(sessionId), action);
}

export async function listBrowserSaves(): Promise<string[]> {
  const storage = getStorage();
  return Array.from({ length: storage.length }, (_, index) => storage.key(index))
    .filter((key): key is string => Boolean(key && key.startsWith(SAVE_PREFIX)))
    .sort()
    .reverse();
}

export function createNoopWs() {
  return {
    send: () => undefined,
    close: () => undefined,
  };
}
