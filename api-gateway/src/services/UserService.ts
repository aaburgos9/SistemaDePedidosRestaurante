import { AdminProxyService } from './AdminProxyService';

const adminProxy = new AdminProxyService();


export async function getUserByEmail(email: string) {
  try {
    const res = await adminProxy.forward(`/admin/users/email/${encodeURIComponent(email)}`, 'GET');
    return res.data;
  } catch {
    return null;
  }
}


export async function getUserById(id: string) {
  try {
    const res = await adminProxy.forward(`/admin/users/${id}`, 'GET');
    return res.data;
  } catch {
    return null;
  }
}


export async function updateUserPassword(id: string, password: string) {
  try {
    const res = await adminProxy.forward(`/admin/users/${id}/password`, 'PUT', { password });
    return res.data;
  } catch (err) {
    throw err;
  }
}
