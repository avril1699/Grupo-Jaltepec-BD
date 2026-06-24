// ============================================================
// DANZA APP — VERSIÓN ESTÁTICA (localStorage)
// ============================================================

// ---------- STORAGE ----------
const DB = {
  get(key) { try { return JSON.parse(localStorage.getItem('danza_' + key)) || []; } catch { return []; } },
  set(key, val) { localStorage.setItem('danza_' + key, JSON.stringify(val)); },
  nextId(key) { const rows = DB.get(key); return rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1; }
};

// ---------- SEED DATA ----------
function seed() {
  if (localStorage.getItem('danza_seeded')) return;

  DB.set('usuarios', [
    { id: 1, email: 'admin@danza.mx', password: 'admin123', rol: 'admin', activo: true, id_integrante: null },
    { id: 2, email: 'integrante@danza.mx', password: 'pass123', rol: 'integrante', activo: true, id_integrante: 1 }
  ]);

  DB.set('integrantes', [
    { id: 1, nombre: 'María González', fecha_nacimiento: '2000-04-15', fecha_ingresso: '2022-01-10', observaciones_medicas: null },
    { id: 2, nombre: 'Juan Ramírez', fecha_nacimiento: '1998-09-22', fecha_ingresso: '2021-06-01', observaciones_medicas: 'Alergia al polen' },
    { id: 3, nombre: 'Sofía López', fecha_nacimiento: '2002-12-03', fecha_ingresso: '2023-03-15', observaciones_medicas: null }
  ]);

  DB.set('bailes', [
    { id: 1, nombre: 'Jarabe Tapatío', duracion: '00:05:30', solistas: 'María González', informacion_baile: 'Baile tradicional de Jalisco' },
    { id: 2, nombre: 'La Bamba', duracion: '00:04:00', solistas: 'Juan Ramírez', informacion_baile: 'Son jarocho veracruzano' },
    { id: 3, nombre: 'Danza del Venado', duracion: '00:07:00', solistas: null, informacion_baile: 'Danza ritual yaqui' }
  ]);

  DB.set('presentaciones', [
    { id: 1, fecha: new Date(Date.now() + 7 * 86400000).toISOString(), lugar: 'Teatro Municipal' },
    { id: 2, fecha: new Date(Date.now() + 30 * 86400000).toISOString(), lugar: 'Plaza Principal' },
    { id: 3, fecha: new Date(Date.now() - 10 * 86400000).toISOString(), lugar: 'Auditorio Cultural' }
  ]);

  DB.set('cuadros', [
    { id: 1, nombre: 'Cuadro Jalisco', id_baile: 1, id_presentation: 1, numero_parejas: 5 },
    { id: 2, nombre: 'Cuadro Veracruz', id_baile: 2, id_presentation: 1, numero_parejas: 4 }
  ]);

  DB.set('participaciones', [
    { id_integrante: 1, id_baile: 1, rol: 'Solista', fecha_inicio: '2022-03-01' },
    { id_integrante: 2, id_baile: 2, rol: 'Caballero principal', fecha_inicio: '2021-09-01' },
    { id_integrante: 3, id_baile: 1, rol: 'Dama', fecha_inicio: '2023-04-01' }
  ]);

  DB.set('observaciones', [
    { id: 1, id_integrante: 1, presentacion: 'Teatro Municipal', ensayo: 'Ensayo general', notas: 'Excelente desempeño, mejorar giros finales' },
    { id: 2, id_integrante: 2, presentacion: null, ensayo: 'Ensayo 1', notas: 'Necesita practicar más los pasos de zapateado' }
  ]);

  DB.set('inventario', [
    { id: 1, nombre: 'Vestido Jalisco', cantidad_total: 10, color: 'Rojo y verde' },
    { id: 2, nombre: 'Sombrero charro', cantidad_total: 8, color: 'Negro' },
    { id: 3, nombre: 'Huaraches', cantidad_total: 3, color: 'Café' }
  ]);

  DB.set('inv_presentaciones', [
    { id_item: 1, id_presentation: 1, cantidad_llevada: 8, observaciones: null },
    { id_item: 2, id_presentation: 1, cantidad_llevada: 6, observaciones: 'Revisar estado' }
  ]);

  DB.set('asistencias', [
    { id: 1, id_integrante: 1, fecha: '2024-06-10', asistio: true, observacion: '' },
    { id: 2, id_integrante: 2, fecha: '2024-06-10', asistio: false, observacion: 'Enfermedad' },
    { id: 3, id_integrante: 1, fecha: '2024-06-17', asistio: true, observacion: '' },
    { id: 4, id_integrante: 3, fecha: '2024-06-10', asistio: true, observacion: '' }
  ]);

  DB.set('audit_log', []);
  localStorage.setItem('danza_seeded', '1');
}

// ---------- AUTH ----------
const SESSION_KEY = 'danza_session';

function login(email, password) {
  const usuarios = DB.get('usuarios');
  const user = usuarios.find(u => u.email === email && u.password === password && u.activo);
  if (!user) return { ok: false, error: 'Credenciales incorrectas o cuenta inactiva' };
  const session = { user: { id: user.id, email: user.email, rol: user.rol, id_integrante: user.id_integrante } };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  logAudit(user.id, 'LOGIN', {});
  return { ok: true, session };
}

function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}

function logout() {
  const s = getSession();
  if (s) logAudit(s.user.id, 'LOGOUT', {});
  localStorage.removeItem(SESSION_KEY);
  showPage('login');
}

function requireAuth() {
  const s = getSession();
  if (!s) { showPage('login'); return null; }
  return s;
}

function logAudit(idUsuario, accion, detalle, tabla = null) {
  const log = DB.get('audit_log');
  log.unshift({ id: Date.now(), id_usuario: idUsuario, accion, tabla_afectada: tabla, detalle, created_at: new Date().toISOString() });
  DB.set('audit_log', log.slice(0, 200));
}

// ---------- UI UTILS ----------
function formatDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }); }
function formatDateTime(d) { if (!d) return '—'; return new Date(d).toLocaleString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
function showAlert(container, type, message) {
  const div = document.createElement('div');
  div.className = `alert alert-${type}`;
  div.textContent = message;
  container.prepend(div);
  setTimeout(() => div.remove(), 4000);
}
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// ---------- ROUTER ----------
let currentPage = null;
const pages = {};

function registerPage(name, fn) { pages[name] = fn; }

function showPage(name, params = {}) {
  // Hide all
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const el = document.getElementById('page-' + name);
  if (el) el.style.display = 'block';
  currentPage = name;

  // Update nav active
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === name);
  });

  if (pages[name]) pages[name](params);
}

// ---------- NAVBAR ----------
function renderNavbar() {
  const session = getSession();
  if (!session) return;
  const nav = document.getElementById('navbar');
  const links = [
    { key: 'dashboard', label: 'Inicio' },
    { key: 'integrantes', label: 'Integrantes' },
    { key: 'bailes', label: 'Bailes' },
    { key: 'participaciones', label: 'Participaciones' },
    { key: 'presentaciones', label: 'Presentaciones' },
    { key: 'cuadros', label: 'Cuadros' },
    { key: 'observaciones', label: 'Observaciones' },
    { key: 'inventario', label: 'Inventario' }
  ];
  nav.innerHTML = `
    <nav class="navbar">
      <h1>Compañía de Danza</h1>
      <div class="nav-links">
        ${links.map(l => `<a href="#" data-page="${l.key}">${l.label}</a>`).join('')}
      </div>
      <div class="user-info">
        <span>${session.user.email}</span>
        <span class="badge badge-admin">${session.user.rol}</span>
        <button class="btn-secondary btn-sm" id="logout-btn">Cerrar sesión</button>
      </div>
    </nav>`;
  nav.querySelectorAll('a[data-page]').forEach(a => {
    a.addEventListener('click', e => { e.preventDefault(); showPage(a.dataset.page); });
  });
  document.getElementById('logout-btn').addEventListener('click', logout);
}

// ============================================================
// PAGES
// ============================================================

// ----- LOGIN -----
registerPage('login', () => {
  // handled inline
});

// ----- DASHBOARD -----
registerPage('dashboard', () => {
  const session = getSession();
  if (!session) return;

  const integrantes = DB.get('integrantes');
  const bailes = DB.get('bailes');
  const presentaciones = DB.get('presentaciones');
  const cuadros = DB.get('cuadros');
  const inventario = DB.get('inventario');

  document.getElementById('stat-integrantes').textContent = integrantes.length;
  document.getElementById('stat-bailes').textContent = bailes.length;
  document.getElementById('stat-presentaciones').textContent = presentaciones.length;
  document.getElementById('stat-cuadros').textContent = cuadros.length;
  document.getElementById('stat-inventario').textContent = inventario.reduce((s, i) => s + (i.cantidad_total || 0), 0);

  // Proximas presentaciones
  const proximas = presentaciones.filter(p => new Date(p.fecha) >= new Date()).sort((a, b) => new Date(a.fecha) - new Date(b.fecha)).slice(0, 5);
  const proxTbody = document.getElementById('proximas-tbody');
  proxTbody.innerHTML = proximas.length
    ? proximas.map(p => {
        const nc = cuadros.filter(c => c.id_presentation === p.id).length;
        return `<tr><td>${formatDateTime(p.fecha)}</td><td>${p.lugar}</td><td>${nc}</td></tr>`;
      }).join('')
    : '<tr><td colspan="3" class="empty">No hay presentaciones futuras</td></tr>';

  // KPI proxima
  const kpis = document.getElementById('kpis');
  kpis.innerHTML = '';
  if (proximas.length) {
    const dias = Math.ceil((new Date(proximas[0].fecha) - new Date()) / 86400000);
    kpis.insertAdjacentHTML('beforeend', `<div class="stat-card"><div class="label">📅 Próxima presentación</div><div class="value">${dias} días</div><small>${proximas[0].lugar}</small></div>`);
  }

  // Asistencia
  const asistencias = DB.get('asistencias');
  const total = asistencias.length;
  const asistidas = asistencias.filter(a => a.asistio).length;
  const prom = total ? Math.round(100 * asistidas / total) : 0;
  kpis.insertAdjacentHTML('beforeend', `<div class="stat-card"><div class="label">👥 Asistencia promedio</div><div class="value">${prom}%</div></div>`);

  // Inventario critico
  const critico = inventario.filter(i => i.cantidad_total < 5).length;
  kpis.insertAdjacentHTML('beforeend', `<div class="stat-card"><div class="label">📦 Inventario crítico</div><div class="value">${critico}</div></div>`);

  // Asistencia por integrante
  const asistenciaTbody = document.getElementById('asistencia-tbody');
  const grouped = {};
  asistencias.forEach(a => {
    if (!grouped[a.id_integrante]) grouped[a.id_integrante] = { asistencias: 0, faltas: 0 };
    a.asistio ? grouped[a.id_integrante].asistencias++ : grouped[a.id_integrante].faltas++;
  });
  asistenciaTbody.innerHTML = Object.entries(grouped).map(([id, g]) => {
    const int = integrantes.find(i => i.id == id);
    const total = g.asistencias + g.faltas;
    const pct = total ? Math.round(100 * g.asistencias / total) : 0;
    const cls = pct >= 85 ? 'badge-success' : pct < 70 ? 'badge-danger' : 'badge-warning';
    return `<tr><td>${int ? int.nombre : '?'}</td><td>${g.asistencias}</td><td>${g.faltas}</td><td><span class="${cls}">${pct}%</span></td></tr>`;
  }).join('') || '<tr><td colspan="4" class="empty">Sin registros de asistencia</td></tr>';

  // Mis observaciones (si es integrante)
  const obsCard = document.getElementById('mis-observaciones-card');
  if (session.user.rol === 'integrante' && session.user.id_integrante) {
    obsCard.style.display = 'block';
    const mis = asistencias.filter(a => a.id_integrante === session.user.id_integrante).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    document.getElementById('mis-observaciones').innerHTML = mis.map(r => `<tr><td>${formatDate(r.fecha)}</td><td>${r.asistio ? 'Asistió' : 'Faltó'}</td><td>${r.observacion || ''}</td></tr>`).join('') || '<tr><td colspan="3" class="empty">Sin registros</td></tr>';
  } else {
    obsCard.style.display = 'none';
  }

  // Formulario asistencia (solo admin)
  const asistContainer = document.getElementById('asistencia-form-container');
  if (session.user.rol === 'admin') {
    const intOpts = integrantes.map(i => `<option value="${i.id}">${i.nombre}</option>`).join('');
    asistContainer.innerHTML = `
      <div class="card" style="margin-bottom:16px">
        <h3 style="margin-bottom:12px">Registrar asistencia</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end">
          <select id="asis-integrante" style="flex:1;min-width:140px"><option value="">Integrante</option>${intOpts}</select>
          <input type="date" id="asis-fecha" style="flex:1;min-width:140px">
          <select id="asis-estado" style="flex:1;min-width:120px"><option value="true">Asistió</option><option value="false">Faltó</option></select>
          <textarea id="asis-observacion" placeholder="Observaciones..." rows="1" style="flex:2;min-width:180px;resize:none;height:38px"></textarea>
          <button id="guardar-asistencia">Guardar</button>
        </div>
      </div>`;
    document.getElementById('guardar-asistencia').addEventListener('click', () => {
      const id_integrante = parseInt(document.getElementById('asis-integrante').value);
      const fecha = document.getElementById('asis-fecha').value;
      const asistio = document.getElementById('asis-estado').value === 'true';
      const observacion = document.getElementById('asis-observacion').value.trim();
      if (!id_integrante || !fecha) { alert('Selecciona integrante y fecha'); return; }
      const asis = DB.get('asistencias');
      const existing = asis.findIndex(a => a.id_integrante === id_integrante && a.fecha === fecha);
      if (existing >= 0) { asis[existing] = { ...asis[existing], asistio, observacion }; }
      else { asis.push({ id: DB.nextId('asistencias'), id_integrante, fecha, asistio, observacion }); }
      DB.set('asistencias', asis);
      logAudit(session.user.id, 'INSERT_ASISTENCIA', { id_integrante, fecha }, 'asistencia');
      showPage('dashboard');
    });
  } else {
    asistContainer.innerHTML = '';
  }

  // Audit log
  const auditTbody = document.getElementById('audit-tbody');
  const auditLog = DB.get('audit_log').slice(0, 10);
  const usuarios = DB.get('usuarios');
  auditTbody.innerHTML = auditLog.length
    ? auditLog.map(a => {
        const u = usuarios.find(u => u.id === a.id_usuario);
        return `<tr><td>${formatDateTime(a.created_at)}</td><td>${u ? u.email : '—'}</td><td>${a.accion}</td><td>${a.tabla_afectada || '—'}</td></tr>`;
      }).join('')
    : '<tr><td colspan="4" class="empty">Sin actividad</td></tr>';

  // Chart inventario
  const ctx = document.getElementById('chartInventario');
  if (ctx) {
    if (window._chartInv) window._chartInv.destroy();
    window._chartInv = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: inventario.map(i => i.nombre),
        datasets: [{ data: inventario.map(i => i.cantidad_total), backgroundColor: ['#ef4444','#f97316','#22c55e','#3b82f6','#a855f7','#ec4899'] }]
      },
      options: { plugins: { legend: { position: 'bottom' } } }
    });
  }
});

// ----- INTEGRANTES -----
registerPage('integrantes', () => {
  const session = getSession();
  const esAdmin = session?.user?.rol === 'admin';
  const alertC = document.getElementById('alert-integrantes');

  function reload() {
    const rows = DB.get('integrantes');
    const tbody = document.getElementById('tbody-integrantes');
    tbody.innerHTML = rows.length
      ? rows.map(r => `
        <tr>
          <td>${r.id}</td>
          <td>${r.nombre}</td>
          <td>${formatDate(r.fecha_nacimiento)}</td>
          <td>${formatDate(r.fecha_ingresso)}</td>
          <td>${r.observaciones_medicas ? r.observaciones_medicas.slice(0, 60) + (r.observaciones_medicas.length > 60 ? '…' : '') : '—'}</td>
          <td>${(esAdmin || (session?.user?.rol === 'integrante' && session?.user?.id_integrante == r.id)) ? `
            <div class="actions">
              <button class="btn-secondary btn-sm" data-edit="${r.id}">Editar</button>
              <button class="btn-danger btn-sm" data-del="${r.id}">Borrar</button>
            </div>` : ''}</td>
        </tr>`).join('')
      : '<tr><td colspan="6" class="empty">Sin registros</td></tr>';
  }

  reload();
  document.getElementById('new-integrante').style.display = esAdmin ? '' : 'none';

  document.getElementById('new-integrante').onclick = () => {
    document.getElementById('modal-int-title').textContent = 'Nuevo integrante';
    document.getElementById('form-integrante').reset();
    document.getElementById('fi-int-id').value = '';
    openModal('modal-integrante');
  };

  document.getElementById('tbody-integrantes').addEventListener('click', e => {
    const editId = e.target.dataset.edit;
    const delId = e.target.dataset.del;
    if (editId) {
      const r = DB.get('integrantes').find(x => x.id == editId);
      document.getElementById('modal-int-title').textContent = 'Editar integrante';
      document.getElementById('fi-int-id').value = r.id;
      document.getElementById('fi-int-nombre').value = r.nombre || '';
      document.getElementById('fi-int-nac').value = r.fecha_nacimiento || '';
      document.getElementById('fi-int-ing').value = r.fecha_ingresso || '';
      document.getElementById('fi-int-obs').value = r.observaciones_medicas || '';
      openModal('modal-integrante');
    }
    if (delId && confirm('¿Eliminar este registro?')) {
      const rows = DB.get('integrantes').filter(r => r.id != delId);
      DB.set('integrantes', rows);
      logAudit(session.user.id, 'DELETE', { id: delId }, 'integrante');
      showAlert(alertC, 'success', 'Registro eliminado'); reload();
    }
  });

  document.getElementById('form-integrante').onsubmit = e => {
    e.preventDefault();
    const id = document.getElementById('fi-int-id').value;
    const obj = {
      nombre: document.getElementById('fi-int-nombre').value.trim(),
      fecha_nacimiento: document.getElementById('fi-int-nac').value || null,
      fecha_ingresso: document.getElementById('fi-int-ing').value || null,
      observaciones_medicas: document.getElementById('fi-int-obs').value.trim() || null
    };
    const rows = DB.get('integrantes');
    if (id) { const i = rows.findIndex(r => r.id == id); rows[i] = { ...rows[i], ...obj }; }
    else { obj.id = DB.nextId('integrantes'); rows.push(obj); }
    DB.set('integrantes', rows);
    logAudit(session.user.id, id ? 'UPDATE' : 'INSERT', obj, 'integrante');
    showAlert(alertC, 'success', id ? 'Integrante actualizado' : 'Integrante creado');
    closeModal('modal-integrante'); reload();
  };
});

// ----- BAILES -----
registerPage('bailes', () => {
  const session = getSession();
  const esAdmin = ['admin', 'usuario'].includes(session?.user?.rol);
  const alertC = document.getElementById('alert-bailes');

  function reload() {
    const rows = DB.get('bailes');
    const tbody = document.getElementById('tbody-bailes');
    tbody.innerHTML = rows.length
      ? rows.map(r => `
        <tr>
          <td>${r.id}</td>
          <td>${r.nombre}</td>
          <td>${r.duracion || '—'}</td>
          <td>${r.solistas || '—'}</td>
          <td>${r.informacion_baile ? r.informacion_baile.slice(0, 50) + (r.informacion_baile.length > 50 ? '…' : '') : '—'}</td>
          <td>${esAdmin ? `<div class="actions"><button class="btn-secondary btn-sm" data-edit="${r.id}">Editar</button><button class="btn-danger btn-sm" data-del="${r.id}">Borrar</button></div>` : ''}</td>
        </tr>`).join('')
      : '<tr><td colspan="6" class="empty">Sin registros</td></tr>';
  }

  reload();
  document.getElementById('new-baile').style.display = esAdmin ? '' : 'none';

  document.getElementById('new-baile').onclick = () => {
    document.getElementById('modal-baile-title').textContent = 'Nuevo baile';
    document.getElementById('form-baile').reset();
    document.getElementById('fi-baile-id').value = '';
    openModal('modal-baile');
  };

  document.getElementById('tbody-bailes').addEventListener('click', e => {
    const editId = e.target.dataset.edit;
    const delId = e.target.dataset.del;
    if (editId) {
      const r = DB.get('bailes').find(x => x.id == editId);
      document.getElementById('modal-baile-title').textContent = 'Editar baile';
      document.getElementById('fi-baile-id').value = r.id;
      document.getElementById('fi-baile-nombre').value = r.nombre || '';
      document.getElementById('fi-baile-dur').value = r.duracion || '';
      document.getElementById('fi-baile-sol').value = r.solistas || '';
      document.getElementById('fi-baile-info').value = r.informacion_baile || '';
      openModal('modal-baile');
    }
    if (delId && confirm('¿Eliminar este baile?')) {
      DB.set('bailes', DB.get('bailes').filter(r => r.id != delId));
      logAudit(session.user.id, 'DELETE', { id: delId }, 'baile');
      showAlert(alertC, 'success', 'Registro eliminado'); reload();
    }
  });

  document.getElementById('form-baile').onsubmit = e => {
    e.preventDefault();
    const id = document.getElementById('fi-baile-id').value;
    const obj = {
      nombre: document.getElementById('fi-baile-nombre').value.trim(),
      duracion: document.getElementById('fi-baile-dur').value.trim() || null,
      solistas: document.getElementById('fi-baile-sol').value.trim() || null,
      informacion_baile: document.getElementById('fi-baile-info').value.trim() || null
    };
    const rows = DB.get('bailes');
    if (id) { const i = rows.findIndex(r => r.id == id); rows[i] = { ...rows[i], ...obj }; }
    else { obj.id = DB.nextId('bailes'); rows.push(obj); }
    DB.set('bailes', rows);
    logAudit(session.user.id, id ? 'UPDATE' : 'INSERT', obj, 'baile');
    showAlert(alertC, 'success', id ? 'Baile actualizado' : 'Baile creado');
    closeModal('modal-baile'); reload();
  };
});

// ----- PARTICIPACIONES -----
registerPage('participaciones', () => {
  const session = getSession();
  const esAdmin = ['admin', 'usuario'].includes(session?.user?.rol);
  const alertC = document.getElementById('alert-participaciones');

  function loadDropdowns() {
    const intSel = document.getElementById('fi-part-int');
    const bailSel = document.getElementById('fi-part-baile');
    const ints = DB.get('integrantes');
    const bailes = DB.get('bailes');
    intSel.innerHTML = '<option value="">— Elige integrante —</option>' + ints.map(i => `<option value="${i.id}">${i.nombre}</option>`).join('');
    bailSel.innerHTML = '<option value="">— Elige baile —</option>' + bailes.map(b => `<option value="${b.id}">${b.nombre}</option>`).join('');
  }

  function reload() {
    const rows = DB.get('participaciones');
    const ints = DB.get('integrantes');
    const bailes = DB.get('bailes');
    const tbody = document.getElementById('tbody-participaciones');
    tbody.innerHTML = rows.length
      ? rows.map(r => {
          const int = ints.find(i => i.id == r.id_integrante);
          const baile = bailes.find(b => b.id == r.id_baile);
          return `<tr data-int="${r.id_integrante}" data-bai="${r.id_baile}">
            <td>${int ? int.nombre : '?'}</td>
            <td>${baile ? baile.nombre : '?'}</td>
            <td>${r.rol || '—'}</td>
            <td>${formatDate(r.fecha_inicio)}</td>
            <td>${esAdmin ? `<div class="actions"><button class="btn-secondary btn-sm" data-edit="1">Editar</button><button class="btn-danger btn-sm" data-del="1">Borrar</button></div>` : ''}</td>
          </tr>`;
        }).join('')
      : '<tr><td colspan="5" class="empty">Sin registros</td></tr>';
  }

  loadDropdowns();
  reload();
  document.getElementById('new-participacion').style.display = esAdmin ? '' : 'none';

  document.getElementById('new-participacion').onclick = () => {
    document.getElementById('modal-part-title').textContent = 'Nueva participación';
    document.getElementById('form-participacion').reset();
    document.getElementById('fi-part-orig-int').value = '';
    document.getElementById('fi-part-orig-bai').value = '';
    document.getElementById('fi-part-int').disabled = false;
    document.getElementById('fi-part-baile').disabled = false;
    openModal('modal-participacion');
  };

  document.getElementById('tbody-participaciones').addEventListener('click', e => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const idInt = tr.dataset.int;
    const idBai = tr.dataset.bai;
    if (e.target.dataset.edit) {
      const r = DB.get('participaciones').find(x => x.id_integrante == idInt && x.id_baile == idBai);
      document.getElementById('modal-part-title').textContent = 'Editar participación';
      document.getElementById('fi-part-orig-int').value = r.id_integrante;
      document.getElementById('fi-part-orig-bai').value = r.id_baile;
      document.getElementById('fi-part-int').value = r.id_integrante;
      document.getElementById('fi-part-baile').value = r.id_baile;
      document.getElementById('fi-part-int').disabled = true;
      document.getElementById('fi-part-baile').disabled = true;
      document.getElementById('fi-part-rol').value = r.rol || '';
      document.getElementById('fi-part-inicio').value = r.fecha_inicio || '';
      openModal('modal-participacion');
    }
    if (e.target.dataset.del && confirm('¿Eliminar esta participación?')) {
      const rows = DB.get('participaciones').filter(r => !(r.id_integrante == idInt && r.id_baile == idBai));
      DB.set('participaciones', rows);
      logAudit(session.user.id, 'DELETE', { id_integrante: idInt, id_baile: idBai }, 'participa_en');
      showAlert(alertC, 'success', 'Registro eliminado'); reload();
    }
  });

  document.getElementById('form-participacion').onsubmit = e => {
    e.preventDefault();
    const origInt = document.getElementById('fi-part-orig-int').value;
    const origBai = document.getElementById('fi-part-orig-bai').value;
    const integrante = parseInt(document.getElementById('fi-part-int').value);
    const baile = parseInt(document.getElementById('fi-part-baile').value);
    const rol = document.getElementById('fi-part-rol').value.trim() || null;
    const fecha_inicio = document.getElementById('fi-part-inicio').value || null;
    const rows = DB.get('participaciones');
    if (origInt && origBai) {
      const i = rows.findIndex(r => r.id_integrante == origInt && r.id_baile == origBai);
      rows[i] = { ...rows[i], rol, fecha_inicio };
    } else {
      rows.push({ id_integrante: integrante, id_baile: baile, rol, fecha_inicio });
    }
    DB.set('participaciones', rows);
    logAudit(session.user.id, origInt ? 'UPDATE' : 'INSERT', { integrante, baile, rol }, 'participa_en');
    showAlert(alertC, 'success', origInt ? 'Participación actualizada' : 'Participación creada');
    closeModal('modal-participacion'); reload();
  };
});

// ----- PRESENTACIONES -----
registerPage('presentaciones', () => {
  const session = getSession();
  const esAdmin = ['admin', 'usuario'].includes(session?.user?.rol);
  const alertC = document.getElementById('alert-presentaciones');

  function reload() {
    const rows = DB.get('presentaciones');
    const cuadros = DB.get('cuadros');
    const tbody = document.getElementById('tbody-presentaciones');
    tbody.innerHTML = rows.length
      ? rows.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(r => {
          const nc = cuadros.filter(c => c.id_presentation === r.id).length;
          return `<tr>
            <td>${r.id}</td>
            <td>${formatDateTime(r.fecha)}</td>
            <td>${r.lugar}</td>
            <td>${nc}</td>
            <td>${esAdmin ? `<div class="actions"><button class="btn-secondary btn-sm" data-edit="${r.id}">Editar</button><button class="btn-danger btn-sm" data-del="${r.id}">Borrar</button></div>` : ''}</td>
          </tr>`;
        }).join('')
      : '<tr><td colspan="5" class="empty">Sin registros</td></tr>';
  }

  reload();
  document.getElementById('new-presentacion').style.display = esAdmin ? '' : 'none';

  document.getElementById('new-presentacion').onclick = () => {
    document.getElementById('modal-pres-title').textContent = 'Nueva presentación';
    document.getElementById('form-presentacion').reset();
    document.getElementById('fi-pres-id').value = '';
    openModal('modal-presentacion');
  };

  document.getElementById('tbody-presentaciones').addEventListener('click', e => {
    const editId = e.target.dataset.edit;
    const delId = e.target.dataset.del;
    if (editId) {
      const r = DB.get('presentaciones').find(x => x.id == editId);
      document.getElementById('modal-pres-title').textContent = 'Editar presentación';
      document.getElementById('fi-pres-id').value = r.id;
      document.getElementById('fi-pres-fecha').value = r.fecha ? new Date(r.fecha).toISOString().slice(0, 16) : '';
      document.getElementById('fi-pres-lugar').value = r.lugar || '';
      openModal('modal-presentacion');
    }
    if (delId && confirm('¿Eliminar esta presentación?')) {
      DB.set('presentaciones', DB.get('presentaciones').filter(r => r.id != delId));
      logAudit(session.user.id, 'DELETE', { id: delId }, 'presentacion');
      showAlert(alertC, 'success', 'Registro eliminado'); reload();
    }
  });

  document.getElementById('form-presentacion').onsubmit = e => {
    e.preventDefault();
    const id = document.getElementById('fi-pres-id').value;
    const obj = {
      fecha: document.getElementById('fi-pres-fecha').value,
      lugar: document.getElementById('fi-pres-lugar').value.trim()
    };
    const rows = DB.get('presentaciones');
    if (id) { const i = rows.findIndex(r => r.id == id); rows[i] = { ...rows[i], ...obj }; }
    else { obj.id = DB.nextId('presentaciones'); rows.push(obj); }
    DB.set('presentaciones', rows);
    logAudit(session.user.id, id ? 'UPDATE' : 'INSERT', obj, 'presentacion');
    showAlert(alertC, 'success', id ? 'Presentación actualizada' : 'Presentación creada');
    closeModal('modal-presentacion'); reload();
  };
});

// ----- CUADROS -----
registerPage('cuadros', () => {
  const session = getSession();
  const esAdmin = ['admin', 'usuario'].includes(session?.user?.rol);
  const alertC = document.getElementById('alert-cuadros');

  function loadDropdowns() {
    const bailes = DB.get('bailes');
    const pres = DB.get('presentaciones');
    const bSel = document.getElementById('fi-cuad-baile');
    const pSel = document.getElementById('fi-cuad-pres');
    bSel.innerHTML = '<option value="">— Elige un baile —</option>' + bailes.map(b => `<option value="${b.id}">${b.nombre}</option>`).join('');
    pSel.innerHTML = '<option value="">— Sin asignar —</option>' + pres.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(p => `<option value="${p.id}">${new Date(p.fecha).toLocaleDateString('es-MX')} · ${p.lugar}</option>`).join('');
  }

  function reload() {
    const rows = DB.get('cuadros');
    const bailes = DB.get('bailes');
    const pres = DB.get('presentaciones');
    const tbody = document.getElementById('tbody-cuadros');
    tbody.innerHTML = rows.length
      ? rows.map(r => {
          const b = bailes.find(x => x.id === r.id_baile);
          const p = pres.find(x => x.id === r.id_presentation);
          return `<tr>
            <td>${r.id}</td>
            <td>${r.nombre}</td>
            <td>${b ? b.nombre : '—'}</td>
            <td>${p ? formatDateTime(p.fecha) + ' · ' + p.lugar : '—'}</td>
            <td>${r.numero_parejas}</td>
            <td>${esAdmin ? `<div class="actions"><button class="btn-secondary btn-sm" data-edit="${r.id}">Editar</button><button class="btn-danger btn-sm" data-del="${r.id}">Borrar</button></div>` : ''}</td>
          </tr>`;
        }).join('')
      : '<tr><td colspan="6" class="empty">Sin registros</td></tr>';
  }

  loadDropdowns();
  reload();
  document.getElementById('new-cuadro').style.display = esAdmin ? '' : 'none';

  document.getElementById('new-cuadro').onclick = () => {
    document.getElementById('modal-cuad-title').textContent = 'Nuevo cuadro';
    document.getElementById('form-cuadro').reset();
    document.getElementById('fi-cuad-id').value = '';
    openModal('modal-cuadro');
  };

  document.getElementById('tbody-cuadros').addEventListener('click', e => {
    const editId = e.target.dataset.edit;
    const delId = e.target.dataset.del;
    if (editId) {
      const r = DB.get('cuadros').find(x => x.id == editId);
      document.getElementById('modal-cuad-title').textContent = 'Editar cuadro';
      document.getElementById('fi-cuad-id').value = r.id;
      document.getElementById('fi-cuad-nombre').value = r.nombre || '';
      document.getElementById('fi-cuad-baile').value = r.id_baile || '';
      document.getElementById('fi-cuad-pres').value = r.id_presentation || '';
      document.getElementById('fi-cuad-parejas').value = r.numero_parejas || 0;
      openModal('modal-cuadro');
    }
    if (delId && confirm('¿Eliminar este cuadro?')) {
      DB.set('cuadros', DB.get('cuadros').filter(r => r.id != delId));
      logAudit(session.user.id, 'DELETE', { id: delId }, 'cuadro');
      showAlert(alertC, 'success', 'Registro eliminado'); reload();
    }
  });

  document.getElementById('form-cuadro').onsubmit = e => {
    e.preventDefault();
    const id = document.getElementById('fi-cuad-id').value;
    const obj = {
      nombre: document.getElementById('fi-cuad-nombre').value.trim(),
      id_baile: parseInt(document.getElementById('fi-cuad-baile').value),
      id_presentation: parseInt(document.getElementById('fi-cuad-pres').value) || null,
      numero_parejas: parseInt(document.getElementById('fi-cuad-parejas').value) || 0
    };
    const rows = DB.get('cuadros');
    if (id) { const i = rows.findIndex(r => r.id == id); rows[i] = { ...rows[i], ...obj }; }
    else { obj.id = DB.nextId('cuadros'); rows.push(obj); }
    DB.set('cuadros', rows);
    logAudit(session.user.id, id ? 'UPDATE' : 'INSERT', obj, 'cuadro');
    showAlert(alertC, 'success', id ? 'Cuadro actualizado' : 'Cuadro creado');
    closeModal('modal-cuadro'); reload();
  };
});

// ----- OBSERVACIONES -----
registerPage('observaciones', () => {
  const session = getSession();
  const esAdmin = ['admin', 'usuario'].includes(session?.user?.rol);
  const alertC = document.getElementById('alert-observaciones');

  function loadDropdowns() {
    const ints = DB.get('integrantes');
    const sel = document.getElementById('fi-obs-int');
    sel.innerHTML = '<option value="">— Elige integrante —</option>' + ints.map(i => `<option value="${i.id}">${i.nombre}</option>`).join('');
  }

  function reload() {
    const rows = DB.get('observaciones');
    const ints = DB.get('integrantes');
    const tbody = document.getElementById('tbody-observaciones');
    tbody.innerHTML = rows.length
      ? [...rows].reverse().map(r => {
          const int = ints.find(i => i.id == r.id_integrante);
          return `<tr>
            <td>${r.id}</td>
            <td>${int ? int.nombre : '?'}</td>
            <td>${r.presentacion || '—'}</td>
            <td>${r.ensayo || '—'}</td>
            <td>${r.notas ? r.notas.slice(0, 60) + (r.notas.length > 60 ? '…' : '') : '—'}</td>
            <td>${esAdmin ? `<div class="actions"><button class="btn-secondary btn-sm" data-edit="${r.id}">Editar</button><button class="btn-danger btn-sm" data-del="${r.id}">Borrar</button></div>` : ''}</td>
          </tr>`;
        }).join('')
      : '<tr><td colspan="6" class="empty">Sin registros</td></tr>';
  }

  loadDropdowns();
  reload();
  document.getElementById('new-observacion').style.display = esAdmin ? '' : 'none';

  document.getElementById('new-observacion').onclick = () => {
    document.getElementById('modal-obs-title').textContent = 'Nueva observación';
    document.getElementById('form-observacion').reset();
    document.getElementById('fi-obs-id').value = '';
    openModal('modal-observacion');
  };

  document.getElementById('tbody-observaciones').addEventListener('click', e => {
    const editId = e.target.dataset.edit;
    const delId = e.target.dataset.del;
    if (editId) {
      const r = DB.get('observaciones').find(x => x.id == editId);
      document.getElementById('modal-obs-title').textContent = 'Editar observación';
      document.getElementById('fi-obs-id').value = r.id;
      document.getElementById('fi-obs-int').value = r.id_integrante || '';
      document.getElementById('fi-obs-pres').value = r.presentacion || '';
      document.getElementById('fi-obs-ens').value = r.ensayo || '';
      document.getElementById('fi-obs-notas').value = r.notas || '';
      openModal('modal-observacion');
    }
    if (delId && confirm('¿Eliminar esta observación?')) {
      DB.set('observaciones', DB.get('observaciones').filter(r => r.id != delId));
      logAudit(session.user.id, 'DELETE', { id: delId }, 'observacion');
      showAlert(alertC, 'success', 'Registro eliminado'); reload();
    }
  });

  document.getElementById('form-observacion').onsubmit = e => {
    e.preventDefault();
    const id = document.getElementById('fi-obs-id').value;
    const obj = {
      id_integrante: parseInt(document.getElementById('fi-obs-int').value),
      presentacion: document.getElementById('fi-obs-pres').value.trim() || null,
      ensayo: document.getElementById('fi-obs-ens').value.trim() || null,
      notas: document.getElementById('fi-obs-notas').value.trim() || null
    };
    const rows = DB.get('observaciones');
    if (id) { const i = rows.findIndex(r => r.id == id); rows[i] = { ...rows[i], ...obj }; }
    else { obj.id = DB.nextId('observaciones'); rows.push(obj); }
    DB.set('observaciones', rows);
    logAudit(session.user.id, id ? 'UPDATE' : 'INSERT', obj, 'observacion');
    showAlert(alertC, 'success', id ? 'Observación actualizada' : 'Observación creada');
    closeModal('modal-observacion'); reload();
  };
});

// ----- INVENTARIO -----
registerPage('inventario', () => {
  const session = getSession();
  const esAdmin = ['admin', 'usuario'].includes(session?.user?.rol);
  const alertC = document.getElementById('alert-inventario');

  function loadDropdowns() {
    const items = DB.get('inventario');
    const pres = DB.get('presentaciones');
    const iSel = document.getElementById('fa-item');
    const pSel = document.getElementById('fa-pres');
    iSel.innerHTML = '<option value="">— Elige ítem —</option>' + items.map(i => `<option value="${i.id}">${i.nombre}</option>`).join('');
    pSel.innerHTML = '<option value="">— Elige presentación —</option>' + pres.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map(p => `<option value="${p.id}">${new Date(p.fecha).toLocaleDateString('es-MX')} · ${p.lugar}</option>`).join('');
  }

  function reloadItems() {
    const rows = DB.get('inventario');
    const tbody = document.getElementById('tbody-items');
    tbody.innerHTML = rows.length
      ? rows.map(r => `
        <tr>
          <td>${r.id}</td>
          <td>${r.nombre}</td>
          <td><span class="${r.cantidad_total < 5 ? 'badge-danger' : 'badge-success'}" style="padding:2px 8px;border-radius:999px;font-size:0.8rem">${r.cantidad_total}</span></td>
          <td>${r.color || '—'}</td>
          <td>${esAdmin ? `<div class="actions"><button class="btn-secondary btn-sm" data-edit-item="${r.id}">Editar</button><button class="btn-danger btn-sm" data-del-item="${r.id}">Borrar</button></div>` : ''}</td>
        </tr>`).join('')
      : '<tr><td colspan="5" class="empty">Sin registros</td></tr>';
  }

  function reloadAsig() {
    const rows = DB.get('inv_presentaciones');
    const items = DB.get('inventario');
    const pres = DB.get('presentaciones');
    const tbody = document.getElementById('tbody-asig');
    tbody.innerHTML = rows.length
      ? rows.map(r => {
          const item = items.find(i => i.id === r.id_item);
          const p = pres.find(x => x.id === r.id_presentation);
          return `<tr data-item="${r.id_item}" data-pres="${r.id_presentation}">
            <td>${item ? item.nombre : '?'}</td>
            <td>${p ? formatDateTime(p.fecha) + ' · ' + p.lugar : '?'}</td>
            <td>${r.cantidad_llevada}</td>
            <td>${r.observaciones || '—'}</td>
            <td>${esAdmin ? `<div class="actions"><button class="btn-secondary btn-sm" data-edit-asig="1">Editar</button><button class="btn-danger btn-sm" data-del-asig="1">Borrar</button></div>` : ''}</td>
          </tr>`;
        }).join('')
      : '<tr><td colspan="5" class="empty">Sin asignaciones</td></tr>';
  }

  loadDropdowns();
  reloadItems();
  reloadAsig();

  document.getElementById('new-item').style.display = esAdmin ? '' : 'none';
  document.getElementById('assign-btn').style.display = esAdmin ? '' : 'none';

  document.getElementById('new-item').onclick = () => {
    document.getElementById('m-item-title').textContent = 'Nuevo ítem';
    document.getElementById('form-item').reset();
    document.getElementById('fi-item-id').value = '';
    openModal('modal-item');
  };

  document.getElementById('assign-btn').onclick = () => {
    document.getElementById('m-asig-title').textContent = 'Asignar a presentación';
    document.getElementById('form-asig').reset();
    document.getElementById('fa-orig-item').value = '';
    document.getElementById('fa-orig-pres').value = '';
    document.getElementById('fa-item').disabled = false;
    document.getElementById('fa-pres').disabled = false;
    openModal('modal-asig');
  };

  document.getElementById('tbody-items').addEventListener('click', e => {
    const editId = e.target.dataset.editItem;
    const delId = e.target.dataset.delItem;
    if (editId) {
      const r = DB.get('inventario').find(x => x.id == editId);
      document.getElementById('m-item-title').textContent = 'Editar ítem';
      document.getElementById('fi-item-id').value = r.id;
      document.getElementById('fi-item-nombre').value = r.nombre || '';
      document.getElementById('fi-item-cant').value = r.cantidad_total || 0;
      document.getElementById('fi-item-color').value = r.color || '';
      openModal('modal-item');
    }
    if (delId && confirm('¿Eliminar este ítem?')) {
      DB.set('inventario', DB.get('inventario').filter(r => r.id != delId));
      logAudit(session.user.id, 'DELETE', { id: delId }, 'inventario');
      showAlert(alertC, 'success', 'Ítem eliminado'); reloadItems(); loadDropdowns();
    }
  });

  document.getElementById('tbody-asig').addEventListener('click', e => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const idItem = tr.dataset.item;
    const idPres = tr.dataset.pres;
    if (e.target.dataset.editAsig) {
      const r = DB.get('inv_presentaciones').find(x => x.id_item == idItem && x.id_presentation == idPres);
      document.getElementById('m-asig-title').textContent = 'Editar asignación';
      document.getElementById('fa-orig-item').value = r.id_item;
      document.getElementById('fa-orig-pres').value = r.id_presentation;
      document.getElementById('fa-item').value = r.id_item;
      document.getElementById('fa-pres').value = r.id_presentation;
      document.getElementById('fa-item').disabled = true;
      document.getElementById('fa-pres').disabled = true;
      document.getElementById('fa-cant').value = r.cantidad_llevada || 0;
      document.getElementById('fa-obs').value = r.observaciones || '';
      openModal('modal-asig');
    }
    if (e.target.dataset.delAsig && confirm('¿Eliminar esta asignación?')) {
      DB.set('inv_presentaciones', DB.get('inv_presentaciones').filter(r => !(r.id_item == idItem && r.id_presentation == idPres)));
      logAudit(session.user.id, 'DELETE', { id_item: idItem, id_presentation: idPres }, 'inventario_presentacion');
      showAlert(alertC, 'success', 'Asignación eliminada'); reloadAsig();
    }
  });

  document.getElementById('form-item').onsubmit = e => {
    e.preventDefault();
    const id = document.getElementById('fi-item-id').value;
    const obj = {
      nombre: document.getElementById('fi-item-nombre').value.trim(),
      cantidad_total: parseInt(document.getElementById('fi-item-cant').value) || 0,
      color: document.getElementById('fi-item-color').value.trim() || null
    };
    const rows = DB.get('inventario');
    if (id) { const i = rows.findIndex(r => r.id == id); rows[i] = { ...rows[i], ...obj }; }
    else { obj.id = DB.nextId('inventario'); rows.push(obj); }
    DB.set('inventario', rows);
    logAudit(session.user.id, id ? 'UPDATE' : 'INSERT', obj, 'inventario');
    showAlert(alertC, 'success', id ? 'Ítem actualizado' : 'Ítem creado');
    closeModal('modal-item'); reloadItems(); loadDropdowns();
  };

  document.getElementById('form-asig').onsubmit = e => {
    e.preventDefault();
    const origItem = document.getElementById('fa-orig-item').value;
    const origPres = document.getElementById('fa-orig-pres').value;
    const obj = {
      id_item: parseInt(document.getElementById('fa-item').value),
      id_presentation: parseInt(document.getElementById('fa-pres').value),
      cantidad_llevada: parseInt(document.getElementById('fa-cant').value) || 0,
      observaciones: document.getElementById('fa-obs').value.trim() || null
    };
    const rows = DB.get('inv_presentaciones');
    if (origItem && origPres) {
      const i = rows.findIndex(r => r.id_item == origItem && r.id_presentation == origPres);
      rows[i] = { ...rows[i], cantidad_llevada: obj.cantidad_llevada, observaciones: obj.observaciones };
    } else {
      rows.push(obj);
    }
    DB.set('inv_presentaciones', rows);
    logAudit(session.user.id, origItem ? 'UPDATE' : 'INSERT', obj, 'inventario_presentacion');
    showAlert(alertC, 'success', origItem ? 'Asignación actualizada' : 'Asignación creada');
    closeModal('modal-asig'); reloadAsig();
  };
});

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  seed();

  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    const session = getSession();
    if (session) {
      document.getElementById('page-login').style.display = 'none';
      renderNavbar();
      showPage('dashboard');
    } else {
      document.getElementById('page-login').style.display = 'flex';
    }

    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = document.getElementById('submit-btn');
      btn.disabled = true; btn.textContent = 'Ingresando...';
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const result = login(email, password);
      if (result.ok) {
        document.getElementById('page-login').style.display = 'none';
        renderNavbar();
        showPage('dashboard');
      } else {
        const alertC = document.getElementById('alert-login');
        showAlert(alertC, 'error', result.error);
        btn.disabled = false; btn.textContent = 'Iniciar sesión';
      }
    });
  }
});
