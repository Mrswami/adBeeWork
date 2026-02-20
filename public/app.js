let schedules = [];
let isAuthenticated = false;
let pendingSyncIds = [];

// ─── Init ─────────────────────────────────────────────────────────────────────

window.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  checkUrlParams();

  document.getElementById('notify-self').addEventListener('change', (e) => {
    const badge = document.getElementById('notify-badge');
    badge.textContent = e.target.checked ? 'Notify self ON' : 'Auto-replies OFF';
    badge.className   = e.target.checked ? 'badge badge-on'  : 'badge badge-off';
  });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function checkAuth() {
  try {
    const res  = await fetch('/auth/status');
    const data = await res.json();
    isAuthenticated = data.authenticated;

    if (isAuthenticated && data.user) {
      showUserInfo(data.user);
      await loadCalendars();
      await loadSavedUrl();
      await loadHistory();
    }
  } catch {
    isAuthenticated = false;
  }

  document.getElementById('btn-login').classList.toggle('hidden', isAuthenticated);
  document.getElementById('user-info').classList.toggle('hidden', !isAuthenticated);
}

function showUserInfo(user) {
  if (user.picture) {
    document.getElementById('user-avatar').src = user.picture;
    document.getElementById('user-avatar').classList.remove('hidden');
  }
  document.getElementById('user-name').textContent  = user.name  || '';
  document.getElementById('user-email').textContent = user.email || '';
}

function loginWithGoogle() { window.location.href = '/auth/google'; }

async function logout() {
  await fetch('/auth/logout', { method: 'POST' });
  isAuthenticated = false; schedules = [];
  document.getElementById('btn-login').classList.remove('hidden');
  document.getElementById('user-info').classList.add('hidden');
  document.getElementById('schedules-panel').classList.add('hidden');
  document.getElementById('history-panel').classList.add('hidden');
  document.getElementById('cal-picker').innerHTML = '<option value="">— sign in to load calendars —</option>';
  document.getElementById('cal-picker').disabled = true;
  showToast('Signed out');
}

function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('auth') === 'success') { showToast('Connected to Google Calendar!', 'success'); }
  if (params.get('error'))              { showToast('Google sign-in failed. Try again.', 'error'); }
  if (params.get('auth') || params.get('error')) {
    window.history.replaceState({}, '', '/');
  }
}

// ─── Calendars ────────────────────────────────────────────────────────────────

async function loadCalendars() {
  try {
    const res  = await fetch('/api/calendar/list');
    const data = await res.json();
    const picker = document.getElementById('cal-picker');

    if (!res.ok || !data.calendars?.length) {
      picker.innerHTML = '<option value="primary">Primary Calendar</option>';
      picker.disabled = false;
      return;
    }

    picker.innerHTML = data.calendars.map((cal) => `
      <option value="${escHtml(cal.id)}" ${cal.isPrimary ? 'selected' : ''}>
        ${cal.isPrimary ? '⭐ ' : ''}${escHtml(cal.name)}
      </option>
    `).join('');
    picker.disabled = false;
  } catch {
    document.getElementById('cal-picker').innerHTML = '<option value="primary">Primary Calendar</option>';
    document.getElementById('cal-picker').disabled = false;
  }
}

// ─── iCal URL ─────────────────────────────────────────────────────────────────

async function loadSavedUrl() {
  if (!isAuthenticated) return;
  try {
    const res  = await fetch('/api/schedules/saved-url');
    const data = await res.json();
    if (data.url) document.getElementById('ical-url').value = data.url;
  } catch {}
}

async function saveAndFetch() {
  if (!isAuthenticated) { showToast('Sign in with Google first', 'error'); return; }

  const url = document.getElementById('ical-url').value.trim();
  if (!url) { showToast('Paste your SocialSchedules calendar URL first', 'error'); return; }

  showLoading('Fetching your shifts from SocialSchedules...');
  try {
    await fetch('/api/schedules/save-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    const res  = await fetch(`/api/schedules?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load schedules');

    schedules = data.schedules;
    renderSchedules(schedules);
    document.getElementById('schedules-panel').classList.remove('hidden');
    showToast(`Found ${schedules.length} upcoming confirmed shifts`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    hideLoading();
  }
}

// ─── Schedules render ─────────────────────────────────────────────────────────

function renderSchedules(items) {
  const list = document.getElementById('schedules-list');
  document.getElementById('shift-count').textContent = items.length;

  if (!items.length) {
    list.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:24px;">No upcoming confirmed shifts found.</p>';
    return;
  }

  list.innerHTML = items.map((s) => {
    const start   = new Date(s.start);
    const end     = new Date(s.end);
    const dateStr = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = `${fmtTime(start)} – ${fmtTime(end)}`;
    return `
      <div class="schedule-item selected" id="item-${s.id}" onclick="toggleSelect('${s.id}')">
        <input type="checkbox" class="schedule-checkbox" id="chk-${s.id}" checked
          onclick="event.stopPropagation(); syncCheckbox('${s.id}', this.checked)" />
        <div class="schedule-info">
          <div class="schedule-title">${escHtml(s.title)}</div>
          <div class="schedule-time">${dateStr} · ${timeStr}</div>
          ${s.location ? `<div class="schedule-location">📍 ${escHtml(s.location)}</div>` : ''}
        </div>
        <span class="schedule-status">${s.status}</span>
      </div>`;
  }).join('');
}

function toggleSelect(id) {
  const chk = document.getElementById(`chk-${id}`);
  chk.checked = !chk.checked;
  syncCheckbox(id, chk.checked);
}
function syncCheckbox(id, checked) {
  document.getElementById(`item-${id}`).classList.toggle('selected', checked);
}
function selectAll()  { schedules.forEach((s) => { const c = document.getElementById(`chk-${s.id}`); if(c){ c.checked = true;  syncCheckbox(s.id, true);  } }); }
function selectNone() { schedules.forEach((s) => { const c = document.getElementById(`chk-${s.id}`); if(c){ c.checked = false; syncCheckbox(s.id, false); } }); }

function getSelectedIds() {
  return schedules.filter((s) => { const c = document.getElementById(`chk-${s.id}`); return c && c.checked; }).map((s) => s.id);
}

// ─── Confirm modal ────────────────────────────────────────────────────────────

function askToSync() {
  if (!isAuthenticated) { showToast('Sign in with Google first', 'error'); return; }

  const ids = getSelectedIds();
  if (!ids.length) { showToast('Select at least one shift to sync', 'error'); return; }

  const calPicker = document.getElementById('cal-picker');
  const calName   = calPicker.options[calPicker.selectedIndex]?.text || 'Primary Calendar';
  const notifySelf = document.getElementById('notify-self').checked;

  document.getElementById('confirm-body').innerHTML = `
    You're about to add <strong>${ids.length} shift${ids.length > 1 ? 's' : ''}</strong>
    to <strong>${escHtml(calName)}</strong>.<br/><br/>
    ${notifySelf
      ? '📧 You will receive a confirmation email.'
      : '🔇 Events will be added <strong>silently</strong> — no emails or auto-replies sent.'}
  `;

  pendingSyncIds = ids;
  document.getElementById('confirm-modal').classList.remove('hidden');
}

function closeConfirm() {
  document.getElementById('confirm-modal').classList.add('hidden');
  pendingSyncIds = [];
}

async function confirmSync() {
  closeConfirm();
  await runSync(pendingSyncIds);
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

async function runSync(selectedIds) {
  const icalUrl    = document.getElementById('ical-url').value.trim();
  const calendarId = document.getElementById('cal-picker').value || 'primary';
  const timeZone   = document.getElementById('timezone').value;
  const notifySelf = document.getElementById('notify-self').checked;

  showLoading(`Syncing ${selectedIds.length} shift(s) to Google Calendar...`);
  try {
    const res  = await fetch('/api/calendar/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ icalUrl, calendarId, timeZone, notifySelf, selectedIds }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Sync failed');

    showResult(data);
    (data.details?.synced || []).forEach(({ id }) => {
      const item = document.getElementById(`item-${id}`);
      if (item) item.classList.add('synced');
    });

    await loadHistory();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    hideLoading();
  }
}

// ─── Result panel ─────────────────────────────────────────────────────────────

function showResult(data) {
  const panel   = document.getElementById('result-panel');
  const content = document.getElementById('result-content');

  const links = (data.details?.synced || []).filter((s) => s.gcalLink)
    .map((s) => `<a class="result-link" href="${s.gcalLink}" target="_blank">📅 ${escHtml(s.title)}</a>`)
    .join('');

  const failedHtml = (data.details?.failed || []).length
    ? `<p style="color:var(--red);font-size:13px;margin-bottom:16px;">
        Failed: ${data.details.failed.map((f) => escHtml(f.title)).join(', ')}
       </p>` : '';

  content.innerHTML = `
    <div class="result-grid">
      <div class="result-stat stat-synced"><div class="number">${data.synced}</div><span class="label">Added to Calendar</span></div>
      <div class="result-stat stat-skipped"><div class="number">${data.skipped}</div><span class="label">Already Existed</span></div>
      <div class="result-stat stat-failed"><div class="number">${data.failed}</div><span class="label">Failed</span></div>
    </div>
    ${failedHtml}
    ${links ? `<div class="result-links">${links}</div>` : ''}
  `;
  panel.classList.remove('hidden');
  panel.scrollIntoView({ behavior: 'smooth' });
}

function hideResult() { document.getElementById('result-panel').classList.add('hidden'); }

// ─── History ──────────────────────────────────────────────────────────────────

async function loadHistory() {
  if (!isAuthenticated) return;
  try {
    const res  = await fetch('/api/user/history');
    const data = await res.json();
    if (!data.history?.length) return;

    const panel = document.getElementById('history-panel');
    const list  = document.getElementById('history-list');

    list.innerHTML = data.history.map((h) => {
      const date = h.createdAt?.seconds
        ? new Date(h.createdAt.seconds * 1000).toLocaleString()
        : 'Recent';
      return `
        <div class="history-item">
          <span>${date}</span>
          <div class="history-stats">
            <span class="hs">+${h.synced ?? 0} added</span>
            <span>${h.skipped ?? 0} skipped</span>
            ${h.failed ? `<span style="color:var(--red)">${h.failed} failed</span>` : ''}
          </div>
        </div>`;
    }).join('');

    panel.classList.remove('hidden');
  } catch {}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function showLoading(text = 'Loading...') {
  document.getElementById('loading-text').textContent = text;
  document.getElementById('loading').classList.remove('hidden');
}
function hideLoading() { document.getElementById('loading').classList.add('hidden'); }

let toastTimer;
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = `toast${type ? ' toast-' + type : ''}`;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3500);
}

function fmtTime(d) { return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
