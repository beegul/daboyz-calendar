import { renderHook, act } from '@testing-library/react';
import useDeletePersona from '../../hooks/useDeletePersona';

describe('Cascade Delete Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('deletes persona via API', async () => {
    global.fetch = jest.fn((url) => {
      if (url === '/api/personas/TestPersona') {
        return Promise.resolve({
          ok: true,
          status: 204,
          json: async () => ({ success: true }),
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    const { result } = renderHook(() => useDeletePersona());

    await act(async () => {
      await result.current.deletePersona('TestPersona');
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/personas/TestPersona', expect.objectContaining({
      method: 'DELETE',
    }));
  });

  test('verifies all availability entries for deleted persona removed', async () => {
    // Set up initial data with two personas
    const initialData = [
      { name: 'Alice', date: '2024-06-15', color: '#FF0000' },
      { name: 'Alice', date: '2024-06-16', color: '#FF0000' },
      { name: 'Bob', date: '2024-06-15', color: '#00FF00' },
      { name: 'Bob', date: '2024-06-17', color: '#00FF00' },
    ];

    localStorage.setItem('daboyz_availability', JSON.stringify(initialData));

    global.fetch = jest.fn((url) => {
      if (url === '/api/personas/Alice') {
        // Simulate backend removing Alice's entries
        const remaining = initialData.filter((e) => e.name !== 'Alice');
        localStorage.setItem('daboyz_availability', JSON.stringify(remaining));
        return Promise.resolve({
          ok: true,
          status: 204,
          json: async () => ({ deletedCount: 2 }),
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    const { result } = renderHook(() => useDeletePersona());

    await act(async () => {
      await result.current.deletePersona('Alice');
    });

    const remaining = JSON.parse(localStorage.getItem('daboyz_availability'));
    const aliceEntries = remaining.filter((e) => e.name === 'Alice');
    expect(aliceEntries).toHaveLength(0);

    const bobEntries = remaining.filter((e) => e.name === 'Bob');
    expect(bobEntries).toHaveLength(2);
  });

  test('verifies other personas unaffected by deletion', async () => {
    const initialData = [
      { name: 'Charlie', date: '2024-06-15', color: '#0000FF' },
      { name: 'Diana', date: '2024-06-16', color: '#FFFF00' },
    ];

    localStorage.setItem('daboyz_availability', JSON.stringify(initialData));

    global.fetch = jest.fn((url) => {
      if (url === '/api/personas/Charlie') {
        const remaining = initialData.filter((e) => e.name !== 'Charlie');
        localStorage.setItem('daboyz_availability', JSON.stringify(remaining));
        return Promise.resolve({
          ok: true,
          status: 204,
          json: async () => ({ success: true }),
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    const { result } = renderHook(() => useDeletePersona());

    await act(async () => {
      await result.current.deletePersona('Charlie');
    });

    const remaining = JSON.parse(localStorage.getItem('daboyz_availability'));
    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe('Diana');
  });

  test('localStorage cleared for deleted persona', async () => {
    const initialData = [
      { name: 'Eve', date: '2024-06-15', color: '#FF00FF' },
    ];

    localStorage.setItem('daboyz_availability', JSON.stringify(initialData));

    global.fetch = jest.fn((url) => {
      if (url === '/api/personas/Eve') {
        localStorage.removeItem('daboyz_availability');
        return Promise.resolve({
          ok: true,
          status: 204,
          json: async () => ({ success: true }),
        });
      }
      return Promise.reject(new Error('Unexpected URL'));
    });

    const { result } = renderHook(() => useDeletePersona());

    await act(async () => {
      await result.current.deletePersona('Eve');
    });

    expect(localStorage.getItem('daboyz_availability')).toBeNull();
  });
});
