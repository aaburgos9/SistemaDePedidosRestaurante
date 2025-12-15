import { WebSocketServer, WebSocket } from "ws";

export const wss = new WebSocketServer({ port: 4000 });
console.log("🔌 WebSocket server escuchando en puerto 4000");

export function notifyClients(payload: any) {
  const message = JSON.stringify(payload);

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
