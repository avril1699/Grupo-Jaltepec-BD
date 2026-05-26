// AUTENTICACIÓN — JWT simulado en localStorage (lab)
import { execSQL } from './config.js';

const SESSION_KEY = 'danza_session';

async function fakeHash(password) {
  const data = new TextEncoder().encode(password);
  const buf  = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function esc(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return value.toString();
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  return `'${String(value).replace(/'/g, "''")}'`;
}

export async function login(email, password) {
  const sql = `
    SELECT u.id, u.email, u.rol, u.activo, u.password_hash,
           u.id_integrante, i.nombre AS integrante_nombre
      FROM usuario u
      LEFT JOIN integrante i ON i.id = u.id_integrante
     WHERE u.email = ${esc(email)}
     LIMIT 1
  `;
  const { data, error } = await execSQL(sql);
  if (error) return { ok: false, error };
  if (!data || data.length === 0) return { ok: false, error: 'Usuario no encontrado' };

  const user = data[0];
  if (!user.activo) return { ok: false, error: 'Cuenta inactiva' };

  const hash = await fakeHash(password);
  if (hash !== user.password_hash) {
    await logAudit(null, 'LOGIN_FALLIDO', { email_intentado: email, razon: 'password_incorrecto' });
    return { ok: false, error: 'Contraseña incorrecta' };
  }

  const token = btoa(JSON.stringify({
    sub: user.id, email: user.email, rol: user.rol,
    exp: Date.now() + 1000 * 60 * 60 * 8
  }));

  const session = {
    token,
    user: {
      id: user.id, email: user.email, rol: user.rol,
      id_integrante: user.id_integrante,
      integrante_nombre: user.integrante_nombre
    }
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  await logAudit(user.id, 'LOGIN', { resultado: 'exitoso' });
  return { ok: true, session };
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    const payload = JSON.parse(atob(s.token));
    if (payload.exp < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch { return null; }
}

export async function logout() {
  const s = getSession();
  if (s) await logAudit(s.user.id, 'LOGOUT', { accion: 'cierre_sesion' });
  localStorage.removeItem(SESSION_KEY);
  window.location.href = '/index.html';
}

export function requireAuth() {
  const s = getSession();
  if (!s) { window.location.href = '/index.html'; return null; }
  return s;
}

export async function logAudit(idUsuario, accion, detalle = {}, tabla = null, idReg = null) {
  const sql = `
    INSERT INTO audit_log (id_usuario, accion, tabla_afectada, id_registro, detalle)
    VALUES (${esc(idUsuario)}, ${esc(accion)}, ${esc(tabla)}, ${esc(idReg)},
            ${esc(JSON.stringify(detalle))}::jsonb)
  `;
  await execSQL(sql);
}
