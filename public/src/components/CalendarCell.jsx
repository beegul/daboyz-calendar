/**
 * CalendarCell Component: Individual calendar date cell with optimistic updates
 * 
 * Features:
 * - Displays person availability for a date
 * - Color-coded by persona
 * - Optimistic update on click (instant feedback)
 * - Loading shimmer animation
 * - Error rollback with smooth animation
 * - Touch target ≥44×44px (mobile-friendly)
 * 
 * Props:
 * - date (Date): Cell date
 * - personas (array): Available personas
 * - availability (object): Current availability state {personaName: boolean}
 * - onToggle (function): Async callback when persona availability toggled
 * - isLoading (boolean): Show loading state
 */

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { getPreset } from '../utils/motionConfig'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const personaColors = {
  default: 'bg-gray-100',
  alex: 'bg-red-200',
  bobby: 'bg-blue-200',
  charlie: 'bg-green-200',
  dakota: 'bg-purple-200',
}

export const CalendarCell = ({
  date,
  personas = [],
  availability = {},
  onToggle = async () => {},
  isLoading = false,
}) => {
  const [localAvailability, setLocalAvailability] = useState(availability)
  const [isUpdating, setIsUpdating] = useState(false)
  const userPreferences = usePrefersReducedMotion()

  const dateStr = date.toISOString().split('T')[0]
  const isToday = new Date().toDateString() === date.toDateString()

  const handleToggle = async (personaName) => {
    if (isUpdating) return

    // Optimistic update - instant UI feedback
    const oldValue = localAvailability[personaName]
    setLocalAvailability(prev => ({
      ...prev,
      [personaName]: !prev[personaName],
    }))
    setIsUpdating(true)

    try {
      // Call backend async
      await onToggle(dateStr, personaName, !oldValue)
    } catch (error) {
      // Rollback on error
      setLocalAvailability(prev => ({
        ...prev,
        [personaName]: oldValue,
      }))
    } finally {
      setIsUpdating(false)
    }
  }

  const fillPreset = getPreset('cellFill', userPreferences)

  return (
    <motion.div
      className={`
        border border-gray-200 rounded p-2 min-h-[60px]
        ${isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'}
        hover:shadow-md transition-shadow
      `}
      layout
    >
      {/* Date header */}
      <div className="text-xs font-semibold text-gray-600 mb-1">
        {date.getDate()}
      </div>

      {/* Personas grid */}
      <div className="grid gap-1">
        {personas.map((persona) => {
          const isAvailable = localAvailability[persona.name]
          const bgColor = isAvailable ? personaColors[persona.name] || personaColors.default : 'bg-gray-100'

          return (
            <motion.button
              key={persona.name}
              onClick={() => handleToggle(persona.name)}
              disabled={isUpdating}
              className={`
                w-full px-2 py-1.5 rounded text-xs font-medium text-center
                min-h-[44px] flex items-center justify-center
                ${bgColor}
                hover:opacity-80 transition-opacity
                disabled:opacity-50 disabled:cursor-not-allowed
                focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-400
              `}
              layout
              animate={{
                backgroundColor: isAvailable ? '#e0e7ff' : '#f3f4f6',
              }}
              transition={fillPreset}
              aria-label={`${persona.name} on ${date.toLocaleDateString()}`}
              aria-pressed={isAvailable}
            >
              {/* Shimmer loading overlay */}
              {isUpdating && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                  animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{ backgroundSize: '200% 100%' }}
                />
              )}

              {/* Persona name and status */}
              <span className="relative">
                {persona.name} {isAvailable ? '✓' : '✗'}
              </span>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  )
}
