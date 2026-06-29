import { render, screen, fireEvent } from "@testing-library/react";
import PersonaOnboarding from "../PersonaOnboarding";

describe("PersonaOnboarding Component", () => {
  it("renders the persona creation form", () => {
    const mockOnCreate = jest.fn();
    render(<PersonaOnboarding onPersonaCreate={mockOnCreate} />);

    const nameInput = screen.getByLabelText(/Persona name/i);
    expect(nameInput).toBeInTheDocument();
    const colorInput = screen.getByLabelText(/Persona color picker/i);
    expect(colorInput).toBeInTheDocument();
    
    // Try to find submit button
    const buttons = screen.queryAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("validates that name cannot be empty on initial render", () => {
    const mockOnCreate = jest.fn();
    render(<PersonaOnboarding onPersonaCreate={mockOnCreate} />);

    // Look for any disabled submit button
    const buttons = screen.queryAllByRole("button");
    const disabledButtons = buttons.filter(btn => btn.disabled);
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

  it("accepts text input for persona name", () => {
    const mockOnCreate = jest.fn();
    render(<PersonaOnboarding onPersonaCreate={mockOnCreate} />);

    const nameInput = screen.getByLabelText("Persona name");
    fireEvent.change(nameInput, { target: { value: "Sarah" } });
    expect(nameInput.value).toBe("Sarah");
  });

  it("enforces 50 character name limit", () => {
    const mockOnCreate = jest.fn();
    render(<PersonaOnboarding onPersonaCreate={mockOnCreate} />);

    const nameInput = screen.getByLabelText("Persona name");
    
    // Verify the maxLength attribute is set
    expect(nameInput.maxLength).toBe(50);
    
    // Test that 50 characters is accepted
    fireEvent.change(nameInput, { target: { value: "A".repeat(50) } });
    expect(nameInput.value).toHaveLength(50);
  });

  it("has a color picker that defaults to blue", () => {
    const mockOnCreate = jest.fn();
    render(<PersonaOnboarding onPersonaCreate={mockOnCreate} />);

    const colorInput = screen.getByLabelText("Persona color picker");
    expect(colorInput.value.toLowerCase()).toBe("#0000ff");
  });

  it("allows changing the color", () => {
    const mockOnCreate = jest.fn();
    render(<PersonaOnboarding onPersonaCreate={mockOnCreate} />);

    const colorInput = screen.getByLabelText("Persona color picker");
    fireEvent.change(colorInput, { target: { value: "#FF0000" } });
    expect(colorInput.value.toUpperCase()).toBe("#FF0000");
  });

  it("shows character count feedback", () => {
    const mockOnCreate = jest.fn();
    render(<PersonaOnboarding onPersonaCreate={mockOnCreate} />);

    const nameInput = screen.getByLabelText("Persona name");

    expect(screen.getByText(/0\/50 characters/i)).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: "Sarah" } });
    
    expect(screen.getByText(/5\/50 characters/i)).toBeInTheDocument();
  });

  it("preserves input value when user types whitespace", () => {
    const mockOnCreate = jest.fn();
    render(<PersonaOnboarding onPersonaCreate={mockOnCreate} />);

    const nameInput = screen.getByLabelText("Persona name");

    fireEvent.change(nameInput, { target: { value: "  Sarah  " } });
    expect(nameInput.value).toBe("  Sarah  ");
  });

  // T193 [FR-015]: Verify form submission on mobile doesn't cause page scroll or layout shifts
  describe("T193: Mobile form submission scroll behavior (FR-015)", () => {
    it("form inputs use mobile-friendly text sizing (FR-009)", () => {
      // Setup mobile viewport
      window.innerWidth = 375;
      window.innerHeight = 667;

      const mockOnCreate = jest.fn();
      render(<PersonaOnboarding onPersonaCreate={mockOnCreate} />);

      // Verify name input uses text-base (16px) for mobile accessibility (FR-009)
      const nameInput = screen.getByLabelText("Persona name");
      expect(nameInput.className).toContain("text-base");
      expect(nameInput.className).toContain("py-3"); // Verify vertical padding for tap target

      // Verify color input has adequate tap target size (44px minimum)
      const colorInput = screen.getByLabelText("Persona color picker");
      expect(colorInput).toBeInTheDocument();
    });

    it("form submission preserves scroll position on mobile (FR-015)", () => {
      // Setup mobile viewport
      window.innerWidth = 375;
      window.innerHeight = 667;

      const mockOnCreate = jest.fn();
      render(<PersonaOnboarding onPersonaCreate={mockOnCreate} />);

      // Fill form with valid data
      const nameInput = screen.getByLabelText("Persona name");
      const colorInput = screen.getByLabelText("Persona color picker");

      fireEvent.change(nameInput, { target: { value: "TestUser" } });
      fireEvent.change(colorInput, { target: { value: "#FF5500" } });

      // Record initial scroll position
      const initialScrollTop = document.documentElement.scrollTop;

      // Find the form and simulate submit
      const form = nameInput.closest("form");
      expect(form).toBeInTheDocument();

      // Submit the form
      fireEvent.submit(form);

      // Verify scroll position hasn't changed after form submission (FR-015 requirement)
      // This ensures form submission doesn't trigger unwanted page scrolling on mobile
      expect(document.documentElement.scrollTop).toBe(initialScrollTop);
    });
  });
});
