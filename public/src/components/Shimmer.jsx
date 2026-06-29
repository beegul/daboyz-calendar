/**
 * Shimmer Component (T039 - Optimistic UI Loading)
 * Pulsing gradient animation for loading states
 */

import React from 'react'
import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export const Shimmer = ({ isLoading = true, children }) => {
  const prefersReduced = usePrefersReducedMotion()

  if (!isLoading) return children

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.3 }}
      className="relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer" />
      {children}
    </motion.div>
  )
}

export default Shimmer
