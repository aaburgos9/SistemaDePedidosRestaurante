import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../utils/emailService';
import { getUserByEmail, getUserById, updateUserPassword } from '../services/UserService';
import { passwordResetTemplate } from '../utils/emailTemplates';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';



// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  // Validar que el correo no esté vacío
  if (!email || !email.trim()) {
    return res.status(400).json({ 
      success: false, 
      message: 'El correo electrónico es requerido.' 
    });
  }
  
  const user = await getUserByEmail(email);
  console.log('🔍 Usuario encontrado para forgot-password:', user);
  
  // Validar que el usuario existe en el sistema
  if (!user || !user.success || !user.data) {
    return res.status(404).json({ 
      success: false, 
      message: 'No existe un usuario registrado con ese correo electrónico.' 
    });
  }
  
  // Extraer el id real del usuario
  const userId = user.data.id || user.data._id || user.data.userId;
  if (!userId) {
    console.error('❌ No se encontró campo de id en el usuario:', user);
    return res.status(500).json({ 
      success: false, 
      message: 'No se pudo generar el token de recuperación.' 
    });
  }
  
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
  const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;
  
  await sendEmail({
    to: email,
    subject: 'Recupera tu contraseña',
    html: passwordResetTemplate(resetLink)
  });
  
  res.json({ 
    success: true,
    message: 'Se ha enviado un correo con las instrucciones para recuperar tu contraseña.'
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ success: false, message: 'Token y contraseña requeridos.' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    console.log('🔑 Payload del token reset-password:', payload);
    // El campo correcto es userId (como se firma en forgot-password)
    // @ts-ignore
    const userId = payload.userId || payload.sub || payload.id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Token inválido: no contiene userId.' });
    }
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }
    console.log('🪵 user recibido de getUserById:', user);
    const idToUse = (user.data && (user.data._id || user.data.id));
    console.log('🪵 id que se enviará a updateUserPassword:', idToUse);
    await updateUserPassword(idToUse, password);
    res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Token inválido o expirado.' });
  }
});

export default router;
