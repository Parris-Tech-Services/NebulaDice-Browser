import type { ActionResponse, ConnectionStatus, UIAction } from "./types";
import { validateActionResponse } from "./validators";
import { getApiBase, isBrowserMode } from "./client";
import { createNoopWs } from "./browserClient";

type OnMessage = (response: ActionResponse) => void;
type OnStatus = (status: ConnectionStatus) => void;

export type WSController = {
  send: (action: UIAction) => void;
  close: () => void;
};

export function connect(
  sessionId: string,
  onMessage: OnMessage,
  onStatusChange: OnStatus
): WSController {
  if (isBrowserMode()) {
    void sessionId;
    void onMessage;
    onStatusChange("DISCONNECTED");
    return createNoopWs();
  }
  let socket: WebSocket | null = null;
  let reconnectDelay = 300;
  let manuallyClosed = false;

  const base = getApiBase();
  const wsBase = base.startsWith("https://") ? base.replace("https://", "wss://") : base.replace("http://", "ws://");
  const url = `${wsBase}/ws/${sessionId}`;

  const open = () => {
    onStatusChange(socket ? "RECONNECTING" : "CONNECTING");
    socket = new WebSocket(url);
    socket.onopen = () => {
      reconnectDelay = 300;
      onStatusChange("CONNECTED");
    };
    socket.onmessage = (event) => {
      try {
        onMessage(validateActionResponse(JSON.parse(event.data)));
      } catch {
        // Ignore malformed payloads without crashing UI.
      }
    };
    socket.onclose = () => {
      if (manuallyClosed) {
        onStatusChange("DISCONNECTED");
        return;
      }
      onStatusChange("RECONNECTING");
      setTimeout(open, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, 4000);
    };
  };

  open();

  return {
    send(action) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(action));
      }
    },
    close() {
      manuallyClosed = true;
      socket?.close();
    }
  };
}
