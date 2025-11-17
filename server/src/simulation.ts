/**
 * Core simulation logic for PUF-based IoT provisioning
 * Handles PUF evaluation, Diffie-Hellman key exchange, and encryption
 */

import crypto from 'crypto';
import {
  SimulationSession,
  CRP,
  PufType,
  EnrollResponse,
  AuthenticateResponse,
  KeyExchangeResponse,
  ProvisionResponse,
  OperationResponse,
  ResetResponse,
} from './types';

// In-memory session storage
const sessions = new Map<string, SimulationSession>();

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Get current timestamp for logging
 */
function getTimestamp(): string {
  return new Date().toISOString().split('T')[1].slice(0, 12);
}

/**
 * Append a log message to session
 */
function appendLog(session: SimulationSession, message: string): void {
  const timestamp = getTimestamp();
  session.logs.push(`[${timestamp}] ${message}`);
}

/**
 * PUF evaluation function - deterministic based on challenge and seed
 * Uses SHA-256 for deterministic output
 */
function evalPUF(challengeBits: number[], seed: number, pufType: PufType): 0 | 1 {
  // Convert challenge bits to bytes for hashing
  const challengeBytes = Buffer.alloc(Math.ceil(challengeBits.length / 8));
  for (let i = 0; i < challengeBits.length; i++) {
    if (challengeBits[i] === 1) {
      const byteIndex = Math.floor(i / 8);
      const bitIndex = 7 - (i % 8);
      challengeBytes[byteIndex] |= (1 << bitIndex);
    }
  }

  // Create input for hash: seed (4 bytes) + pufType + challenge
  const seedBuffer = Buffer.alloc(4);
  seedBuffer.writeUInt32BE(seed, 0);
  const pufTypeBuffer = Buffer.from(pufType);
  const input = Buffer.concat([seedBuffer, pufTypeBuffer, challengeBytes]);

  // Hash and compute parity
  const hash = crypto.createHash('sha256').update(input).digest();
  
  // Compute parity of hash bytes (XOR all bits)
  let parity = 0;
  for (let i = 0; i < hash.length; i++) {
    parity ^= hash[i];
  }
  
  // Reduce to single bit
  for (let i = 0; i < 8; i++) {
    parity ^= (parity >> i) & 1;
  }
  
  return (parity & 1) as (0 | 1);
}

/**
 * Generate random challenge bits
 */
function generateChallenge(bitLength: number = 64): number[] {
  const challenge: number[] = [];
  const bytes = crypto.randomBytes(Math.ceil(bitLength / 8));
  
  for (let i = 0; i < bitLength; i++) {
    const byteIndex = Math.floor(i / 8);
    const bitIndex = 7 - (i % 8);
    const bit = (bytes[byteIndex] >> bitIndex) & 1;
    challenge.push(bit);
  }
  
  return challenge;
}

/**
 * Create a new simulation session
 */
export function createSession(
  deviceId: string,
  pufType: PufType,
  numCrps: number
): string {
  const sessionId = generateSessionId();
  const pufSeed = crypto.randomInt(0, 0xFFFFFFFF);
  
  const session: SimulationSession = {
    id: sessionId,
    deviceId,
    pufType,
    pufSeed,
    numCrps,
    crps: [],
    dh: {},
    logs: [],
    provisioned: false,
  };
  
  sessions.set(sessionId, session);
  appendLog(session, `Session created for device ${deviceId}`);
  appendLog(session, `PUF type: ${pufType}, Seed: 0x${pufSeed.toString(16)}`);
  
  return sessionId;
}

/**
 * Get session by ID or throw error
 */
export function getSession(sessionId: string): SimulationSession {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }
  return session;
}

/**
 * Delete a session
 */
export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

/**
 * Enrollment phase - Generate and store CRPs
 */
export function performEnrollment(sessionId: string): EnrollResponse {
  const session = getSession(sessionId);
  
  appendLog(session, '=== ENROLLMENT PHASE STARTED ===');
  appendLog(session, `Generating ${session.numCrps} Challenge-Response Pairs...`);
  
  session.crps = [];
  
  for (let i = 0; i < session.numCrps; i++) {
    const challenge = generateChallenge(64);
    const response = evalPUF(challenge, session.pufSeed, session.pufType);
    
    session.crps.push({ challenge, response });
    
    if (i < 3 || i >= session.numCrps - 1) {
      const preview = challenge.slice(0, 8).join('');
      appendLog(session, `  CRP ${i + 1}: Challenge=${preview}... → Response=${response}`);
    } else if (i === 3) {
      appendLog(session, `  ... (generating remaining CRPs)`);
    }
  }
  
  appendLog(session, `✓ Successfully stored ${session.crps.length} CRPs in server database`);
  appendLog(session, '=== ENROLLMENT COMPLETE ===');
  
  return {
    step: 'S0_ENROLL',
    status: 'success',
    crpCount: session.crps.length,
    log: [...session.logs],
  };
}

/**
 * Authentication phase - Challenge device with a stored CRP
 */
export function performAuthentication(sessionId: string): AuthenticateResponse {
  const session = getSession(sessionId);
  
  if (session.crps.length === 0) {
    throw new Error('No CRPs available. Run enrollment first.');
  }
  
  appendLog(session, '=== PUF AUTHENTICATION STARTED ===');
  
  // Select random CRP
  const crpIndex = crypto.randomInt(0, session.crps.length);
  const { challenge, response: expectedResponse } = session.crps[crpIndex];
  
  const preview = challenge.slice(0, 8);
  appendLog(session, `Server: Sending challenge #${crpIndex + 1} to device`);
  appendLog(session, `  Challenge preview: ${preview.join('')}...`);
  
  // Device re-evaluates PUF
  const deviceResponse = evalPUF(challenge, session.pufSeed, session.pufType);
  appendLog(session, `Device: PUF evaluated → ${deviceResponse}`);
  appendLog(session, `Server: Expected response → ${expectedResponse}`);
  
  const authSuccess = deviceResponse === expectedResponse;
  
  if (authSuccess) {
    appendLog(session, '✓ Authentication SUCCESS - Device identity verified!');
  } else {
    appendLog(session, '✗ Authentication FAILED - Response mismatch!');
  }
  
  appendLog(session, '=== AUTHENTICATION COMPLETE ===');
  
  return {
    step: 'S2_AUTH',
    status: authSuccess ? 'success' : 'error',
    challengePreview: preview,
    deviceResponse,
    expectedResponse,
    log: [...session.logs],
  };
}

/**
 * Diffie-Hellman key exchange
 */
export function performKeyExchange(sessionId: string): KeyExchangeResponse {
  const session = getSession(sessionId);
  
  appendLog(session, '=== DIFFIE-HELLMAN KEY EXCHANGE STARTED ===');
  
  // Use crypto's DH implementation with a safe 2048-bit prime
  const serverDH = crypto.createDiffieHellman(2048);
  serverDH.generateKeys();
  
  const deviceDH = crypto.createDiffieHellman(
    serverDH.getPrime(),
    serverDH.getGenerator()
  );
  deviceDH.generateKeys();
  
  // Store keys
  session.dh.devicePrivate = deviceDH.getPrivateKey('hex');
  session.dh.devicePublic = deviceDH.getPublicKey('hex');
  session.dh.serverPrivate = serverDH.getPrivateKey('hex');
  session.dh.serverPublic = serverDH.getPublicKey('hex');
  
  appendLog(session, `Device: Generated DH key pair`);
  appendLog(session, `  Public key: ${session.dh.devicePublic.slice(0, 16)}...`);
  appendLog(session, `Server: Generated DH key pair`);
  appendLog(session, `  Public key: ${session.dh.serverPublic.slice(0, 16)}...`);
  
  // Compute shared secrets (both should be identical)
  const deviceSharedSecret = deviceDH.computeSecret(serverDH.getPublicKey());
  const serverSharedSecret = serverDH.computeSecret(deviceDH.getPublicKey());
  
  // Verify they match
  if (!deviceSharedSecret.equals(serverSharedSecret)) {
    throw new Error('DH key exchange failed - shared secrets do not match!');
  }
  
  appendLog(session, `Device: Computed shared secret`);
  appendLog(session, `Server: Computed shared secret`);
  appendLog(session, `✓ Shared secrets match!`);
  
  // Derive session key using SHA-256
  session.sessionKey = crypto
    .createHash('sha256')
    .update(deviceSharedSecret)
    .digest();
  
  const sessionKeyHex = session.sessionKey.toString('hex');
  appendLog(session, `✓ Derived AES-256 session key: ${sessionKeyHex.slice(0, 16)}...`);
  appendLog(session, '=== KEY EXCHANGE COMPLETE ===');
  
  return {
    step: 'S3_DH',
    status: 'success',
    devicePublicKey: session.dh.devicePublic || '',
    serverPublicKey: session.dh.serverPublic || '',
    sessionKeyHex,
    log: [...session.logs],
  };
}

/**
 * AES-256-GCM encryption
 */
function encrypt(plaintext: string, key: Buffer): { ciphertext: string; iv: string; tag: string } {
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return {
    ciphertext: encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * AES-256-GCM decryption
 */
function decrypt(ciphertext: string, key: Buffer, iv: string, tag: string): string {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Provisioning phase - Send encrypted credentials to device
 */
export function performProvisioning(sessionId: string): ProvisionResponse {
  const session = getSession(sessionId);
  
  if (!session.sessionKey) {
    throw new Error('No session key available. Run key exchange first.');
  }
  
  appendLog(session, '=== SECURE PROVISIONING STARTED ===');
  
  // Generate provisioning credentials
  const deviceCert = `-----BEGIN CERTIFICATE-----
MIIC${crypto.randomBytes(32).toString('base64')}
-----END CERTIFICATE-----`;
  
  const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${crypto
    .randomBytes(64)
    .toString('base64')}.${crypto.randomBytes(32).toString('base64')}`;
  
  const provisioningData = {
    deviceCert,
    token,
    timestamp: new Date().toISOString(),
    deviceId: session.deviceId,
  };
  
  appendLog(session, 'Server: Preparing provisioning credentials...');
  appendLog(session, `  Device Certificate (preview): ${deviceCert.slice(0, 40)}...`);
  appendLog(session, `  Access Token (preview): ${token.slice(0, 40)}...`);
  
  // Encrypt provisioning data
  const plaintext = JSON.stringify(provisioningData);
  const encrypted = encrypt(plaintext, session.sessionKey);
  
  appendLog(session, `Server: Encrypting credentials with AES-256-GCM...`);
  appendLog(session, `  IV: ${encrypted.iv}`);
  appendLog(session, `  Ciphertext (preview): ${encrypted.ciphertext.slice(0, 32)}...`);
  appendLog(session, `  Auth Tag: ${encrypted.tag}`);
  
  // Simulate device receiving and decrypting
  appendLog(session, 'Device: Receiving encrypted provisioning data...');
  const decrypted = decrypt(
    encrypted.ciphertext,
    session.sessionKey,
    encrypted.iv,
    encrypted.tag
  );
  
  appendLog(session, 'Device: Decrypting with session key...');
  const receivedData = JSON.parse(decrypted);
  appendLog(session, `✓ Device successfully decrypted and stored credentials`);
  
  session.provisioned = true;
  session.provisionedData = {
    deviceCert: receivedData.deviceCert,
    token: receivedData.token,
  };
  
  appendLog(session, '=== PROVISIONING COMPLETE ===');
  
  return {
    step: 'S4_PROVISION',
    status: 'success',
    provisioned: true,
    credentialsPreview: {
      deviceCert: deviceCert.slice(0, 60) + '...',
      token: token.slice(0, 50) + '...',
    },
    log: [...session.logs],
  };
}

/**
 * Normal operation - Secure bidirectional communication
 */
export function performOperation(sessionId: string): OperationResponse {
  const session = getSession(sessionId);
  
  if (!session.sessionKey) {
    throw new Error('No session key available. Run key exchange first.');
  }
  
  if (!session.provisioned) {
    throw new Error('Device not provisioned. Run provisioning first.');
  }
  
  appendLog(session, '=== NORMAL OPERATION - SECURE COMMUNICATION ===');
  
  // Server to Device communication
  const serverMessage = `Hello Device ${session.deviceId}! System status check at ${new Date().toISOString()}`;
  appendLog(session, `Server: Sending message to device...`);
  appendLog(session, `  Plaintext: "${serverMessage}"`);
  
  const serverEncrypted = encrypt(serverMessage, session.sessionKey);
  appendLog(session, `  Encrypted: ${serverEncrypted.ciphertext.slice(0, 32)}...`);
  appendLog(session, `  IV: ${serverEncrypted.iv}, Tag: ${serverEncrypted.tag}`);
  
  // Device receives and decrypts
  appendLog(session, `Device: Receiving encrypted message...`);
  const deviceReceivedPlaintext = decrypt(
    serverEncrypted.ciphertext,
    session.sessionKey,
    serverEncrypted.iv,
    serverEncrypted.tag
  );
  appendLog(session, `  Decrypted: "${deviceReceivedPlaintext}"`);
  
  // Device responds
  const deviceMessage = `ACK: ${serverMessage.slice(0, 30)}... | Status: OK | Uptime: ${crypto.randomInt(100, 10000)}s`;
  appendLog(session, `Device: Sending response to server...`);
  appendLog(session, `  Plaintext: "${deviceMessage}"`);
  
  const deviceEncrypted = encrypt(deviceMessage, session.sessionKey);
  appendLog(session, `  Encrypted: ${deviceEncrypted.ciphertext.slice(0, 32)}...`);
  appendLog(session, `  IV: ${deviceEncrypted.iv}, Tag: ${deviceEncrypted.tag}`);
  
  // Server receives and decrypts
  appendLog(session, `Server: Receiving device response...`);
  const serverReceivedPlaintext = decrypt(
    deviceEncrypted.ciphertext,
    session.sessionKey,
    deviceEncrypted.iv,
    deviceEncrypted.tag
  );
  appendLog(session, `  Decrypted: "${serverReceivedPlaintext}"`);
  
  appendLog(session, '✓ Secure bidirectional communication successful!');
  appendLog(session, '=== OPERATION COMPLETE ===');
  
  return {
    step: 'S5_OPERATION',
    status: 'success',
    serverToDevicePlaintext: serverMessage,
    deviceToServerPlaintext: deviceMessage,
    log: [...session.logs],
  };
}

/**
 * Reset/clear session
 */
export function resetSession(sessionId: string): ResetResponse {
  const session = getSession(sessionId);
  
  // Keep basic session info but clear all progress
  session.crps = [];
  session.dh = {};
  session.sessionKey = undefined;
  session.logs = [];
  session.provisioned = false;
  session.provisionedData = undefined;
  
  appendLog(session, 'Session reset - all data cleared');
  
  return {
    status: 'success',
    message: 'Session reset successfully',
  };
}

