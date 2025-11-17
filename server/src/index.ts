/**
 * Express server for PUF-based IoT provisioning simulator
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import {
  createSession,
  getSession,
  performEnrollment,
  performAuthentication,
  performKeyExchange,
  performProvisioning,
  performOperation,
  resetSession,
  deleteSession,
} from './simulation';
import { InitSessionRequest, ErrorResponse } from './types';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

/**
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'PUF Simulator Server is running' });
});

/**
 * 1. Initialize new simulation session
 * POST /api/sim/session/init
 */
app.post('/api/sim/session/init', (req: Request, res: Response) => {
  try {
    const { deviceId, pufType, numCrps } = req.body as InitSessionRequest;
    
    // Validation
    if (!deviceId || typeof deviceId !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'deviceId is required and must be a string',
      } as ErrorResponse);
    }
    
    if (!pufType || !['arbiter', 'sram', 'fallback'].includes(pufType)) {
      return res.status(400).json({
        status: 'error',
        message: 'pufType must be one of: arbiter, sram, fallback',
      } as ErrorResponse);
    }
    
    if (!numCrps || typeof numCrps !== 'number' || numCrps < 1 || numCrps > 1000) {
      return res.status(400).json({
        status: 'error',
        message: 'numCrps must be a number between 1 and 1000',
      } as ErrorResponse);
    }
    
    const sessionId = createSession(deviceId, pufType, numCrps);
    
    res.json({
      sessionId,
      message: 'Session initialized',
      initialStep: 'S0_ENROLL',
    });
  } catch (error) {
    console.error('Error in /session/init:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error',
    } as ErrorResponse);
  }
});

/**
 * 2. Enrollment phase - Generate and store CRPs
 * POST /api/sim/session/:sessionId/enroll
 */
app.post('/api/sim/session/:sessionId/enroll', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'sessionId is required',
      } as ErrorResponse);
    }
    
    const result = performEnrollment(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Error in /enroll:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error',
    } as ErrorResponse);
  }
});

/**
 * 3. Authentication phase - Verify device identity using PUF
 * POST /api/sim/session/:sessionId/authenticate
 */
app.post('/api/sim/session/:sessionId/authenticate', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'sessionId is required',
      } as ErrorResponse);
    }
    
    const result = performAuthentication(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Error in /authenticate:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error',
    } as ErrorResponse);
  }
});

/**
 * 4. Key exchange phase - Establish shared session key using Diffie-Hellman
 * POST /api/sim/session/:sessionId/key-exchange
 */
app.post('/api/sim/session/:sessionId/key-exchange', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'sessionId is required',
      } as ErrorResponse);
    }
    
    const result = performKeyExchange(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Error in /key-exchange:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error',
    } as ErrorResponse);
  }
});

/**
 * 5. Provisioning phase - Send encrypted credentials to device
 * POST /api/sim/session/:sessionId/provision
 */
app.post('/api/sim/session/:sessionId/provision', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'sessionId is required',
      } as ErrorResponse);
    }
    
    const result = performProvisioning(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Error in /provision:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error',
    } as ErrorResponse);
  }
});

/**
 * 6. Normal operation - Secure bidirectional communication
 * POST /api/sim/session/:sessionId/operation
 */
app.post('/api/sim/session/:sessionId/operation', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'sessionId is required',
      } as ErrorResponse);
    }
    
    const result = performOperation(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Error in /operation:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error',
    } as ErrorResponse);
  }
});

/**
 * 7. Reset session
 * POST /api/sim/session/:sessionId/reset
 */
app.post('/api/sim/session/:sessionId/reset', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        status: 'error',
        message: 'sessionId is required',
      } as ErrorResponse);
    }
    
    const result = resetSession(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Error in /reset:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Internal server error',
    } as ErrorResponse);
  }
});

/**
 * Get session info (for debugging)
 * GET /api/sim/session/:sessionId
 */
app.get('/api/sim/session/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const session = getSession(sessionId);
    
    // Return session without sensitive keys
    res.json({
      id: session.id,
      deviceId: session.deviceId,
      pufType: session.pufType,
      numCrps: session.numCrps,
      crpCount: session.crps.length,
      hasSessionKey: !!session.sessionKey,
      provisioned: session.provisioned,
      logCount: session.logs.length,
    });
  } catch (error) {
    console.error('Error in GET /session:', error);
    res.status(404).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Session not found',
    } as ErrorResponse);
  }
});

/**
 * Delete session (cleanup)
 * DELETE /api/sim/session/:sessionId
 */
app.delete('/api/sim/session/:sessionId', (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    deleteSession(sessionId);
    
    res.json({
      status: 'success',
      message: 'Session deleted',
    });
  } catch (error) {
    console.error('Error in DELETE /session:', error);
    res.status(404).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Session not found',
    } as ErrorResponse);
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.path} not found`,
  } as ErrorResponse);
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  } as ErrorResponse);
});

// Start server
app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🔐 PUF-based IoT Provisioning Simulator - Backend Server');
  console.log('='.repeat(60));
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ API base path: /api/sim`);
  console.log(`✓ Health check: http://localhost:${PORT}/health`);
  console.log('='.repeat(60));
  console.log('Available endpoints:');
  console.log('  POST   /api/sim/session/init');
  console.log('  POST   /api/sim/session/:sessionId/enroll');
  console.log('  POST   /api/sim/session/:sessionId/authenticate');
  console.log('  POST   /api/sim/session/:sessionId/key-exchange');
  console.log('  POST   /api/sim/session/:sessionId/provision');
  console.log('  POST   /api/sim/session/:sessionId/operation');
  console.log('  POST   /api/sim/session/:sessionId/reset');
  console.log('  GET    /api/sim/session/:sessionId');
  console.log('  DELETE /api/sim/session/:sessionId');
  console.log('='.repeat(60));
});

