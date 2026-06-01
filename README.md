# Antigravity REST API & React Dashboard UI

A production-grade, highly scalable, and modular web application built using **Node.js, Express, TypeScript, and Prisma ORM**, paired with a stunning dark-mode glassmorphic **React (Vite + TypeScript) Dashboard** for interactive testing.

---

## 🏗️ System Architecture

The project is structured with a modular architecture that enforces separation of concerns, decoupling routes, request validation, controller orchestration, and core service layers.

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
                            │ (Routing)
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
                            │ (Business Parameters)
                            ▼
┌────────────────────────────────────────────────────────┐
│                 Core Services Layer                    │
│    (Database logic with Prisma ORM, Password hashing)  │
└───────────────────────────┬────────────────────────────┘
                            │ (Client Connection Pool)
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Database Engine                     │
│         (SQLite for Dev / PostgreSQL for Prod)         │
└────────────────────────────────────────────────────────┘
```

---

## ✨ Features Implemented

### 🔒 Backend REST API (Primary Focus)
*   **JWT Authentication & Password Security:** Stateless authentication via token-based validation. Password fields are salted and hashed using high-round `bcryptjs`.
*   **Role-Based Access Control (RBAC):** Restricts endpoints by user profile role (`USER` vs `ADMIN`). Standard users CRUD only owned tasks; administrators manage and view tasks across all users.
*   **Modularity & Layered Architecture:** Domain modules (`auth`, `tasks`) have dedicated files for validation, routing, controllers, and services.
*   **Express Protection Suite:** Combines `helmet` for HTTP headers, `cors` for cross-origin access control, and `express-rate-limit` for rate limiting (100 requests per 15 minutes).
*   **Robust Input Validation:** Standard Zod interceptor intercepts bodies, parameters, and queries, returning clear validation mappings.
*   **Central Winston Logging:** Formatted logging outputs saved to files (`logs/combined.log`, `logs/error.log`) and streamed dynamically to terminal logs via Morgan.
*   **Graceful Termination Handles:** Handles standard Unix signals (`SIGTERM`, `SIGINT`) to close database connection pools and finish active requests prior to shut down.
*   **Prisma Relational Mapping:** Relational user-to-task linkages with cascading deletes.

### 🎨 Basic Frontend (Supportive)
*   **Vite + React + TypeScript:** Accelerated build performance and type-safe components.
*   **Visual Excellence:** Sleek glassmorphic card elements, custom neon backglows, styled input forms, and badge indicators.
*   **Full CRUD Panels:** Allows users to create tasks, delete tasks, change task parameters via inline editing, and cycle statuses (`Todo` ➔ `In Progress` ➔ `Done`) by clicking interactive badges.
*   **Real-time custom Toast Notifications:** Self-destructing, color-coded status banners mapping API return messages.
*   **Superuser Admin Panel Toggle:** Displays owner labels and full-system tasks when logged in as an `ADMIN`.

---

## 🛠️ Tech Stack Details

| Component | Framework / Tool | Description |
| :--- | :--- | :--- |
| **Backend Core** | Express, TypeScript | Highly flexible Node.js REST server scaffolding. |
| **Database ORM** | Prisma | Automated TypeScript clients and migration trackers. |
| **Database Engine** | SQLite (Dev) / Postgres (Prod) | Zero-setup local files easily swappable with server pools. |
| **Input Check** | Zod | Schema-based static validation. |
| **Security Layer** | JWT, Bcryptjs, Helmet | Token controls, hashing, and header guards. |
| **Log Management** | Winston + Morgan | Console stream and persistent file logging. |
| **API Docs** | Swagger (OpenAPI 3.0) | Interactive testing served directly on the server. |
| **Frontend** | React, Vite, Lucide Icons | Responsive UI and smooth icon packs. |
| **Deployment** | Docker, Docker Compose | Orchestrates database, cache, and backend environments. |

---

## 📊 System Scalability & Production Note

For high-load production scaling, the following system architecture upgrades are recommended:

### 1. Database Scaling (Read/Write Splitting & Indexing)
*   **Swapping to PostgreSQL:** Prisma makes switching databases trivial. Simply swap `provider = "sqlite"` to `"postgresql"` in `schema.prisma` and point the `DATABASE_URL` to a Postgres instance.
*   **Database Indexing:** Add indexes to search fields and foreign keys (e.g. `userId` on `Task` and `email` on `User`) to ensure $O(1)$ query search performance under massive datasets.
*   **Read Replicas:** Scopes like `TasksService.getAllTasks` can query read-only database replica pools, keeping the primary database unburdened and dedicated to writes.

### 2. Caching (Redis Layer)
*   Integrate a **Redis Caching Service** in the services layer.
*   Frequently queried, slow-changing records (like global admin panels or user configurations) should be cached in Redis with a Time-To-Live (TTL). When tasks are updated, the cache is invalidated.

### 3. Load Balancing & Clustering
*   **Horizontal Scaling:** Run multiple backend API containers behind an **Nginx** or **HAProxy** load balancer.
*   **PM2 Clustering:** For bare-metal servers, run the backend using PM2's cluster mode to execute instances across multiple physical CPU cores.
*   **Stateless Operations:** Because authentication is managed completely via stateless JWTs, any incoming server can validate and service requests, ensuring limitless scaling potential.

### 4. Microservices Decomposition
*   As the application scales, decompose into standalone services:
    *   **Identity Service:** Register, Login, Token generation, and Role assignment.
    *   **Task Processing Service:** Core CRUD and processing queues (e.g., dispatching emails for task completions via RabbitMQ/Kafka).

---

## 🚀 Setup & Execution Guide

### Prerequisite Checklist
*   [Node.js (v18+)](https://nodejs.org/) installed
*   [Git](https://git-scm.com/) installed
*   *(Optional)* [Docker Desktop](https://www.docker.com/) installed

---

### ⚡ Method 1: One-Click PowerShell Setup (Recommended for Windows)

We provide an automated PowerShell script at the root directory that handles environment configurations, package installations, Prisma client compilation, relational database migrations, and boots both the backend API and frontend dashboard client concurrently in active separate consoles.

1.  Open **PowerShell** (as administrator if execution policies restrict script runs) and navigate to the project root:
    ```powershell
    cd "c:\Users\Naman Kumar\Desktop\assinglemt"
    ```
2.  Enable script execution policies for the active terminal session if needed:
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
3.  Configure variables (Preset by default):
    Inspect or edit `.env` configurations:
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
    *   **Interactive Swagger Documentation:** Access **`http://localhost:5000/api/v1/docs`** to inspect and run endpoints directly from the browser!

---

### Step B: Start the React Frontend UI

1.  Navigate to the frontend directory (Open a new terminal window):
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

### Step C: Multi-Container Docker Scaffolding (Production Deployment)

To build the entire application, PostgreSQL database, and Redis cache in unified Docker containers, execute the following from the root workspace:

```bash
docker-compose up --build
```
This builds the backend using our multi-stage optimized `Dockerfile`, spins up PostgreSQL, sets up Redis, and exposes the gateway on port `5000`.

---

## 🧪 Testing Walkthrough (Validation & RBAC Verification)

1.  **Register a Standard User:**
    *   Open `http://localhost:5173` and toggle to the "Sign up" screen.
    *   Input a test email (e.g. `user@test.com`) and password `password123`. Maintain the Role as **User**.
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
