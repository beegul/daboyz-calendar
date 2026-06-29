import { useState, useEffect } from "react";
import "./App.css";
import PersonaOnboarding from "./components/PersonaOnboarding";
import PersonaSelector from "./components/PersonaSelector";
import DeletePersonaModal from "./components/DeletePersonaModal";
import EmptyState from "./components/EmptyState";
import CalendarGrid from "./components/CalendarGrid";
import MonthNavigation from "./components/MonthNavigation";
import DarkModeToggle from "./components/DarkModeToggle";
import OfflineWarning from "./components/OfflineWarning";
import { useAvailability } from "./hooks/useAvailability";
import { useDarkMode } from "./hooks/useDarkMode";
import useDeletePersona from "./hooks/useDeletePersona";

// Month utility functions
function getIsoMonth(date) {
  return date.toISOString().split("T")[0].slice(0, 7);
}

export default function App() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return today;
  });

  // Dark mode state
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Persona state — initialised synchronously from localStorage to prevent flicker.
  // Reading in the useState initializer runs before the first render (no useEffect delay).
  const [personas, setPersonas] = useState(() => {
    try {
      const stored = localStorage.getItem("personas_storage");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activePersona, setActivePersona] = useState(() => {
    try {
      const storedActive = localStorage.getItem("active_persona");
      if (storedActive) return JSON.parse(storedActive);
      // Fall back to first persona in list
      const storedPersonas = localStorage.getItem("personas_storage");
      if (storedPersonas) {
        const arr = JSON.parse(storedPersonas);
        return arr.length > 0 ? arr[0] : null;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      const stored = localStorage.getItem("personas_storage");
      const arr = stored ? JSON.parse(stored) : [];
      return arr.length === 0;
    } catch {
      return true;
    }
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState(null);

  // Delete persona hook
  const {
    deletePersona,
    isDeleting: isDeleteInProgress,
    error: deleteError,
    success: deleteSuccess,
  } = useDeletePersona();

  // Load availability data
  const isoMonth = getIsoMonth(currentMonth);
  const {
    entries,
    loading: availLoading,
    error: availError,
    lastSync,
    toggleAvailability,
    deleteAvailability,
    refetch: refetchAvailability,
    useMockAPI,
  } = useAvailability(isoMonth);

  const loading = availLoading;
  const error = availError;

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handlePersonaCreate = (newPersona) => {
    // Add new persona to list
    const updatedPersonas = [...personas, newPersona];
    setPersonas(updatedPersonas);

    // Store in localStorage
    localStorage.setItem("personas_storage", JSON.stringify(updatedPersonas));
    localStorage.setItem("active_persona", JSON.stringify(newPersona));

    // Set as active persona
    setActivePersona(newPersona);
    setShowOnboarding(false);
  };

  const handleSelectPersona = (persona) => {
    // Update active persona
    setActivePersona(persona);
    localStorage.setItem("active_persona", JSON.stringify(persona));
  };

  const handleCreateNewPersona = () => {
    // Show onboarding modal
    setShowOnboarding(true);
  };

  const handleDeletePersonaClick = (persona) => {
    // Show delete confirmation modal
    setPersonaToDelete(persona);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async (personaName) => {
    if (!personaName) return;

    // Call delete API
    const success = await deletePersona(personaName);

    if (success) {
      // Remove from personas list
      const updatedPersonas = personas.filter(
        (p) => p.name !== personaName
      );
      setPersonas(updatedPersonas);
      localStorage.setItem(
        "personas_storage",
        JSON.stringify(updatedPersonas)
      );

      // If deleted persona is active, switch to first remaining or show onboarding
      if (activePersona && activePersona.name === personaName) {
        if (updatedPersonas.length > 0) {
          const newActive = updatedPersonas[0];
          setActivePersona(newActive);
          localStorage.setItem("active_persona", JSON.stringify(newActive));
        } else {
          // No personas left - show onboarding
          setActivePersona(null);
          localStorage.removeItem("active_persona");
          setShowOnboarding(true);
        }
      }

      // Close modal after success (after brief delay to show success message)
      setTimeout(() => {
        setDeleteModalOpen(false);
        setPersonaToDelete(null);
      }, 2000);
    }
  };

  const handleDeleteModalCancel = () => {
    setDeleteModalOpen(false);
    setPersonaToDelete(null);
  };

  const handleDateClick = async (date) => {
    if (!activePersona) return;

    try {
      await toggleAvailability(activePersona.name, activePersona.color, date);
    } catch (err) {
      console.error("Error toggling availability:", err);
    }
  };

  const handleRemoveAvailability = async (name, color, date) => {
    try {
      await deleteAvailability(name, color, date);
    } catch (err) {
      console.error("Error removing availability:", err);
    }
  };

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-gray-100"}`}
    >
      {/* Offline warning banner */}
      <OfflineWarning isOffline={useMockAPI} />
      
      {/* Persona Onboarding Modal */}
      {showOnboarding && (
        <PersonaOnboarding onPersonaCreate={handlePersonaCreate} />
      )}

      {/* Delete Persona Modal */}
      <DeletePersonaModal
        isOpen={deleteModalOpen}
        personaName={personaToDelete?.name}
        onConfirm={handleConfirmDelete}
        onCancel={handleDeleteModalCancel}
        isDeleting={isDeleteInProgress}
        deleteSuccess={deleteSuccess}
        error={deleteError}
      />

      {/* Empty state - no personas */}
      {!showOnboarding && personas.length === 0 && (
        <EmptyState onCreatePersona={handleCreateNewPersona} />
      )}

      {/* Normal layout - when personas exist */}
      {(showOnboarding || personas.length > 0) && (
        <>
          <header
            className={`${isDarkMode ? "bg-gray-800 border-b border-gray-700" : "bg-white"} shadow`}
          >
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h1
                    className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
                  >
                    Da Boyz Availability Calender
                  </h1>
                  <p
                    className={`${isDarkMode ? "text-gray-400" : "text-gray-600"} mt-2`}
                  >
                    {activePersona
                      ? `Logged in as: ${activePersona.name}`
                      : "Create your persona to get started"}
                  </p>
                </div>
                <div className="ml-4">
                  <DarkModeToggle
                    isDarkMode={isDarkMode}
                    onChange={toggleDarkMode}
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Main content */}
          {!showOnboarding && (
            <main
              className={`max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ${isDarkMode ? "" : ""}`}
            >
              {/* Error messages */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
                  <strong>Error:</strong> {error}
                </div>
              )}

              {/* Status bar */}
              <div className="mb-6 bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {activePersona && (
                      <PersonaSelector
                        personas={personas}
                        activePersona={activePersona}
                        onSelectPersona={handleSelectPersona}
                        onCreateNew={handleCreateNewPersona}
                        onDeletePersona={handleDeletePersonaClick}
                      />
                    )}
                  </div>
                  <div className="text-xs text-gray-500 text-right ml-4">
                    <div>
                      Last synced:{" "}
                      {lastSync ? new Date(lastSync).toLocaleTimeString() : "Never"}
                    </div>
                    <button
                      onClick={refetchAvailability}
                      disabled={loading}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                      title="Manually refresh data from server"
                    >
                      🔄 Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading state */}
              {loading && (
                <div
                  className="text-center py-8"
                  aria-busy="true"
                  aria-label="Loading calendar data"
                  role="status"
                >
                  <div className="inline-block">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                    <p className="mt-2 text-gray-600">Loading...</p>
                  </div>
                </div>
              )}

              {/* Calendar */}
              {!loading && activePersona && (
                <div className="bg-white rounded-lg shadow p-6">
                  <MonthNavigation
                    currentMonth={currentMonth}
                    onPreviousMonth={handlePreviousMonth}
                    onNextMonth={handleNextMonth}
                  />

                  <CalendarGrid
                    currentMonth={currentMonth}
                    entries={entries}
                    activePersona={activePersona}
                    onDateClick={handleDateClick}
                    onRemoveAvailability={handleRemoveAvailability}
                    isDarkMode={isDarkMode}
                  />
                </div>
              )}
            </main>
          )}
        </>
      )}
    </div>
  );
}
