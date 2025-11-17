import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArchitectureView } from "@/components/simulator/ArchitectureView";
import { SimulationStepper } from "@/components/simulator/SimulationStepper";
import { ControlPanel } from "@/components/simulator/ControlPanel";
import { LogViewer } from "@/components/simulator/LogViewer";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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

  const updateStepStatus = (stepId: SimulationStepId, status: StepStatus) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const resetSimulation = () => {
    setSteps(initialSteps);
    setCurrentStepIndex(0);
    setLogs([]);
    setSessionStatus('not-started');
    addLog('SYSTEM', 'Simulation reset');
  };

  const initializeSession = () => {
    setSessionStatus('active');
    addLog('SYSTEM', `Session initialized for device ${deviceConfig.deviceId}`);
    addLog('SYSTEM', `PUF Type: ${deviceConfig.pufType.toUpperCase()}, CRP Count: ${deviceConfig.crpCount}`);
  };

  const runStep = async (stepId: SimulationStepId) => {
    updateStepStatus(stepId, 'running');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate step execution
    switch (stepId) {
      case 'S0_ENROLL':
        addLog('DEVICE', `PUF module initialized on ${deviceConfig.deviceId}`);
        addLog('SERVER', `Generating ${deviceConfig.crpCount} Challenge-Response Pairs...`);
        addLog('SERVER', `CRPs stored in database for device ${deviceConfig.deviceId}`);
        break;
      case 'S1_BOOT':
        addLog('DEVICE', 'Device powered on');
        addLog('DEVICE', 'PUF module warming up...');
        addLog('DEVICE', 'Device ready for authentication');
        break;
      case 'S2_AUTH':
        addLog('SERVER', 'Sending authentication challenge...');
        addLog('DEVICE', 'Generating PUF response...');
        addLog('SERVER', 'Response verified ✓ Authentication successful');
        break;
      case 'S3_DH':
        addLog('DEVICE', 'Generating DH public key...');
        addLog('SERVER', 'Generating DH public key...');
        addLog('DH', 'Key exchange completed. Shared secret established');
        break;
      case 'S4_PROVISION':
        addLog('PROVISIONING', 'Encrypting configuration data...');
        addLog('SERVER', 'Transferring provisioning package...');
        addLog('DEVICE', 'Configuration received and applied');
        break;
      case 'S5_OPERATION':
        addLog('DEVICE', 'Entering normal operation mode');
        addLog('SYSTEM', 'Device is now fully provisioned and operational');
        break;
    }
    
    updateStepStatus(stepId, 'success');
  };

  const runFullSimulation = async () => {
    if (sessionStatus === 'not-started') {
      initializeSession();
    }
    
    for (let i = 0; i < steps.length; i++) {
      setCurrentStepIndex(i);
      await runStep(steps[i].id);
    }
    
    setSessionStatus('completed');
    addLog('SYSTEM', '🎉 Full simulation completed successfully');
  };

  const runNextStep = async () => {
    if (sessionStatus === 'not-started') {
      initializeSession();
    }
    
    if (currentStepIndex < steps.length) {
      await runStep(steps[currentStepIndex].id);
      setCurrentStepIndex(prev => prev + 1);
      
      if (currentStepIndex === steps.length - 1) {
        setSessionStatus('completed');
        addLog('SYSTEM', '🎉 Simulation completed successfully');
      }
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
