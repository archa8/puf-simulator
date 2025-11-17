/**
 * API service for PUF simulation backend
 */

// API Types matching backend responses
export interface InitSessionResponse {
  sessionId: string;
  message: string;
  initialStep: string;
}

export interface StepResponse {
  step: string;
  status: 'success' | 'error';
  log: string[];
  [key: string]: any; // Allow additional properties
}

export interface ErrorResponse {
  status: 'error';
  message: string;
}

const API_BASE_URL = '/api/sim';

/**
 * Initialize a new simulation session
 */
export async function initSession(
  deviceId: string,
  pufType: 'arbiter' | 'sram' | 'fallback',
  numCrps: number
): Promise<InitSessionResponse> {
  const response = await fetch(`${API_BASE_URL}/session/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      deviceId,
      pufType,
      numCrps,
    }),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || 'Failed to initialize session');
  }

  return response.json();
}

/**
 * Run enrollment phase
 */
export async function runEnrollment(sessionId: string): Promise<StepResponse> {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}/enroll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || 'Enrollment failed');
  }

  return response.json();
}

/**
 * Run authentication phase
 */
export async function runAuthentication(sessionId: string): Promise<StepResponse> {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}/authenticate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || 'Authentication failed');
  }

  return response.json();
}

/**
 * Run key exchange phase
 */
export async function runKeyExchange(sessionId: string): Promise<StepResponse> {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}/key-exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || 'Key exchange failed');
  }

  return response.json();
}

/**
 * Run provisioning phase
 */
export async function runProvisioning(sessionId: string): Promise<StepResponse> {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}/provision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || 'Provisioning failed');
  }

  return response.json();
}

/**
 * Run operation phase
 */
export async function runOperation(sessionId: string): Promise<StepResponse> {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}/operation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || 'Operation failed');
  }

  return response.json();
}

/**
 * Reset session
 */
export async function resetSession(sessionId: string): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || 'Reset failed');
  }

  return response.json();
}

/**
 * Get session info (for debugging)
 */
export async function getSessionInfo(sessionId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/session/${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.message || 'Failed to get session info');
  }

  return response.json();
}

/**
 * Parse backend logs and extract source
 */
export function parseLogSource(message: string): 'DEVICE' | 'SERVER' | 'DH' | 'SYSTEM' | 'PROVISIONING' {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('device:') || lowerMessage.includes('device ')) {
    return 'DEVICE';
  }
  if (lowerMessage.includes('server:') || lowerMessage.includes('server ')) {
    return 'SERVER';
  }
  if (lowerMessage.includes('dh') || lowerMessage.includes('diffie')) {
    return 'DH';
  }
  if (lowerMessage.includes('provision') || lowerMessage.includes('credentials')) {
    return 'PROVISIONING';
  }
  
  return 'SYSTEM';
}

