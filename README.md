# AutoVault - Car Dealership Inventory System

AutoVault is a full-stack, single-page web application (SPA) designed to manage a car dealership's vehicle inventory. Built using the modern **MERN stack (MongoDB, Express.js, React, Node.js)** with **JavaScript**, it features robust **JWT (JSON Web Token) authentication**, role-based permission gates, a live search and filter engine, and database-backed transactional controls.

This project was built following a strict **Test-Driven Development (TDD)** pattern for the API logic.

---

## Technical Architecture

### Backend API (`/backend`)
*   **Engine:** Node.js with Express.js.
*   **Database:** MongoDB via Mongoose ODM.
*   **Authentication:** JWT token-based authentication (securely hashing passwords with `bcryptjs`).
*   **Test Suite:** Vitest + Supertest for fast, ES-module native integration testing.

### Frontend SPA (`/frontend`)
*   **Build Tool & Library:** React bootstrapped with Vite.
*   **State Management:** React Context API with custom hooks (`useAuth` and `useInventory`).
*   **Routing:** client-side routing via React Router DOM.
*   **Styling:** Custom Vanilla CSS design system. Employs a premium dark mode, glassmorphic card containers, micro-interactions, responsive grids, and Google Font **Outfit**.

---

## Repository Setup & Run Guide

### Prerequisites
Before running, make sure you have:
1.  **Node.js** (v18 or higher recommended) and **npm** installed.
2.  **MongoDB** running locally (default: `mongodb://127.0.0.1:27017/car-dealership`) or a MongoDB Atlas connection string.

---

### Step 1: Backend Setup
1.  Navigate to the `backend/` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environment variables. A default `.env` file has already been pre-configured for you, matching local defaults. If you need to make changes, copy `.env.example` to `.env` and edit:
    ```bash
    cp .env.example .env
    ```
4.  **Seed the database:** Populate your database with sample vehicles, a customer user, and an admin user:
    ```bash
    npm run seed
    ```
    *This generates two accounts: `user@example.com` (customer) and `admin@example.com` (administrator), both with password `password123`.*
5.  Start the backend server in development mode:
    ```bash
    npm run dev
    ```
    *The server will run on `http://localhost:5000`.*

---

### Step 2: Frontend Setup
1.  Open a new terminal and navigate to the `frontend/` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite development server:
    ```bash
    npm run dev
    ```
    *The frontend application will spin up at `http://localhost:3000` and automatically proxy all API requests to the backend.*

---

## Running the TDD Test Suite

To run the integration tests and verify that the authentication and vehicle business logic are fully secure:

1.  Navigate to the `/backend` folder:
    ```bash
    cd backend
    ```
2.  Execute the test runner:
    ```bash
    npm run test
    ```
    *This runs the test suites at `backend/src/__tests__/auth.test.js` and `backend/src/__tests__/vehicles.test.js` using Vitest.*
3.  To run tests with code coverage reports:
    ```bash
    npm run test:coverage
    ```

---

## User Roles & Evaluation Guide

To test the application, register your own account or log in with the pre-seeded credentials:

### 1. Customer User (`user@example.com` / `password123`)
*   **Access:** Can see the inventory catalog dashboard and search/filter cars.
*   **Action:** Can purchase cars by clicking **Purchase**. The stock count decreases by 1 in the database. When the stock reaches 0, the button automatically disables, showing **Sold Out**.
*   **Security:** Attempting to trigger administrative operations (e.g. POST, PUT, DELETE, or restock) will fail with a `403 Forbidden` response.

### 2. Administrator User (`admin@example.com` / `password123`)
*   **Access:** Has access to customer controls as well as administrative forms.
*   **Action:**
    *   Click **Add New Vehicle** at the top right to open the insertion form.
    *   Click **Edit** on any car card to update its model, manufacturer, category, price, or stock levels.
    *   Click **Restock** to input a quantity to add to the existing stock (adds directly, e.g., 5 + 10 = 15).
    *   Click **Delete** to permanently delete a vehicle from the dealership directory.

---

## Backend Hardening Notes

A follow-up review pass identified and fixed the following issues in the backend:

*   **Privilege escalation (security):** `POST /api/auth/register` previously trusted a client-supplied `role` field, letting anyone self-register as `admin` and bypass every admin-only guard. Registration now always creates `role: 'user'`; admin accounts are provisioned only via `npm run seed` or directly in the database.
*   **Weak JWT secret fallback (security):** `JWT_SECRET` had a hardcoded fallback string baked into the code. The app now validates required env vars at startup (`src/config/env.js`) and refuses to boot if `JWT_SECRET` is missing, instead of silently signing tokens with a guessable default.
*   **Incorrect error status code (bug):** the global error handler always returned HTTP `555` due to `res.status(555 || res.statusCode)` (a non-zero literal is always truthy). It now correctly falls back to `500` or a status already set on the response.
*   **Malformed `:id` handling (robustness):** routes with an `:id` param now validate it's a well-formed Mongo ObjectId before hitting the database, returning a clean `400` instead of a confusing `500` on a bad id.
*   **Test coverage tooling:** `npm run test:coverage` referenced `vitest run --coverage` without the required coverage provider installed. `@vitest/coverage-v8` has been added and `vitest.config.js` configured with `text`, `html`, and `json-summary` reporters.
*   **New tests:** malformed/expired/forged JWT handling, combined multi-filter search (make + category + price together), invalid vehicle-id format on update/delete/purchase/restock, and a regression test locking down the role-escalation fix.



### AI Tool Used
*   **Antigravity** (Google DeepMind agentic coding assistant).

### Scope of AI Collaboration
1.  **Architecture Brainstorming & Setup:** Brainstormed directory arrangements, package configurations, database schema layout, and Vite proxy mappings to support the MERN stack with JavaScript.
2.  **TDD (Test-Driven Development) Design:** Assisted in writing comprehensive integration test structures for user sign-up/login, CRUD transactions, and inventory depletion/restock parameters *before* code logic was written.
3.  **Core Backend Implementation:** Wrote Mongoose schemas, JWT generation hooks, cryptographic hashing middleware, router endpoints, and controller logic to make the tests pass.
4.  **Frontend Component Architecture:** Drafted React components (Navbar, Cards, Modals), created state-sharing context structures (`AuthContext` and `InventoryContext`), and built forms linked to backend API paths.
5.  **Vanilla CSS Design System:** Structured CSS variables, dark mode styling, and hover animations, meeting the premium visual expectations.

### Reflection
The collaboration with Antigravity streamlined development. Writing integration tests first forced us to plan our API schemas and endpoint behaviors precisely. Having the AI construct boilerplate controllers, router mappings, and form states reduced setup time, allowing focus to remain on security permissions, database transaction safety, and polishing visual layouts.
