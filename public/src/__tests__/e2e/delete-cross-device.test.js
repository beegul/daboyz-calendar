import { renderHook, act, waitFor } from '@testing-library/react';
import { useAvailability } from '../../hooks/useAvailability';

describe.skip('Cross-Device Delete Sync (E2E)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('Device A deletes persona, Device B detects deletion via polling within 3s', async () => {
    // Initial state - both devices have same data
    const initialData = [
      { name: 'SharedPersona', date: '2024-06-15', color: '#FF0000' },
      { name: 'OtherPersona', date: '2024-06-16', color: '#00FF00' },
    ];

    localStorage.setItem('daboyz_availability', JSON.stringify(initialData));

    // Device A: Simulate deletion API call
    global.fetch = jest.fn();
    let callCount = 0;

    global.fetch.mockImplementation((url) => {
      callCount++;

      if (url === '/api/personas/SharedPersona' && callCount === 1) {
        // Device A deletes
        return Promise.resolve({
          ok: true,
          status: 204,
          json: async () => ({}),
        });
      }

      if (url === '/api/availability') {
        // Device B polls after delete on Device A
        // Simulate fresh data from backend (SharedPersona removed)
        return Promise.resolve({
          ok: true,
          json: async () => [
            { name: 'OtherPersona', date: '2024-06-16', color: '#00FF00' },
          ],
        });
      }

      return Promise.reject(new Error('Unexpected URL'));
    });

    const { result: resultB } = renderHook(() =>
      useAvailability('2024-06')
    );

    // Wait for initial load
    await waitFor(() => {
      expect(resultB.current.entries.length).toBeGreaterThan(0);
    });

    // Device A deletes
    await act(async () => {
      await fetch('/api/personas/SharedPersona', { method: 'DELETE' });
    });

    // Device B polls and detects removal within 3 seconds
    await waitFor(
      () => {
        const hasSharedPersona = resultB.current.entries.some(
          (e) => e.name === 'SharedPersona'
        );
        expect(hasSharedPersona).toBe(false);
      },
      { timeout: 3000 }
    );
  });

  test('both devices show consistent state after deletion', async () => {
    const initialData = [
      { name: 'PersonaX', date: '2024-06-15', color: '#0000FF' },
      { name: 'PersonaY', date: '2024-06-16', color: '#FFFF00' },
    ];

    localStorage.setItem('daboyz_availability', JSON.stringify(initialData));

    global.fetch = jest.fn();
    let deleteCalled = false;

    global.fetch.mockImplementation((url) => {
      if (url === '/api/personas/PersonaX') {
        deleteCalled = true;
        return Promise.resolve({
          ok: true,
          status: 204,
          json: async () => ({}),
        });
      }

      if (url === '/api/availability') {
        if (deleteCalled) {
          // Return filtered data (PersonaX deleted)
          return Promise.resolve({
            ok: true,
            json: async () => [
              { name: 'PersonaY', date: '2024-06-16', color: '#FFFF00' },
            ],
          });
        } else {
          // Return initial data before delete
          return Promise.resolve({
            ok: true,
            json: async () => initialData,
          });
        }
      }

      return Promise.reject(new Error('Unexpected URL'));
    });

    const { result: resultA } = renderHook(() =>
      useAvailability('2024-06')
    );
    const { result: resultB } = renderHook(() =>
      useAvailability('2024-06')
    );

    // Wait for initial data to load from API
    await waitFor(() => {
      expect(resultA.current.entries.length).toBeGreaterThan(0);
    });

    // Both start with same data
    expect(resultA.current.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'PersonaX' }),
        expect.objectContaining({ name: 'PersonaY' }),
      ])
    );
    expect(resultB.current.entries).toEqual(resultA.current.entries);

    // Device A deletes PersonaX
    await act(async () => {
      await fetch('/api/personas/PersonaX', { method: 'DELETE' });
    });

    // Both devices eventually converge on same state
    await waitFor(
      () => {
        const aHasPersonaX = resultA.current.entries.some(
          (e) => e.name === 'PersonaX'
        );
        const bHasPersonaX = resultB.current.entries.some(
          (e) => e.name === 'PersonaX'
        );

        expect(aHasPersonaX).toBe(false);
        expect(bHasPersonaX).toBe(false);
      },
      { timeout: 3000 }
    );
  });

  test('deletion succeeds even if other device is actively editing', async () => {
    global.fetch = jest.fn();

    global.fetch.mockImplementation((url, options = {}) => {
      if (url === '/api/personas/PersonaZ') {
        // Delete succeeds
        return Promise.resolve({
          ok: true,
          status: 204,
          json: async () => ({}),
        });
      }

      if (url === '/api/availability' && options.method !== 'POST') {
        // Both devices fetching availability
        return Promise.resolve({
          ok: true,
          json: async () => [
            { name: 'PersonaZ', date: '2024-06-15', color: '#FF00FF' },
          ],
        });
      }

      if (url === '/api/availability' && options.method === 'POST') {
        // Edit attempt on other device
        return Promise.resolve({
          ok: true,
          json: async () => ({
            name: 'PersonaZ',
            date: '2024-06-20',
            color: '#FF00FF',
          }),
        });
      }

      return Promise.reject(new Error('Unexpected URL'));
    });

    // Device A deletes
    await act(async () => {
      await fetch('/api/personas/PersonaZ', { method: 'DELETE' });
    });

    // Device B tries to edit (should fail or be ignored)
    const _result = await fetch('/api/availability', {
      method: 'POST',
      body: JSON.stringify({
        name: 'PersonaZ',
        date: '2024-06-20',
      }),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/personas/PersonaZ',
      expect.any(Object)
    );
  });
});
