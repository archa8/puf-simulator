# PUF-based Zero-Touch IoT Provisioning Simulator

A full-stack application demonstrating how IoT devices can be securely provisioned using Physical Unclonable Functions (PUF) with zero-touch enrollment and authentication.

## Project Overview

This simulator visualizes the complete provisioning pipeline:
1. **Enrollment** - Device generates and stores Challenge-Response Pairs (CRPs)
2. **Boot** - Device powers on and initializes PUF module
3. **Authentication** - Server verifies device identity using stored CRPs
4. **Key Exchange** - Diffie-Hellman protocol establishes shared session key
5. **Provisioning** - Server sends encrypted credentials to device
6. **Operation** - Secure bidirectional communication using AES-256-GCM

## Deployment Links

- Backend: https://puf-simulator.onrender.com/
- Frontend: https://puf-simulator.vercel.app/

## Project Structure

```
puf-sim-workbench/
├── src/                    # React frontend (Vite + TypeScript)
│   ├── components/         # UI components
│   ├── pages/             # Page components
│   └── ...
├── server/                 # Node.js backend (Express + TypeScript)
│   ├── src/
│   │   ├── index.ts       # Express server entry point
│   │   ├── simulation.ts  # Core PUF simulation logic
│   │   └── types.ts       # TypeScript type definitions
│   ├── package.json
│   └── tsconfig.json
└── ...
```

## Project info

**URL**: https://lovable.dev/projects/6c053814-c69c-4785-bf20-4a66ab95a4ea

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/6c053814-c69c-4785-bf20-4a66ab95a4ea) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Running the Backend Server

The simulator requires both frontend and backend to be running simultaneously.

### Backend Setup

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install backend dependencies:**
   ```bash
   npm install
   ```

3. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The backend will start on `http://localhost:4000` with hot-reloading enabled.

### Frontend Setup

1. **In a new terminal, navigate to the project root:**
   ```bash
   cd ..  # or navigate to project root
   ```

2. **Install frontend dependencies (if not already done):**
   ```bash
   npm install
   ```

3. **Start the frontend dev server:**
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:8080` and automatically proxy API requests to the backend.

### Quick Start (Both Servers)

**Terminal 1 - Backend:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

Then open `http://localhost:8080` in your browser.

## API Endpoints

The backend exposes the following REST API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/sim/session/init` | Initialize new simulation session |
| `POST` | `/api/sim/session/:id/enroll` | Generate and store CRPs |
| `POST` | `/api/sim/session/:id/authenticate` | Verify device identity |
| `POST` | `/api/sim/session/:id/key-exchange` | Perform Diffie-Hellman key exchange |
| `POST` | `/api/sim/session/:id/provision` | Send encrypted credentials |
| `POST` | `/api/sim/session/:id/operation` | Simulate secure communication |
| `POST` | `/api/sim/session/:id/reset` | Reset session state |
| `GET` | `/api/sim/session/:id` | Get session info (debug) |
| `DELETE` | `/api/sim/session/:id` | Delete session |
| `GET` | `/health` | Health check endpoint |

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

### Frontend
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI framework
- **shadcn-ui** - High-quality UI components
- **Tailwind CSS** - Utility-first CSS framework

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **crypto (Node.js)** - Cryptographic operations (SHA-256, AES-256-GCM, Diffie-Hellman)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6c053814-c69c-4785-bf20-4a66ab95a4ea) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
