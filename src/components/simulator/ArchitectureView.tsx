import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cpu, Cloud, Shield, Key, Lock, Radio } from "lucide-react";
import { SimulationStep } from "@/pages/Simulator";

interface ArchitectureViewProps {
  currentStep: SimulationStep;
}

export const ArchitectureView = ({ currentStep }: ArchitectureViewProps) => {
  const getHighlightClass = (component: string) => {
    const stepId = currentStep.id;
    const isActive = currentStep.status === 'running' || currentStep.status === 'success';
    
    if (!isActive) return '';
    
    switch (component) {
      case 'puf':
        return ['S0_ENROLL', 'S1_BOOT', 'S2_AUTH'].includes(stepId) ? 'ring-2 ring-primary shadow-lg shadow-primary/50' : '';
      case 'crp':
        return ['S0_ENROLL', 'S2_AUTH'].includes(stepId) ? 'ring-2 ring-primary shadow-lg shadow-primary/50' : '';
      case 'dh':
        return stepId === 'S3_DH' ? 'ring-2 ring-accent shadow-lg shadow-accent/50' : '';
      case 'provision':
        return stepId === 'S4_PROVISION' ? 'ring-2 ring-cyber-secondary shadow-lg shadow-cyber-secondary/50' : '';
      case 'operation':
        return stepId === 'S5_OPERATION' ? 'ring-2 ring-cyber-accent shadow-lg shadow-cyber-accent/50' : '';
      default:
        return '';
    }
  };

  const getArrowClass = () => {
    const stepId = currentStep.id;
    if (currentStep.status === 'running' || currentStep.status === 'success') {
      return 'animate-pulse';
    }
    return 'opacity-30';
  };

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-primary" />
          Architecture View
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* IoT Device */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-cyber mb-2">
                <Cpu className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">IoT Device</h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className={`p-3 rounded-lg bg-secondary border border-border transition-all duration-300 ${getHighlightClass('puf')}`}>
                <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-center">PUF Module</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <Radio className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-center">RNG</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <Key className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-center">Crypto Engine</p>
              </div>
            </div>
          </div>

          {/* Connection Arrow */}
          <div className="relative">
            <div className={`h-20 border-l-2 border-r-2 border-primary/50 mx-auto w-0 ${getArrowClass()}`}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className={`w-3 h-3 rounded-full bg-primary ${getArrowClass()}`} />
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-xs text-muted-foreground">
              {currentStep.status === 'running' && '← Data Flow →'}
            </div>
          </div>

          {/* Provisioning Server */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-cyber mb-2">
                <Cloud className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-lg">Provisioning Server</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className={`p-3 rounded-lg bg-secondary border border-border transition-all duration-300 ${getHighlightClass('crp')}`}>
                <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs text-center">CRP Database</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary border border-border">
                <Lock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-xs text-center">Auth Engine</p>
              </div>
              <div className={`p-3 rounded-lg bg-secondary border border-border transition-all duration-300 ${getHighlightClass('dh')}`}>
                <Key className="h-5 w-5 mx-auto mb-1 text-accent" />
                <p className="text-xs text-center">Key Exchange</p>
              </div>
              <div className={`p-3 rounded-lg bg-secondary border border-border transition-all duration-300 ${getHighlightClass('provision')}`}>
                <Lock className="h-5 w-5 mx-auto mb-1 text-cyber-secondary" />
                <p className="text-xs text-center">Provisioning</p>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className={`p-3 rounded-lg text-center transition-all duration-300 ${
            currentStep.status === 'running' ? 'bg-primary/10 border border-primary' :
            currentStep.status === 'success' ? 'bg-primary/5 border border-primary/30' :
            'bg-secondary border border-border'
          }`}>
            <p className="text-sm font-medium">{currentStep.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{currentStep.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
