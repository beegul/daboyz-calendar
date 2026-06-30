import { render, screen, fireEvent } from "@testing-library/react";
import PersonaOnboarding from "../PersonaOnboarding";

describe("PersonaOnboarding accessibility regression", () => {
  beforeEach(() => {
    global.fetch = jest.fn((url) => {
      if (url === "/api/users") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ users: [] }),
        });
      }
      return Promise.reject(new Error(`Unexpected fetch call to ${url}`));
    });
  });

  it("exposes labeled controls and keyboard-submittable form", () => {
    const onPersonaCreate = jest.fn();
    render(<PersonaOnboarding onPersonaCreate={onPersonaCreate} />);

    const nameInput = screen.getByLabelText(/Persona name/i);
    const colorInput = screen.getByLabelText(/Persona color picker/i);

    fireEvent.change(nameInput, { target: { value: "Sarah" } });
    fireEvent.change(colorInput, { target: { value: "#FF0000" } });

    const form = nameInput.closest("form");
    expect(form).toBeInTheDocument();
    fireEvent.submit(form);

    expect(onPersonaCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Sarah", color: "#ff0000" }),
    );
  });
});
