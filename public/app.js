const STORAGE_KEY = 'availability-calendar-state';
const DEFAULT_USERS = [
  { id: 'user-1', name: 'Alice', color: '#2563eb' },
  { id: 'user-2', name: 'Bobby', color: '#f59e0b' },
  { id: 'user-3', name: 'Carmen', color: '#10b981' },
];

const elements = {
  userSelect: document.getElementById('user-select'),
  legend: document.querySelector('.legend'),
  monthLabel: document.getElementById('month-label'),
  calendarGrid: document.getElementById('calendar-grid'),
  prevMonth: document.getElementById('prev-month'),
  nextMonth: document.getElementById('next-month'),
  storageWarning: document.getElementById('storage-warning'),
};

let state = {
  currentMonth: getIsoMonth(new Date()),
  selectedUserId: DEFAULT_USERS[0].id,
  users: DEFAULT_USERS,
  availability: [],
};

let storageAvailable = true;

function getIsoMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function parseIsoMonth(isoMonth) {
  const [year, month] = isoMonth.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

function getMonthLabel(isoMonth) {
  const date = parseIsoMonth(isoMonth);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed?.currentMonth && parsed?.selectedUserId && Array.isArray(parsed.users) && Array.isArray(parsed.availability)) {
      state = {
        currentMonth: parsed.currentMonth,
        selectedUserId: parsed.selectedUserId,
        users: parsed.users,
        availability: parsed.availability,
      };
    }
  } catch (error) {
    storageAvailable = false;
    console.warn('Unable to load state from localStorage:', error);
  }
}

function saveState() {
  if (!storageAvailable) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    storageAvailable = false;
    showStorageWarning(true);
    console.warn('Unable to save state to localStorage:', error);
  }
}

function verifyStorageAvailability() {
  try {
    const key = '__storage_test__';
    localStorage.setItem(key, key);
    localStorage.removeItem(key);
    storageAvailable = true;
  } catch (error) {
    storageAvailable = false;
    console.warn('localStorage unavailable:', error);
  }
}

function showStorageWarning(show) {
  if (show) {
    elements.storageWarning.textContent = 'Browser storage is unavailable. Availability selections will not persist after refresh.';
    elements.storageWarning.classList.remove('hidden');
  } else {
    elements.storageWarning.classList.add('hidden');
  }
}

function buildUserSelect() {
  elements.userSelect.innerHTML = '';
  state.users.forEach((user) => {
    const option = document.createElement('option');
    option.value = user.id;
    option.textContent = user.name;
    elements.userSelect.appendChild(option);
  });
  elements.userSelect.value = state.selectedUserId;
}

function buildLegend() {
  elements.legend.innerHTML = '';
  state.users.forEach((user) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <span class="legend-chip" style="background:${user.color}"></span>
      <span>${user.name}</span>
    `;
    elements.legend.appendChild(item);
  });
}

function getMonthDates(isoMonth) {
  const start = parseIsoMonth(isoMonth);
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const firstWeekday = start.getDay();
  const cells = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(start.getFullYear(), start.getMonth(), day);
    cells.push(date);
  }

  return cells;
}

function getAvailabilityForDate(date) {
  const isoDate = date.toISOString().slice(0, 10);
  return state.availability.filter((entry) => entry.date === isoDate);
}

function toggleAvailability(date) {
  const isoDate = date.toISOString().slice(0, 10);
  const existingIndex = state.availability.findIndex(
    (entry) => entry.userId === state.selectedUserId && entry.date === isoDate,
  );

  if (existingIndex >= 0) {
    state.availability.splice(existingIndex, 1);
  } else {
    state.availability.push({ userId: state.selectedUserId, date: isoDate });
  }
  saveState();
  renderCalendar();
}

function getUserColor(userId) {
  return state.users.find((user) => user.id === userId)?.color || '#000000';
}

function renderCalendar() {
  elements.monthLabel.textContent = getMonthLabel(state.currentMonth);
  elements.calendarGrid.innerHTML = '';
  const dates = getMonthDates(state.currentMonth);

  dates.forEach((date) => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'date-cell';

    if (!date) {
      cell.classList.add('disabled');
      cell.setAttribute('aria-hidden', 'true');
      cell.disabled = true;
      elements.calendarGrid.appendChild(cell);
      return;
    }

    const isoDate = date.toISOString().slice(0, 10);
    const dateLabel = document.createElement('span');
    dateLabel.className = 'date-label';
    dateLabel.textContent = String(date.getDate());
    cell.appendChild(dateLabel);

    const entries = getAvailabilityForDate(date);
    if (entries.length > 0) {
      const badges = document.createElement('div');
      badges.className = 'badges';
      const visibleEntries = entries.slice(0, 2);

      visibleEntries.forEach((entry) => {
        const badge = document.createElement('span');
        badge.className = 'badge';
        const user = state.users.find((u) => u.id === entry.userId);
        badge.style.backgroundColor = user?.color || '#6b7280';
        badge.textContent = user ? user.name : 'Unknown';
        badges.appendChild(badge);
      });

      if (entries.length > 2) {
        const extraBadge = document.createElement('span');
        extraBadge.className = 'badge collapsed-badge';
        extraBadge.textContent = `+${entries.length - 2} more`;
        extraBadge.style.backgroundColor = 'rgba(107, 114, 128, 0.64)';
        badges.appendChild(extraBadge);
      }

      cell.appendChild(badges);
    }

    const activeUser = entries.some((entry) => entry.userId === state.selectedUserId);
    if (activeUser) {
      cell.classList.add('active');
    }

    cell.addEventListener('click', () => toggleAvailability(date));
    cell.setAttribute('aria-label', `${date.toLocaleDateString()} availability`);
    elements.calendarGrid.appendChild(cell);
  });
}

function changeMonth(direction) {
  const current = parseIsoMonth(state.currentMonth);
  current.setMonth(current.getMonth() + direction);
  state.currentMonth = getIsoMonth(current);
  saveState();
  renderCalendar();
}

function handleUserChange(event) {
  state.selectedUserId = event.target.value;
  saveState();
  renderCalendar();
}

function ensureUniqueColors() {
  const usedColors = new Set();
  state.users = state.users.map((user, index) => {
    if (!usedColors.has(user.color)) {
      usedColors.add(user.color);
      return user;
    }

    const fallbackColors = ['#ef4444', '#8b5cf6', '#14b8a6', '#f97316', '#0ea5e9'];
    const fallback = fallbackColors[index % fallbackColors.length];
    usedColors.add(fallback);
    return { ...user, color: fallback };
  });
}

function init() {
  verifyStorageAvailability();
  if (!storageAvailable) {
    showStorageWarning(true);
  }
  loadState();
  if (!storageAvailable) {
    showStorageWarning(true);
  }
  ensureUniqueColors();
  buildUserSelect();
  buildLegend();
  renderCalendar();

  elements.prevMonth.addEventListener('click', () => changeMonth(-1));
  elements.nextMonth.addEventListener('click', () => changeMonth(1));
  elements.userSelect.addEventListener('change', handleUserChange);
}

init();
