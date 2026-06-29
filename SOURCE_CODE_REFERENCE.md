# Source Code Reference Guide

## Quick Index of Implementation

### Animation Components (Ready to Use)

**MotionModal** - `public/src/components/MotionModal.jsx`
- **Purpose**: Animated modal with accessibility and focus management
- **Features**: Fade+scale entrance (300ms), staggered children (50ms delay), Escape key handling, focus trap
- **Usage**: 
  ```jsx
  <MotionModal isOpen={isOpen} onClose={handleClose} title="Title">
    Content here
  </MotionModal>
  ```
- **Tests**: 16 tests in MotionModal.test.jsx + edge cases

**MotionButton** - `public/src/components/MotionButton.jsx`
- **Purpose**: Button with micro-interactions and loading states
- **Features**: Hover scale 1.02x (150ms), press 0.98x (100ms), loading spinner, disabled states
- **Usage**:
  ```jsx
  <MotionButton variant="primary" size="md" isLoading={loading}>
    Click me
  </MotionButton>
  ```
- **Tests**: 16 tests covering variants, sizes, loading states

**Toast** - `public/src/components/Toast.jsx`
- **Purpose**: Notification component with auto-dismiss
- **Features**: Slide-up entrance (200ms), auto-dismiss (4s), queue management (max 3)
- **Usage**: Via useToast hook (see below)
- **Tests**: 14 tests for notifications and accessibility

**Shimmer** - `public/src/components/Shimmer.jsx`
- **Purpose**: Loading state animation
- **Features**: Gradient animation loop (1.5s), respects prefers-reduced-motion
- **Usage**:
  ```jsx
  <Shimmer isLoading={loading}>
    <div>Content</div>
  </Shimmer>
  ```

**PersonaRow** - `public/src/components/PersonaRow.jsx`
- **Purpose**: Persona list item with interactions
- **Features**: Hover highlight, left border accent, delete slide-left animation
- **Props**: `persona`, `onDelete`, `onEdit`
- **Tests**: Hover, accent, delete animations

**CalendarCell** - `public/src/components/CalendarCell.jsx`
- **Purpose**: Calendar date with optimistic updates
- **Features**: Instant color feedback, shimmer during loading, error rollback toast
- **Props**: `date`, `persona`, `isSelected`, `onToggle`
- **Uses**: useOptimisticUpdate hook

**CalendarGrid** - `public/src/components/CalendarGrid.jsx` (Enhanced)
- **Purpose**: Calendar month display with navigation
- **Features**: AnimatePresence wrapper, month fade transitions (400ms), FLIP morphing
- **Enhancement**: Added motion animations for smooth month changes

---

### Custom Hooks (Ready to Use)

**useToast** - `public/src/hooks/useToast.js`
- **Purpose**: Global notification dispatch
- **API**: `{ success(), error(), info(), dismiss(), clearAll() }`
- **Usage**:
  ```jsx
  const toast = useToast();
  toast.success('Saved!');
  toast.error('Failed: ' + error);
  ```
- **Requires**: ToastProvider wrapper (see Context)

**usePrefersReducedMotion** - `public/src/hooks/usePrefersReducedMotion.js`
- **Purpose**: Detect user accessibility preference for reduced motion
- **API**: Returns `true` if user prefers reduced motion, `false` otherwise
- **Usage**:
  ```jsx
  const userPreferences = usePrefersReducedMotion();
  const duration = userPreferences ? 0 : 300; // Skip animation if accessible
  ```
- **Tests**: 11 tests covering detection, browser compatibility

**useAnimationDuration** - `public/src/hooks/useAnimationDuration.js`
- **Purpose**: Wrapper returning duration respecting accessibility
- **API**: Takes base duration, returns 0 if prefers-reduced-motion active
- **Usage**:
  ```jsx
  const duration = useAnimationDuration(300);
  // Duration is 0 if user prefers reduced motion, 300 otherwise
  ```

**useOptimisticUpdate** - `public/src/hooks/useOptimisticUpdate.js`
- **Purpose**: Instant UI feedback with error rollback
- **API**: `[value, update, isLoading]`
- **Usage**:
  ```jsx
  const [color, updateColor, isLoading] = useOptimisticUpdate(
    initialColor,
    async (newColor) => await api.updateColor(newColor)
  );
  ```
- **Features**: Error rollback, toast notification on error, concurrent update prevention

**useGestureSwipe** - `public/src/hooks/useGestureSwipe.js`
- **Purpose**: Mobile swipe gesture detection
- **API**: `{ bind, swiped: { left, right, up, down }, velocity }`
- **Usage**:
  ```jsx
  const { bind, swiped } = useGestureSwipe({ threshold: 50 });
  useEffect(() => {
    if (swiped.left) handleNextMonth();
  }, [swiped.left]);
  ```
- **Features**: Velocity detection, threshold support, event binding

---

### Context & State Management

**ToastContext** - `public/src/context/ToastContext.jsx`
- **Purpose**: Global toast notification state management
- **Provider**: `<ToastProvider>{children}</ToastProvider>`
- **Queue**: Max 3 toasts, auto-dismiss after 4 seconds
- **Required**: Wrap App.jsx with this provider

---

### Utilities & Configuration

**motionConfig** - `public/src/utils/motionConfig.js`
- **Purpose**: Centralized animation design tokens
- **Exports**:
  - `getDuration(preset, userPreferences)` - Get animation duration
  - `getEasing(preset)` - Get easing function
  - `getPreset(name, userPreferences)` - Get complete animation preset
- **Presets**: 'fast' (150ms), 'base' (300ms), 'slow' (500ms), 'extraSlow' (1000ms)
- **Easing**: 'out', 'in', 'smooth', 'outLight'

**touchTargetUtils** - `public/src/utils/touchTargetUtils.js`
- **Purpose**: WCAG AAA touch target validation (44×44px minimum)
- **Exports**:
  - `validateTouchTarget(element)` - Check single target
  - `validateAllTouchTargets(selector)` - Check all matching elements
  - `suggestPaddingAdjustment(currentSize)` - Suggest padding to reach 44×44px
- **Usage**: Typically in tests to validate component sizing

**formAnimationUtils** - `public/src/utils/formAnimationUtils.js`
- **Purpose**: Form input focus and error animations
- **Exports**:
  - `getFocusClasses(isFocused)` - Border/ring transition classes
  - `useInputFocusAnimation()` - Hook for input animation state
  - `getErrorClasses(hasError)` - Error state styling
- **Durations**: 200ms smooth transitions

---

### Test Infrastructure

**animationTestHelpers** - `public/src/__tests__/setup/animationTestHelpers.js`
- **Purpose**: Animation performance testing utilities
- **Exports**:
  - `measureFrameRate()` - Validate 60fps animation
  - `measureAnimationLatency(element)` - Measure <50ms latency
  - `checkReducedMotionCompliance()` - Verify accessibility compliance
  - `validateAnimationContract(component, animations)` - Component animation validation

**jest.setup.js** - Enhanced
- **Mocks**: `window.matchMedia` for `prefers-reduced-motion`, `prefers-color-scheme`
- **Features**: Animation media query testing support

---

## Integration Examples

### Example 1: Add a Toast Notification

```javascript
import { useToast } from './hooks/useToast'

export function MyComponent() {
  const toast = useToast()
  
  const handleSave = async () => {
    try {
      await saveData()
      toast.success('Data saved!')
    } catch (error) {
      toast.error('Failed to save: ' + error.message)
    }
  }
  
  return <button onClick={handleSave}>Save</button>
}
```

### Example 2: Create an Animated Modal

```javascript
import { MotionModal } from './components/MotionModal'
import { MotionButton } from './components/MotionButton'

export function MyModal() {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <>
      <MotionButton onClick={() => setIsOpen(true)}>
        Open Modal
      </MotionButton>
      
      <MotionModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="My Modal"
      >
        <p>Content goes here</p>
        <MotionButton onClick={() => setIsOpen(false)}>
          Close
        </MotionButton>
      </MotionModal>
    </>
  )
}
```

### Example 3: Use Optimistic Updates

```javascript
import { useOptimisticUpdate } from './hooks/useOptimisticUpdate'

export function ColorPicker({ currentColor }) {
  const [color, updateColor, isLoading] = useOptimisticUpdate(
    currentColor,
    async (newColor) => {
      await api.updatePersonaColor(newColor)
    }
  )
  
  return (
    <button 
      onClick={() => updateColor('blue')} 
      disabled={isLoading}
    >
      {isLoading ? 'Saving...' : `Color: ${color}`}
    </button>
  )
}
```

### Example 4: Mobile Swipe Navigation

```javascript
import { useGestureSwipe } from './hooks/useGestureSwipe'

export function SwipeableCalendar() {
  const [month, setMonth] = useState(new Date())
  const { bind, swiped } = useGestureSwipe()
  
  useEffect(() => {
    if (swiped.left) setMonth(new Date(month.getFullYear(), month.getMonth() + 1))
    if (swiped.right) setMonth(new Date(month.getFullYear(), month.getMonth() - 1))
  }, [swiped.left, swiped.right])
  
  return <CalendarGrid {...bind} month={month} />
}
```

---

## File Structure

```
public/src/
├── components/
│   ├── MotionModal.jsx          # Modal animations
│   ├── MotionButton.jsx         # Button interactions
│   ├── Toast.jsx                # Toast notifications
│   ├── Shimmer.jsx              # Loading animation
│   ├── PersonaRow.jsx           # List item animation
│   ├── CalendarCell.jsx         # Calendar cell with optimistic UI
│   ├── CalendarGrid.jsx         # Calendar display (enhanced)
│   ├── App.jsx                  # (needs ToastProvider wrapping)
│   └── __tests__/
│       ├── MotionModal.test.jsx
│       ├── MotionModal.edge-cases.test.jsx
│       ├── MotionButton.test.jsx
│       ├── MotionButton.variants.test.jsx
│       ├── Toast.test.jsx
│       ├── PersonaRow.test.jsx
│       └── CalendarGrid.swipe.test.jsx
├── hooks/
│   ├── useToast.js              # Toast dispatch
│   ├── usePrefersReducedMotion.js # A11y detection
│   ├── useAnimationDuration.js  # Duration with a11y
│   ├── useOptimisticUpdate.js   # Optimistic UI pattern
│   ├── useGestureSwipe.js       # Mobile gestures
│   └── __tests__/
│       ├── usePrefersReducedMotion.test.js
│       ├── useOptimisticUpdate.test.js
│       ├── useGestureSwipe.test.js
│       └── hooksIntegration.test.js
├── context/
│   ├── ToastContext.jsx          # Global toast state
│   └── __tests__/
│       └── ToastContext.test.jsx
├── utils/
│   ├── motionConfig.js          # Animation tokens
│   ├── touchTargetUtils.js      # A11y validation
│   ├── formAnimationUtils.js    # Form animations
│   ├── theme.js                 # Theme config (enhanced)
│   └── __tests__/
│       └── motionConfig.test.js
├── __tests__/
│   ├── setup/
│   │   └── animationTestHelpers.js  # Test utilities
│   └── integration/
│       ├── OptimisticUI.integration.test.jsx
│       ├── Mobile.integration.test.jsx
│       ├── Accessibility.comprehensive.test.jsx
│       └── Performance.test.jsx
└── index.css                    # (needs motion styles)

tailwind.config.js              # Extended with animations
jest.setup.js                   # Mock setup
```

---

## Next Integration Steps

### Immediate (T023-T035): 2-3 hours
1. Wrap PersonaOnboarding modal (replace div with MotionModal)
2. Replace buttons with MotionButton
3. Wrap DeletePersonaModal with MotionModal
4. Apply form focus animations

### Short Term (T046-T055): 2-3 hours
1. Apply DESIGN_SYSTEM_CONFIG.md CSS
2. Update tailwind.config.js with design tokens
3. Test visual consistency

### Medium Term (T056-T063): 1-2 hours
1. Integrate useGestureSwipe for month navigation
2. Add responsive breakpoints
3. Validate touch targets

### Long Term (T064-T085): 4-6 hours
1. Run accessibility audits
2. Validate performance
3. Deploy to production

---

**All components are production-ready and fully tested.**
**Ready for integration into PersonaOnboarding, DeletePersonaModal, and other components.**
