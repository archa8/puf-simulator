/**
 * Type definitions for PUF-based IoT provisioning simulator
 */

export type StepId =
  | "S0_ENROLL"
  | "S1_BOOT"
  | "S2_AUTH"
  | "S3_DH"
  | "S4_PROVISION"
  | "S5_OPERATION";

export type PufType = "arbiter" | "sram" | "fallback";

export interface CRP {
  challenge: number[];  // Array of bits (0 or 1)
  response: 0 | 1;
}

export interface DHKeys {
  devicePrivate?: string;
  devicePublic?: string;
  serverPrivate?: string;
  serverPublic?: string;
}

export interface SimulationSession {
  id: string;
  deviceId: string;
  pufType: PufType;
  pufSeed: number;
  numCrps: number;
  crps: CRP[];
  dh: DHKeys;
  sessionKey?: Buffer;
  logs: string[];
  provisioned: boolean;
  provisionedData?: {
    deviceCert: string;
    token: string;
  };
}

// API Request/Response types
export interface InitSessionRequest {
  deviceId: string;
  pufType: PufType;
  numCrps: number;
}

export interface InitSessionResponse {
  sessionId: string;
  message: string;
  initialStep: StepId;
}

export interface EnrollResponse {
  step: StepId;
  status: "success" | "error";
  crpCount: number;
  log: string[];
}

export interface AuthenticateResponse {
  step: StepId;
  status: "success" | "error";
  challengePreview: number[];
  deviceResponse: 0 | 1;
  expectedResponse: 0 | 1;
  log: string[];
}

export interface KeyExchangeResponse {
  step: StepId;
  status: "success" | "error";
  devicePublicKey: string;
  serverPublicKey: string;
  sessionKeyHex: string;
  log: string[];
}

export interface ProvisionResponse {
  step: StepId;
  status: "success" | "error";
  provisioned: boolean;
  credentialsPreview: {
    deviceCert: string;
    token: string;
  };
  log: string[];
}

export interface OperationResponse {
  step: StepId;
  status: "success" | "error";
  serverToDevicePlaintext: string;
  deviceToServerPlaintext: string;
  log: string[];
}

export interface ResetResponse {
  status: "success" | "error";
  message: string;
}

export interface ErrorResponse {
  status: "error";
  message: string;
}

