import { WebSocket } from "ws";

// Mock ws module ANTES de importar wsServer
jest.mock("ws", () => {
  const mockClients = new Set();
  return {
    WebSocketServer: jest.fn(() => ({
      clients: mockClients,
    })),
    WebSocket: {
      OPEN: 1,
      CLOSED: 3,
    },
  };
});

import { notifyClients, wss } from "../../../infrastructure/websocket/ws-server";

describe("wsServer", () => {
  const mockClient1 = {
    readyState: WebSocket.OPEN,
    send: jest.fn(),
  };

  const mockClient2 = {
    readyState: WebSocket.OPEN,
    send: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Limpiar y agregar clientes mockeados
    (wss.clients as any).clear();
    (wss.clients as any).add(mockClient1);
    (wss.clients as any).add(mockClient2);
  });

  it("notifica a todos los clientes conectados", () => {
    const payload = { type: "ORDER_NEW", order: { id: "123" } };
    
    notifyClients(payload);

    expect(mockClient1.send).toHaveBeenCalledWith(JSON.stringify(payload));
    expect(mockClient2.send).toHaveBeenCalledWith(JSON.stringify(payload));
  });

  it("solo envía a clientes con estado OPEN", () => {
    const closedClient = {
      readyState: WebSocket.CLOSED,
      send: jest.fn(),
    };

    (wss.clients as any).add(closedClient);
    notifyClients({ type: "TEST" });

    expect(closedClient.send).not.toHaveBeenCalled();
    expect(mockClient1.send).toHaveBeenCalled();
  });

  it("serializa payload a JSON", () => {
    const complexPayload = {
      type: "ORDER_READY",
      id: "abc-123",
      finishedAt: new Date("2025-01-01").toISOString(),
    };

    notifyClients(complexPayload);
    
    expect(mockClient1.send).toHaveBeenCalledWith(JSON.stringify(complexPayload));
  });
});
