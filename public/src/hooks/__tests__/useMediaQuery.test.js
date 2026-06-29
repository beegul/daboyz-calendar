import { renderHook } from "@testing-library/react";
import useMediaQuery from "../useMediaQuery";

describe("useMediaQuery Hook", () => {
  test("should return a boolean", () => {
    const { result } = renderHook(() => useMediaQuery("(max-width: 768px)"));
    expect(typeof result.current).toBe("boolean");
  });

  test("should accept complex media queries", () => {
    const { result } = renderHook(() =>
      useMediaQuery("(min-width: 768px) and (max-width: 1023px)"),
    );
    expect(typeof result.current).toBe("boolean");
  });

  test("should handle prefers-color-scheme query", () => {
    const { result } = renderHook(() =>
      useMediaQuery("(prefers-color-scheme: dark)"),
    );
    expect(typeof result.current).toBe("boolean");
  });

  test("should use matchMedia API", () => {
    const matchMediaSpy = jest.spyOn(window, "matchMedia");
    renderHook(() => useMediaQuery("(max-width: 768px)"));
    expect(matchMediaSpy).toHaveBeenCalled();
    matchMediaSpy.mockRestore();
  });

  test("should add event listener for media query changes", () => {
    const addEventListenerSpy = jest.fn();
    const mediaQueryList = {
      matches: false,
      addEventListener: addEventListenerSpy,
      removeEventListener: jest.fn(),
    };
    jest.spyOn(window, "matchMedia").mockReturnValue(mediaQueryList);

    renderHook(() => useMediaQuery("(max-width: 768px)"));

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  test("should cleanup event listener on unmount", () => {
    const removeEventListenerSpy = jest.fn();
    const mediaQueryList = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: removeEventListenerSpy,
    };
    jest.spyOn(window, "matchMedia").mockReturnValue(mediaQueryList);

    const { unmount } = renderHook(() => useMediaQuery("(max-width: 768px)"));
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });
});
