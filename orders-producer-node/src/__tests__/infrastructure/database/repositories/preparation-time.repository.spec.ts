import { PreparationTimeRepository } from "../../../../infrastructure/database/repositories/preparation-time.repository";
import MongoSingleton from "../../../../infrastructure/database/mongo";

jest.mock("../../../../infrastructure/database/mongo");

const mockCollection = {
  find: jest.fn(() => ({
    sort: jest.fn(() => ({
      toArray: jest.fn(),
    })),
  })),
  findOne: jest.fn(),
  updateOne: jest.fn(),
  deleteOne: jest.fn(),
};

describe("PreparationTimeRepository", () => {
  let repository: PreparationTimeRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    (MongoSingleton.connect as jest.Mock).mockResolvedValue({
      collection: jest.fn().mockReturnValue(mockCollection),
    });
    repository = new PreparationTimeRepository();
  });

  it("obtiene tiempos habilitados ordenados", async () => {
    const mockTimes = [
      { productName: "Hamburguesa", secondsPerUnit: 10, enabled: true },
      { productName: "Pizza", secondsPerUnit: 15, enabled: true },
    ];

    const mockSort = jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue(mockTimes),
    });
    mockCollection.find.mockReturnValue({ sort: mockSort });

    const result = await repository.getAllEnabled();

    expect(mockCollection.find).toHaveBeenCalledWith({ enabled: true });
    expect(mockSort).toHaveBeenCalledWith({ productName: 1 });
    expect(result).toEqual(mockTimes);
  });

  it("retorna array vacío si MongoDB falla en getAllEnabled", async () => {
    (MongoSingleton.connect as jest.Mock).mockRejectedValue(new Error("Connection failed"));

    const result = await repository.getAllEnabled();

    expect(result).toEqual([]);
  });

  it("obtiene tiempo de preparación por ID", async () => {
    const mockTime = { _id: "abc123", productName: "Tacos", secondsPerUnit: 8 };
    mockCollection.findOne.mockResolvedValue(mockTime);

    const result = await repository.getById("abc123");

    expect(mockCollection.findOne).toHaveBeenCalledWith({ _id: "abc123" });
    expect(result).toEqual(mockTime);
  });

  it("retorna null si getById falla", async () => {
    mockCollection.findOne.mockRejectedValue(new Error("DB error"));

    const result = await repository.getById("fail-id");

    expect(result).toBeNull();
  });

  it("hace upsert de un tiempo de preparación", async () => {
    mockCollection.updateOne.mockResolvedValue({ acknowledged: true });

    const prepTime = {
      _id: "prep-123",
      productName: "Sushi",
      secondsPerUnit: 20,
      enabled: true,
    };

    await repository.upsert(prepTime);

    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { productName: "Sushi" },
      expect.objectContaining({
        $set: expect.objectContaining({
          productName: "Sushi",
          secondsPerUnit: 20,
          enabled: true,
        }),
        $setOnInsert: {
          createdAt: expect.any(Date),
        },
      }),
      { upsert: true }
    );
  });

  it("lanza error si upsert falla", async () => {
    mockCollection.updateOne.mockRejectedValue(new Error("Update failed"));

    const prepTime = {
      _id: "fail-123",
      productName: "Fail",
      secondsPerUnit: 10,
      enabled: true,
    };

    await expect(repository.upsert(prepTime)).rejects.toThrow("Update failed");
  });
});
