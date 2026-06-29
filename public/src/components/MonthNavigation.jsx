import React from "react";

function getMonthLabel(date) {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function MonthNavigation({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
}) {
  const label = getMonthLabel(currentMonth);

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <button
        onClick={onPreviousMonth}
        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        aria-label="Previous month"
      >
        ← Previous
      </button>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white min-w-[200px] text-center">
        {label}
      </h2>

      <button
        onClick={onNextMonth}
        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        aria-label="Next month"
      >
        Next →
      </button>
    </div>
  );
}
