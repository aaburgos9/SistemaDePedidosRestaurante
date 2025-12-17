import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

let wss: WebSocketServer;

export function initializeWebSocket(server: Server) {
  wss = new WebSocketServer({ server });
  console.log("🔌 WebSocket server inicializado en el mismo puerto que HTTP");
  
  wss.on('connection', (ws) => {
    console.log('👤 Cliente WebSocket conectado');
    
    ws.on('close', () => {
      console.log('👋 Cliente WebSocket desconectado');
    });
  });
}

export function notifyClients(payload: any) {
  if (!wss) {
    console.warn("⚠️ WebSocket server no inicializado");
    return;
  }
  
  const message = JSON.stringify(payload);

  wss.clients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
