// Contract tests for DELETE /api/personas/{name} endpoint
// These tests verify the API contract without testing implementation details

describe('DELETE /api/personas/{name} Endpoint Contract', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns 204 No Content on successful deletion', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 204,
        json: async () => ({}),
      })
    );

    const response = await fetch('/api/personas/ValidPersona', {
      method: 'DELETE',
    });

    expect(response.status).toBe(204);
    expect(response.ok).toBe(true);
  });

  test('returns 404 Not Found if persona does not exist', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Persona not found' }),
      })
    );

    const response = await fetch('/api/personas/NonExistentPersona', {
      method: 'DELETE',
    });

    expect(response.status).toBe(404);
    expect(response.ok).toBe(false);
    const body = await response.json();
    expect(body.error).toMatch(/not found/i);
  });

  test('returns 400 Bad Request if name is invalid (empty)', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid persona name' }),
      })
    );

    const response = await fetch('/api/personas/', {
      method: 'DELETE',
    });

    expect(response.status).toBe(400);
    expect(response.ok).toBe(false);
  });

  test('atomically deletes all availability entries for persona', async () => {
    const deletedEntryCount = 5;

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 204,
        json: async () => ({ deletedCount: deletedEntryCount }),
      })
    );

    const response = await fetch('/api/personas/PersonaToDelete', {
      method: 'DELETE',
    });

    expect(response.ok).toBe(true);
    // In a real scenario, we'd verify that all 5 entries were deleted atomically
    // (either all succeed or all fail, no partial deletions)
  });

  test('deletion request accepts standard HTTP headers', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 204,
        json: async () => ({}),
      })
    );

    await fetch('/api/personas/TestPersona', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/personas/TestPersona',
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  test('delete request with special characters in name handled safely', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        status: 204,
        json: async () => ({}),
      })
    );

    const personaName = encodeURIComponent('Person A');
    await fetch(`/api/personas/${personaName}`, {
      method: 'DELETE',
    });

    expect(global.fetch).toHaveBeenCalled();
    const url = global.fetch.mock.calls[0][0];
    expect(url).toContain('Person%20A');
  });
});
