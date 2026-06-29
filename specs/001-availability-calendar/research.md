# Research: Shared Availability Calendar

## Decision

Build a static browser-based calendar application using plain HTML, CSS, and JavaScript. The app will use browser `localStorage` to persist availability selections in the same browser and can be deployed to Azure Static Web Apps in the future.

## Rationale

- The user requested a static web application for friends to mark availability, which fits Azure Static Web Apps well.
- Static HTML/CSS/JS is the simplest and most maintainable approach for a browser-hosted calendar with no backend.
- `localStorage` provides lightweight persistence for the same browser session and supports the local testing requirement.
- A minimal toolchain like Vite enables fast local development and smooth future Azure deployment without introducing runtime complexity.

## Alternatives Considered

- Use a server backend or database: rejected because the feature is intended as a static web app initially and does not require cross-device sync for v1.
- Use a framework like React or Vue: rejected for the first version because plain JavaScript is sufficient and keeps the app lightweight.
- Use cookies or indexedDB: rejected in favor of `localStorage` for simplicity and broad browser support.
- Azure Static Web Apps was chosen as the future hosting target because it supports static sites directly and provides easy CI/CD integration.
