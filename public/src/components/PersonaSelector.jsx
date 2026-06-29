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
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectPersona = (persona) => {
    onSelectPersona(persona);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    onCreateNew();
    setIsOpen(false);
  };

  if (!activePersona || !personas || personas.length === 0) {
    return null;
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Dropdown button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        aria-label="Select persona"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div
          className="w-4 h-4 rounded border border-gray-300"
          style={{ backgroundColor: activePersona.color }}
          title="Current persona color"
        />
        <span className="font-medium text-gray-900 text-sm">
          {activePersona.name}
        </span>
        <svg
          className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
          className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-50"
          role="listbox"
        >
          {/* Personas list */}
          <div className="py-1">
            {personas.map((persona) => {
              const isActive =
                persona.name === activePersona.name &&
                persona.color === activePersona.color;
              return (
                <button
                  key={`${persona.name}-${persona.color}`}
                  onClick={() => handleSelectPersona(persona)}
                  className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-900"
                      : "hover:bg-gray-100 text-gray-900"
                  }`}
                  role="option"
                  aria-selected={isActive}
                >
                  <div
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: persona.color }}
                  />
                  <span className="text-sm font-medium">{persona.name}</span>
                  {isActive && (
                    <svg
                      className="w-4 h-4 ml-auto text-blue-600"
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
              );
            })}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Create new persona button */}
          <button
            onClick={handleCreateNew}
            className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-green-50 text-green-700 transition-colors"
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
