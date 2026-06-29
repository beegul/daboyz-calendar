import React, { useState } from 'react';
import './DeletePersonaModal.css';

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
    <div className="modal-overlay" onClick={handleCancel}>
      <div
        className="delete-persona-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
        onClick={(e) => e.stopPropagation()}
      >
        {!deleteSuccess && !error && (
          <>
            <h2 id="delete-modal-title" className="modal-title">
              Delete {personaName}?
            </h2>
            <p id="delete-modal-description" className="modal-description">
              This will remove {personaName} and all their calendar entries. This
              cannot be undone.
            </p>
            <div className="modal-buttons">
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={isDeleting}
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirm}
                disabled={isDeleting}
                aria-busy={isDeleting}
                aria-label={isDeleting ? 'Deleting...' : 'Delete persona'}
              >
                {isDeleting ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </>
        )}

        {deleteSuccess && (
          <>
            <h2 className="modal-title success">✓ Persona Deleted</h2>
            <p className="modal-description">
              {personaName} and all their calendar entries have been removed.
            </p>
            <div className="modal-buttons">
              <button
                className="btn btn-primary"
                onClick={handleCancel}
                aria-label="Close success message"
              >
                Close
              </button>
            </div>
          </>
        )}

        {error && (
          <>
            <h2 className="modal-title error">✗ Deletion Failed</h2>
            <p className="modal-description error-message">{error}</p>
            <div className="modal-buttons">
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleRetry}
                aria-label="Retry deletion"
              >
                Retry
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeletePersonaModal;
