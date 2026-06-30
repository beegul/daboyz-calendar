import { renderHook, act } from "@testing-library/react";
import useDeletePersona from "../../hooks/useDeletePersona";

describe("Cascade delete regression", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("deleting a persona removes only that persona's availability", async () => {
    const initialData = [
      { name: "Alice", date: "2024-06-15", color: "#FF0000" },
      { name: "Alice", date: "2024-06-16", color: "#FF0000" },
      { name: "Bob", date: "2024-06-15", color: "#00FF00" },
    ];

    localStorage.setItem("daboyz_availability", JSON.stringify(initialData));

    global.fetch = jest.fn((url) => {
      if (url === "/api/personas/Alice") {
        const remaining = initialData.filter((e) => e.name !== "Alice");
        localStorage.setItem("daboyz_availability", JSON.stringify(remaining));
        return Promise.resolve({ ok: true, status: 204 });
      }
      return Promise.reject(new Error("Unexpected URL"));
    });

    const { result } = renderHook(() => useDeletePersona());

    await act(async () => {
      await result.current.deletePersona("Alice");
    });

    const remaining = JSON.parse(localStorage.getItem("daboyz_availability"));
    expect(remaining).toHaveLength(1);
    expect(remaining[0].name).toBe("Bob");
  });
});
