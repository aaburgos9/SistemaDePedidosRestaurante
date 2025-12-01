import type { Request, Response } from "express";
import { setOrderRepository, getKitchenOrders, markOrderReady } from "../controllers/kitchen.controller";

describe("KitchenController - failure cases", () => {
  let repoMock: any;
  let controller: KitchenController;

  beforeEach(() => {
    repoMock = {
      add: jest.fn(),
      findById: jest.fn(),
      remove: jest.fn(),
      getAll: jest.fn().mockReturnValue([]),
    };
    setOrderRepository(repoMock);
  });

  it("getOrders maneja excepción del repositorio y pasa error a next()", async () => {
    const req = {} as Request;
    const status = jest.fn().mockReturnThis();
    const json = jest.fn();
    const res = { status, json } as unknown as Response;

    const next = jest.fn();
    repoMock.getAll.mockImplementation(() => { throw new Error("db down"); });

    await getKitchenOrders(req, res, next);

    expect(status).not.toHaveBeenCalled();
    expect(json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("markOrderReady maneja pedido no encontrado sin explotar", async () => {
    repoMock.updateStatus = jest.fn().mockResolvedValue(false);
    await expect(markOrderReady("no-existe")).resolves.toBe(false);
  });
});

// Isolated: Repositorio mockeado; respuesta simulada.
// Repeatable: Inputs deterministas.
// Self-validating: Aserciones sobre códigos y payloads.