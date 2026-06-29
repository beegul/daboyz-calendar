import React, { useState } from 'react';
import { MotionModal } from './MotionModal';
import { MotionButton } from './MotionButton';

/**
 * DeletePersonaModal Component
 * Displays a confirmation dialog for deleting a persona and all its calendar entries.
 * 
 * Props:
 * - isOpen: boolean - Whether modal is visible
 * - personaName: string - Name of persona to delete
 * - onConfirm: function - Called when user confirms deletion
 * - onCancel: function - Called when user cancels deletion
 * - isDeleting: boolean - Whether deletion is in progress
 * - deleteSuccess: boolean - Whether deletion succeeded
 * - error: string - Error message if deletion failed
 * - onRetry: function - Called when user clicks Retry after error
 */
const DeletePersonaModal = ({
  isOpen,
  personaName,
  onConfirm,
  onCancel,
  isDeleting = false,
  deleteSuccess = false,
  error = null,
  onRetry,
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);

  // Update visibility when isOpen prop changes
  React.useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  if (!isVisible) {
    return null;
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(personaName);
    }
  };

  const handleCancel = () => {
    setIsVisible(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (onConfirm) {
      onConfirm(personaName);
    }
  };

  return (
    <MotionModal
      isOpen={isVisible}
      onClose={handleCancel}
      title={
        !deleteSuccess && !error
          ? `Delete ${personaName}?`
          : deleteSuccess
            ? '✓ Persona Deleted'
            : '✗ Deletion Failed'
      }
    >
      {!deleteSuccess && !error && (
        <>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This will remove {personaName} and all their calendar entries. This
            cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <MotionButton
              variant="secondary"
              onClick={handleCancel}
              disabled={isDeleting}
            >
              Cancel
            </MotionButton>
            <MotionButton
              variant="danger"
              onClick={handleConfirm}
              disabled={isDeleting}
              isLoading={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </MotionButton>
          </div>
        </>
      )}

      {deleteSuccess && (
        <>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {personaName} and all their calendar entries have been removed.
          </p>
          <div className="flex gap-3 justify-end">
            <MotionButton variant="primary" onClick={handleCancel}>
              Close
            </MotionButton>
          </div>
        </>
      )}

      {error && (
        <>
          <p className="text-red-600 dark:text-red-400 mb-6 font-medium">{error}</p>
          <div className="flex gap-3 justify-end">
            <MotionButton
              variant="secondary"
              onClick={handleCancel}
            >
              Cancel
            </MotionButton>
            <MotionButton
              variant="primary"
              onClick={handleRetry}
            >
              Retry
            </MotionButton>
          </div>
        </>
      )}
    </MotionModal>
  );
};

export default DeletePersonaModal;
