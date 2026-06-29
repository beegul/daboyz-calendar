import { useState, useCallback } from 'react';

/**
 * useDeletePersona Hook
 * Handles persona deletion via DELETE /api/personas/{name} endpoint
 * and updates local state to remove deleted persona's entries.
 * 
 * Returns:
 * - deletePersona(name): async function to delete persona
 * - isDeleting: boolean indicating deletion in progress
 * - error: error message or null
 * - success: boolean indicating successful deletion
 */
const useDeletePersona = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const deletePersona = useCallback(async (personaName) => {
    if (!personaName || typeof personaName !== 'string') {
      setError('Invalid persona name');
      return false;
    }

    setIsDeleting(true);
    setError(null);
    setSuccess(false);

    try {
      // Call DELETE /api/personas/{name}
      const encodedName = encodeURIComponent(personaName);
      const response = await fetch(`/api/personas/${encodedName}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to delete persona: ${response.status}`
        );
      }

      // Success! Log for debugging
      console.log(`[delete] Successfully deleted persona: ${personaName}`);

      // Remove persona from localStorage
      try {
        const stored = localStorage.getItem('daboyz_availability');
        if (stored) {
          const entries = JSON.parse(stored);
          const filtered = entries.filter((e) => e.name !== personaName);
          localStorage.setItem('daboyz_availability', JSON.stringify(filtered));
        }
      } catch (storageError) {
        console.warn('[delete] Error updating localStorage:', storageError);
      }

      setSuccess(true);
      setIsDeleting(false);
      return true;
    } catch (err) {
      console.error(`[delete] Error deleting persona ${personaName}:`, err);
      setError(err.message || 'Failed to delete persona');
      setIsDeleting(false);
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return {
    deletePersona,
    isDeleting,
    error,
    success,
    reset,
  };
};

export default useDeletePersona;
