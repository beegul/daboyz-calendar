import apiClient from "../api/client";

describe("API Client", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Request Method", () => {
    it("makes successful GET request", async () => {
      const mockResponse = { users: [] };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.getUsers();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/users"),
        expect.objectContaining({ method: "GET" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("makes successful POST request", async () => {
      const mockResponse = { user: { id: "alice", name: "Alice" } };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.addOrUpdateUser(
        "alice",
        "Alice",
        "#2563eb",
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/users"),
        expect.objectContaining({ method: "POST" }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("handles 204 No Content response", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await apiClient.deleteAvailability("alice", "2026-07-15");

      expect(result).toEqual({ success: true });
    });

    it("throws error on failed response", async () => {
      const errorData = { error: "Not found", code: "NOT_FOUND" };
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue(errorData),
      });

      await expect(apiClient.getAvailability("2026-07")).rejects.toThrow(
        "Not found",
      );
    });

    it("retries on network errors", async () => {
      const mockResponse = { entries: [] };
      global.fetch
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue(mockResponse),
        });

      const result = await apiClient.getAvailability("2026-07");

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("Users API", () => {
    it("fetches users", async () => {
      const mockResponse = {
        users: [{ id: "alice", name: "Alice", color: "#2563eb" }],
      };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.getUsers();

      expect(result.users).toHaveLength(1);
      expect(result.users[0].name).toBe("Alice");
    });

    it("adds or updates user", async () => {
      const mockResponse = {
        user: { id: "alice", name: "Alice", color: "#2563eb" },
      };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.addOrUpdateUser(
        "alice",
        "Alice",
        "#2563eb",
      );

      expect(result.user.id).toBe("alice");
    });
  });

  describe("Availability API", () => {
    it("fetches availability for month", async () => {
      const mockResponse = {
        month: "2026-07",
        entries: [{ userId: "alice", date: "2026-07-15", name: "Alice" }],
      };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.getAvailability("2026-07");

      expect(result.month).toBe("2026-07");
      expect(result.entries).toHaveLength(1);
    });

    it("toggles availability", async () => {
      const mockResponse = {
        action: "added",
        entry: { userId: "alice", date: "2026-07-15" },
      };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.toggleAvailability(
        "alice",
        "2026-07-15",
        "Alice",
        "#2563eb",
      );

      expect(result.action).toBe("added");
    });

    it("deletes availability", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await apiClient.deleteAvailability("alice", "2026-07-15");

      expect(result.success).toBe(true);
    });
  });

  describe("Health Check", () => {
    it("checks API health", async () => {
      const mockResponse = { status: "healthy", version: "1.0.0" };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockResponse),
      });

      const result = await apiClient.health();

      expect(result.status).toBe("healthy");
    });
  });
});
