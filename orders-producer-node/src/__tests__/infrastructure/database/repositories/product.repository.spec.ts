import { ProductRepository } from "../../../../infrastructure/database/repositories/product.repository";
import MongoSingleton from "../../../../infrastructure/database/mongo";
import { Collection } from "mongodb";

const mockCollection = () => {
  return {
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    toArray: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
  } as unknown as Collection;
};

describe("ProductRepository", () => {
  const repo = new ProductRepository();
  let col: any;

  beforeEach(() => {
    jest.clearAllMocks();
    col = mockCollection() as any;
    jest.spyOn(MongoSingleton, "connect").mockResolvedValue({
      collection: jest.fn().mockReturnValue(col),
    } as any);
  });

  test("getAllEnabled returns sorted enabled products", async () => {
    col.toArray.mockResolvedValue([{ id: 1, enabled: true }, { id: 2, enabled: true }]);
    const result = await repo.getAllEnabled();
    expect(result).toHaveLength(2);
    expect(col.find).toHaveBeenCalledWith({ enabled: true });
    expect(col.sort).toHaveBeenCalledWith({ id: 1 });
    expect(col.toArray).toHaveBeenCalled();
  });

  test("getAll returns all products sorted", async () => {
    col.toArray.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    const result = await repo.getAll();
    expect(result).toHaveLength(2);
    expect(col.find).toHaveBeenCalledWith({});
    expect(col.sort).toHaveBeenCalledWith({ id: 1 });
  });

  test("getById finds by numeric id", async () => {
    col.findOne.mockResolvedValue({ id: 42, name: "X" });
    const result = await repo.getById(42);
    expect(result).toEqual({ id: 42, name: "X" });
    expect(col.findOne).toHaveBeenCalledWith({ id: 42 });
  });

  test("getById finds by string _id", async () => {
    col.findOne.mockResolvedValue({ _id: "abc", name: "Y" });
    const result = await repo.getById("abc");
    expect(result).toEqual({ _id: "abc", name: "Y" });
    expect(col.findOne).toHaveBeenCalledWith({ _id: "abc" });
  });

  test("getByName finds case-insensitive match", async () => {
    col.findOne.mockResolvedValue({ _id: "p1", name: "Burger" });
    const result = await repo.getByName("Burger");
    expect(result).toEqual({ _id: "p1", name: "Burger" });
    const arg = col.findOne.mock.calls[0][0];
    expect(arg.name.$regex).toBeInstanceOf(RegExp);
  });

  test("upsert with id updates or inserts", async () => {
    col.updateOne.mockResolvedValue({ acknowledged: true, upsertedId: undefined });
    await repo.upsert({ id: 5, name: "P", enabled: true } as any);
    const [query, update, options] = col.updateOne.mock.calls[0];
    expect(query).toEqual({ id: 5 });
    expect(options).toEqual({ upsert: true });
    expect(update.$set.name).toBe("P");
    expect(update.$setOnInsert.createdAt).toBeInstanceOf(Date);
  });

  test("upsert without id queries by name", async () => {
    col.updateOne.mockResolvedValue({ acknowledged: true, upsertedId: "x" });
    await repo.upsert({ name: "Q", enabled: true } as any);
    const [query] = col.updateOne.mock.calls[0];
    expect(query).toEqual({ name: "Q" });
  });

  test("disable returns true when matched", async () => {
    col.updateOne.mockResolvedValue({ matchedCount: 1 });
    const ok = await repo.disable(9);
    expect(ok).toBe(true);
    expect(col.updateOne).toHaveBeenCalledWith(
      { id: 9 },
      expect.objectContaining({ $set: expect.objectContaining({ enabled: false }) })
    );
  });

  test("disable with string id maps to _id and returns false when not matched", async () => {
    col.updateOne.mockResolvedValue({ matchedCount: 0 });
    const ok = await repo.disable("z");
    expect(ok).toBe(false);
    expect(col.updateOne).toHaveBeenCalledWith(
      { _id: "z" },
      expect.any(Object)
    );
  });

  test("disable handles error and returns false", async () => {
    col.updateOne.mockRejectedValue(new Error("update fail"));
    const ok = await repo.disable(1);
    expect(ok).toBe(false);
  });

  test("error branches return fallbacks", async () => {
    (MongoSingleton.connect as any).mockRejectedValueOnce(new Error("conn error"));
    const list = await repo.getAllEnabled();
    expect(list).toEqual([]);

    (MongoSingleton.connect as any).mockRejectedValueOnce(new Error("conn error"));
    const listAll = await repo.getAll();
    expect(listAll).toEqual([]);

    (MongoSingleton.connect as any).mockRejectedValueOnce(new Error("conn error"));
    const byId = await repo.getById(1);
    expect(byId).toBeNull();

    (MongoSingleton.connect as any).mockRejectedValueOnce(new Error("conn error"));
    const byName = await repo.getByName("A");
    expect(byName).toBeNull();

    // upsert throws
    (MongoSingleton.connect as any).mockResolvedValue({
      collection: jest.fn().mockReturnValue({ updateOne: jest.fn().mockRejectedValue(new Error("write error")) }),
    } as any);
    await expect(repo.upsert({ id: 1, name: "A" } as any)).rejects.toThrow("write error");
  });
});
