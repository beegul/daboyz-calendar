# Contract: Mobile Components Interface

**Feature**: [007-multi-user-sync-mobile-ux](../spec.md)  
**Components**: React components for mobile layout  
**Date**: 2026-06-29  
**Status**: Phase 1 Contract

---

## Component Hierarchy

```
<App>
  {isMobile ? (
    <MobileView>
      <MobileHeader />
      <MobilePersonaSelector />
      <MobileCalendarLayout />
      {isOffline && <OfflineIndicator />}
    </MobileView>
  ) : (
    <DesktopView>{ /* existing layout */ }</DesktopView>
  )}
</App>
```

---

## MobileHeader

### Purpose
Display active persona, current month, sync status badge, and dark mode toggle in a compact header.

### Props

```typescript
interface MobileHeaderProps {
  activePersona: string | null; // Currently selected persona name
  darkMode: boolean; // Dark mode enabled
  onToggleDarkMode: (value: boolean) => void;
  syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
  lastSyncTime: number; // Milliseconds since epoch
  currentMonth: string; // e.g., "June 2026"
}
```

### Rendering Spec

```html
<header className="flex justify-between items-center px-4 py-2 bg-light dark:bg-dark">
  <!-- Left: Title -->
  <div className="flex-1">
    <h1 className="text-lg font-bold text-primary">
      {activePersona || "Onboarding"}
    </h1>
    <p className="text-sm text-gray-600 dark:text-gray-400">
      {currentMonth}
    </p>
  </div>
  
  <!-- Center: Sync Badge -->
  <SyncStatusBadge
    syncStatus={syncStatus}
    lastSyncTime={lastSyncTime}
  />
  
  <!-- Right: Dark Mode Toggle -->
  <button
    onClick={() => onToggleDarkMode(!darkMode)}
    className="ml-4 p-2 text-2xl"
  >
    {darkMode ? "☀️" : "🌙"}
  </button>
</header>
```

### Layout
- **Height**: 44–56px (touch-friendly)
- **Padding**: 8px horizontal, 4px vertical
- **Spacing**: Distribute evenly using flexbox
- **Responsive**: 375px–600px+ (no media queries needed)

### Behavior
- Title updates when activePersona changes
- Month updates when calendar navigates
- Sync badge updates every second (if synced) or in real-time (if syncing)
- Dark toggle is sticky (survives app reload)

---

## MobilePersonaSelector

### Purpose
Display available personas, highlight active persona, provide delete option for each.

### Props

```typescript
interface MobilePersonaSelectorProps {
  personas: Array<{ name: string; color: string }>;
  activePersona: string | null;
  onSelectPersona: (name: string) => void;
  onDeletePersona: (name: string) => void;
  isLoading?: boolean; // Show loading state while syncing personas
}
```

### Rendering Spec

```html
<div className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b">
  <div className="space-y-2">
    {personas.map(persona => (
      <div
        key={persona.name}
        className="flex items-center justify-between p-3 rounded-lg
                   bg-white dark:bg-gray-800
                   border-2 {activePersona === persona.name ? 'border-primary' : 'border-gray-200'}"
      >
        <!-- Left: Color dot + name -->
        <button
          onClick={() => onSelectPersona(persona.name)}
          className="flex items-center flex-1"
        >
          <span
            className="w-4 h-4 rounded-full mr-2"
            style={{ backgroundColor: persona.color }}
          />
          <span className="font-medium text-base">
            {persona.name}
          </span>
        </button>
        
        <!-- Right: Delete button (always visible) -->
        <button
          onClick={() => onDeletePersona(persona.name)}
          className="ml-2 p-2 text-red-500 hover:bg-red-50"
        >
          ✕
        </button>
      </div>
    ))}
  </div>
  
  <!-- Create new button -->
  <button
    className="w-full mt-3 p-3 border-2 border-dashed border-primary
               rounded-lg text-primary font-medium"
  >
    + Create Persona
  </button>
</div>
```

### Layout
- **Item Height**: 44px minimum (touch target)
- **Spacing**: 8px between items
- **Delete Button**: 32x32px minimum (visible at all times)
- **Scrollable**: Yes, if many personas (overflow-y auto, max-height ~200px)
- **Delete Visibility**: Icon always visible (NOT hover-dependent)

### Behavior
- Tap name/color dot to select persona
- Tap ✕ to delete (shows confirmation modal)
- Create button at bottom (disabled if isLoading)
- Active persona has highlighted border (2px primary color)

### Delete Interaction
```javascript
// On delete click
showConfirmModal({
  title: "Delete Persona?",
  message: "Are you sure? This will remove all associated dates.",
  onConfirm: () => onDeletePersona(name)
});
```

---

## MobileCalendarLayout

### Purpose
Display month calendar with date selection, no horizontal scroll required.

### Props

```typescript
interface MobileCalendarLayoutProps {
  activePersona: string | null;
  availability: Record<string, boolean>; // { 'YYYY-MM-DD': true/false }
  syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
  currentMonth: Date; // Current month being displayed
  onToggleDate: (date: string, value: boolean) => void; // Called when user taps date
  onPreviousMonth?: () => void;
  onNextMonth?: () => void;
}
```

### Rendering Spec

```html
<div className="p-4 bg-white dark:bg-gray-800">
  <!-- Month Navigation -->
  <div className="flex justify-between items-center mb-4">
    <button
      onClick={onPreviousMonth}
      className="p-2 text-xl rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      ←
    </button>
    <h2 className="text-lg font-bold">
      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
    </h2>
    <button
      onClick={onNextMonth}
      className="p-2 text-xl rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      →
    </button>
  </div>
  
  <!-- Day headers -->
  <div className="grid grid-cols-7 gap-1 text-center mb-2">
    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
      <div key={day} className="text-xs font-bold text-gray-600">
        {day}
      </div>
    ))}
  </div>
  
  <!-- Calendar grid -->
  <div className="grid grid-cols-7 gap-1">
    {/* Empty cells for days before month starts */}
    {Array(firstDayOfWeek).fill(null).map((_, i) => (
      <div key={`empty-${i}`} className="aspect-square" />
    ))}
    
    {/* Date cells */}
    {Array(daysInMonth).fill(null).map((_, i) => {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1);
      const dateStr = formatDate(date); // YYYY-MM-DD
      const isAvailable = availability[dateStr];
      
      return (
        <button
          key={dateStr}
          onClick={() => onToggleDate(dateStr, !isAvailable)}
          className="aspect-square rounded-lg text-base font-medium
                     bg-gray-50 dark:bg-gray-700
                     hover:bg-gray-100 dark:hover:bg-gray-600
                     transition-colors duration-0 (instant feedback)
                     border-2 border-transparent
                     {isAvailable ? 'bg-primary text-white border-primary' : 'border-gray-300'}"
        >
          <span>{i + 1}</span>
          {isAvailable && <span className="ml-1">✓</span>}
        </button>
      );
    })}
  </div>
</div>
```

### Layout
- **Grid**: 7 columns (Sun–Sat), auto rows
- **Cell Size**: 44x44px minimum (to fit in 375px viewport: 7 × 44 + gaps = ~320px)
- **Cell Content**: Date number (16px) + optional checkmark (✓)
- **Gaps**: 4px between cells
- **Text**: 16px+ for date numbers (readable without zoom)
- **Horizontal Scroll**: Prevented (full width, no overflow)

### Behavior
- Tap date to toggle availability
- Feedback is instant (0ms animation, color change)
- Syncronizing: Show spinner in corner, but allow interaction
- Error: Show error badge, but allow local changes (offline)

### Colors
```css
/* Available (marked) */
.available { background: #primary-color; color: white; }

/* Unavailable (unmarked) */
.unavailable { background: #gray-100; color: #gray-800; }

/* Today (optional visual) */
.today { border: 2px solid #primary-color; }

/* Syncing */
.syncing { opacity: 0.8; }
```

---

## SyncStatusBadge

### Purpose
Display "Last synced: 10s ago" or real-time sync status (syncing/error/offline).

### Props

```typescript
interface SyncStatusBadgeProps {
  syncStatus: 'synced' | 'syncing' | 'error' | 'offline';
  lastSyncTime: number; // Milliseconds since epoch
  onRetry?: () => void; // Called when user clicks retry (for error state)
}
```

### Rendering Spec

```html
<div className="flex items-center gap-2">
  {syncStatus === 'synced' && (
    <>
      <span className="text-green-600 text-lg">✓</span>
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {getRelativeTime(lastSyncTime)}
        {/* e.g., "10s ago", "2m ago" */}
      </span>
    </>
  )}
  
  {syncStatus === 'syncing' && (
    <>
      <span className="text-blue-600 text-lg animate-spin">↻</span>
      <span className="text-xs text-gray-600">Syncing...</span>
    </>
  )}
  
  {syncStatus === 'error' && (
    <>
      <span className="text-red-600 text-lg">⚠</span>
      <button
        onClick={onRetry}
        className="text-xs text-red-600 underline"
      >
        Retry
      </button>
    </>
  )}
  
  {syncStatus === 'offline' && (
    <>
      <span className="text-orange-600 text-lg">✕</span>
      <span className="text-xs text-gray-600">Offline</span>
    </>
  )}
</div>
```

### Layout
- **Size**: Compact (32px icon + text)
- **Location**: Top-right of header (or any accessible location)
- **Update Frequency**: Every second (if synced), real-time (if syncing/error)
- **Animation**: Spinning icon for syncing (uses Framer Motion instant config)

---

## OfflineIndicator

### Purpose
Alert user that app is offline and changes will sync when online.

### Props

```typescript
interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingCount: number; // Number of pending items in offline queue
  onDismiss?: () => void; // Allow user to manually close
}
```

### Rendering Spec

```html
{!isOnline && (
  <div className="fixed bottom-0 left-0 right-0 bg-orange-100 dark:bg-orange-900
                  border-t-2 border-orange-500 px-4 py-3 flex justify-between">
    <div>
      <p className="text-orange-800 dark:text-orange-100 font-medium">
        You are offline
      </p>
      <p className="text-sm text-orange-700 dark:text-orange-200">
        {pendingCount > 0
          ? `${pendingCount} change${pendingCount > 1 ? 's' : ''} will sync when online`
          : "Changes will sync when online"
        }
      </p>
    </div>
    {onDismiss && (
      <button
        onClick={onDismiss}
        className="ml-4 text-orange-800 dark:text-orange-100 text-xl"
      >
        ✕
      </button>
    )}
  </div>
)}
```

### Layout
- **Position**: Bottom banner (fixed) or inline (configurable)
- **Height**: 60–80px (2 lines text + padding)
- **Color**: Orange (warning, not error)
- **Auto-dismiss**: Optional (disappears when online, or stays with close button)

### Behavior
- Shown only when `!isOnline`
- Displays pending item count
- Auto-hides when online event fires
- User can manually dismiss (optional)

---

## Responsive Utilities

### useMobileLayout Hook

```typescript
interface UseMobileLayoutResult {
  isMobile: boolean; // < 600px
  isTablet: boolean; // 600px–999px
  isDesktop: boolean; // >= 1000px
  viewport: 'mobile' | 'tablet' | 'desktop';
}

function useMobileLayout(): UseMobileLayoutResult {
  const [viewport, setViewport] = useState('mobile');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 600) setViewport('mobile');
      else if (width < 1000) setViewport('tablet');
      else setViewport('desktop');
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    isMobile: viewport === 'mobile',
    isTablet: viewport === 'tablet',
    isDesktop: viewport === 'desktop',
    viewport
  };
}
```

### Usage in App.jsx

```javascript
const { isMobile } = useMobileLayout();

return (
  <>
    {isMobile ? (
      <MobileView>
        <MobileHeader {...} />
        <MobilePersonaSelector {...} />
        <MobileCalendarLayout {...} />
      </MobileView>
    ) : (
      <DesktopView>
        {/* Existing desktop layout */}
      </DesktopView>
    )}
  </>
);
```

---

## Testing Requirements

### Component Tests (React Testing Library)
- [ ] MobileHeader: Renders persona name, month, sync badge
- [ ] MobilePersonaSelector: List personas, tap to select, tap delete shows modal
- [ ] MobileCalendarLayout: Render month grid, tap date toggles availability
- [ ] SyncStatusBadge: Shows correct status icon and text
- [ ] OfflineIndicator: Shows when offline, hides when online
- [ ] useMobileLayout: Detects viewport size correctly

### Integration Tests
- [ ] Mobile full workflow: Select persona → mark dates → observe sync badge
- [ ] Offline → Online: Mark dates offline → sync badge shows syncing → synced
- [ ] Persona delete: Delete persona → modal appears → refresh shows no persona

---

**Contract Complete** ✅  
**Ready for**: Implementation (Phase 2, T124–T145)
