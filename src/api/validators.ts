import { z } from "zod";

import type { ActionResponse, GameSnapshot } from "./types";

const SnapshotSchema = z.object({
  session_id: z.string(),
  timestamp: z.string(),
  mode: z.string(),
  prompt: z.string(),
  location: z.object({
    room_id: z.string(),
    room_name: z.string(),
    description: z.string(),
    exits: z.array(z.string())
  })
});

const ActionResponseSchema = z.object({
  ok: z.boolean(),
  messages: z.array(z.string()),
  snapshot: z.any()
});

export function validateSnapshot(snapshot: unknown): GameSnapshot {
  SnapshotSchema.parse(snapshot);
  return snapshot as GameSnapshot;
}

export function validateActionResponse(payload: unknown): ActionResponse {
  ActionResponseSchema.parse(payload);
  const parsed = payload as ActionResponse;
  validateSnapshot(parsed.snapshot);
  return parsed;
}
