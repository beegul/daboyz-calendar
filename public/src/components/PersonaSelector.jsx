import React, { useState, useRef, useEffect } from "react";

/**
 * PersonaSelector Component
 * Dropdown for selecting between existing personas or creating new ones
 * Appears in header after onboarding is complete
 */
function PersonaSelector({
  personas,
  activePersona,
  onSelectPersona,
  onCreateNew,
  onDeletePersona,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null); // Track which persona's menu is open
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setMenuOpen(null);
      }
    };

    if (isOpen || menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, menuOpen]);

  const handleSelectPersona = (persona) => {
    onSelectPersona(persona);
    setIsOpen(false);
    setMenuOpen(null);
  };

  const handleCreateNew = () => {
    onCreateNew();
    setIsOpen(false);
    setMenuOpen(null);
  };

  const handleDeleteClick = (e, persona) => {
    e.stopPropagation();
    if (onDeletePersona) {
      onDeletePersona(persona);
    }
    setIsOpen(false);
    setMenuOpen(null);
  };

  if (!activePersona || !personas || personas.length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Dropdown button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        aria-label="Select persona"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div
          className="w-4 h-4 rounded border border-gray-300 dark:border-gray-500"
          style={{ backgroundColor: activePersona.color }}
          title="Current persona color"
        />
        <span className="font-medium text-gray-900 dark:text-white text-sm">
          {activePersona.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50"
          role="listbox"
        >
          {/* Personas list */}
          <div className="py-1">
            {personas.map((persona) => {
              const isActive =
                persona.name === activePersona.name &&
                persona.color === activePersona.color;
              const personaKey = `${persona.name}-${persona.color}`;
              return (
                <div
                  key={personaKey}
                  className="relative flex items-center group"
                >
                  <button
                    onClick={() => handleSelectPersona(persona)}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900 text-blue-900 dark:text-blue-50"
                        : "hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
                    }`}
                    role="option"
                    aria-selected={isActive}
                  >
                    <div
                      className="w-4 h-4 rounded border border-gray-300"
                      style={{ backgroundColor: persona.color }}
                    />
                    <span className="text-sm font-medium flex-1">{persona.name}</span>
                    {isActive && (
                      <svg
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                  {/* Delete menu button (three dots) */}
                  {onDeletePersona && (
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === personaKey ? null : personaKey);
                        }}
                        className="px-2 py-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                        aria-label={`Delete ${persona.name}`}
                        title={`Delete ${persona.name}`}
                      >
                        ⋯
                      </button>
                      {/* Delete menu */}
                      {menuOpen === personaKey && (
                        <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-700 border border-red-300 dark:border-red-700 rounded-lg shadow-lg z-50">
                          <button
                            onClick={(e) => handleDeleteClick(e, persona)}
                            className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 text-sm font-medium rounded-lg transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-600" />

          {/* Create new persona button */}
          <button
            onClick={handleCreateNew}
            className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-green-50 dark:hover:bg-green-900 text-green-700 dark:text-green-400 transition-colors"
            role="option"
          >
            <span className="text-lg">➕</span>
            <span className="text-sm font-medium">New Persona</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default PersonaSelector;
