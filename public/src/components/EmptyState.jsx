import React from 'react';

/**
 * EmptyState Component
 * Shown when no personas exist in the app
 */
const EmptyState = ({ onCreatePersona }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-4">📅</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          No Personas Yet
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          Create your first persona to get started tracking availability with your mates.
        </p>
        <button
          onClick={onCreatePersona}
          className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          aria-label="Create your first persona"
        >
          ✨ Create Persona
        </button>
      </div>
    </div>
  );
};

export default EmptyState;
