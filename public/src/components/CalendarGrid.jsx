import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AvailabilityBadge from "./AvailabilityBadge";
import AvailabilityModal from "./AvailabilityModal";

function getDaysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function getFirstDayOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

export default function CalendarGrid({
  currentMonth,
  entries,
  activePersona,
  onDateClick,
  onRemoveAvailability,
  isDarkMode = false,
  syncingStates = new Set(), // Phase 3: Track which cells are syncing
}) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    date: null,
    personas: [],
    triggerRef: null,
  });

  const handleShowAllPersonas = (personas, triggerRef, date) => {
    setModalState({
      isOpen: true,
      date,
      personas,
      triggerRef,
    });
  };

  const handleCloseModal = () => {
    setModalState({
      isOpen: false,
      date: null,
      personas: [],
      triggerRef: null,
    });
  };
  const calendarDays = useMemo(() => {
    const firstDay = getFirstDayOfMonth(currentMonth);
    const daysInMonth = getDaysInMonth(currentMonth);
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day,
      );
      days.push(date);
    }

    return days;
  }, [currentMonth]);

  const getAvailabilityForDate = (date) => {
    if (!date) return [];

    const dateStr = formatDate(date);
    return entries.filter((e) => e.date === dateStr);
  };

  const handleDateClick = (date) => {
    if (!date || !activePersona) return;

    const dateStr = formatDate(date);
    onDateClick(dateStr);
  };

  const handleRemoveUser = (date, name, color) => {
    if (!date) return;
    const dateStr = formatDate(date);
    onRemoveAvailability(name, color, dateStr);
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-200 text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid with month transition animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMonth.toISOString().split('T')[0]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
          className="grid grid-cols-7"
        >
        {calendarDays.map((date, index) => {
          const availability = date ? getAvailabilityForDate(date) : [];
          const isCurrentMonth =
            date && date.getMonth() === currentMonth.getMonth();
          const isToday =
            date && date.toDateString() === new Date().toDateString();
          const isSelected =
            date &&
            activePersona &&
            availability.some(
              (e) =>
                e.name === activePersona.name &&
                e.color === activePersona.color,
            );
          
          // Phase 3: Check if this cell is syncing
          const dateStr = date ? formatDate(date) : null;
          const syncKey = activePersona ? `${activePersona.name}|${activePersona.color}|${dateStr}` : null;
          const isSyncing = syncKey && syncingStates.has(syncKey);

          return (
            <div
              key={index}
              className={`
                min-h-24 p-2 border border-gray-200 dark:border-gray-600 relative
                ${isCurrentMonth ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700"}
                ${isToday ? "bg-blue-50 dark:bg-blue-900" : ""}
                ${!date ? "cursor-default" : "cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"}
                ${isSyncing ? "opacity-75" : ""}
              `}
              onClick={() => handleDateClick(date)}
            >
              {date && (
                <>
                  <div
                    className={`
                    text-sm font-semibold mb-1
                    ${isCurrentMonth ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}
                    ${isToday ? "text-blue-600" : ""}
                  `}
                  >
                    {date.getDate()}
                  </div>

                  {availability.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <AvailabilityBadge
                        entries={availability}
                        onRemove={(name, color) =>
                          handleRemoveUser(date, name, color)
                        }
                        onShowAll={(personas, triggerRef) =>
                          handleShowAllPersonas(personas, triggerRef, date)
                        }
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  )}

                  {activePersona && !isSelected && (
                    <div className="text-xs text-gray-400 mt-1">
                      Click to mark
                    </div>
                  )}
                  
                  {/* Phase 3: Show syncing indicator */}
                  {isSyncing && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-blue-50/50 dark:bg-blue-900/50 rounded"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      <div className="w-4 h-4 rounded-full border-2 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
                    </motion.div>
                  )}
                </>
              )}
            </div>
          );
        })}
        </motion.div>
      </AnimatePresence>

      {/* Availability Modal - Shows all personas for a date */}
      <AvailabilityModal
        isOpen={modalState.isOpen}
        date={modalState.date}
        personas={modalState.personas}
        onClose={handleCloseModal}
        isDarkMode={isDarkMode}
        triggerRef={modalState.triggerRef}
      />
    </div>
  );
}
