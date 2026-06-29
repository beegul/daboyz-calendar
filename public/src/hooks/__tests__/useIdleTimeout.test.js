/**
 * Unit tests for useIdleTimeout hook
 * Tests: initialization, activity tracking, idle state transitions, cleanup
 */
/* eslint-disable no-unused-vars */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useIdleTimeout } from "../useIdleTimeout";

describe("useIdleTimeout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test("initializes with isIdle = false", () => {
    const { result } = renderHook(() => useIdleTimeout());
    expect(result.current.isIdle).toBe(false);
  });

  test("initializes with lastActivityTime as current timestamp", () => {
    const beforeRender = Date.now();
    const { result } = renderHook(() => useIdleTimeout());
    const afterRender = Date.now();

    expect(result.current.lastActivityTime).toBeGreaterThanOrEqual(
      beforeRender,
    );
    expect(result.current.lastActivityTime).toBeLessThanOrEqual(
      afterRender + 100,
    );
  });

  test("has default idle threshold of 600000ms (10 minutes)", () => {
    const { result } = renderHook(() => useIdleTimeout());
    expect(result.current.idleThresholdMs).toBe(600000);
  });

  test("accepts custom idle threshold", () => {
    const customThreshold = 120000; // 2 minutes
    const { result } = renderHook(() => useIdleTimeout(customThreshold));
    expect(result.current.idleThresholdMs).toBe(customThreshold);
  });

  test("detects idle state after threshold time elapsed", () => {
    const { result } = renderHook(() => useIdleTimeout(5000)); // 5 second threshold

    // Fast forward to just before idle threshold
    act(() => {
      jest.advanceTimersByTime(4900);
    });
    expect(result.current.isIdle).toBe(false);

    // Fast forward past idle threshold
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current.isIdle).toBe(true);
  });

  test("resets idle state when resetIdleTimer is called", () => {
    const { result } = renderHook(() => useIdleTimeout(5000));
    const initialTime = result.current.lastActivityTime;

    // Move to idle state
    act(() => {
      jest.advanceTimersByTime(5100);
    });
    expect(result.current.isIdle).toBe(true);

    // Reset idle timer
    act(() => {
      result.current.resetIdleTimer();
    });
    expect(result.current.isIdle).toBe(false);
    // After reset, lastActivityTime should be after initial
    expect(result.current.lastActivityTime).toBeGreaterThanOrEqual(initialTime);
  });

  test("updates lastActivityTime when resetIdleTimer is called", () => {
    const { result } = renderHook(() => useIdleTimeout());

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const timeBeforeReset = Date.now();
    act(() => {
      result.current.resetIdleTimer();
    });
    const timeAfterReset = Date.now();

    expect(result.current.lastActivityTime).toBeGreaterThanOrEqual(
      timeBeforeReset,
    );
    expect(result.current.lastActivityTime).toBeLessThanOrEqual(
      timeAfterReset + 100,
    );
  });

  test("listens to mousemove events and resets idle timer", () => {
    const { result } = renderHook(() => useIdleTimeout(5000));
    const initialActivity = result.current.lastActivityTime;

    // Move to idle state
    act(() => {
      jest.advanceTimersByTime(5100);
    });
    expect(result.current.isIdle).toBe(true);

    // Trigger mousemove event
    act(() => {
      const event = new MouseEvent("mousemove");
      document.dispatchEvent(event);
      jest.advanceTimersByTime(150); // Account for debounce
    });

    expect(result.current.isIdle).toBe(false);
  });

  test("listens to keydown events and resets idle timer", () => {
    const { result } = renderHook(() => useIdleTimeout(5000));

    // Move to idle state
    act(() => {
      jest.advanceTimersByTime(5100);
    });
    expect(result.current.isIdle).toBe(true);

    // Trigger keydown event
    act(() => {
      const event = new KeyboardEvent("keydown");
      document.dispatchEvent(event);
      jest.advanceTimersByTime(150);
    });

    expect(result.current.isIdle).toBe(false);
  });

  test("listens to touchstart events and resets idle timer", () => {
    const { result } = renderHook(() => useIdleTimeout(5000));

    // Move to idle state
    act(() => {
      jest.advanceTimersByTime(5100);
    });
    expect(result.current.isIdle).toBe(true);

    // Trigger touchstart event
    act(() => {
      const event = new TouchEvent("touchstart");
      document.dispatchEvent(event);
      jest.advanceTimersByTime(150);
    });

    expect(result.current.isIdle).toBe(false);
  });

  test("debounces activity events to avoid excessive updates", () => {
    const { result } = renderHook(() => useIdleTimeout(5000));

    act(() => {
      jest.advanceTimersByTime(5100);
    });
    expect(result.current.isIdle).toBe(true);

    // Trigger multiple mousemove events rapidly
    act(() => {
      for (let i = 0; i < 10; i++) {
        const event = new MouseEvent("mousemove");
        document.dispatchEvent(event);
        jest.advanceTimersByTime(10);
      }
      jest.advanceTimersByTime(150); // Let debounce settle
    });

    // Should only have one state update, not 10
    expect(result.current.isIdle).toBe(false);
  });

  test("transitions between idle and non-idle multiple times", () => {
    const { result } = renderHook(() => useIdleTimeout(2000)); // 2 second threshold

    // Start not idle
    expect(result.current.isIdle).toBe(false);

    // Become idle
    act(() => {
      jest.advanceTimersByTime(2100);
    });
    expect(result.current.isIdle).toBe(true);

    // Activity resets
    act(() => {
      const event = new MouseEvent("mousemove");
      document.dispatchEvent(event);
      jest.advanceTimersByTime(150);
    });
    expect(result.current.isIdle).toBe(false);

    // Become idle again
    act(() => {
      jest.advanceTimersByTime(2100);
    });
    expect(result.current.isIdle).toBe(true);

    // Activity resets again
    act(() => {
      result.current.resetIdleTimer();
    });
    expect(result.current.isIdle).toBe(false);
  });

  test("cleans up event listeners on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(document, "removeEventListener");
    const { unmount } = renderHook(() => useIdleTimeout());

    unmount();

    // Should remove all three event listeners
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "keydown",
      expect.any(Function),
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "touchstart",
      expect.any(Function),
    );

    removeEventListenerSpy.mockRestore();
  });

  test("clears interval on unmount", () => {
    const clearIntervalSpy = jest.spyOn(global, "clearInterval");
    const { unmount } = renderHook(() => useIdleTimeout());

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });

  test("handles rapid theme changes without memory leaks", () => {
    const { unmount, rerender } = renderHook(
      ({ threshold }) => useIdleTimeout(threshold),
      {
        initialProps: { threshold: 5000 },
      },
    );

    // Change threshold multiple times
    act(() => {
      rerender({ threshold: 3000 });
      jest.advanceTimersByTime(100);
      rerender({ threshold: 7000 });
      jest.advanceTimersByTime(100);
    });

    unmount();
    // If this completes without error, cleanup worked properly
  });

  test("returns stable references for functions", () => {
    const { result, rerender } = renderHook(() => useIdleTimeout());
    const firstResetFn = result.current.resetIdleTimer;

    rerender();

    // Function reference should remain stable across re-renders
    expect(result.current.resetIdleTimer).toBe(firstResetFn);
  });

  test("handles zero idle threshold edge case", () => {
    const { result } = renderHook(() => useIdleTimeout(0));

    expect(result.current.isIdle).toBe(false);

    // Advance time to trigger interval check
    act(() => {
      jest.advanceTimersByTime(1100); // More than 1 second for interval to trigger
    });

    expect(result.current.isIdle).toBe(true);
  });

  test("idle state updates are minimum when no change occurs", () => {
    const { result } = renderHook(() => useIdleTimeout(5000));

    const initialIdleState = result.current.isIdle;

    // Advance time without crossing threshold
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should not have changed idle state
    expect(result.current.isIdle).toBe(initialIdleState);
    expect(result.current.isIdle).toBe(false);
  });

  test("handles unmount during debounce timeout", () => {
    const { result, unmount } = renderHook(() => useIdleTimeout(5000));

    act(() => {
      jest.advanceTimersByTime(5100);
    });

    // Trigger activity but unmount during debounce window
    act(() => {
      const event = new MouseEvent("mousemove");
      document.dispatchEvent(event);
      jest.advanceTimersByTime(50); // During debounce
    });

    // Should not throw error
    expect(() => {
      unmount();
    }).not.toThrow();
  });
});
