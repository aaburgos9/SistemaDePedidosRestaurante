import { MongoOrderRepository } from "../../../../infrastructure/database/repositories/mongo.order.repository";
import MongoSingleton from "../../../../infrastructure/database/mongo";
import { KitchenOrder } from "../../../../domain/models/order";

jest.mock("../../../../infrastructure/database/mongo");

const mockCollection = {
  insertOne: jest.fn(),
  find: jest.fn(() => ({
    sort: jest.fn(() => ({
      toArray: jest.fn(),
    })),
  })),
  findOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
};

describe("MongoOrderRepository", () => {
  let repository: MongoOrderRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    (MongoSingleton.connect as jest.Mock).mockResolvedValue({
      collection: jest.fn().mockReturnValue(mockCollection),
    });
    repository = new MongoOrderRepository();
  });

  it("crea una orden correctamente", async () => {
    const order: KitchenOrder = {
      id: "ORD-123",
      customerName: "Juan",
      items: [{ productName: "Pizza", unitPrice: 2, quantity: 1 }],
      table: "5",
      status: "preparing",
      createdAt: new Date().toISOString(),
    };

    await repository.create(order);

    expect(mockCollection.insertOne).toHaveBeenCalledWith(order);
  });

  it("obtiene todas las órdenes ordenadas por fecha", async () => {
    const mockOrders = [
      { id: "ORD-1", orderId: "ORD-1", status: "ready" },
      { id: "ORD-2", orderId: "ORD-2", status: "pending" },
    ];

    const mockSort = jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockOrders),
    });
    mockCollection.find.mockReturnValue({ sort: mockSort });

    const result = await repository.getAll();

    expect(mockCollection.find).toHaveBeenCalledWith({});
    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(result).toEqual(mockOrders);
  });

  it("obtiene orden por ID", async () => {
    const mockOrder = { id: "ORD-ABC", orderId: "ORD-ABC", status: "ready" };
    mockCollection.findOne.mockResolvedValue(mockOrder);

    const result = await repository.getById("ORD-ABC");

    expect(mockCollection.findOne).toHaveBeenCalledWith({ id: "ORD-ABC" });
    expect(result).toEqual(mockOrder);
  });

  it("retorna null cuando orden no existe", async () => {
    mockCollection.findOne.mockResolvedValue(null);

    const result = await repository.getById("INEXISTENTE");

    expect(result).toBeNull();
  });

  it("actualiza estado de orden", async () => {
    mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });

    const result = await repository.updateStatus("ORD-123", "ready");

    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { id: "ORD-123" },
      { $set: { status: "ready" } }
    );
    expect(result).toBe(true);
  });

  it("retorna false si updateStatus no encuentra orden", async () => {
    mockCollection.updateOne.mockResolvedValue({ matchedCount: 0 });

    const result = await repository.updateStatus("NO-EXISTE", "ready");

    expect(result).toBe(false);
  });

  it("elimina orden correctamente", async () => {
    await repository.remove("ORD-DELETE");

    expect(mockCollection.deleteOne).toHaveBeenCalledWith({ id: "ORD-DELETE" });
  });
});
