import type { Request, Response } from "express";
import { setOrderRepository, getKitchenOrders, addKitchenOrder, markOrderReady, removeOrderFromKitchen } from "../controllers/kitchen.controller";
import { KitchenOrder } from "../models/order";

describe("KitchenController (Repository Pattern & DIP)", () => {
  let repoMock: {
    add: jest.Mock;
    findById: jest.Mock;
    remove: jest.Mock;
    getAll: jest.Mock;
  };
  

  beforeEach(() => {
    repoMock = {
      add: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      remove: jest.fn(),
      getAll: jest.fn().mockResolvedValue([]),
      updateStatus: jest.fn(),
    };
    setOrderRepository(repoMock as any);
  });

  it("getOrders devuelve lo provisto por el repositorio (sin acceso directo a datos)", async () => {
    const req = {} as Request;
    const json = jest.fn();
    const res = { json } as unknown as Response;

    repoMock.getAll.mockReturnValue([
      {
        id: "o-1",
        customerName: "Laura",
        table: "Mesa 1",
        items: [],
        createdAt: new Date().toISOString(),
        status: "preparing",
      } as KitchenOrder,
    ]);

    // next mock to capture errors (should not be called here)
    const next = jest.fn();
    // function is async
    await getKitchenOrders(req, res, next);
    // assertions already performed above
    expect(next).not.toHaveBeenCalled();

    expect(repoMock.getAll).toHaveBeenCalledTimes(1);
    expect(json).toHaveBeenCalledWith([
      expect.objectContaining({ id: "o-1", status: "preparing" }),
    ]);
  });

  it("add, markReady y remove usan el repositorio (no arrays globales)", async () => {
    const order: KitchenOrder = {
      id: "o-2",
      customerName: "Pedro",
      table: "Mesa 3",
      items: [],
      createdAt: new Date().toISOString(),
      status: "preparing",
    };

    await addKitchenOrder(order);
    expect(repoMock.create).toHaveBeenCalledWith(order);
    repoMock.findById.mockReturnValue(order);
    await markOrderReady(order.id);
    expect(repoMock.updateStatus).toHaveBeenCalledWith(order.id, "ready");
    await removeOrderFromKitchen(order.id);
    expect(repoMock.remove).toHaveBeenCalledWith(order.id);
    // no direct array/state access; repository methods are used
  });
});

// Isolated: Repositorio completamente mockeado; sin acceso a memoria global.
// Repeatable: Datos fijos y deterministas.
// Self-validating: Aserciones verifican llamadas a la abstracción (DIP).