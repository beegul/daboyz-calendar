import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  validatePersonaUniqueness,
  isValidHexColor,
  normalizePersonaName,
} from "../utils/validation";
import { MotionModal } from "./MotionModal";
import { MotionButton } from "./MotionButton";
import { useToast } from "../hooks/useToast";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

/**
 * PersonaOnboarding Component
 * Modal form for creating a new persona with name and color
 * Mandatory on first app load - blocks calendar access until persona created
 *
 * Features:
 * - Real-time collision detection against all existing personas
 * - Case-insensitive name matching with whitespace trimming
 * - Debounced validation (300ms) to avoid excessive updates
 * - Clear error messaging for collisions
 */
function PersonaOnboarding({ onPersonaCreate }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#0000FF");
  const [allPersonas, setAllPersonas] = useState([]);
  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [personasError, setPersonasError] = useState(null);
  const [nameError, setNameError] = useState("");
  const [colorError, setColorError] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [collisionMessage, setCollisionMessage] = useState("");

  const validationDebounceRef = useRef(null);

  // Fetch all existing personas on component mount
  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setLoadingPersonas(true);
        const response = await fetch("/api/personas");

        if (!response.ok) {
          throw new Error(`Failed to fetch personas: ${response.status}`);
        }

        const data = await response.json();
        setAllPersonas(Array.isArray(data.personas) ? data.personas : []);
        setPersonasError(null);
      } catch (err) {
        console.warn("Failed to fetch existing personas:", err.message);
        setPersonasError(err.message);
        setAllPersonas([]);
      } finally {
        setLoadingPersonas(false);
      }
    };

    fetchPersonas();
  }, []);

  // Debounced validation function - runs after 300ms of no input changes
  const performValidation = useCallback(
    (inputName, inputColor) => {
      setIsValidating(true);

      // Clear previous errors
      setNameError("");
      setColorError("");
      setCollisionMessage("");

      // Validate name format
      if (!inputName || !inputName.trim()) {
        setNameError("Name cannot be empty");
        setIsValidating(false);
        return;
      }

      if (inputName.trim().length > 50) {
        setNameError("Name must be 50 characters or less");
        setIsValidating(false);
        return;
      }

      if (!/^[a-zA-Z0-9\s]+$/.test(inputName.trim())) {
        setNameError("Name can only contain letters, numbers, and spaces");
        setIsValidating(false);
        return;
      }

      // Validate color format
      if (!isValidHexColor(inputColor)) {
        setColorError("Invalid color format");
        setIsValidating(false);
        return;
      }

      // Check for collision against existing personas
      const validation = validatePersonaUniqueness(
        inputName,
        inputColor,
        allPersonas,
      );
      if (!validation.isValid) {
        setCollisionMessage(validation.errorMessage);
      }

      setIsValidating(false);
    },
    [allPersonas],
  );

  // Set up debounce timer for validation
  const handleNameChange = (e) => {
    const inputName = e.target.value;
    setName(inputName);

    // Clear existing debounce timer
    if (validationDebounceRef.current) {
      clearTimeout(validationDebounceRef.current);
    }

    // Set new debounce timer (300ms)
    validationDebounceRef.current = setTimeout(() => {
      performValidation(inputName, color);
    }, 300);
  };

  const handleColorChange = (e) => {
    const inputColor = e.target.value;
    setColor(inputColor);

    // Clear existing debounce timer
    if (validationDebounceRef.current) {
      clearTimeout(validationDebounceRef.current);
    }

    // Set new debounce timer (300ms)
    validationDebounceRef.current = setTimeout(() => {
      performValidation(name, inputColor);
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final validation before submission
    const validation = validatePersonaUniqueness(
      name.trim(),
      color,
      allPersonas,
    );

    if (!validation.isValid) {
      setCollisionMessage(validation.errorMessage);
      return;
    }

    // Call parent callback with trimmed name and color
    onPersonaCreate({
      name: name.trim(),
      color: color,
    });

    // Reset form
    setName("");
    setColor("#0000FF");
    setNameError("");
    setColorError("");
    setCollisionMessage("");
  };

  // Form is valid if:
  // 1. Name is not empty
  // 2. No validation errors
  // 3. No collision errors
  const hasErrors = nameError || colorError || collisionMessage;
  const isFormValid = name.trim().length > 0 && !hasErrors && !loadingPersonas;

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (validationDebounceRef.current) {
        clearTimeout(validationDebounceRef.current);
      }
    };
  }, []);

  return (
    <MotionModal 
      isOpen={true} 
      onClose={null}
      title="Create Your Persona"
    >
      <p className="text-gray-600 text-sm mb-6">
        Welcome! Create a unique persona to start marking your availability.
      </p>

      {personasError && !loadingPersonas && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
          <p>
            Note: Could not validate personas online ({personasError}).
            Proceeding without collision check.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label
              htmlFor="personaName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="personaName"
              type="text"
              value={name}
              onChange={handleNameChange}
              placeholder="e.g., Sarah"
              maxLength={50}
              disabled={loadingPersonas}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                nameError || collisionMessage
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              aria-label="Persona name"
              aria-describedby={
                nameError || collisionMessage ? "nameError" : undefined
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              {name.length}/50 characters
            </p>
            {nameError && (
              <p
                id="nameError"
                className="text-xs text-red-500 mt-1 font-medium"
              >
                {nameError}
              </p>
            )}
            {collisionMessage && !nameError && (
              <p
                id="collisionError"
                className="text-xs text-red-500 mt-1 font-medium"
              >
                ⚠️ {collisionMessage}
              </p>
            )}
          </div>

          {/* Color Picker */}
          <div>
            <label
              htmlFor="personaColor"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Color <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                id="personaColor"
                type="color"
                value={color}
                onChange={handleColorChange}
                disabled={loadingPersonas}
                className={`w-16 h-10 rounded border cursor-pointer ${
                  colorError ? "border-red-300" : "border-gray-300"
                }`}
                aria-label="Persona color picker"
              />
              <span className="text-sm text-gray-600 font-mono">{color}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Pick your favorite color
            </p>
            {colorError && (
              <p className="text-xs text-red-500 mt-1 font-medium">
                {colorError}
              </p>
            )}
          </div>

          {/* Create Button */}
          <MotionButton
            type="submit"
            variant={isFormValid ? "primary" : "disabled"}
            disabled={!isFormValid}
            isLoading={loadingPersonas || isValidating}
            className="w-full"
          >
            {loadingPersonas
              ? "Loading..."
              : isValidating
                ? "Validating..."
                : "Create Persona"}
          </MotionButton>
        </form>
    </MotionModal>
  );
}

export default PersonaOnboarding;
