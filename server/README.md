# PUF Provisioning Simulator - Backend Server

Node.js + Express + TypeScript backend that simulates both IoT device and provisioning server behavior.

## Features

- 🔐 **PUF Simulation** - Deterministic Physical Unclonable Function using SHA-256
- 🔑 **Diffie-Hellman** - 2048-bit key exchange for establishing shared secrets
- 🔒 **AES-256-GCM** - Authenticated encryption for secure communication
- 📝 **Session Management** - In-memory storage for multiple simulation sessions
- 🌐 **REST API** - JSON-based endpoints for all simulation phases

## Installation

```bash
npm install
```

## Development

Start the development server with hot-reload:

```bash
npm run dev
```

The server will run on `http://localhost:4000` by default.

## Production Build

```bash
# Build TypeScript to JavaScript
npm run build

# Run the compiled server
npm start
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Server port |

Example `.env` file:
```
PORT=4000
```

## Architecture

```
server/
├── src/
│   ├── index.ts        # Express app and API routes
│   ├── simulation.ts   # Core simulation logic
│   └── types.ts        # TypeScript type definitions
├── dist/              # Compiled JavaScript (after build)
├── package.json
└── tsconfig.json
```

## Core Components

### 1. PUF Evaluation (`simulation.ts`)

Simulates a Physical Unclonable Function that generates deterministic responses:

```typescript
evalPUF(challengeBits: number[], seed: number, pufType: string): 0 | 1
```

- Takes a challenge (array of bits) and device-specific seed
- Uses SHA-256 for deterministic hashing
- Returns a single bit (0 or 1) as response

### 2. Session Management

Each simulation session contains:
- Device ID and PUF configuration
- Generated CRPs (Challenge-Response Pairs)
- Diffie-Hellman keys
- Derived session key
- Provisioning status
- Detailed execution logs

### 3. Cryptographic Operations

**Key Exchange:**
- Uses Node.js `crypto.createDiffieHellman()` with 2048-bit prime
- Both device and server generate key pairs
- Shared secret derived from public key exchange
- Session key = SHA-256(sharedSecret)

**Encryption/Decryption:**
- AES-256-GCM with 96-bit IV
- Authenticated encryption prevents tampering
- Random IV for each message

## API Usage Examples

### 1. Initialize Session

```bash
curl -X POST http://localhost:4000/api/sim/session/init \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "DEV-1001",
    "pufType": "arbiter",
    "numCrps": 50
  }'
```

Response:
```json
{
  "sessionId": "a1b2c3d4...",
  "message": "Session initialized",
  "initialStep": "S0_ENROLL"
}
```

### 2. Run Enrollment

```bash
curl -X POST http://localhost:4000/api/sim/session/{sessionId}/enroll
```

### 3. Authenticate Device

```bash
curl -X POST http://localhost:4000/api/sim/session/{sessionId}/authenticate
```

### 4. Key Exchange

```bash
curl -X POST http://localhost:4000/api/sim/session/{sessionId}/key-exchange
```

### 5. Provision Device

```bash
curl -X POST http://localhost:4000/api/sim/session/{sessionId}/provision
```

### 6. Normal Operation

```bash
curl -X POST http://localhost:4000/api/sim/session/{sessionId}/operation
```

### 7. Health Check

```bash
curl http://localhost:4000/health
```

## Simulation Flow

1. **Session Init** → Creates new session with device ID, PUF type, and CRP count
2. **Enrollment** → Generates random challenges, evaluates PUF, stores CRPs
3. **Boot** → (Frontend only - prepares device state)
4. **Authentication** → Selects random CRP, device re-evaluates PUF, verifies match
5. **Key Exchange** → DH protocol establishes shared session key
6. **Provisioning** → Server encrypts credentials, device decrypts with session key
7. **Operation** → Bidirectional encrypted communication using AES-256-GCM

## Security Notes

⚠️ **This is a simulator for educational purposes:**

- Sessions are stored in memory (cleared on restart)
- No persistent database
- Not suitable for production use
- Real PUF implementations would use actual hardware

For production systems:
- Use hardware PUF chips (e.g., SRAM PUF, Arbiter PUF)
- Implement fuzzy extractors for noise tolerance
- Store CRPs securely (encrypted database)
- Add mutual authentication
- Implement certificate validation
- Use HSM for key storage

## Troubleshooting

**Port already in use:**
```bash
# Change the port
PORT=5000 npm run dev
```

**TypeScript errors:**
```bash
# Clean build
rm -rf dist/
npm run build
```

**CORS errors:**
- The server uses `cors` middleware to allow all origins
- For production, configure specific allowed origins

## License

MIT

