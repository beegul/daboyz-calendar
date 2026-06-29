/**
 * Mock API handler for local development without Azure credentials
 * Falls back to localStorage for persistence using composite key (name, color, date)
 */

const STORAGE_KEYS = {
  PERSONAS: "personas_storage",
  ACTIVE_PERSONA: "active_persona",
  AVAILABILITY: "calendar_availability",
};

function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PERSONAS)) {
    localStorage.setItem(STORAGE_KEYS.PERSONAS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AVAILABILITY)) {
    localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify([]));
  }
}

export const mockAPI = {
  // Availability
  getAvailability: (month) => {
    initializeStorage();
    const entries = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.AVAILABILITY) || "[]",
    );
    const monthEntries = entries.filter((e) => e.date.startsWith(month));
    return Promise.resolve({ month, entries: monthEntries });
  },

  toggleAvailability: (name, color, date) => {
    initializeStorage();
    const entries = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.AVAILABILITY) || "[]",
    );

    // Find entry using composite key
    const existingIndex = entries.findIndex(
      (e) => e.name === name && e.color === color && e.date === date,
    );

    if (existingIndex >= 0) {
      // Remove if exists
      const removed = entries.splice(existingIndex, 1)[0];
      localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(entries));
      return Promise.resolve({ action: "removed", entry: removed });
    } else {
      // Add if not exists
      const month = date.slice(0, 7);
      const entry = {
        partitionKey: `calendar-${month}`,
        rowKey: `${name}#${color}#${date}`, // Composite key format
        date,
        name,
        color,
        timestamp: new Date().toISOString(),
      };
      entries.push(entry);
      localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(entries));
      return Promise.resolve({ action: "added", entry });
    }
  },

  deleteAvailability: (name, color, date) => {
    initializeStorage();
    const entries = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.AVAILABILITY) || "[]",
    );

    // Find entry using composite key
    const existingIndex = entries.findIndex(
      (e) => e.name === name && e.color === color && e.date === date,
    );

    if (existingIndex >= 0) {
      entries.splice(existingIndex, 1);
      localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(entries));
      return Promise.resolve({ success: true });
    }
    return Promise.reject(new Error("Entry not found"));
  },

  getPersonas: (month) => {
    initializeStorage();
    const entries = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.AVAILABILITY) || "[]",
    );

    // Get distinct personas for the month
    const personasMap = {};
    entries
      .filter((e) => e.date.startsWith(month))
      .forEach((e) => {
        const key = `${e.name}#${e.color}`;
        if (!personasMap[key]) {
          personasMap[key] = { name: e.name, color: e.color };
        }
      });

    const personas = Object.values(personasMap);
    return Promise.resolve({ month, personas });
  },

  health: () => {
    return Promise.resolve({ status: "healthy (mock)", version: "1.0.0-mock" });
  },
};
