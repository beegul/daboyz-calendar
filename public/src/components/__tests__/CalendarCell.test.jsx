import React from "react";
import { render, screen } from "@testing-library/react";
import { CalendarCell } from "../CalendarCell";
import { ToastProvider } from "../../context/ToastContext";

describe("CalendarCell touch regression", () => {
  it("keeps persona controls touch-friendly and stateful", () => {
    render(
      <ToastProvider>
        <CalendarCell
          date={new Date("2024-06-15")}
          personas={[{ name: "alex", color: "#FF0000" }]}
          availability={{ alex: true }}
        />
      </ToastProvider>,
    );

    const personaButton = screen.getByRole("button", { name: /alex/i });
    expect(personaButton).toHaveClass("min-h-[44px]");
    expect(personaButton).toHaveAttribute("aria-pressed", "true");
  });
});
