import React from "react";
import { render, screen } from "@testing-library/react";
import CalendarGrid from "../CalendarGrid";

describe("Mobile clarity regression", () => {
  it("renders readable month context and tappable date cells at mobile width", () => {
    window.innerWidth = 375;
    window.innerHeight = 667;

    render(
      <CalendarGrid
        currentMonth={new Date(2024, 5, 1)}
        entries={[]}
        activePersona={{ name: "Alex", color: "#FF0000" }}
        onDateClick={() => {}}
        onRemoveAvailability={() => {}}
      />,
    );

    expect(screen.getByText("Sun")).toBeInTheDocument();

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getAllByText(/Click to mark/i).length).toBeGreaterThan(0);

    const cell = screen.getByText("1").closest("div")?.parentElement;
    expect(cell).toHaveClass("min-h-24");
  });
});
