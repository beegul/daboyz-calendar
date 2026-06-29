export function getIsoMonth(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function parseIsoMonth(isoMonth) {
  const [year, month] = isoMonth.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

export function getMonthLabel(isoMonth) {
  const date = parseIsoMonth(isoMonth);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
}

export function getMonthDates(isoMonth) {
  const start = parseIsoMonth(isoMonth);
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const firstWeekday = start.getDay();
  const cells = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(start.getFullYear(), start.getMonth(), day));
  }

  return cells;
}
