import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArchitectureView } from "@/components/simulator/ArchitectureView";
import { SimulationStepper } from "@/components/simulator/SimulationStepper";
import { ControlPanel } from "@/components/simulator/ControlPanel";
import { LogViewer } from "@/components/simulator/LogViewer";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import * as SimulationAPI from "@/services/simulationApi";

export type StepStatus = 'idle' | 'running' | 'success' | 'error';
export type SimulationStepId = 'S0_ENROLL' | 'S1_BOOT' | 'S2_AUTH' | 'S3_DH' | 'S4_PROVISION' | 'S5_OPERATION';

export interface SimulationStep {
  id: SimulationStepId;
  label: string;
  description: string;
  status: StepStatus;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  source: 'DEVICE' | 'SERVER' | 'DH' | 'SYSTEM' | 'PROVISIONING';
  message: string;
}

export interface DeviceConfig {
  deviceId: string;
  pufType: 'arbiter' | 'sram' | 'fallback';
  crpCount: number;
}

const initialSteps: SimulationStep[] = [
  { id: 'S0_ENROLL', label: 'Enrollment', description: 'Generate and store Challenge-Response Pairs', status: 'idle' },
  { id: 'S1_BOOT', label: 'Boot / Activation', description: 'Device powers on and initializes PUF module', status: 'idle' },
  { id: 'S2_AUTH', label: 'PUF Authentication', description: 'Server challenges device to verify identity', status: 'idle' },
  { id: 'S3_DH', label: 'Diffie-Hellman Key Exchange', description: 'Establish secure communication channel', status: 'idle' },
  { id: 'S4_PROVISION', label: 'Secure Provisioning', description: 'Transfer configuration and credentials', status: 'idle' },
  { id: 'S5_OPERATION', label: 'Normal Operation', description: 'Device operates with secure communication', status: 'idle' },
];

const Simulator = () => {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'not-started' | 'active' | 'completed'>('not-started');
  const [steps, setSteps] = useState<SimulationStep[]>(initialSteps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stepByStepMode, setStepByStepMode] = useState(false);
  const [deviceConfig, setDeviceConfig] = useState<DeviceConfig>({
    deviceId: 'DEV-1001',
    pufType: 'arbiter',
    crpCount: 50,
  });

  const addLog = (source: LogEntry['source'], message: string) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
      source,
      message,
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Add logs from backend response
  const addBackendLogs = (backendLogs: string[]) => {
    backendLogs.forEach(logMessage => {
      const source = SimulationAPI.parseLogSource(logMessage);
      // Remove timestamp from backend logs if present (they have their own format)
      const cleanMessage = logMessage.replace(/^\[\d{2}:\d{2}:\d{2}\.\d+\]\s*/, '');
      addLog(source, cleanMessage);
    });
  };

  const updateStepStatus = (stepId: SimulationStepId, status: StepStatus) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const resetSimulation = async () => {
    if (sessionId) {
      try {
        await SimulationAPI.resetSession(sessionId);
      } catch (error) {
        console.error('Failed to reset session:', error);
      }
    }
    
    setSteps(initialSteps);
    setCurrentStepIndex(0);
    setLogs([]);
    setSessionStatus('not-started');
    setSessionId(null);
    addLog('SYSTEM', 'Simulation reset');
    toast.info('Simulation reset');
  };

  const initializeSession = async () => {
    try {
      addLog('SYSTEM', `Initializing session for device ${deviceConfig.deviceId}...`);
      
      const response = await SimulationAPI.initSession(
        deviceConfig.deviceId,
        deviceConfig.pufType,
        deviceConfig.crpCount
      );
      
      setSessionId(response.sessionId);
      setSessionStatus('active');
      
      addLog('SYSTEM', `✓ Session initialized: ${response.sessionId.slice(0, 8)}...`);
      addLog('SYSTEM', `PUF Type: ${deviceConfig.pufType.toUpperCase()}, CRP Count: ${deviceConfig.crpCount}`);
      toast.success('Session initialized successfully');
    } catch (error) {
      addLog('SYSTEM', `✗ Failed to initialize session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Failed to initialize session');
      throw error;
    }
  };

  const runStep = async (stepId: SimulationStepId) => {
    if (!sessionId) {
      toast.error('No active session. Please initialize first.');
      return;
    }

    updateStepStatus(stepId, 'running');
    
    try {
      let response: SimulationAPI.StepResponse;
      
      switch (stepId) {
        case 'S0_ENROLL':
          response = await SimulationAPI.runEnrollment(sessionId);
          addBackendLogs(response.log);
          toast.success('Enrollment completed');
          break;
          
        case 'S1_BOOT':
          // Boot is a frontend-only step (no backend call)
          addLog('DEVICE', 'Device powered on');
          addLog('DEVICE', 'PUF module warming up...');
          await new Promise(resolve => setTimeout(resolve, 800));
          addLog('DEVICE', 'Device ready for authentication');
          break;
          
        case 'S2_AUTH':
          response = await SimulationAPI.runAuthentication(sessionId);
          addBackendLogs(response.log);
          if (response.status === 'success') {
            toast.success('Authentication successful');
          } else {
            toast.error('Authentication failed');
          }
          break;
          
        case 'S3_DH':
          response = await SimulationAPI.runKeyExchange(sessionId);
          addBackendLogs(response.log);
          toast.success('Key exchange completed');
          break;
          
        case 'S4_PROVISION':
          response = await SimulationAPI.runProvisioning(sessionId);
          addBackendLogs(response.log);
          toast.success('Provisioning completed');
          break;
          
        case 'S5_OPERATION':
          response = await SimulationAPI.runOperation(sessionId);
          addBackendLogs(response.log);
          toast.success('Device operational');
          break;
      }
      
      updateStepStatus(stepId, 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog('SYSTEM', `✗ Error in ${stepId}: ${errorMessage}`);
      updateStepStatus(stepId, 'error');
      toast.error(`Step failed: ${errorMessage}`);
      throw error;
    }
  };

  const runFullSimulation = async () => {
    try {
      if (sessionStatus === 'not-started') {
        await initializeSession();
      }
      
      for (let i = 0; i < steps.length; i++) {
        setCurrentStepIndex(i);
        await runStep(steps[i].id);
      }
      
      setSessionStatus('completed');
      addLog('SYSTEM', '🎉 Full simulation completed successfully');
      toast.success('Simulation completed!');
    } catch (error) {
      console.error('Simulation error:', error);
      toast.error('Simulation failed');
    }
  };

  const runNextStep = async () => {
    try {
      if (sessionStatus === 'not-started') {
        await initializeSession();
      }
      
      if (currentStepIndex < steps.length) {
        await runStep(steps[currentStepIndex].id);
        setCurrentStepIndex(prev => prev + 1);
        
        if (currentStepIndex === steps.length - 1) {
          setSessionStatus('completed');
          addLog('SYSTEM', '🎉 Simulation completed successfully');
          toast.success('Simulation completed!');
        }
      }
    } catch (error) {
      console.error('Step error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark dark">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
              PUF Provisioning Simulator
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant={sessionStatus === 'not-started' ? 'secondary' : sessionStatus === 'active' ? 'default' : 'outline'}
              className={sessionStatus === 'active' ? 'bg-gradient-cyber' : ''}
            >
              Session: {sessionStatus === 'not-started' ? 'Not Started' : sessionStatus === 'active' ? 'Active' : 'Completed'}
            </Badge>
            <Button 
              variant="outline" 
              onClick={resetSimulation}
              className="border-primary/50 hover:bg-primary/10"
            >
              Reset Simulation
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Column - Architecture View */}
          <div className="lg:col-span-4">
            <ArchitectureView currentStep={steps[currentStepIndex]} />
          </div>

          {/* Center Column - Stepper */}
          <div className="lg:col-span-4">
            <SimulationStepper
              steps={steps}
              currentStepIndex={currentStepIndex}
              stepByStepMode={stepByStepMode}
              onToggleStepMode={setStepByStepMode}
              onRunFullSimulation={runFullSimulation}
              onRunNextStep={runNextStep}
              sessionStatus={sessionStatus}
            />
          </div>

          {/* Right Column - Control Panel + Logs */}
          <div className="lg:col-span-4 space-y-6">
            <ControlPanel
              deviceConfig={deviceConfig}
              onConfigChange={setDeviceConfig}
              onInitializeSession={initializeSession}
              onRunEnrollment={() => runStep('S0_ENROLL')}
              onRunAuthentication={() => runStep('S2_AUTH')}
              onRunFullSimulation={runFullSimulation}
              sessionStatus={sessionStatus}
            />
            <LogViewer logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulator;
