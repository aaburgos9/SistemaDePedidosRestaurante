import type { Request, Response } from "express";
import { setOrderRepository, getKitchenOrders, addKitchenOrder, markOrderReady, removeOrderFromKitchen } from "../controllers/kitchen.controller";

describe("kitchen.controller repo not initialized branches", () => {
  beforeEach(() => {
    // Explicitly unset repository
    setOrderRepository(null as any);
  });

  it("getKitchenOrders returns 500 when repo is null", async () => {
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