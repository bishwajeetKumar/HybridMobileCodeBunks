# Usage & Billing Platform — Contract Management Console

A React prototype for a bank-internal usage-based billing tool, styled after the
Chase design language. Data is persisted **locally in the browser via IndexedDB**.

## Roles

- **Admin — Blueprint Builder**: define the billing model architecture (payment vs.
  non-payment request headers, metered endpoints, SLA tracking fields) and publish
  immutable, versioned blueprint snapshots.
- **Contract Manager**: bind clients to a published blueprint and fill in the
  commercial values — USD rates, endpoint entitlement switches, SLA targets.
  Supports multiple clients and per-client blueprint upgrades. Export the finished
  contract as JSON.
- **Review**: a read-only, print-ready (Save-as-PDF) contract summary document.

## Getting started

```bash
npm install
npm run dev        # Vite dev server at http://localhost:5173
npm run build      # production build to dist/
npm run preview    # preview the production build
```

## Testing

Unit + component tests run on **Jest** with React Testing Library and an in-memory
IndexedDB (`fake-indexeddb`).

```bash
npm test               # run all tests
npm run test:coverage  # with coverage report
```

## Project structure

```
src/
├─ main.jsx                  App bootstrap
├─ App.jsx                   Role routing + persistence wiring
├─ styles/theme.css          Chase-aligned light theme
├─ components/               React views
│  ├─ TopBar.jsx             Wordmark lockup + role switcher
│  ├─ AdminView.jsx          Blueprint Builder
│  ├─ ContractManagerView.jsx
│  ├─ ReviewView.jsx         Read-only contract document
│  └─ Toast.jsx              Toast context/provider
├─ domain/                   Pure, unit-tested logic
│  ├─ blueprint.js           Sample data + store factory
│  ├─ reducer.js             All state transitions
│  └─ selectors.js           Derived views (summary, JSON export)
├─ db/                       Persistence
│  ├─ indexedDb.js           Promise-based IndexedDB KV wrapper
│  └─ store.js               load/save/clear the app store
├─ hooks/
│  └─ usePersistentStore.js  reducer <-> IndexedDB bridge
└─ utils/                    format.js, download.js
```

## Data & persistence

The entire application state (draft blueprint, published versions, clients, and
their contract values) is stored as a single record in IndexedDB
(`usage_billing_platform` DB → `kv` store → key `app_store_v1`). It hydrates on
load and saves (debounced) on every change. "Reset all data" clears the record and
reseeds the sample set.
