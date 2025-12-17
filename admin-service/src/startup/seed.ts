import { getDb } from '../storage/mongo';
import bcrypt from 'bcryptjs';

export async function ensureDefaultAdmin() {
  try {
    const db = getDb();
    const email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
    
    // Verificar si el admin ya existe por email
    const existing = await db.collection('users').findOne({ email });
    if (existing) {
      console.log(`ℹ️  Usuario admin ya existe: ${email}`);
      return;
    }
    
    const name = process.env.DEFAULT_ADMIN_NAME || 'Admin';
    const password = process.env.DEFAULT_ADMIN_PASSWORD || 'changeme';
    const passwordHash = await bcrypt.hash(password, 10);
    
    await db.collection('users').insertOne({
      name,
      email,
      passwordHash,
      roles: ['admin'],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log(`✅ Usuario admin creado: ${email} / [password hidden]`);
  } catch (error) {
    console.error('❌ Error en seed de admin:', error);
  }
}
