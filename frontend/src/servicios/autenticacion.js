// Funciones para interactuar con la API de autenticación de Laravel
const RUTA_API = import.meta.env?.DEV ? 'http://localhost:8000/api' : '/api';

export async function registrarUsuario(datos) {
  const respuesta = await fetch(`${RUTA_API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) throw await respuesta.json();
  return await respuesta.json();
}

export async function iniciarSesion(datos) {
  const respuesta = await fetch(`${RUTA_API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) throw await respuesta.json();
  return await respuesta.json();
}

export function guardarToken(token) {
  localStorage.setItem('token', token);
}

export function obtenerToken() {
  return localStorage.getItem('token');
}

export function eliminarToken() {
  localStorage.removeItem('token');
}

export async function obtenerUsuarioAutenticado() {
  const token = obtenerToken();
  if (!token) return null;
  const respuesta = await fetch(`${RUTA_API}/user`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!respuesta.ok) return null;
  return await respuesta.json();
}

export async function cerrarSesion() {
  const token = obtenerToken();
  if (!token) return;
  await fetch(`${RUTA_API}/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  eliminarToken();
}
