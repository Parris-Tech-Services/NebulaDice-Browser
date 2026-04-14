import type { ActionResponse, GameSnapshot, UIAction } from "./types";
import { validateActionResponse, validateSnapshot } from "./validators";
import {
  getBrowserState,
  listBrowserSaves,
  loadBrowserSession,
  newBrowserSession,
  postBrowserAction,
} from "./browserClient";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";
const API_MODE = import.meta.env.VITE_API_MODE ?? "browser";
const IS_BROWSER_MODE = API_MODE === "browser";

async function jsonRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${response.status} ${detail}`);
  }
  return (await response.json()) as T;
}

export async function newSession(seed?: number, permadeath = false, slot = "autosave"): Promise<string> {
  if (IS_BROWSER_MODE) {
    void permadeath;
    void slot;
    return newBrowserSession(seed);
  }
  const result = await jsonRequest<{ session_id: string }>("/session/new", {
    method: "POST",
    body: JSON.stringify({ seed, permadeath, slot })
  });
  return result.session_id;
}

export async function loadSession(
  savePath: string,
  seed?: number,
  permadeath = false
): Promise<string> {
  if (IS_BROWSER_MODE) {
    void seed;
    void permadeath;
    return loadBrowserSession(savePath);
  }
  const result = await jsonRequest<{ session_id: string }>("/session/load", {
    method: "POST",
    body: JSON.stringify({ save_path: savePath, seed, permadeath })
  });
  return result.session_id;
}

export async function getState(sessionId: string): Promise<GameSnapshot> {
  if (IS_BROWSER_MODE) {
    return getBrowserState(sessionId);
  }
  const result = await jsonRequest<unknown>(`/session/${sessionId}/state`);
  return validateSnapshot(result);
}

export async function postAction(sessionId: string, action: UIAction): Promise<ActionResponse> {
  if (IS_BROWSER_MODE) {
    return postBrowserAction(sessionId, action);
  }
  const result = await jsonRequest<unknown>(`/session/${sessionId}/action`, {
    method: "POST",
    body: JSON.stringify(action)
  });
  return validateActionResponse(result);
}

export async function listSaves(sessionId: string): Promise<string[]> {
  if (IS_BROWSER_MODE) {
    void sessionId;
    return listBrowserSaves();
  }
  const result = await jsonRequest<{ saves: string[] }>(`/session/${sessionId}/saves`);
  return result.saves;
}

export function getApiBase(): string {
  return API_BASE;
}

export function isBrowserMode(): boolean {
  return IS_BROWSER_MODE;
}
