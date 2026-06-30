import { useState, useEffect, useRef } from "react";
import "./App.css";
import PersonaOnboarding from "./components/PersonaOnboarding";
import PersonaSelector from "./components/PersonaSelector";
import DeletePersonaModal from "./components/DeletePersonaModal";
import EmptyState from "./components/EmptyState";
import CalendarGrid from "./components/CalendarGrid";
import MonthNavigation from "./components/MonthNavigation";
import DarkModeToggle from "./components/DarkModeToggle";
import OfflineWarning from "./components/OfflineWarning";
import { ToastProvider } from "./context/ToastContext";
import { useAvailability } from "./hooks/useAvailability";
import { useDarkMode } from "./hooks/useDarkMode";
import useDeletePersona from "./hooks/useDeletePersona";
import { usePolling } from "./hooks/usePolling"; // Phase 2: New polling hook
import { useOfflineQueue } from "./hooks/useOfflineQueue"; // Phase 2: Offline queue hook
import { useMobileLayout } from "./hooks/useMobileLayout"; // Phase 2: Responsive layout hook
// Phase 3: Mobile components for responsive layout (lean bundle version)
import MobileHeader from "./components/MobileHeader";
import MobilePersonaSelector from "./components/MobilePersonaSelector";

// Month utility functions
function getIsoMonth(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
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
    reset: resetDeleteState,
  } = useDeletePersona();

  // Fetch personas from API on initial mount to ensure we have the latest list
  // This prevents concurrency issues where personas are created on one device but not synced yet
  useEffect(() => {
    const fetchInitialPersonas = async () => {
      try {
        const res = await fetch("/api/users");
        if (res.ok) {
          const { users: apiList = [] } = await res.json();
          if (apiList.length > 0) {
            // API has personas - merge with localStorage
            const cleanList = apiList.map(({ name, color }) => ({ name, color }));
            
            // Get current localStorage value
            let localPersonas = [];
            try {
              const stored = localStorage.getItem("personas_storage");
              localPersonas = stored ? JSON.parse(stored) : [];
            } catch {
              localPersonas = [];
            }
            
            // Merge: keep all API personas, add any local personas not in API
            const apiNames = new Set(cleanList.map((p) => p.name));
            const onlyLocal = localPersonas.filter((p) => !apiNames.has(p.name));
            const merged = [...cleanList, ...onlyLocal];
            
            // Only update if there are changes
            if (JSON.stringify(merged) !== JSON.stringify(localPersonas)) {
              setPersonas(merged);
              localStorage.setItem("personas_storage", JSON.stringify(merged));
              
              // If activePersona is not in merged list, switch to first persona
              const activeStr = localStorage.getItem("active_persona");
              let activePersona = null;
              try {
                activePersona = activeStr ? JSON.parse(activeStr) : null;
              } catch {
                activePersona = null;
              }
              
              if (activePersona && !merged.some((p) => p.name === activePersona.name)) {
                if (merged.length > 0) {
                  setActivePersona(merged[0]);
                  localStorage.setItem("active_persona", JSON.stringify(merged[0]));
                } else {
                  setActivePersona(null);
                  localStorage.removeItem("active_persona");
                }
              }
            }
          } else {
            // API returned empty list - all personas were deleted on another device
            // Clear local personas and show onboarding
            let localPersonas = [];
            try {
              const stored = localStorage.getItem("personas_storage");
              localPersonas = stored ? JSON.parse(stored) : [];
            } catch {
              localPersonas = [];
            }
            
            if (localPersonas.length > 0) {
              // We have local personas but API says they're all gone
              setPersonas([]);
              localStorage.removeItem("personas_storage");
              localStorage.removeItem("active_persona");
              setActivePersona(null);
              setShowOnboarding(true);
            }
          }
        }
      } catch {
        // Network error - continue with localStorage data
      }
    };

    fetchInitialPersonas();
  }, []); // Run once on mount

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
    allPersonas: apiPersonas,
    syncingStates, // Phase 3: Track syncing cells for visual feedback
  } = useAvailability(isoMonth);

  // Ref so the persona-sync interval can read the latest activePersona without
  // needing it in its dependency array (which would restart the interval on every change).
  const activePersonaRef = useRef(activePersona);
  useEffect(() => {
    activePersonaRef.current = activePersona;
  }, [activePersona]);

  // Phase 2: Replace 3-second interval with 1-second polling using usePolling hook
  // This provides better sync latency (p99 < 500ms) and includes retry logic
  const {
    data: polledPersonas,
    loading: pollingLoading,
    error: pollingError,
    lastSync: pollingLastSync,
    isOnline: isNetworkOnline,
    retry: retryPolling
  } = usePolling('/api/users', { interval: 1000 }); // 1-second polling

  // When polling receives new persona list, sync with local state
  useEffect(() => {
    if (!polledPersonas) return;
    
    const apiList = polledPersonas.users || polledPersonas || [];
    
    // If API returns empty list, check if we have local personas to clean up
    if (apiList.length === 0) {
      if (personas.length > 0) {
        setPersonas([]);
        localStorage.removeItem("personas_storage");
        localStorage.removeItem("active_persona");
        setActivePersona(null);
        setShowOnboarding(true);
      }
      return;
    }

    const apiNames = new Set(apiList.map((p) => p.name));

    // Track if any personas were deleted
    let hadDeletions = false;

    // Sync the persona list: remove deleted ones, add any that are new.
    setPersonas((prev) => {
      const synced = prev.filter((p) => apiNames.has(p.name));
      hadDeletions = synced.length < prev.length;
      
      const localNames = new Set(synced.map((p) => p.name));
      // Keep only name+color from API objects (strip Table Storage metadata)
      const fromAPI = apiList
        .filter((p) => !localNames.has(p.name))
        .map(({ name, color }) => ({ name, color }));
      const result = [...synced, ...fromAPI];
      if (
        result.length === prev.length &&
        fromAPI.length === 0
      )
        return prev; // no change
      localStorage.setItem("personas_storage", JSON.stringify(result));
      return result;
    });

    // If the active persona was deleted on another device, switch immediately.
    const current = activePersonaRef.current;
    if (current && !apiNames.has(current.name)) {
      const cleanList = apiList.map(({ name, color }) => ({ name, color }));
      if (cleanList.length > 0) {
        setActivePersona(cleanList[0]);
        localStorage.setItem("active_persona", JSON.stringify(cleanList[0]));
      } else {
        setActivePersona(null);
        localStorage.removeItem("active_persona");
        setShowOnboarding(true);
      }
    }

    // If ANY persona was deleted, refresh availability to remove their stale entries.
    if (hadDeletions) {
      refetchAvailability();
    }
  }, [polledPersonas, refetchAvailability]);

  // Guardrail: if the active persona becomes invalid for any reason,
  // deterministically fall back to the first available persona.
  useEffect(() => {
    if (!activePersona) return;
    if (personas.some((p) => p.name === activePersona.name)) return;

    if (personas.length > 0) {
      setActivePersona(personas[0]);
      localStorage.setItem("active_persona", JSON.stringify(personas[0]));
      return;
    }

    setActivePersona(null);
    localStorage.removeItem("active_persona");
    setShowOnboarding(true);
  }, [personas, activePersona]);

  const loading = availLoading;
  const error = availError;

  // Phase 2: Offline queue for actions when network is unavailable
  const { queue, enqueue: enqueueOffline, isOnline: queueIsOnline, pendingCount } = useOfflineQueue();

  // Phase 2: Mobile layout detection
  const { isMobile, isTablet, isDesktop } = useMobileLayout();

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

  const handlePersonaCreate = async (newPersona) => {
    // Phase 2: If offline, enqueue the creation for later retry
    if (!queueIsOnline) {
      enqueueOffline({
        type: 'create_persona',
        personaName: newPersona.name,
        value: newPersona.color
      });
      
      // Still update local state optimistically
      const updatedPersonas = [...personas, newPersona];
      setPersonas(updatedPersonas);
      localStorage.setItem("personas_storage", JSON.stringify(updatedPersonas));
      localStorage.setItem("active_persona", JSON.stringify(newPersona));
      setActivePersona(newPersona);
      setShowOnboarding(false);
      return;
    }

    // Online: try to register persona in the backend
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newPersona.name.toLowerCase().replace(/\s+/g, "_"),
          name: newPersona.name,
          color: newPersona.color,
        }),
      });
      
      if (!res.ok) {
        console.warn(`[create] Failed to register persona in Users table: ${res.status}`);
        // Show error but still accept the persona locally
      }
    } catch (err) {
      console.warn("[create] Error registering persona in Users table:", err);
      // If network fails after attempting, enqueue for retry
      enqueueOffline({
        type: 'create_persona',
        personaName: newPersona.name,
        value: newPersona.color
      });
    }

    // After backend registration attempt, update local state
    const updatedPersonas = [...personas, newPersona];
    setPersonas(updatedPersonas);
    localStorage.setItem("personas_storage", JSON.stringify(updatedPersonas));
    localStorage.setItem("active_persona", JSON.stringify(newPersona));
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
    // Always reset delete state before opening modal to ensure clean slate
    resetDeleteState();
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

      const noPersonasLeft = updatedPersonas.length === 0;

      // If deleted persona is active, switch to first remaining or show onboarding
      if (activePersona && activePersona.name === personaName) {
        if (updatedPersonas.length > 0) {
          const newActive = updatedPersonas[0];
          setActivePersona(newActive);
          localStorage.setItem("active_persona", JSON.stringify(newActive));
        } else {
          // No personas left - close modal first, then show onboarding
          setActivePersona(null);
          localStorage.removeItem("active_persona");
          // Don't set showOnboarding here - wait for modal to close
        }
      }

      // Immediately refresh availability to remove deleted persona's dates
      refetchAvailability();

      // Close modal after success (the 3-second polling will handle backend sync)
      setTimeout(() => {
        resetDeleteState();
        setDeleteModalOpen(false);
        setPersonaToDelete(null);
        
        // If no personas left, show onboarding after modal closes
        if (noPersonasLeft) {
          setTimeout(() => {
            setShowOnboarding(true);
          }, 100);
        }
      }, 2000);
    }
  };

  const handleDeleteModalCancel = () => {
    resetDeleteState();
    setDeleteModalOpen(false);
    setPersonaToDelete(null);
  };

  const handleDateClick = async (date) => {
    if (!activePersona) return;

    // Phase 2: If offline, enqueue the availability change for later
    if (!queueIsOnline) {
      const isCurrentlyAvailable = entries.some(
        (e) => e.name === activePersona.name && e.color === activePersona.color && e.date === date
      );
      
      enqueueOffline({
        type: isCurrentlyAvailable ? 'mark_unavailable' : 'mark_available',
        personaName: activePersona.name,
        color: activePersona.color,
        date: date,
        value: !isCurrentlyAvailable
      });
      
      // Optimistically update UI
      await toggleAvailability(activePersona.name, activePersona.color, date);
      return;
    }

    try {
      await toggleAvailability(activePersona.name, activePersona.color, date);
    } catch (err) {
      console.error("Error toggling availability:", err);
      // If error, enqueue for retry
      const isCurrentlyAvailable = entries.some(
        (e) => e.name === activePersona.name && e.color === activePersona.color && e.date === date
      );
      
      enqueueOffline({
        type: isCurrentlyAvailable ? 'mark_unavailable' : 'mark_available',
        personaName: activePersona.name,
        color: activePersona.color,
        date: date,
        value: !isCurrentlyAvailable
      });
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
    <ToastProvider>
      <div
        className={`min-h-screen ${isDarkMode ? "dark bg-gray-900" : "bg-gray-100"}`}
      >
        {/* Offline warning - Phase 2/3: Used for both mobile and desktop */}
        <OfflineWarning isOffline={!isNetworkOnline && !queueIsOnline} pendingCount={pendingCount} />
      
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
            {/* Phase 3: Mobile header */}
            {isMobile && (
              <MobileHeader
                activePersona={activePersona}
                currentMonth={currentMonth}
                isDarkMode={isDarkMode}
                onToggleDarkMode={toggleDarkMode}
                isSyncing={syncingStates.size > 0}
                isOnline={isNetworkOnline}
                pendingCount={pendingCount}
              />
            )}

            {/* Desktop header */}
            {!isMobile && (
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
            )}

            {/* Main content */}
            {!showOnboarding && (
              <main
                className={`${isMobile ? "px-0" : "max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"} ${isDarkMode ? "" : ""}`}
              >
                {/* Error messages */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 dark:border-red-700 border border-red-200 rounded-md text-red-700 dark:text-red-100">
                    <strong>Error:</strong> {error}
                  </div>
                )}

                {/* Phase 3: Mobile persona selector and calendar layout */}
                {isMobile && (
                  <>
                    {/* Mobile persona selector */}
                    <div className="px-4 py-4">
                      {activePersona && (
                        <MobilePersonaSelector
                          personas={personas}
                          activePersona={activePersona}
                          onSelectPersona={handleSelectPersona}
                          onCreateNew={handleCreateNewPersona}
                          onDeletePersona={handleDeletePersonaClick}
                          isDarkMode={isDarkMode}
                        />
                      )}
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
                          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
                        </div>
                      </div>
                    )}

                    {/* Mobile calendar layout - reuse CalendarGrid with responsive container */}
                    {!loading && activePersona && (
                      <div className="px-2 py-4">
                        <CalendarGrid
                          currentMonth={currentMonth}
                          entries={entries}
                          activePersona={activePersona}
                          onDateClick={handleDateClick}
                          onRemoveAvailability={handleRemoveAvailability}
                          isDarkMode={isDarkMode}
                          syncingStates={syncingStates}
                        />
                      </div>
                    )}

                    {/* Month navigation on mobile */}
                    {!loading && activePersona && (
                      <div className="px-4 py-4 flex justify-center gap-2">
                        <button
                          onClick={handlePreviousMonth}
                          className={`px-3 py-2 rounded text-sm font-medium ${
                            isDarkMode
                              ? "bg-gray-700 text-white hover:bg-gray-600"
                              : "bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
                          }`}
                        >
                          ← Previous
                        </button>
                        <button
                          onClick={handleNextMonth}
                          className={`px-3 py-2 rounded text-sm font-medium ${
                            isDarkMode
                              ? "bg-gray-700 text-white hover:bg-gray-600"
                              : "bg-white text-gray-900 hover:bg-gray-100 border border-gray-300"
                          }`}
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Desktop persona selector and calendar */}
                {!isMobile && (
                  <>
                    {/* Status bar */}
                    <div className="mb-6 bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow p-4">
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
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-right ml-4">
                          <div>
                            Last synced:{" "}
                            {lastSync ? new Date(lastSync).toLocaleTimeString() : "Never"}
                          </div>
                          <button
                            onClick={refetchAvailability}
                            disabled={loading}
                            className="mt-2 px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded text-xs hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50"
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
                          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
                        </div>
                      </div>
                    )}

                    {/* Calendar */}
                    {!loading && activePersona && (
                      <div className="bg-white dark:bg-gray-800 dark:border dark:border-gray-700 rounded-lg shadow p-6">
                        <MonthNavigation
                          currentMonth={currentMonth}
                          onPreviousMonth={handlePreviousMonth}
                          onNextMonth={handleNextMonth}
                        />

                        {/* Phase 3: Pass syncing states for visual feedback on syncing dates */}
                        <CalendarGrid
                          currentMonth={currentMonth}
                          entries={entries}
                          activePersona={activePersona}
                          onDateClick={handleDateClick}
                          onRemoveAvailability={handleRemoveAvailability}
                          isDarkMode={isDarkMode}
                          syncingStates={syncingStates}
                        />
                      </div>
                    )}
                  </>
                )}
              </main>
            )}
          </>
        )}
      </div>
    </ToastProvider>
  );
}
