import { getSession, logout } from './auth.js';

export function renderNavbar(active) {
  const session = getSession();
  if (!session) return;
  const links = [
    { href: '/pages/dashboard.html',       label: '🏠Inicio',          key: 'dashboard' },
    { href: '/pages/integrantes.html',     label: '💃Integrantes',     key: 'integrantes' },
    { href:'/pages/eventos.html',          label:'🎪 Eventos',         key:'eventos'},
    { href: '/pages/inventario.html',      label: '📦Inventario',      key: 'inventario' },
    { href: '/pages/repertorio.html',      label:'🎭 Repertorio',      key:'repertorio' }
  ];
  const html = `
  
    <nav class="navbar">
      <h1>Compañía de Danza</h1>
      <div class="nav-links">
        ${links.map(l => `<a href="${l.href}" class="${l.key === active ? 'active' : ''}">${l.label}</a>`).join('')}
      </div>
      <div class="user-info">
        <span>${session.user.email}</span>
        <span class="badge badge-admin">${session.user.rol}</span>
        <button class="btn-secondary btn-sm" id="logout-btn">Cerrar sesión</button>
      </div>
    </nav>
  `;
  document.body.insertAdjacentHTML('afterbegin', html);
  document.getElementById('logout-btn').addEventListener('click', logout);
}

export function showAlert(container, type, message) {
  const div = document.createElement('div');
  div.className = `alert alert-${type}`;
  div.textContent = message;
  container.prepend(div);
  setTimeout(() => div.remove(), 4000);
}

export function openModal(id)  { document.getElementById(id).classList.add('open'); }
export function closeModal(id) { document.getElementById(id).classList.remove('open'); }

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-PE', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export function confirmDelete(msg = '¿Eliminar este registro?') { return window.confirm(msg); }
