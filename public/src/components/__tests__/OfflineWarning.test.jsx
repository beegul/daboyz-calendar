import React from "react";
import { render, screen } from "@testing-library/react";
import OfflineWarning from "../OfflineWarning";

describe("OfflineWarning Component", () => {
  it("should render warning message when offline (useMockAPI = true)", () => {
    render(<OfflineWarning isOffline={true} />);
    const warning = screen.getByText(/offline mode/i);
    expect(warning).toBeInTheDocument();
  });

  it("should not render when online (useMockAPI = false)", () => {
    const { container } = render(<OfflineWarning isOffline={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("should have aria-live='polite' for screen reader announcement", () => {
    render(<OfflineWarning isOffline={true} />);
    const banner = screen.getByRole("status");
    expect(banner).toHaveAttribute("aria-live", "polite");
  });

  it("should display 'Using local data' text when offline", () => {
    render(<OfflineWarning isOffline={true} />);
    expect(screen.getByText(/using local data/i)).toBeInTheDocument();
  });

  it("should have proper styling for visibility", () => {
    render(<OfflineWarning isOffline={true} />);
    const banner = screen.getByRole("status");
    expect(banner).toHaveClass("bg-yellow-50");
    expect(banner).toHaveClass("border-yellow-200");
  });
});
