import { execSQL } from './config.js';
import { esc, logAudit, getSession } from './auth.js';
import { showAlert, formatDate, confirmDelete } from './ui.js';

export { esc, formatDate };

export async function loadRows(sql, tbody, renderRow, emptyMsg = 'Sin registros') {
  tbody.innerHTML = '';
  const { data, error } = await execSQL(sql);
  if (error) {
    tbody.innerHTML = `<tr><td colspan="99" class="empty">Error: ${error}</td></tr>`;
    return [];
  }
  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="99" class="empty">${emptyMsg}</td></tr>`;
    return [];
  }
  data.forEach(row => tbody.insertAdjacentHTML('beforeend', renderRow(row)));
  return data;
}

export async function deleteRow(table, id, reload, alertC) {
  if (!confirmDelete()) return;
  const { error } = await execSQL(`DELETE FROM ${table} WHERE id = ${esc(id)}`);
  if (error) { showAlert(alertC, 'error', error); return; }
  const s = getSession();
  await logAudit(s.user.id, 'DELETE', { id }, table, id);
  showAlert(alertC, 'success', 'Registro eliminado');
  await reload();
}

export async function deleteCompositeRow(table, whereClause, reload, alertC) {
  if (!confirmDelete()) return;
  const { error } = await execSQL(`DELETE FROM ${table} WHERE ${whereClause}`);
  if (error) { showAlert(alertC, 'error', error); return; }
  const s = getSession();
  await logAudit(s.user.id, 'DELETE', { where: whereClause }, table, null);
  showAlert(alertC, 'success', 'Registro eliminado');
  await reload();
}
