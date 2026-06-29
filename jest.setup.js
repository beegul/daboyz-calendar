import '@testing-library/jest-dom'

// Mock window.matchMedia for responsive design tests and accessibility
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => {
    // Default: return false for all queries
    let matches = false
    
    // Specific handling for color scheme detection
    if (query === '(prefers-color-scheme: dark)') {
      matches = false // Default to light mode in tests
    }
    
    // Specific handling for reduced motion (accessibility preference)
    // By default, tests assume NO reduced motion preference
    // Individual tests can override this using global.testPrefersReducedMotion
    if (query === '(prefers-reduced-motion: reduce)') {
      matches = global.testPrefersReducedMotion || false
    }
    
    // Hover capability detection
    if (query === '(hover: hover)') {
      matches = true // Default: tests assume desktop with hover support
    }
    if (query === '(hover: none)') {
      matches = false // Default: not a touch-only device
    }
    
    return {
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }
  }),
})

// Mock localStorage for persona tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Helper to control API failure scenarios for tests
global.mockAPIFailure = false
global.mockAPIError = null

// Mock fetch globally if needed by any test
global.fetch = jest.fn((url) => {
  // Allow tests to simulate API failures
  if (global.mockAPIFailure) {
    return Promise.reject(global.mockAPIError || new Error('API is offline'))
  }

  if (url.includes('/api/personas')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ personas: [] }),
    })
  }
  if (url.includes('/api/availability')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ entries: [] }),
    })
  }
  return Promise.reject(new Error(`Unexpected fetch call to ${url}`))
})

// Suppress console errors in tests unless explicitly needed
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
