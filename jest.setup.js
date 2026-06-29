import '@testing-library/jest-dom'

// Mock window.matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => {
    // Default: return false for all queries except prefers-color-scheme
    let matches = false
    
    // Specific handling for prefers-color-scheme (dark mode detection)
    if (query === '(prefers-color-scheme: dark)') {
      matches = false // Default to light mode in tests
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

// Mock fetch globally if needed by any test
global.fetch = jest.fn((url) => {
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
