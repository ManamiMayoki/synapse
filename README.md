# Synapse: Smart CSE Department Lab & Asset Management System

> An enterprise-grade, interactive MERN stack platform designed to streamline university computer lab operations, hardware inventory tracking, and real-time PC maintenance ticketing through an immersive 3D interface.

## Key Features

* **3D Interactive Lab Environment:** Built with **Three.js**, **React Three Fiber**, and **GSAP** to let students visually explore lab layouts and click workstations/devices to report issues or check out gear.
* **Smart Hardware Inventory (Lab Checkout):** QR/barcode-enabled tracking for expensive components (Arduino boards, sensors, routers) with automated due-date auditing.
* **PC Maintenance Ticketing:** Instant issue reporting tied directly to specific lab stations (Hardware, Software, or Network failures).
* **AI-Powered Predictive Maintenance:** Analyzes historical ticket logs to flag high-risk hardware prone to future failure.
* **Role-Based Access Control (RBAC):** Secure separation of duties for Students, Lab Assistants, and Administrators.

## Tech Stack

* **Frontend:** React.js, Vite, Tailwind CSS, Three.js, React Three Fiber, GSAP, Lucide Icons
* **Backend:** Node.js, Express.js (Strict MVC Architecture)
* **Database:** MongoDB & Mongoose ODM
* **Security & Auth:** JSON Web Tokens (JWT), bcrypt, Helmet, Express Rate Limit, Input Sanitization
* **DevOps & Testing:** Docker, Docker Compose, GitHub Actions (CI/CD), Postman, Newman (CLI), Apache JMeter

## Project Architecture & Milestones (Lab Requirements)

- **Lab-01:** Git/GitHub version control workflow & Linux/Docker server setup with automated GitHub Actions CI/CD pipelines.
- **Lab-02:** API integration testing using Postman, Newman CLI execution, and Apache JMeter load testing.
- **Lab-03:** MVC backend architecture with complete CRUD operations for inventory and equipment.
- **Lab-05:** Secure user registration, login, JWT middleware protection, and RBAC implementation.
- **Lab-06:** Production security hardening (HTTPS configuration, rate limiting, Helmet security headers, CORS policies, and input sanitization).

## Repository Structure

```text
Synapse/
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions CI/CD pipeline
├── client/                     # Vite + React 3D Frontend
│   ├── public/                 # Static assets & 3D models
│   ├── src/
│   │   ├── components/         # UI components & 3D canvases
│   │   ├── context/            # React Auth & Lab Context
│   │   ├── services/           # Axios API services
│   │   ├── App.jsx             # Main router & layout
│   │   ├── index.css           # Tailwind & custom CSS
│   │   └── main.jsx            # React root entry
│   ├── package.json
│   └── vite.config.js
├── server/                     # Express.js REST API (MVC)
│   ├── src/
│   │   ├── config/             # DB & environment configs
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, RBAC, error handlers
│   │   ├── models/             # Mongoose schemas
│   │   ├── routes/             # API routing
│   │   ├── utils/              # Helper utilities
│   │   └── server.js           # Express app bootstrap
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── docker-compose.yml          # Multi-container orchestration
├── .gitignore
└── README.md
```

##  Getting Started & Installation

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [npm](https://www.npmjs.com/) (v9+)
* [MongoDB](https://www.mongodb.com/) (Local instance running on `localhost:27017` or MongoDB Atlas URI)
* [Docker & Docker Compose](https://www.docker.com/) (Optional, for containerized environment)

### 1. Clone the Repository

```bash
git clone https://github.com/ManamiMayoki/synapse.git
cd synapse
```

### 2. Environment Variables Setup

#### Backend (`server/.env`):
Create `server/.env` based on `server/.env.example`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/synapse_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

#### Frontend (`client/.env`):
Create `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```


### 3. Running Locally (Manual Setup)

#### Step 3A: Backend Server
```bash
cd server
npm install
npm run dev
# Server will run at http://localhost:5000
```

#### Step 3B: Frontend Client
Open a second terminal window:
```bash
cd client
npm install
npm run dev
# Vite dev server will run at http://localhost:5173
```

### 4. Running with Docker Compose (Recommended for Lab-01)

To run the complete stack including MongoDB, Backend, and Frontend:

```bash
# Build and run containers in detached mode
docker compose up --build -d

# Check running services
docker compose ps

# View application logs
docker compose logs -f

# Stop all services
docker compose down
```
##  Testing & CI/CD (Lab-01 & Lab-02)

* **Continuous Integration:** GitHub Actions automatically tests linting, builds, and runs server tests on push and pull requests to `development` and `release`.
* **API Integration Testing:**
  ```bash
  # Execute automated Postman collection via Newman
  newman run server/tests/synapse_postman_collection.json -e server/tests/synapse_env.json
  ```
* **Load Testing:** JMeter test plans located in `server/tests/load/` for benchmarking API throughput under concurrent lab station requests.

##  Roles & Permissions (RBAC)

| Role | Permissions |
| :--- | :--- |
| **Student** | View 3D lab layout, inspect PC status, submit failure tickets, request hardware checkout. |
| **Lab Assistant** | Approve/return gear checkouts, update ticket statuses, update workstation availability. |
| **Admin** | Full system control, user & role management, hardware inventory CRUD, predictive AI maintenance metrics. |

##  License
This project is developed for Academic CSE Department Lab coursework. All rights reserved.
