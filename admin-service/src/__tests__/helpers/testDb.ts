import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient, Db } from 'mongodb';

let mongoServer: MongoMemoryServer;
let client: MongoClient;
let db: Db;

export async function setupTestDatabase(): Promise<Db> {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  client = new MongoClient(uri);
  await client.connect();
  
  db = client.db('test-admin-db');
  return db;
}

export async function teardownTestDatabase(): Promise<void> {
  if (client) {
    await client.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}

export async function clearDatabase(): Promise<void> {
  if (db) {
    const collections = await db.collections();
    await Promise.all(collections.map(c => c.deleteMany({})));
  }
}

export function getTestDb(): Db {
  return db;
}
