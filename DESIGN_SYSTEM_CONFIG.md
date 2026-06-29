/**
 * T046-T055: Design System Configuration
 * Visual Design Polish & Tailwind Extension
 */

/**
 * TAILWIND CONFIG EXTENSIONS
 * Add to tailwind.config.js extend section:
 */

const DESIGN_SYSTEM = {
  // Color Palette
  colors: {
    'primary': {
      50: '#eff6ff',
      600: '#2563eb', // Primary blue
      700: '#1d4ed8',
    },
    'danger': {
      50: '#fef2f2',
      600: '#dc2626', // Danger red
      700: '#b91c1c',
    },
    'success': {
      50: '#f0fdf4',
      600: '#16a34a', // Success green
      700: '#15803d',
    },
    'neutral': {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      600: '#4b5563',
      900: '#111827',
    },
  },

  // Typography Scale
  fontSize: {
    'h1': ['20px', { fontWeight: '700', lineHeight: '1.5', letterSpacing: '-0.02em' }],
    'h2': ['18px', { fontWeight: '600', lineHeight: '1.5', letterSpacing: '-0.01em' }],
    'h3': ['16px', { fontWeight: '600', lineHeight: '1.5' }],
    'body': ['14px', { fontWeight: '400', lineHeight: '1.6' }],
    'body-sm': ['12px', { fontWeight: '400', lineHeight: '1.5' }],
    'label': ['12px', { fontWeight: '500', lineHeight: '1.5', letterSpacing: '0.01em' }],
  },

  // Spacing Grid (8px base)
  spacing: {
    'xs': '4px',
    'sm': '8px',
    'md': '16px',
    'lg': '24px',
    'xl': '32px',
    '2xl': '48px',
  },

  // Border Radius
  borderRadius: {
    'none': '0',
    'sm': '4px',
    'md': '6px',
    'lg': '8px',
    'full': '9999px',
  },

  // Box Shadows - Directional from top-left
  boxShadow: {
    'none': 'none',
    'xs': '0 2px 4px rgba(0, 0, 0, 0.05)',
    'sm': '0 2px 8px rgba(0, 0, 0, 0.1)',
    'md': '0 4px 12px rgba(0, 0, 0, 0.12)',
    'lg': '0 8px 24px rgba(0, 0, 0, 0.15)',
    'xl': '0 16px 32px rgba(0, 0, 0, 0.2)',
  },

  // Transitions
  transitionDuration: {
    '150': '150ms',
    '200': '200ms',
    '300': '300ms',
    '400': '400ms',
  },

  // Easing Functions
  transitionTimingFunction: {
    'ease-out-quart': 'cubic-bezier(0.165, 0.84, 0.44, 1)',
    'ease-in-quart': 'cubic-bezier(0.77, 0, 0.175, 1)',
  },
}

/**
 * GLOBAL STYLES
 * Add to public/src/index.css:
 */

const GLOBAL_STYLES = `
/* Base Typography */
html {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: #ffffff;
  color: #111827;
  line-height: 1.6;
}

/* Headings */
h1 { @apply text-h1 font-bold text-gray-900; }
h2 { @apply text-h2 font-semibold text-gray-900; }
h3 { @apply text-h3 font-semibold text-gray-900; }

/* Body Text */
p { @apply text-body text-gray-600; }

/* Links */
a { @apply text-primary-600 hover:text-primary-700 transition-colors; }

/* Buttons */
button { @apply transition-all duration-200; }
button:disabled { @apply opacity-50 cursor-not-allowed; }

/* Inputs */
input, textarea, select {
  @apply border border-gray-300 rounded-md px-3 py-2;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-600;
  @apply transition-all duration-200;
}

input:disabled, textarea:disabled, select:disabled {
  @apply bg-gray-50 cursor-not-allowed;
}

/* Focus Visible (High Contrast Mode) */
:focus-visible {
  @apply outline-2 outline-offset-2 outline-primary-600;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Touch Devices */
@media (hover: none) {
  button:hover { @apply no-underline; }
  a:hover { @apply no-underline; }
}

/* Dark Mode (if needed) */
@media (prefers-color-scheme: dark) {
  body { @apply bg-gray-900 text-white; }
  h1, h2, h3 { @apply text-gray-50; }
  p { @apply text-gray-300; }
}
`

/**
 * COMPONENT STYLING PATTERNS
 */

const CARD_PATTERN = `
/* Card Component Pattern */
.card {
  @apply bg-white rounded-lg border border-gray-200;
  @apply shadow-sm hover:shadow-md transition-shadow;
  @apply p-lg;
}
`

const BUTTON_PATTERN = `
/* Button Patterns */
.button {
  @apply px-md py-sm rounded-md font-medium;
  @apply min-h-[44px] min-w-[44px];
  @apply focus:ring-2 focus:ring-offset-2;
  @apply transition-all duration-200;
}

.button-primary {
  @apply bg-primary-600 text-white;
  @apply hover:bg-primary-700 active:bg-primary-800;
  @apply focus:ring-primary-400;
}

.button-secondary {
  @apply bg-gray-200 text-gray-900;
  @apply hover:bg-gray-300 active:bg-gray-400;
  @apply focus:ring-gray-400;
}

.button-danger {
  @apply bg-danger-600 text-white;
  @apply hover:bg-danger-700 active:bg-danger-800;
  @apply focus:ring-danger-400;
}

.button:disabled {
  @apply opacity-50 cursor-not-allowed;
}
`

const INPUT_PATTERN = `
/* Input Patterns */
.input {
  @apply w-full px-md py-sm;
  @apply border border-gray-300 rounded-md;
  @apply text-body;
  @apply focus:outline-none focus:ring-2 focus:ring-primary-400;
  @apply focus:border-primary-600;
  @apply transition-all duration-200;
}

.input:invalid {
  @apply border-danger-300 focus:ring-danger-400;
}
`

export {
  DESIGN_SYSTEM,
  GLOBAL_STYLES,
  CARD_PATTERN,
  BUTTON_PATTERN,
  INPUT_PATTERN,
}
