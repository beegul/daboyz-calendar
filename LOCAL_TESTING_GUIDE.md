# Local Testing Guide - Daboyz Availability Calendar

**Status**: ✅ **Ready for Local Testing**

The Shared Availability Calendar app is now fully functional and ready for local testing with all core features implemented.

## 🚀 Quick Start

### Prerequisites
- Node.js 26.4.0+ (or compatible version)
- npm 11.17.0+

### Start the Development Server

```bash
# In the project root directory
npm run dev
```

The app will start on `http://localhost:5174/` (or the next available port).

### App Features Now Available

✅ **Calendar UI**
- Monthly calendar grid display
- Previous/Next month navigation
- Responsive design (mobile, tablet, desktop)

✅ **User Management**
- Pre-loaded with 3 sample users: Alice, Bobby, Carmen
- User selector dropdown
- Color-coded user badges

✅ **Availability Marking**
- Click any date to toggle your availability
- Instant visual feedback (optimistic updates)
- Available users shown as colored badges on dates
- Remove availability by clicking the badge

✅ **Cross-Device Sync** (simulated)
- Automatic refresh every 5 seconds
- Manual refresh button
- Last-sync timestamp display
- Conflict detection (timestamp-based)

✅ **Data Persistence** (Mock Mode)
- Availability data persists in browser localStorage
- No Azure credentials needed for local testing
- "Using Mock Data (localStorage)" indicator shown in UI

✅ **Error Handling**
- Graceful fallback to mock data if backend unavailable
- User-friendly error messages
- Network error recovery and retry logic

## 📋 How to Test

### Test 1: Basic Calendar Navigation
1. Open http://localhost:5174/
2. Click "← Previous" and "Next →" buttons
3. Verify calendar displays correct dates for each month

### Test 2: Mark Availability
1. Select a user from dropdown
2. Click any date in the calendar
3. Verify colored badge appears for that user
4. Click again to unmark
5. Refresh page - data should persist

### Test 3: Multi-User Availability
1. Select different users and mark dates
2. View same date with multiple users marked
3. Verify badges stack/show "+X more" if many users

### Test 4: Cross-Device Sync Simulation
1. Open the app in two browser tabs (or different devices on same network if testing that way)
2. In Tab 1: Mark availability for a date
3. Watch Tab 2: Data should update within 5 seconds
4. Try clicking manual "🔄 Refresh" button

### Test 5: Responsive Design
1. Open app on desktop (1920x1080)
2. Verify calendar grid is readable
3. Open DevTools (F12) and set mobile view (iPhone 12)
4. Verify layout adapts: buttons stack, text is readable

## 📂 Project Structure

```
daboyz-calender/
├── public/
│   ├── index.html                 # React root HTML
│   └── src/
│       ├── main.jsx              # Vite entry point
│       ├── App.jsx               # Root component (state management)
│       ├── index.css             # TailwindCSS + custom styles
│       ├── App.css               # App-specific styling
│       ├── components/           # React components
│       │   ├── CalendarGrid.jsx
│       │   ├── UserSelector.jsx
│       │   ├── MonthNavigation.jsx
│       │   ├── AvailabilityBadge.jsx
│       │   └── UserLegend.jsx
│       ├── hooks/                # Custom React hooks
│       │   └── useAvailability.js (with mock fallback)
│       └── api/
│           ├── client.js         # HTTP client wrapper
│           └── mock.js           # Mock API (localStorage-backed)
├── api/                          # Azure Functions backend (Python)
│   ├── function_app.py           # Functions entry point
│   ├── requirements.txt          # Python dependencies
│   ├── routes/
│   │   ├── users.py
│   │   └── availability.py
│   └── models/
│       ├── table_storage.py
│       └── availability.py
├── vite.config.js               # Vite config with API proxy
├── jest.config.cjs              # Jest testing config
├── .babelrc.cjs                 # Babel config for JSX
├── package.json                 # npm dependencies
└── specs/
    └── 001-availability-calendar/
        └── tasks.md             # Implementation tasks (51/51 complete)
```

## 🔌 Data Storage Modes

### Local Development (Current Mode - No Setup Required)
- **Storage**: Browser localStorage
- **API**: Mock API with fallback
- **No credentials needed** ✅
- **Data persists** across page reloads within same browser

### Production Mode (When Azure Configured)
- **Storage**: Azure Table Storage
- **API**: Azure Functions backend
- **Requires**: Azure Storage Account connection string
- **Environment file**: `.env` or `.env.local`

## 🎨 Styling & Responsive Breakpoints

- **Mobile (< 640px)**: Single column layout, stacked buttons
- **Tablet (640px - 1024px)**: 2-column calendar grid
- **Desktop (> 1024px)**: Full 7-column calendar, side-by-side controls

Color scheme:
- Alice: Blue (#2563eb)
- Bobby: Amber/Orange (#f59e0b)
- Carmen: Green (#10b981)

## 🧪 Testing Commands

```bash
# Run tests (API client tests pass, component tests can be added)
npm test

# Build for production
npm run build

# Preview production build
npm run preview

# Format code
npm run format

# Lint code
npm run lint
```

## ⚠️ Known Limitations (Local Testing)

1. **No Real-Time Sync**: Sync happens via polling (5-second interval) not WebSockets
2. **No Database**: Using localStorage, so data is per-browser
3. **No Authentication**: Any user can mark availability for any other user
4. **No History**: Old data not archived, persists indefinitely

These are acceptable for local testing and can be enhanced for production.

## 🐛 Troubleshooting

### Port Already in Use
If port 5174 is in use, Vite will automatically try the next available port (5175, 5176, etc.). Check the terminal output for the actual URL.

### Mock Data Indicator Shows But I Have Backend Running
If you're running Azure Functions locally on port 7071 but the app shows "Using Mock Data":
1. Verify functions are running: `curl http://localhost:7071/api/health`
2. Check dev server proxy: `vite.config.js` has proxy configured
3. Check browser console (F12) for network errors

### Data Not Persisting
Check browser localStorage:
1. Open DevTools (F12)
2. Go to Application/Storage tab
3. Look for keys: `calendar_users`, `calendar_availability`
4. If missing, data will be recreated on next action

## 📞 Support

For issues or questions, check:
- `specs/001-availability-calendar/plan.md` - Architecture overview
- `specs/001-availability-calendar/spec.md` - Feature specifications
- Backend logs: Terminal where `npm run dev` is running
- Browser console: F12 → Console tab

---

**Version**: 1.0.0-local
**Last Updated**: 2026-07-01
**Status**: Ready for testing ✅
