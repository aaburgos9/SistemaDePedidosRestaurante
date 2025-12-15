import type { Request, Response, NextFunction } from "express";

// Mock WebSocket module before importing controller
jest.mock("../../../../infrastructure/websocket/ws-server", () => ({
  notifyClients: jest.fn(),
  wss: {
    clients: new Set()
  }
}));

import { setOrderRepository, updateOrderStatus } from "../../../../infrastructure/http/controllers/kitchen.controller";
import { OrderRepository } from "../../../../domain/interfaces/order.interface";

describe("kitchen.controller - updateOrderStatus", () => {
  let mockRepo: jest.Mocked<OrderRepository>;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRepo = {
      getAll: jest.fn(),
      create: jest.fn(),
      updateStatus: jest.fn(),
      remove: jest.fn(),
      getById: jest.fn(),
    } as jest.Mocked<OrderRepository>;

    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    
    req = {
      params: {},
      body: {}
    };
    
    res = {
      status: statusMock,
      json: jsonMock
    };
    
    next = jest.fn();
    
    setOrderRepository(mockRepo);
  });

  it("actualiza estado exitosamente", async () => {
    req.params = { id: "order-123" };
    req.body = { status: "preparing" };
    mockRepo.updateStatus.mockResolvedValue(true);

    await updateOrderStatus(req as Request, res as Response, next);

    expect(mockRepo.updateStatus).toHaveBeenCalledWith("order-123", "preparing");
    expect(jsonMock).toHaveBeenCalledWith({ success: true, id: "order-123", status: "preparing" });
    expect(statusMock).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 500 cuando repo no está inicializado", async () => {
    setOrderRepository(null as any);
    req.params = { id: "order-123" };
    req.body = { status: "preparing" };

    await updateOrderStatus(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Repository no inicializado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 400 cuando falta ID", async () => {
    req.params = {}; // Sin ID
    req.body = { status: "preparing" };

    await updateOrderStatus(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "ID de orden requerido" });
    expect(mockRepo.updateStatus).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 400 cuando falta status", async () => {
    req.params = { id: "order-123" };
    req.body = {}; // Sin status

    await updateOrderStatus(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ 
      error: "Estado inválido",
      validStatuses: ["pending", "preparing", "ready", "completed", "cancelled"]
    });
    expect(mockRepo.updateStatus).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 400 cuando status no es string", async () => {
    req.params = { id: "order-123" };
    req.body = { status: 123 }; // Número en lugar de string

    await updateOrderStatus(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ 
      error: "Estado inválido",
      validStatuses: ["pending", "preparing", "ready", "completed", "cancelled"]
    });
    expect(mockRepo.updateStatus).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 400 cuando status es inválido", async () => {
    req.params = { id: "order-123" };
    req.body = { status: "invalid-status" };

    await updateOrderStatus(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ 
      error: "Estado inválido",
      validStatuses: ["pending", "preparing", "ready", "completed", "cancelled"]
    });
    expect(mockRepo.updateStatus).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("retorna 404 cuando orden no existe", async () => {
    req.params = { id: "nonexistent-order" };
    req.body = { status: "preparing" };
    mockRepo.updateStatus.mockResolvedValue(false);

    await updateOrderStatus(req as Request, res as Response, next);

    expect(mockRepo.updateStatus).toHaveBeenCalledWith("nonexistent-order", "preparing");
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Orden no encontrada" });
    expect(next).not.toHaveBeenCalled();
  });

  it("llama next con error cuando repo lanza excepción", async () => {
    const error = new Error("Database error");
    req.params = { id: "order-123" };
    req.body = { status: "preparing" };
    mockRepo.updateStatus.mockRejectedValue(error);

    await updateOrderStatus(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(statusMock).not.toHaveBeenCalled();
    expect(jsonMock).not.toHaveBeenCalled();
  });

  it("acepta todos los estados válidos", async () => {
    const validStatuses = ["pending", "preparing", "ready", "completed", "cancelled"];
    
    for (const status of validStatuses) {
      mockRepo.updateStatus.mockResolvedValue(true);
      mockRepo.getById.mockResolvedValue(null); // No order found after update
      req.params = { id: "order-123" };
      req.body = { status };

      await updateOrderStatus(req as Request, res as Response, next);

      expect(mockRepo.updateStatus).toHaveBeenCalledWith("order-123", status);
      expect(jsonMock).toHaveBeenCalledWith({ success: true, id: "order-123", status });
    }
  });

  it("notifica a clientes WebSocket cuando la orden se actualiza exitosamente", async () => {
    const updatedOrder = {
      id: "order-123",
      customerName: "Test Customer",
      items: [{ productName: "Pizza", quantity: 1, unitPrice: 10000 }],
      table: "5",
      status: "preparing" as const,
      createdAt: "2025-01-01T10:00:00.000Z"
    };

    req.params = { id: "order-123" };
    req.body = { status: "preparing" };
    mockRepo.updateStatus.mockResolvedValue(true);
    mockRepo.getById.mockResolvedValue(updatedOrder);

    await updateOrderStatus(req as Request, res as Response, next);

    expect(mockRepo.getById).toHaveBeenCalledWith("order-123");
    expect(jsonMock).toHaveBeenCalledWith({ success: true, id: "order-123", status: "preparing" });
  });

  it("continúa sin error cuando getById retorna null después de actualizar", async () => {
    req.params = { id: "order-123" };
    req.body = { status: "preparing" };
    mockRepo.updateStatus.mockResolvedValue(true);
    mockRepo.getById.mockResolvedValue(null);

    await updateOrderStatus(req as Request, res as Response, next);

    expect(mockRepo.updateStatus).toHaveBeenCalledWith("order-123", "preparing");
    expect(mockRepo.getById).toHaveBeenCalledWith("order-123");
    expect(jsonMock).toHaveBeenCalledWith({ success: true, id: "order-123", status: "preparing" });
    expect(next).not.toHaveBeenCalled();
  });
});
