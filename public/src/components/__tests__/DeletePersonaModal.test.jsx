import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeletePersonaModal from '../DeletePersonaModal';

describe('DeletePersonaModal Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with persona name in confirmation text', () => {
    render(
      <DeletePersonaModal
        personaName="Alice"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isOpen
      />
    );

    expect(screen.getByText(/Delete Alice\?/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /This will remove Alice and all their calendar entries/i
      )
    ).toBeInTheDocument();
  });

  test('Cancel button closes modal without calling API', () => {
    render(
      <DeletePersonaModal
        personaName="Bob"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isOpen
      />
    );

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  test('Delete button calls onConfirm callback', async () => {
    render(
      <DeletePersonaModal
        personaName="Charlie"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isOpen
      />
    );

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledWith('Charlie');
    });
  });

  test('shows loading spinner during deletion', async () => {
    const { rerender } = render(
      <DeletePersonaModal
        personaName="Diana"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isOpen
        isDeleting={false}
      />
    );

    rerender(
      <DeletePersonaModal
        personaName="Diana"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isOpen
        isDeleting
      />
    );

    expect(screen.getByText(/Deleting/i)).toBeInTheDocument();
  });

  test('shows success message after deletion', async () => {
    const { rerender } = render(
      <DeletePersonaModal
        personaName="Eve"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isOpen
        isDeleting
      />
    );

    rerender(
      <DeletePersonaModal
        personaName="Eve"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isOpen
        isDeleting={false}
        deleteSuccess
      />
    );

    expect(screen.getByText(/Persona Deleted/i)).toBeInTheDocument();
  });

  test('shows error message and retry button on deletion failure', async () => {
    render(
      <DeletePersonaModal
        personaName="Frank"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isOpen
        isDeleting={false}
        error="Network error occurred"
      />
    );

    expect(screen.getByText(/Network error occurred/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });

  test('has ARIA modal attributes for accessibility', () => {
    const { container } = render(
      <DeletePersonaModal
        personaName="Grace"
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isOpen
      />
    );

    const modal = container.querySelector('[role="dialog"]');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby');
  });
});
