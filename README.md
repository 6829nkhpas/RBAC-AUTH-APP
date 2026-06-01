# Enterprise Task Scaffolder - Scalable REST API & React Dashboard

A professional-grade, full-stack task manager application designed for maximum architectural scalability, strict security standards, and smooth developer ergonomics. This project features a modular **Node.js, Express, and TypeScript** REST backend utilizing **Prisma ORM**, a high-performance **Redis Caching Layer**, multi-container **Docker Orchestrator Scaffolding**, and a stunning dark-mode glassmorphic **React (Vite + TypeScript)** administration dashboard client.

---

## 🏗️ System Architecture & Data Flow

This application is built around a layered, modular domain architecture that enforces strict separation of concerns, decoupling HTTP networking, payload validations, controller routing, and core service layers.

```
┌────────────────────────────────────────────────────────┐
│               React Frontend Client (Vite)             │
│   (Glassmorphism UI, Custom CSS, LocalStorage Session)  │
└───────────────────────────┬────────────────────────────┘
                            │ (JSON / HTTPS)
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Express Gateway Server                 │
│    (Helmet, CORS, Rate-Limiting, Morgan Logging)       │
└───────────────────────────┬────────────────────────────┘
                            │ (Routing & Validation)
                            ▼
┌────────────────────────────────────────────────────────┐
│             Request Security & Validation              │
│       (JWT Authentication & Zod Schema Validation)     │
└───────────────────────────┬────────────────────────────┘
                            │ (Validated Context)
                            ▼
┌────────────────────────────────────────────────────────┐
│                Modular Controllers Layer               │
│       (Resolves parameters and delegates to Services)  │
└───────────────────────────┬────────────────────────────┘
                            │ (Business Operations)
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Core Services Layer                    │
│    (Orchestrates business logic and queries data)      │
└───────────────┬────────────────────────┬───────────────┘
                │                        │
  (Cache Hit)   │                        │ (Cache Miss)
                ▼                        ▼
┌────────────────────────┐      ┌────────────────────────┐
│      Redis Cache       │      │   Prisma Database ORM  │
│  (High-Speed Memory)   │      │ (Generates SQL Queries)│
└────────────────────────┘      └───────────┬────────────┘
                                            │
                                            ▼
                                ┌────────────────────────┐
                                │    Database Engine     │
                                │ (SQLite/PostgreSQL DB) │
                                └────────────────────────┘
```

---

## ✨ Production-Ready Features

### 🔒 Enterprise Backend (Primary Focus)
*   **JWT Session Authentication & Hashing:** Stateless authentication using cryptographically signed JSON Web Tokens (JWT). User passwords are dynamically salted and hashed using high-entropy `bcryptjs` algorithms before storage.
*   **Double Password Verification & Name Registration:** Signups require double password entry matching on Zod schemas, storing the user's Full Name alongside credentials.
*   **Role-Based Access Control (RBAC):** Relational access guard separating `USER` vs. `ADMIN` roles. Regular accounts query and modify only owned tasks, while administrators override context, gaining full-system visibility to audit, read, and update all user records.
*   **Security Header & Rate Limits:** Integrates `helmet` for robust HTTP headers, CORS configurations to prevent unauthorized cross-origin requests, and `express-rate-limit` to prevent brute-force or DDoS attempts (100 requests per 15 minutes).
*   **Type-Safe Request Interception:** A generic schema runner validation middleware checks `req.body`, `req.query`, and `req.params` against strict Zod declarations before requests hit business controllers.
*   **Structured Winston File Logging:** Formatted system logs are outputted to physical files (`logs/combined.log`, `logs/error.log`) and structured color streams in local dev consoles.
*   **System Integrity & Graceful Shutdowns:** Intercepts system shutdown handlers (`SIGTERM`, `SIGINT`) to safely release database connection pools and exit active processes, preventing thread leaks.

### 🎨 Supportive Frontend Administration UI
*   **Sleek Glassmorphic Dark UI:** Designed using custom dark space colors, glowing glowing backdrops, and blur layout panels.
*   **Responsive Dashboard Layout:** Adapts dynamically to screens, displaying clean profile badges, role overrides, and interactive grid boards.
*   **Self-Dismissing Toast Messages:** Renders animated, color-coded floating notifications mapping success parameters or detailed validation mismatch logs.
*   **Dynamic Status Cycling:** Clickable task status badges that cycle values (`Todo` ➔ `In Progress` ➔ `Done`) instantly with backend API updates.

---

## 🛠️ Comprehensive Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Server Engine** | **Express, Node.js, TypeScript** | Layered, compile-validated backend REST server. |
| **ORM Layer** | **Prisma Client** | Unified SQL generators and automated database migrations. |
| **Database Engines** | **SQLite (Dev) / PostgreSQL (Prod)** | Portable databases. SQLite supports dev-ease; Postgres scales production. |
| **Memory Cache** | **Redis** | High-performance in-memory key-value data structure store to optimize read latencies. |
| **Container Engine** | **Docker & Docker Compose** | Orchestrates backend builds, isolated PostgreSQL instances, and Redis caches in a local production network. |
| **Payload Validation** | **Zod** | Enforces static type constraints and matching password confirmations. |
| **Authentication** | **JWT & Bcryptjs** | Stateful password hashing and stateless JWT bearer token verifications. |
| **API Documentation** | **Swagger UI (OpenAPI 3.0)** | servies interactive sandbox endpoints at `/api/v1/docs` directly from JSDoc specifications. |
| **Client Frontend** | **React, Vite, Lucide Icons** | Highly performant Single Page App (SPA) dashboard client. |

---

## 📊 Enterprise Scalability Roadmap (System Architect Highlights)

This application is designed to be decomposed and scaled horizontally under high-throughput conditions:

### 1. High-Performance Redis Caching (Cache-Aside Pattern)
*   **Caching Strategy:** For read-heavy operations (e.g. querying tasks or rendering global admin overview panels), the service implements the **Cache-Aside Pattern**:
    *   The app checks Redis for the requested dataset. If found (**Cache Hit**), the cached JSON payload is returned immediately, achieving sub-millisecond latencies.
    *   If not found (**Cache Miss**), the ORM queries PostgreSQL, caches the result in Redis with a Time-To-Live (TTL), and returns the payload.
*   **Write Invalidation:** When a task is added, updated, or deleted, a write-through invalidation clears the active cache key in Redis, ensuring data consistency across all user instances.

### 2. Database Scaling (Read/Write Partitioning)
*   **Index Optimizations:** Primary keys use UUIDs, and secondary tables include compound indexes on searching keys (such as `userId` and `email`) to optimize lookup speeds.
*   **Read Replicas:** Read operations (which constitute ~90% of dashboard traffic) are routed to a pool of Read-Only Database Replicas, while writes go exclusively to the Master database, reducing lock contention.

### 3. Load Balancing & Stateless Scale
*   **Horizontal Autoscaling:** The backend services are fully **stateless** (sessions are verified securely using client-side JWTs). This allows running multiple containers behind an **Nginx** or **AWS ALB** load balancer, scaling the container count dynamically under high CPU loads.
*   **PM2 Clustering:** Spawns instances across all available physical CPU cores on native environments.

### 4. Microservices Transition
*   The modular project design simplifies transition to a Microservices Architecture:
    *   **Identity Service:** Handles `/auth/*` (Logins, Signups, Token issuances).
    *   **Task Operations Service:** Manages task boards, using message brokers (such as RabbitMQ or Apache Kafka) to trigger slow notifications without blocking HTTP execution pools.

---

## 🚀 Automated Installation & Run Guide

### Prerequisite Checklist
*   [Node.js (v18+)](https://nodejs.org/) installed
*   [Git](https://git-scm.com/) installed
*   *(Optional)* [Docker Desktop](https://www.docker.com/) installed

---

### ⚡ Method 1: One-Click PowerShell Setup (Recommended for Windows)

We provide an automated, ASCII-safe PowerShell script at the root directory that handles environment configurations, package installations, Prisma client compilation, relational database migrations, and boots both the backend API and frontend dashboard client concurrently in active separate consoles.

1.  Open **PowerShell** and navigate to the project root:
    ```powershell
    cd "c:\Users\Naman Kumar\Desktop\assinglemt"
    ```
2.  Enable script execution policies for the active terminal session:
    ```powershell
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
    ```
3.  Run the orchestrator script:
    ```powershell
    .\setup-and-start.ps1
    ```
    This script will take care of everything and open two standalone consoles for both dev servers!

---

### 🛠️ Method 2: Manual Step-by-Step Installation

If you prefer to configure modules individually or are on a non-Windows environment, follow these steps:

#### Step A: Start the Backend REST API

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure variables:
    Verify or write `.env` parameters:
    ```env
    PORT=5000
    DATABASE_URL="file:./dev.db"
    JWT_SECRET="supersecretkeychangeinproduction"
    JWT_EXPIRES_IN="1d"
    NODE_ENV="development"
    ```
4.  Generate Prisma Client and run migrations:
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```
5.  Start the development server:
    ```bash
    npm run dev
    ```
    The server will startup on **`http://localhost:5000`**.
    *   **Interactive Swagger UI Sandbox:** Access **`http://localhost:5000/api/v1/docs`** to test endpoints from the browser.

---

#### Step B: Start the React Frontend UI

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Boot the Vite development server:
    ```bash
    npm run dev
    ```
    Open **`http://localhost:5173`** in your browser to interact with the dashboard.

---

### Step C: Multi-Container Docker Orchestration (Production Deployment)

To build and run the entire production-ready ecosystem including the Backend API, PostgreSQL database, and high-speed Redis cache in unified Docker containers:

```bash
docker-compose up --build
```
This command compiles the backend using our multi-stage optimized `Dockerfile`, spins up isolated Postgres and Redis volumes, configures container networks, and exposes the REST gateway on port `5000`.

---

## 🧪 Testing Walkthrough (Validation & RBAC Verification)

1.  **Register a Standard User:**
    *   Open `http://localhost:5173` and toggle to the "Sign up" screen.
    *   Input a test Full Name (e.g. `Jane Doe`), email (`jane@test.com`), password (`password123`), and repeat password confirm. Keep the Role as **User**.
    *   Submit, check the success toast, and explore the dashboard card list. Add some sample tasks.
2.  **Register an Admin User:**
    *   Log out from the current dashboard session.
    *   Register a new user (e.g. `admin@test.com`) and choose **Admin** from the role selector dropdown.
    *   Check the dashboard: You'll see a prominent **`ADMIN`** badge next to your email, and you'll see tasks created by the previous user, with owner email tags clearly mapped on the task cards!
3.  **Confirm Fine-Grained Security Checks:**
    *   Log out and log in back to the regular user account.
    *   Try querying an administrator endpoint via curl, or verify that the standard user dashboard only renders owned tasks, fully isolating non-owned records.
4.  **Interactive Swagger Sandbox:**
    *   Open `http://localhost:5000/api/v1/docs` in your browser.
    *   Try out the `/auth/login` endpoint with your email and password. Copy the resulting `token` from the response.
    *   Click **Authorize** at the top right of the Swagger UI page, paste the token, and click Authorize.
    *   You can now test all secured `/tasks` endpoints directly in the Swagger browser sandbox!
