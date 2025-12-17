import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db> {
  if (db) return db;
  const uri = process.env.MONGO_URI || 'mongodb+srv://andresburgos_db_user:hZvUXR6rIFu6kJAH@cluster0.ww4l0e2.mongodb.net/';
  const dbName = process.env.MONGO_DB || 'orders_db';
  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  await Promise.all([
    db.collection('users').createIndex({ email: 1 }, { unique: true, background: true }),
    db.collection('users').createIndex({ roles: 1 }),
    db.collection('users').createIndex({ active: 1 }),
    db.collection('products').createIndex({ id: 1 }, { unique: true, background: true }),
    db.collection('products').createIndex({ name: 1 }, { unique: true, background: true }),
    db.collection('products').createIndex({ enabled: 1 }),
  ]);
  console.log('🟢 admin-service Mongo connected');
  return db;
}

export function getDb(): Db {
  if (!db) throw new Error('Mongo not connected');
  return db;
}
