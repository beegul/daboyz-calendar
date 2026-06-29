/**
 * HTTP client for API calls
 * Provides error handling, retry logic, and request/response formatting
 */

const API_BASE = "/api";
const REQUEST_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;

class APIClient {
  constructor(baseUrl = API_BASE) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make an HTTP request with retry logic
   */
  async request(method, endpoint, options = {}, retryCount = 0) {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `HTTP ${response.status}`);
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { success: true };
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry on network errors (not validation errors)
      if (
        retryCount < MAX_RETRIES &&
        (error.name === "AbortError" || !error.status)
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1)),
        );
        return this.request(method, endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  // Users API
  async getUsers() {
    return this.request("GET", "/users");
  }

  async addOrUpdateUser(userId, name, color) {
    return this.request("POST", "/users", {
      body: { id: userId, name, color },
    });
  }

  // Availability API
  async getAvailability(month) {
    return this.request("GET", `/availability?month=${month}`);
  }

  async toggleAvailability(userId, date, name, color) {
    return this.request("POST", "/availability", {
      body: { userId, date, name, color },
    });
  }

  async deleteAvailability(userId, date) {
    return this.request("DELETE", `/availability/${userId}/${date}`);
  }

  // Health check
  async health() {
    return this.request("GET", "/health");
  }
}

// Export singleton instance
export const apiClient = new APIClient();

export default apiClient;
