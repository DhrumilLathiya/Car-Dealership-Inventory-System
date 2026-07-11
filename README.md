# AutoVault — Car Dealership Inventory System

A full-stack MERN application for managing a car dealership's vehicle inventory: customer registration and login, browsing and searching available vehicles, purchasing, and — for admins — full inventory control (create, update, delete, restock).

Built as a placement assessment kata, with two explicit engineering constraints driving every design decision in this codebase: **Test-Driven Development** and **SOLID principles**.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [SOLID Principles in This Codebase](#solid-principles-in-this-codebase)
- [Test-Driven Development Approach](#test-driven-development-approach)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Screenshots](#screenshots)
- [My AI Usage](#my-ai-usage)
- [Test Report](#test-report)
- [Deployment](#deployment)

---

## Features

**Authentication**
- User registration and login with hashed passwords (bcrypt)
- JWT-based session tokens, verified on every protected route
- Two roles — `user` and `admin` — enforced server-side; role can never be set by the client at registration

**Inventory (customer-facing)**
- Browse all available vehicles
- Search and filter by make, model, category, and price range
- Purchase a vehicle (disabled automatically when stock is zero)

**Inventory (admin-only)**
- Add, edit, and delete vehicle listings
- Restock existing vehicles
- All destructive/administrative actions are gated by both route middleware and UI-level role checks

**Frontend UX**
- Responsive single-page application
- Toast notifications and confirmation dialogs in place of `alert()` / `window.confirm()`
- Skeleton loading states, empty states, and inline validation

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), React Router, Context API |
| **Backend** | Node.js, Express |
| **Database** | MongoDB with Mongoose |
| **Auth** | JSON Web Tokens (jsonwebtoken), bcryptjs |
| **Testing** | Vitest, Supertest, @vitest/coverage-v8 |

---

## Project Structure

```text
backend/
  src/
    config/
      db.js                 # MongoDB connection only
      env.js                # Validates & exposes environment variables (fail-fast)
    models/
      User.js               # User schema, password hashing, comparePassword method
      Vehicle.js            # Vehicle schema with field-level validation
    middleware/
      authMiddleware.js     # protect (JWT verification), admin (role gate)
      validateObjectId.js   # Validates :id route params before hitting the DB
    controllers/
      authController.js     # register / login business logic
      vehicleController.js  # CRUD, search, purchase, restock business logic
    routes/
      authRoutes.js
      vehicleRoutes.js
    __tests__/
      auth.test.js
      vehicles.test.js
    app.js                  # Express app, middleware wiring, error handler
    server.js               # Entry point — connects DB, starts listener
    seed.js                 # Seeds an initial admin user + sample vehicles

frontend/
  src/
    context/
      AuthContext.jsx       # Auth state and actions only
      InventoryContext.jsx  # Vehicle state and actions only
      ToastContext.jsx      # Notification state only
    components/             # Presentational + interactive units
    pages/                  # Route-level views
    styles/                 # Design tokens and component styles
```

---

## SOLID Principles in This Codebase

SOLID is applied deliberately, not decoratively — each principle maps to a concrete structural decision below.

### Single Responsibility Principle
Every file has exactly one reason to change:
- `authController.js` only handles authentication logic; it doesn't know how to query vehicles.
- `vehicleController.js` only handles vehicle/inventory logic; it doesn't know how to issue JWTs.
- `config/db.js` only connects to MongoDB. `config/env.js` only validates and exposes environment variables. Neither does both.
- `authMiddleware.js` is split into two focused functions — `protect` (authentication: who are you?) and `admin` (authorization: are you allowed?) — rather than one function doing both jobs.
- On the frontend, `AuthContext` and `InventoryContext` are separate providers rather than one large "app state" context.

### Open/Closed Principle
- Mongoose schemas (`User.js`, `Vehicle.js`) are open for extension — new fields, virtuals, or instance methods can be added without touching the controllers that consume them.
- The middleware chain is composable: `validateObjectId.js` was added to existing routes (`PUT`, `DELETE`, `/purchase`, `/restock`) without modifying `authMiddleware.js` or the controllers at all — new behavior was *added*, nothing existing was *changed*.

### Liskov Substitution Principle
- Any route handler that expects `req.user` to be populated (via `protect`) receives a consistent shape regardless of role — `admin` middleware can be inserted or removed from a route without the downstream controller needing to change, because the contract (`req.user.role` exists and is trustworthy) always holds.
- `User.comparePassword()` behaves identically wherever it's called — controllers never need to know or care how the comparison is implemented internally.

### Interface Segregation Principle
- Frontend components depend only on the hook they actually need — `useAuth()` or `useInventory()` — instead of one monolithic `useAppState()` that would force every consumer to know about unrelated state.
- Backend routes only import the specific middleware functions they need (`protect`, or `protect` + `admin`, or `protect` + `validateObjectId`), rather than a single catch-all middleware bundle.

### Dependency Inversion Principle
- Controllers depend on the Mongoose model **abstraction** (`Vehicle.find()`, `User.create()`), not on raw MongoDB driver calls — the persistence mechanism could change without rewriting business logic.
- `server.js` and `authController.js` depend on `config/env.js`'s validated `env` object rather than reaching into `process.env` directly in multiple places — environment access is centralized behind one module.

---

## Test-Driven Development Approach

This project follows a **Red → Green → Refactor** cycle, and the commit history is structured to make that cycle visible rather than squashing it away:

1. **Red** — a test is written first, against an endpoint or function that doesn't exist yet (or doesn't yet handle a specific case). The test is run and confirmed to fail for the *right* reason.
2. **Green** — the minimum implementation needed to pass that test is written. Tests are run again and confirmed to pass.
3. **Refactor** — once green, the implementation is cleaned up (naming, structure, duplication) with tests re-run after each change to guarantee nothing broke.

Examples of this cycle in the test suite:
- `auth.test.js` — registration/login were built test-first, including a **regression test** (`should ignore a client-supplied role...`) written specifically to lock down a privilege-escalation fix and prevent it from silently reappearing.
- `vehicles.test.js` — CRUD, search, purchase, and restock were each covered by failing tests before their controller functions existed, including edge cases added after the fact: malformed/expired/forged JWTs, invalid `:id` formats, and combined multi-filter search.

Test coverage is measured with `@vitest/coverage-v8` (`npm run test:coverage`), reporting via `text`, `html`, and `json-summary` — see [Test Report](#test-report).

---

## API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user (always created as role `user`) |
| POST | `/api/auth/login` | Public | Authenticate and receive a JWT |
| GET | `/api/vehicles` | Authenticated | List all vehicles |
| GET | `/api/vehicles/search` | Authenticated | Search by make, model, category, price range |
| POST | `/api/vehicles` | Admin | Add a new vehicle |
| PUT | `/api/vehicles/:id` | Admin | Update a vehicle |
| DELETE | `/api/vehicles/:id` | Admin | Delete a vehicle |
| POST | `/api/vehicles/:id/purchase`| Authenticated | Purchase a vehicle (decrements quantity) |
| POST | `/api/vehicles/:id/restock` | Admin | Restock a vehicle (increments quantity) |

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- A running MongoDB instance (local or Atlas)

### Backend
```bash
cd backend
npm install
cp .env.example .env     # then fill in MONGODB_URI and JWT_SECRET
npm run seed             # optional — creates an admin user and sample vehicles
npm run dev
```

The server refuses to start if `JWT_SECRET` is not set — generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
By default the frontend expects the API at `http://localhost:5000`.

---

## Environment Variables

`backend/.env`:

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default `5000`) | Port the API listens on |
| `MONGODB_URI`| Yes | MongoDB connection string |
| `JWT_SECRET` | Yes — app will not boot without it | Secret used to sign/verify JWTs |
| `NODE_ENV` | No (default `development`) | Environment mode |

---

## Running Tests

```bash
cd backend
npm test                # run the full suite once
npm run test:watch      # watch mode during development
npm run test:coverage   # run with coverage report (text + html + json-summary)
```
Coverage output is written to `backend/coverage/` (`index.html` for the browsable report).

---

## Screenshots

*Add screenshots of the running application here before submission — e.g. login screen, dashboard/inventory view, add/edit vehicle modal, and the admin-only controls.*

| Login | Dashboard | Add Vehicle |
|---|---|---|
| *(screenshot)* | *(screenshot)* | *(screenshot)* |

---

## My AI Usage

**Which AI tools I used:** Antigravity, Claude, ChatGPT, GitHub Copilot, Gemini.

**How I used them:**
- **Antigravity:** Primary architect for the Test-Driven Development (TDD) workflow. Scaffolded complex test suites, implemented backend controllers and route wiring, and managed the Red-Green-Refactor Git commit sequencing. Created the React context structures.
- **Claude (Anthropic):** Engineered the fail-fast environment validation (`env.js`), the `ObjectId` validation middleware, and specialized UI layouts. Fixed privilege-escalation vulnerabilities in the registration endpoint.
- **ChatGPT:** Built the custom CSS token system and glassmorphism design approach. Structured the modal dialog forms and implemented component form validation.
- **GitHub Copilot:** Scaffolded core configuration files (`package.json`, `vite.config.js`) and the GitHub Actions CI pipeline for automated testing.
- **Gemini:** Designed the SVG vector assets, visual stock indicators (AvailabilityMeter), and the notification animation system.

**Reflection on how AI impacted my workflow:**
Using AI shifted a meaningful share of my time from "writing boilerplate" toward reviewing, verifying, and deciding. I spent more time reading generated code critically (does this actually close the vulnerability? does this test actually fail for the right reason?) than I would have typing the same code from scratch. It was particularly effective for catching issues that are easy to miss under deadline pressure, like a silently-truthy error-handler condition and a role field that should never have been client-writable. Where AI assistance mattered less was in judgment calls specific to the assessment's intent — e.g., how strictly to interpret "Red-Green-Refactor commit history" — which required my own decisions about what would be an honest representation of the work, not just a plausible-looking one.

---

## Test Report

*Run `npm run test:coverage` in `backend/` and paste the summary output below before submission.*

```
(paste `npm run test:coverage` summary output here)
```

---

## Deployment

This project is not currently deployed. It can be run locally by following the [Getting Started](#getting-started) instructions above.
