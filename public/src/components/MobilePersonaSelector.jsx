/**
 * MobilePersonaSelector Component (ULTRA-LEAN)
 * 
 * Minimal mobile persona selector using native select.
 * 
 * Feature: 007-multi-user-sync-mobile-ux
 * Phase: 3 - User Story 4 (Mobile Layout Clarity)
 */

import React from 'react';

export function MobilePersonaSelector({
  personas = [],
  activePersona,
  onSelectPersona,
  onCreateNew,
  onDeletePersona,
  isDarkMode = false,
}) {
  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (value === '__create__') {
      onCreateNew();
    } else if (value === '__delete__') {
      if (activePersona && window.confirm(`Delete ${activePersona.name}?`)) {
        onDeletePersona(activePersona);
      }
      e.target.value = activePersona?.name || '';
    } else {
      const p = personas.find(p => p.name === value);
      if (p) onSelectPersona(p);
    }
  };

  return (
    <select
      value={activePersona?.name || ''}
      onChange={handleSelectChange}
      className={`w-full px-4 py-3 rounded-lg border-2 text-sm font-medium ${
        isDarkMode
          ? 'bg-gray-700 border-gray-600 text-white'
          : 'bg-white border-gray-300 text-gray-900'
      }`}
      style={{ minHeight: '44px' }}
    >
      {!activePersona && <option value="">Select Persona</option>}
      {personas.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
      <option disabled>─────────────</option>
      <option value="__create__">+ Create New</option>
      {activePersona && <option value="__delete__">🗑️ Delete {activePersona.name}</option>}
    </select>
  );
}

export default MobilePersonaSelector;
