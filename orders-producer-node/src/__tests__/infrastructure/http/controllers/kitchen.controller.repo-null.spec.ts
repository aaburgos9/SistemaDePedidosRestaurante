import type { Request, Response } from "express";

// Mock WebSocket module before importing controller
jest.mock("../../../../infrastructure/websocket/ws-server", () => ({
  notifyClients: jest.fn(),
  wss: {
    clients: new Set()
  }
}));

import { setOrderRepository, getRepository, getKitchenOrders, addKitchenOrder, markOrderReady, removeOrderFromKitchen } from "../../../../infrastructure/http/controllers/kitchen.controller";

describe("kitchen.controller repo not initialized branches", () => {
  beforeEach(() => {
    // Explicitly unset repository
    setOrderRepository(null as any);
  });

  it("getRepository throws error when repo is null", () => {
    expect(() => getRepository()).toThrow("Repository no inicializado");
  });

  it("getRepository returns repo when initialized", () => {
    const mockRepo = {
      getById: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
      getAll: jest.fn(),
      updateStatus: jest.fn(),
    };
    setOrderRepository(mockRepo as any);
    
    const result = getRepository();
    expect(result).toBe(mockRepo);
  });

  it("getKitchenOrders returns 500 when repo is null", async () => {
    setOrderRepository(null as any);
    const req = {} as Request;
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const res = { status, json } as unknown as Response;
    const next = jest.fn();

    await getKitchenOrders(req, res, next);
    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ error: "Repository no inicializado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("helpers throw when repo is null", async () => {
    await expect(addKitchenOrder({} as any)).rejects.toThrow("Repository no inicializado");
    await expect(markOrderReady("id"))
      .rejects.toThrow("Repository no inicializado");
    await expect(removeOrderFromKitchen("id"))
      .rejects.toThrow("Repository no inicializado");
  });
});

// FIRST: Isolated (no real repo), Self-validating (status/assertions), Repeatable.