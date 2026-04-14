export type ConnectionStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "RECONNECTING";

export type UIActionType =
  | "MOVE"
  | "EXAMINE"
  | "INTERACT"
  | "LOOT"
  | "UNLOCK"
  | "USE_ITEM"
  | "EQUIP_ITEM"
  | "UNEQUIP_ITEM"
  | "ATTACK"
  | "CAST"
  | "DIALOGUE_CHOICE"
  | "END_TURN"
  | "COMMAND";

export type UIAction = {
  type: UIActionType;
  payload: Record<string, unknown>;
  client_time?: string | null;
};

export type SnapshotEntity = {
  id: string;
  name: string;
  hp: number;
  max_hp: number;
  ac: number;
  disposition: string;
  is_player: boolean;
  is_alive: boolean;
  conditions: string[];
};

export type GameSnapshot = {
  session_id: string;
  timestamp: string;
  mode: string;
  prompt: string;
  location: {
    room_id: string;
    room_name: string;
    description: string;
    exits: string[];
  };
  entities: SnapshotEntity[];
  turn: {
    round: number;
    active_entity_id: string;
    initiative_index: number;
  };
  combat: {
    in_combat: boolean;
    initiative_order: string[];
    round: number;
  };
  inventory: {
    carried: { item_id: string; name: string; qty: number }[];
    worn: { item_id: string; name: string; qty: number }[];
    weight: { current: number; capacity: number };
  };
  quests: {
    stage_id: string;
    stage_title: string;
    objectives: { id: string; text: string; status: string }[];
  };
  narrative: {
    flags: Record<string, string>;
    last_events: string[];
  };
  meta: {
    immersion_integrity: number;
    glitch_level: string;
  };
  resonance: {
    heat: number;
    state: string;
  };
  interactables: {
    id: string;
    name: string;
    type: string;
    state: string;
    locked: boolean;
  }[];
  available_actions: {
    movement: string[];
    interact: string[];
    hotbar: string[];
    dialogue_choices: unknown[];
    end_turn: boolean;
  };
  log: {
    recent: { kind: string; text: string }[];
  };
};

export type ActionResponse = {
  ok: boolean;
  messages: string[];
  snapshot: GameSnapshot;
};
