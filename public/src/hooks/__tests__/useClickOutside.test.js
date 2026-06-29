import { renderHook } from "@testing-library/react";
import useClickOutside from "../useClickOutside";

describe("useClickOutside Hook", () => {
  test("should call callback when clicking outside element", () => {
    const callback = jest.fn();
    const ref = { current: document.createElement("div") };

    renderHook(() => useClickOutside(ref, callback));

    // Simulate click outside
    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(callback).toHaveBeenCalled();
  });

  test("should not call callback when clicking inside element", () => {
    const callback = jest.fn();
    const element = document.createElement("div");
    const ref = { current: element };

    renderHook(() => useClickOutside(ref, callback));

    // Simulate click inside
    element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(callback).not.toHaveBeenCalled();
  });

  test("should not call callback when ref is null", () => {
    const callback = jest.fn();
    const ref = { current: null };

    renderHook(() => useClickOutside(ref, callback));

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(callback).not.toHaveBeenCalled();
  });

  test("should respect enabled option (true by default)", () => {
    const callback = jest.fn();
    const ref = { current: document.createElement("div") };

    renderHook(() => useClickOutside(ref, callback));

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(callback).toHaveBeenCalled();
  });

  test("should not call callback when enabled is false", () => {
    const callback = jest.fn();
    const ref = { current: document.createElement("div") };

    renderHook(() => useClickOutside(ref, callback, { enabled: false }));

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(callback).not.toHaveBeenCalled();
  });

  test("should pass event to callback", () => {
    const callback = jest.fn();
    const ref = { current: document.createElement("div") };

    renderHook(() => useClickOutside(ref, callback));

    const event = new MouseEvent("mousedown", { bubbles: true });
    document.dispatchEvent(event);

    expect(callback).toHaveBeenCalledWith(event);
  });

  test("should cleanup event listener on unmount", () => {
    const callback = jest.fn();
    const ref = { current: document.createElement("div") };
    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() => useClickOutside(ref, callback));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousedown",
      expect.any(Function),
    );
    removeEventListenerSpy.mockRestore();
  });

  test("should handle multiple click outside events", () => {
    const callback = jest.fn();
    const ref = { current: document.createElement("div") };

    renderHook(() => useClickOutside(ref, callback));

    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

    expect(callback).toHaveBeenCalledTimes(3);
  });

  test("should handle element change", () => {
    const callback = jest.fn();
    const element1 = document.createElement("div");
    const element2 = document.createElement("div");
    const ref = { current: element1 };

    const { rerender } = renderHook(() => useClickOutside(ref, callback));

    // Click outside element1
    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(callback).toHaveBeenCalledTimes(1);

    // Change ref to element2
    ref.current = element2;
    rerender();

    // Click outside element2
    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(callback).toHaveBeenCalledTimes(2);
  });

  test("should work with nested elements", () => {
    const callback = jest.fn();
    const parent = document.createElement("div");
    const child = document.createElement("div");
    parent.appendChild(child);
    const ref = { current: parent };

    renderHook(() => useClickOutside(ref, callback));

    // Click on child (inside parent)
    child.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(callback).not.toHaveBeenCalled();

    // Click outside
    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    expect(callback).toHaveBeenCalled();
  });
});
