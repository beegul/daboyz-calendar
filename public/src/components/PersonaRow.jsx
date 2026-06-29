/**
 * PersonaRow Component: Displays persona with delete action and hover animations
 * 
 * Features:
 * - Hover animation: background highlight + left border accent slide-in
 * - Delete button visibility on hover
 * - Delete animation: slide left 300ms + fade out
 * - Touch target ≥44×44px
 * 
 * Props:
 * - persona (object): {name, color}
 * - onDelete (function): Async delete callback
 * - onEdit (function): Edit callback
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getPreset } from '../utils/motionConfig'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { MotionButton } from './MotionButton'

export const PersonaRow = ({
  persona,
  onDelete = async () => {},
  onEdit = () => {},
  index = 0,
}) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const userPreferences = usePrefersReducedMotion()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(persona.name)
    } catch (error) {
      setIsDeleting(false)
    }
  }

  const personaColors = {
    alex: 'bg-red-100 border-red-300',
    bobby: 'bg-blue-100 border-blue-300',
    charlie: 'bg-green-100 border-green-300',
    dakota: 'bg-purple-100 border-purple-300',
  }

  const bgClass = personaColors[persona.name] || 'bg-gray-100 border-gray-300'

  return (
    <AnimatePresence mode="popLayout">
      {!isDeleting && (
        <motion.div
          key={persona.name}
          layout
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onHoverStart={() => setIsHovering(true)}
          onHoverEnd={() => setIsHovering(false)}
          className={`
            flex items-center gap-3 p-3 rounded-lg border-l-4 transition-all
            ${bgClass}
            ${isHovering && !userPreferences ? 'bg-opacity-80 shadow-md' : ''}
            min-h-[56px]
          `}
        >
          {/* Left border accent - slides in on hover */}
          <motion.div
            animate={isHovering && !userPreferences ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-0 bottom-0 w-1 bg-current opacity-50 origin-left"
          />

          {/* Persona name and color swatch */}
          <div className="flex items-center gap-3 flex-grow">
            <div
              className="w-6 h-6 rounded-full border-2 border-current"
              style={{
                backgroundColor: persona.color || '#ddd',
              }}
              aria-label={`${persona.name}'s color`}
            />
            <span className="font-medium text-gray-900">{persona.name}</span>
          </div>

          {/* Action buttons - visible on hover or mobile */}
          <motion.div
            animate={
              isHovering && !userPreferences
                ? { opacity: 1, x: 0 }
                : { opacity: 0.5, x: 10 }
            }
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2 min-h-[44px]"
          >
            <MotionButton
              size="sm"
              variant="secondary"
              onClick={() => onEdit(persona.name)}
              className="text-sm"
            >
              Edit
            </MotionButton>
            <MotionButton
              size="sm"
              variant="danger"
              onClick={handleDelete}
              isLoading={isDeleting}
              disabled={isDeleting}
              className="text-sm"
            >
              Delete
            </MotionButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
