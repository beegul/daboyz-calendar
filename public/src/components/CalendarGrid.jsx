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
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-4 py-3 text-center font-semibold text-gray-700 text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid with month transition animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMonth.toISOString().split('T')[0]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
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

          return (
            <div
              key={index}
              className={`
                min-h-24 p-2 border border-gray-200
                ${isCurrentMonth ? "bg-white" : "bg-gray-50"}
                ${isToday ? "bg-blue-50" : ""}
                ${!date ? "cursor-default" : "cursor-pointer hover:bg-blue-100 transition-colors"}
              `}
              onClick={() => handleDateClick(date)}
            >
              {date && (
                <>
                  <div
                    className={`
                    text-sm font-semibold mb-1
                    ${isCurrentMonth ? "text-gray-900" : "text-gray-400"}
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
