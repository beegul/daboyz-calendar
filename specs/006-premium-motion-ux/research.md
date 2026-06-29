# Research Document: Premium Motion & Interaction Design

**Date**: 2026-06-29 | **Feature**: specs/006-premium-motion-ux

## Executive Summary

**Finding**: Daboyz Calendar has strong foundational patterns (Tailwind, accessibility-first components, Jest coverage, React hooks). Premium motion UX requires targeted additions: Framer Motion library, custom toast/optimistic UI hooks, prefers-reduced-motion compliance, and Tailwind animation extensions.

**Best-in-Class Approach**: Leverage existing accessibility model (OfflineWarning, aria-attributes), extend it to motion context. Use Framer Motion for orchestrated animations, CSS for simple transitions, and custom React hooks to bridge optimistic UI with motion.

---

## Decision: Framer Motion + react-use-gesture

### Decision
**Use Framer Motion for all complex animations** (modal stagger, FLIP layout morphing, gesture-driven transitions). Pair with `react-use-gesture` for velocity-based swipe gestures.

### Rationale
- **Framer Motion** (~35 kB gzipped): Best-in-class library for staggered animations, layout morphing (FLIP), and gesture integration. Industry standard (used by Linear, Figma, Stripe).
- **react-use-gesture** (~6 kB gzipped): Handles pointer/touch/mouse events consistently. Calculates velocity automatically for natural swipe animations.
- **Total impact**: ~41 kB gzipped. Within 30-50 kB budget. Allows CSS-only animations for lightweight transitions (hover, simple scale/fade).

### Alternatives Considered
- **Pure CSS Transitions**: Insufficient for staggered animations, FLIP layout transitions, velocity-based gestures. Would require complex JavaScript calculations.
- **React Spring**: More powerful but heavier (~40 kB). Framer Motion's gesture integration simpler than react-spring.
- **Custom JavaScript**: High maintenance, error-prone for complex animations. Not worth the bundle savings.

### Implementation Pattern
```javascript
// Modal entrance: staggered animation with Framer Motion
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.9 }}
  transition={{ duration: 0.3, ease: 'easeOut' }}
>
  <motion.h1
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.05, duration: 0.2 }}
  >
    Modal Title
  </motion.h1>
  {/* content with staggered entry */}
</motion.div>

// Swipe gesture: velocity-based month navigation
import { useGesture } from '@use-gesture/react';
import { useSpring, animated } from '@react-spring/web';

useGesture({
  onSwipe: ({ offset: [offsetX] }) => {
    // Next month if swiped left (offsetX < -50)
    // Previous month if swiped right (offsetX > 50)
  },
});
```

---

## Decision: Accessibility-First prefers-reduced-motion

### Decision
**Disable all animations when `prefers-reduced-motion: reduce`**. Transitions remain instant (no delays). Implement via media query check in Tailwind + React hook.

### Rationale
- **WCAG 2.1 AA compliance**: Respects user OS settings (macOS "Reduce motion", Windows "Turn off animations", iOS "Reduce Motion").
- **Inclusive design**: Animations can cause vestibular issues, migraines, or cognitive overload. Disabling them is non-negotiable.
- **Easy to implement**: Wrap Framer Motion animations in boolean check. Use `@media (prefers-reduced-motion: reduce)` in CSS.
- **Test coverage**: Jest setup already partially supports this via matchMedia mock. Extend it.

### Implementation Pattern
```javascript
// React hook
const usePrefersReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    mq.addEventListener('change', e => setPrefersReduced(e.matches));
  }, []);
  return prefersReduced;
};

// Usage in component
const prefersReduced = usePrefersReducedMotion();
<motion.div
  variants={variants}
  animate="visible"
  transition={prefersReduced ? { duration: 0 } : { duration: 0.3 }}
>
  {children}
</motion.div>
```

### Alternatives Considered
- **Ignore OS setting; add app-level toggle**: Non-compliant, puts burden on user to find setting.
- **Provide non-motion feedback alternatives**: Complex, redundant with disabling animations entirely.
- **Only disable non-critical animations**: Inconsistent, confusing to users. All-or-nothing approach is clearer.

---

## Decision: Error Toast + Automatic Rollback

### Decision
**Show error toast + automatically rollback optimistic state after 3s timeout**. User sees failure, state corrects itself, can retry by repeating action.

### Rationale
- **Transparency**: User knows action failed. Silent rollback causes confusion ("Where did my change go?").
- **Simplicity**: Auto-rollback is simpler than manual retry flows. No extra click needed.
- **UX Pattern**: Industry standard (Gmail, Linear, Slack). Users expect this behavior.
- **Testability**: Easier to test than manual retry state machines.

### Implementation Pattern
```javascript
// useOptimisticUpdate hook
const useOptimisticUpdate = (entity, updateFn, onError) => {
  const [optimistic, setOptimistic] = useState(entity);
  const [isLoading, setIsLoading] = useState(false);
  
  const update = useCallback(async (newValue) => {
    const previousValue = optimistic;
    setOptimistic(newValue);  // Instant UI update
    setIsLoading(true);
    
    try {
      await updateFn(newValue);
      setIsLoading(false);
    } catch (e) {
      // Auto-rollback
      setOptimistic(previousValue);
      setIsLoading(false);
      onError?.({ message: 'Failed to update', duration: 4000 });
    }
  }, [optimistic, updateFn, onError]);
  
  return [optimistic, update, isLoading];
};
```

### Alternatives Considered
- **Silent auto-rollback**: Confuses users. No feedback.
- **Manual retry button**: Extra friction. Users expect auto-retry.
- **Ignore failures**: Leads to data inconsistencies.

---

## Decision: Toast Notification System

### Decision
**Create `useToast()` hook + `Toast` component** with slide-in/out animations, auto-dismiss (4s), and ARIA live regions.

### Rationale
- **Accessibility**: Existing codebase uses `aria-live="polite"` successfully (OfflineWarning component). Extend pattern to toasts.
- **Reusability**: Many features need notifications (success, error, info). Centralized hook reduces duplication.
- **Animation**: Slide-up from bottom aligns with spec (success toast "slides up from bottom"). Use CSS transitions for smooth entry/exit.
- **Context-based**: Toast context allows child components to dispatch notifications without prop drilling.

### Implementation Pattern
```javascript
// ToastContext.jsx + useToast hook
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  return {
    success: (msg, duration = 4000) => context.add({ type: 'success', msg, duration }),
    error: (msg, duration = 4000) => context.add({ type: 'error', msg, duration }),
    info: (msg, duration = 3000) => context.add({ type: 'info', msg, duration }),
  };
};

// Toast.jsx - component with slide animation
<motion.div
  initial={{ y: 100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  exit={{ y: 100, opacity: 0 }}
  transition={{ duration: 0.2 }}
  role="status"
  aria-live="polite"
>
  {icon} {message}
</motion.div>
```

### Alternatives Considered
- **No toast system**: Rely on modal alerts. Too disruptive, clunky UX.
- **Third-party library (react-toastify, react-hot-toast)**: Adds dependency, less control. Custom hook aligns with existing patterns.

---

## Decision: Tailwind Animation Extensions

### Decision
**Extend Tailwind config with animation keyframes, easing curves, and duration design tokens**. Use `@apply` helpers for reusable motion utilities.

### Rationale
- **Design System**: Animations are part of design system, not ad-hoc. Tailwind config centralizes motion definitions.
- **Consistency**: All transitions use same easing curves (ease-out, ease-in-out), durations (300ms, 200ms). Prevents motion chaos.
- **Maintainability**: Update motion globally from one place. Tailwind plugins extend easily.
- **Performance**: CSS animations are GPU-accelerated. Cheaper than JavaScript-driven animations.

### Implementation Pattern
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out',
        scaleUp: 'scaleUp 0.2s ease-out',
        slideUp: 'slideUp 0.3s ease-out',
        flipLayout: 'none', // Handled by Framer Motion
      },
      transitionDuration: {
        'motion-fast': '100ms',
        'motion-base': '200ms',
        'motion-slow': '300ms',
      },
      transitionTimingFunction: {
        'motion-out': 'cubic-bezier(0.16, 1, 0.3, 1)', // ease-out-quart
        'motion-in': 'cubic-bezier(0.7, 0, 0.84, 0)',  // ease-in-quart
        'motion-smooth': 'cubic-bezier(0.4, 0.0, 0.2, 1)', // material ease
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        scaleUp: { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        slideUp: { '0%': { transform: 'translateY(100px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.motion-safe': { '@media (prefers-reduced-motion: no-preference)': { /* apply animations */ } },
        '.motion-reduce': { '@media (prefers-reduced-motion: reduce)': { animationDuration: '0.01ms', transitionDuration: '0.01ms' } },
      });
    }),
  ],
};
```

---

## Decision: Touch Target Sizing (44×44px WCAG AAA)

### Decision
**Enforce 44×44px minimum for ALL interactive elements**. Use CSS padding/margins for spacing. Do NOT reduce visual hit area.

### Rationale
- **WCAG 2.5.5 Level AAA**: 44×44 CSS pixels is accessibility gold standard. Prevents mis-taps for all users, especially those with motor impairments.
- **Consistency**: Uniform standard across buttons, toggles, date cells, links. No exceptions = no confusion.
- **Easy to implement**: Tailwind classes (`h-11 w-11` = 44×44px). Button with padding inside that area.

### Implementation Pattern
```javascript
// Button component (44×44px minimum)
<button className="h-11 w-11 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
  {icon}
</button>

// Date cell (44×44px minimum)
<div className="h-11 w-11 flex items-center justify-center border border-gray-200 rounded cursor-pointer hover:bg-blue-50">
  {date}
</div>

// Verify in tests
expect(button).toHaveStyle('height: 44px; width: 44px');
```

### Alternatives Considered
- **OS-specific sizing (iOS 44px, Android 48px)**: Over-engineered for web. 44px works universally.
- **Smaller targets with hover states**: Violates accessibility standard. Too many misclicks.

---

## Decision: Optimistic UI Implementation via Custom Hooks

### Decision
**Create `useOptimisticUpdate` and `useGestureSwipe` custom hooks** to decouple optimistic state management and gesture handling from component logic.

### Rationale
- **Reusability**: Multiple components need optimistic updates (create, delete, toggle). Hook pattern avoids duplication.
- **Testability**: Pure functions easier to test than component logic intertwined with state.
- **Separation of Concerns**: Component renders UI; hook manages async + optimistic state + rollback.
- **Consistency**: All optimistic updates follow same pattern (rollback on error, toast notification, 3s timeout).

### Implementation Pattern
```javascript
// hooks/useOptimisticUpdate.js
export const useOptimisticUpdate = (entity, updateFn) => {
  const { error: showError, success: showSuccess } = useToast();
  const [optimistic, setOptimistic] = useState(entity);
  const [isLoading, setIsLoading] = useState(false);
  
  const update = useCallback(async (newValue) => {
    const previous = optimistic;
    setOptimistic(newValue);
    setIsLoading(true);
    
    try {
      await updateFn(newValue);
      showSuccess('Updated successfully', 3000);
    } catch (err) {
      setOptimistic(previous);
      showError(`Failed to update: ${err.message}`, 4000);
    } finally {
      setIsLoading(false);
    }
  }, [optimistic, updateFn, showError, showSuccess]);
  
  return { value: optimistic, update, isLoading };
};

// hooks/useGestureSwipe.js
export const useGestureSwipe = (onSwipeLeft, onSwipeRight) => {
  const ref = useRef(null);
  
  useGesture({
    onSwipe: ({ offset: [offsetX] }) => {
      if (offsetX < -50) onSwipeLeft?.();
      if (offsetX > 50) onSwipeRight?.();
    },
  }, { target: ref });
  
  return ref;
};
```

---

## Decision: React 19 Features (useTransition, useOptimistic)

### Decision
**Check for React 19 features**. If available, leverage `useOptimistic()` for built-in optimistic UI. Otherwise, use custom hook.

### Rationale
- **React 19 Concurrency**: `useOptimistic()` is battle-tested pattern in Next.js. Better than custom implementation.
- **Graceful Degradation**: If React <19, fallback to custom hook (already written). No breaking changes.
- **Feature Detection**: Runtime check prevents build errors if React version mismatch.

### Implementation Pattern
```javascript
// Detect React 19 at runtime
const hasUseOptimistic = typeof React.useOptimistic !== 'undefined';

// Use built-in or custom
const useOptimisticState = hasUseOptimistic ? React.useOptimistic : useOptimisticUpdateCustom;
```

---

## Summary: Cutting-Edge Approach

| Decision | Rationale | Bundle Impact | Accessibility |
|----------|-----------|---------------|----------------|
| **Framer Motion + react-use-gesture** | Industry standard, velocity-based gestures | +41 kB gzipped | ✅ Paired with prefers-reduced-motion |
| **prefers-reduced-motion compliance** | WCAG 2.1 AA, respects user preferences | 0 kB | ✅ Core accessibility |
| **Error toast + auto-rollback** | Transparent UX, no silent failures | ~5 kB (toast component) | ✅ aria-live for screen readers |
| **Toast notification system** | Reusable, accessibility-first | ~3 kB (hook+component) | ✅ aria-live, aria-label |
| **Tailwind animation extensions** | Design system, GPU-accelerated | ~1 kB (config) | ✅ motion-safe/motion-reduce utilities |
| **44×44px touch targets (WCAG AAA)** | Accessibility gold standard, universal | 0 kB | ✅ Mandatory for mobile |
| **Custom optimistic UI hooks** | Reusable, testable, consistent | ~2 kB (hooks) | ✅ Works with prefers-reduced-motion |
| **React 19 feature detection** | Future-proof, graceful degradation | 0 kB | ✅ No breaking changes |

**Total Bundle Impact**: ~41 kB gzipped (Framer Motion + react-use-gesture). Within 30-50 kB budget. Leaves room for toast, hooks, and Tailwind animations.

**Timeline**: Phase 0 research complete. Proceed to Phase 1 Design & Contracts.
