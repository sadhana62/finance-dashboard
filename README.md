# Finance Dashboard

This project is a React + Vite finance dashboard demo with three main surfaces:

- `Dashboard`: overview cards, charts, trends, and category breakdowns
- `Transactions`: record management with filters, add/edit/delete flows, and role-aware controls
- `Insights`: derived spending observations and practical summaries

The app uses a local mock JSON file as its data source, Redux Toolkit for state management, and `localStorage` to preserve user edits across refreshes in demo mode.

## Design Origin

This UI feels like a Figma-first dashboard exploration brought into code.

That is an inference from the structure and styling, not a literal export pipeline. The page is built with:

- large rounded cards
- glassmorphism-style surfaces
- soft gradients and blur
- dashboard-style typography hierarchy
- compact analytics widgets and visual summaries

In practice, the implementation behaves like a productized version of a finance dashboard mockup: the interface is highly visual, but the data interactions are wired through Redux and mock APIs rather than being static.

## Tech Stack

- React 19
- Vite
- Redux Toolkit
- React Redux
- Tailwind CSS v4 utilities
- Lucide React icons

## How To Run

```bash
npm install
npm run dev
```

Other scripts:

- `npm run build`: production build
- `npm run preview`: preview the production build
- `npm run lint`: run ESLint

## Project Goal

The goal of this project is to simulate a small personal-finance product UI without requiring a backend.

It demonstrates:

- a dashboard driven by derived calculations
- transaction CRUD-like behavior in the browser
- role switching between `admin` and `viewer`
- mock API loading states and error handling
- persistence of local demo actions with `localStorage`

## High-Level Architecture

At a high level, the app works like this:

1. `src/main.jsx` mounts React and wraps the app with the Redux `Provider`.
2. `src/App.jsx` initializes theme state, current page state, and dispatches the initial mock data load.
3. `src/store/financeSlice.js` owns the finance domain state and derived selectors.
4. `src/services/mockApi.js` reads `/public/mock/finance-data.json` through `fetch`.
5. `src/utils/finance.js` transforms raw transactions into dashboard metrics and insights.
6. `src/utils/localStorage.js` restores local changes and persists updates after every store change.
7. Page components render the current view based on Redux selectors and UI state.

## Data Flow Architecture

### Initial Load

The first load path is:

1. `App.jsx` checks whether Redux status is `idle`
2. it dispatches `initializeFinanceData()`
3. `initializeFinanceData()` calls these mock APIs in parallel:
   - `getDashboardOverview()`
   - `getTransactions()`
   - `getInsightsMeta()`
4. those functions all read the same file: `/mock/finance-data.json`
5. the fulfilled thunk stores:
   - dashboard config
   - transactions
   - insight metadata
6. selectors derive page-ready data from the raw state

### Persistence Layer

This app uses a hybrid mock-data + local-persistence approach:

- base data comes from `public/mock/finance-data.json`
- user edits are stored in browser `localStorage`
- on app startup, persisted transactions and filters are loaded first
- when the mock API data arrives, transactions are merged so local edits remain visible

This means:

- the JSON file is the seed dataset
- browser interactions do not rewrite that JSON file
- add/edit/delete actions are client-side state updates
- those updates survive refreshes because Redux state is saved into `localStorage`

### CRUD Behavior In This Demo

The app behaves like it has CRUD, but only `read` is implemented as a mock API call.

- `Read`: mock API through `fetch("/mock/finance-data.json")`
- `Create`: Redux reducer only
- `Update`: Redux reducer only
- `Delete`: Redux reducer only

So when a transaction is deleted, the flow is:

1. user clicks delete
2. custom confirmation dialog appears
3. confirm action dispatches `deleteTransaction(id)`
4. Redux removes the item from `state.transactions`
5. store subscription writes the latest finance state to `localStorage`

No network delete request is made.

## Folder Structure

```text
src/
  App.jsx
  main.jsx
  components/
    layout/
      AppShell.jsx
      Sidebar.jsx
      Topbar.jsx
    ui/
      RoleSwitcher.jsx
      ThemeToggle.jsx
      Tooltip.jsx
  pages/
    Dashboard.jsx
    Insights.jsx
    Transactions.jsx
  services/
    mockApi.js
  store/
    financeSlice.js
    index.js
  utils/
    finance.js
    formatters.js
    localStorage.js

public/
  mock/
    finance-data.json
```

## Entry Points And Core Modules

### `src/main.jsx`

This is the application bootstrap.

Responsibilities:

- imports global CSS
- creates the React root
- wraps the app with the Redux `Provider`
- injects the configured store

### `src/App.jsx`

This is the top-level application controller.

Responsibilities:

- stores the current theme in local component state
- stores the active page in local component state
- applies the `dark` class on `<html>`
- dispatches `initializeFinanceData()` on first load
- renders the current page inside `AppShell`
- shows a friendly error panel if mock loading fails

Routing is local-state based here, not URL-router based.

## Layout Modules

### `src/components/layout/AppShell.jsx`

This component frames the whole app.

Responsibilities:

- page background and shell structure
- desktop sidebar layout
- topbar rendering
- content spacing
- mobile bottom navigation

Notable behavior:

- desktop uses a left sidebar
- small screens switch to a bottom nav
- mobile nav was themed to match the glass-card design language used elsewhere

### `src/components/layout/Sidebar.jsx`

The desktop navigation component.

Responsibilities:

- project branding
- primary page navigation
- visual active state

It exports `navItems`, which are also reused by the mobile nav in `AppShell.jsx`.

### `src/components/layout/Topbar.jsx`

The compact header action area.

Responsibilities:

- role switching placement
- theme toggle placement

The earlier unused search field was removed so the header only contains controls that actually do something.

## UI Components

### `src/components/ui/RoleSwitcher.jsx`

Lets the user switch between:

- `admin`
- `viewer`

Why it matters:

- `admin` can add, edit, and delete transactions
- `viewer` can inspect data but should not see the same record-management controls

The switcher also uses the shared tooltip component for better clarity on compact buttons.

### `src/components/ui/ThemeToggle.jsx`

Toggles between light and dark themes by changing the `theme` state in `App.jsx`, which then toggles the `dark` class on the document root.

### `src/components/ui/Tooltip.jsx`

A lightweight reusable custom tooltip.

Current usage includes:

- theme toggle
- role switcher buttons
- transaction edit/delete icon buttons

This replaced reliance on default browser tooltips for key compact controls.

## Redux Store Architecture

### `src/store/index.js`

Creates the Redux store and subscribes to changes.

Important detail:

- after every store update, it calls `savePersistedFinanceState(store.getState().finance)`

That is why local UI actions continue to exist after refresh.

### `src/store/financeSlice.js`

This file is the core domain model of the app.

It contains:

- the finance slice state
- reducers
- async initialization thunk
- selectors
- derived selectors with `createSelector`

#### State Shape

The important state fields are:

- `status`
- `error`
- `role`
- `transactions`
- `filters`
- `dashboard`
- `insightsMeta`

#### Reducers

- `setRole(state, action)`: switches between admin and viewer
- `updateFilter(state, action)`: updates transaction filtering/sorting controls
- `resetFilters(state)`: restores default filters
- `addTransaction(state, action)`: prepends a new transaction with a generated `id`
- `updateTransaction(state, action)`: patches an existing transaction
- `deleteTransaction(state, action)`: removes a transaction by id

#### Async Thunk

`initializeFinanceData`

Responsibilities:

- loads dashboard config
- loads raw transactions
- loads insights metadata
- merges mock transactions with any already-persisted local transactions
- updates loading and error states

#### Selectors

Simple selectors:

- `selectRole`
- `selectTransactions`
- `selectTransactionFilters`
- `selectFinanceStatus`
- `selectFinanceError`

Derived selectors:

- `selectFilteredTransactions`
- `selectVisibleSummary`
- `selectInsightsData`
- `selectDashboardData`

These derived selectors are where raw records become UI-ready data.

## Utility Modules

### `src/utils/finance.js`

This file contains the business logic and derived data calculations for the app.

#### `defaultFilters`

The base state for the Transactions page filters:

- `search`
- `type`
- `sortBy`

#### `filterAndSortTransactions(transactions, filters)`

Used by the Transactions page.

It:

- filters by role-selected transaction type
- searches across merchant, category, type, amount, and date
- sorts by date or amount

This is the real search engine behind the Transactions page search input.

#### `summarizeTransactions(transactions)`

Calculates:

- visible income
- visible expense
- net visible amount

This powers the summary tiles on the Transactions page.

#### `buildInsights(transactions, insightsMeta)`

Builds insight-oriented derived content such as:

- top spending category
- month-over-month comparison
- observation card
- savings tip
- previous period insight
- category breakdown percentages

This is the main data engine for `Insights.jsx`.

#### `buildDashboardData(transactions, dashboardConfig, insights)`

Builds the dashboard-specific derived model:

- total balance
- current month income
- current month expense
- net savings
- balance trend
- monthly bars
- highest category
- health label
- goal progress

This is the main data engine for `Dashboard.jsx`.

### `src/utils/formatters.js`

Shared formatting helpers.

- `formatAmount(value, options)`: formats rupee amounts using `en-IN`
- `formatAmountByType(amount, type)`: adds sign conventions for income vs expense
- `formatDisplayDate(value)`: formats dates for transaction display
- `formatMonthLabel(value)`: formats `YYYY-MM` into readable month labels

### `src/utils/localStorage.js`

This module is responsible for demo persistence.

#### `loadPersistedFinanceState()`

Reads `finance-dashboard-redux` from browser `localStorage`.

Used during store initialization to restore:

- role
- filters
- transactions

#### `savePersistedFinanceState(financeState)`

Writes a reduced snapshot back into `localStorage`.

It intentionally persists:

- `role`
- `filters`
- `transactions`

It does not persist everything in the Redux store.

## Mock API Layer

### `src/services/mockApi.js`

This file simulates a backend read layer.

#### `readMockFinanceData()`

This is the internal helper used by all mock API functions.

It:

- fetches `/mock/finance-data.json`
- throws an error if the response is not OK
- parses JSON
- adds a small artificial delay with `setTimeout`

That delay helps the loading states feel realistic.

#### `getDashboardOverview()`

Returns:

- `data.dashboard`

Used by:

- `initializeFinanceData()` in `financeSlice.js`

#### `getTransactions()`

Returns:

- `data.transactions`

Used by:

- `initializeFinanceData()` in `financeSlice.js`

#### `getInsightsMeta()`

Returns:

- `data.insights`

Used by:

- `initializeFinanceData()` in `financeSlice.js`

### Important Note About Mock APIs

There is currently no mock API for:

- create transaction
- update transaction
- delete transaction

Those actions are handled in Redux reducers only.

If this project later needs a more backend-like architecture, the next step would be to move add/update/delete into async thunks and add mock service functions such as:

- `createTransaction(payload)`
- `updateTransaction(id, changes)`
- `deleteTransaction(id)`

## Mock Data File

### `public/mock/finance-data.json`

This is the seed dataset for the whole demo.

It contains three top-level keys:

- `dashboard`
- `transactions`
- `insights`

#### `dashboard`

Contains configuration-like values and seeded headline metrics:

- `balanceTrend`
- `goals`
- `recommendation`
- `forecastRunway`

#### `transactions`

Contains the raw ledger entries used throughout the app.

Each transaction has:

- `id`
- `merchant`
- `date`
- `amount`
- `category`
- `type`

This is the most important dataset because both Dashboard and Insights derive most of their values from it.

#### `insights`

Contains auxiliary copy data, currently:

- `observationHint`

This helps the insights engine produce more natural recommendations without hardcoding everything in the UI.

## Page Documentation

### Dashboard Page

File:

- `src/pages/Dashboard.jsx`

Purpose:

- show the current financial state at a glance
- convert transactions into trend views and category summaries

Main sections include:

- hero overview panel
- monthly health/highlights panel
- summary cards
- transaction volume trend chart
- expense breakdown panel
- bubble-style category panel
- income vs expense chart
- snapshot panel

How it gets data:

- raw transactions from Redux
- derived dashboard model from `selectDashboardData`
- additional chart analytics derived inside `Dashboard.jsx`

Important implementation detail:

`Dashboard.jsx` does not just display mock values directly. It recomputes many views from transaction history so the charts react when transactions change.

### Transactions Page

File:

- `src/pages/Transactions.jsx`

Purpose:

- manage and inspect the transaction ledger

Key features:

- add transaction form for admins
- labeled add transaction action button
- edit transaction flow
- delete transaction flow
- custom delete confirmation dialog
- transaction search
- type filter
- sorting controls
- visible-income and visible-expense summary tiles
- viewer/admin role-aware UI

How search works:

The transaction search now matches:

- merchant
- category
- type
- amount
- date

How sorting works:

The transaction sort control now supports:

- newest first
- oldest first
- highest amount
- lowest amount
- A to Z
- Z to A

How delete works:

- click delete icon
- open custom modal
- confirm deletion
- dispatch Redux delete reducer
- persist new state to `localStorage`

### Insights Page

File:

- `src/pages/Insights.jsx`

Purpose:

- turn raw transactions into readable guidance and summaries

Main sections:

- top insight cards
- cut-back opportunities
- quick savings ideas
- spending distribution

How it gets data:

- `selectInsightsData`
- transaction presence check from Redux

This page is largely a presentation layer over `buildInsights()` in `src/utils/finance.js`.

## Theme And Responsiveness

The app supports both light and dark modes using CSS variables and the `dark` class on the root element.

Responsive behavior includes:

- desktop sidebar
- mobile bottom navigation
- stacked card layouts on smaller screens
- chart panels that compress into single-column views

Some recent UI improvements in this codebase include:

- clearer transaction filter behavior in dark mode
- clearer add transaction button text
- custom in-app delete confirmation dialog
- themed mobile bottom navigation
- custom tooltips where compact controls needed explanation
- alphabetical transaction sorting
- removal of non-functional global search UI

## How A Change Propagates Through The App

A useful way to understand the architecture is to follow one action end to end.

### Example: Add Transaction

1. user opens the add form in `Transactions.jsx`
2. user submits merchant, date, amount, category, and type
3. `addTransaction()` reducer inserts the new item into Redux
4. selectors recompute filtered data, dashboard data, and insight data
5. UI updates automatically across all pages
6. store subscription persists the latest finance state to `localStorage`

### Example: Toggle Role

1. user switches role in `RoleSwitcher.jsx`
2. `setRole()` reducer updates Redux
3. pages re-render based on role
4. admin-only controls appear or disappear
5. role is persisted to `localStorage`

### Example: Refresh The Browser

1. app boots
2. persisted state is loaded from `localStorage`
3. mock API fetch runs
4. fetched transactions are merged with local persisted transaction state
5. final Redux state becomes the source of truth for rendering

## Limitations And Future Improvements

Current limitations:

- no URL routing
- no backend write API
- no server-side persistence
- no form validation library
- no unit/integration test coverage yet

Good next steps:

- add mock CRUD service methods and async thunks
- move from local page switching to React Router
- add tests for `buildInsights()` and `buildDashboardData()`
- add form validation and inline error messaging
- normalize transaction ids instead of relying on `Date.now()`
- add richer dashboard drill-down interactions

## Summary

This project is a front-end finance dashboard demo that starts from a visually polished dashboard-style design and turns it into a working application with:

- a mock read API
- Redux-managed state
- local persistence
- derived analytics
- role-aware transaction management
- responsive light/dark UI

The most important architectural idea is this:

The JSON file provides the seed data, Redux becomes the working source of truth, utility functions derive analytics from raw transactions, and `localStorage` preserves the demo interactions between sessions.
