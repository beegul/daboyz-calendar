import { render, screen, fireEvent } from "@testing-library/react";
import PersonaOnboarding from "../PersonaOnboarding";

describe("PersonaOnboarding Component", () => {
  it("renders the persona creation form", () => {
    const mockOnCreate = jest.fn();
    render(<PersonaOnboarding onPersonaCreate={mockOnCreate} />);

    expect(screen.getByText("Create Your Persona")).toBeInTheDocument();
    expect(screen.getByLabelText("Persona name")).toBeInTheDocument();
    expect(screen.getByLabelText("Persona color picker")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Create Persona/i })).toBeInTheDocument();
  });

  it("validates that name cannot be empty on initial render", () => {
    const mockOnCreate = jest.fn();
    render(<PersonaOnboarding onPersonaCreate={mockOnCreate} />);

    const submitButton = screen.getByRole("button", { name: /Create Persona/i });
    expect(submitButton).toBeDisabled();
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
});
