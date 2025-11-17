import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SimulationStep } from "@/pages/Simulator";
import { Play, ChevronRight, Check, Loader2 } from "lucide-react";

interface SimulationStepperProps {
  steps: SimulationStep[];
  currentStepIndex: number;
  stepByStepMode: boolean;
  onToggleStepMode: (value: boolean) => void;
  onRunFullSimulation: () => void;
  onRunNextStep: () => void;
  sessionStatus: 'not-started' | 'active' | 'completed';
}

export const SimulationStepper = ({
  steps,
  currentStepIndex,
  stepByStepMode,
  onToggleStepMode,
  onRunFullSimulation,
  onRunNextStep,
  sessionStatus,
}: SimulationStepperProps) => {
  const getStepIcon = (status: SimulationStep['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case 'success':
        return <Check className="h-4 w-4 text-primary" />;
      default:
        return null;
    }
  };

  const getStepBadgeVariant = (status: SimulationStep['status']) => {
    switch (status) {
      case 'running':
        return 'default';
      case 'success':
        return 'outline';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5 text-primary" />
          Simulation Pipeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="space-y-4 p-4 rounded-lg bg-secondary/50 border border-border">
          <Button
            onClick={onRunFullSimulation}
            className="w-full bg-gradient-cyber hover:opacity-90"
            disabled={sessionStatus === 'completed'}
          >
            <Play className="h-4 w-4 mr-2" />
            Run Full Simulation
          </Button>

          <div className="flex items-center justify-between">
            <Label htmlFor="step-mode" className="text-sm">Step-by-step mode</Label>
            <Switch
              id="step-mode"
              checked={stepByStepMode}
              onCheckedChange={onToggleStepMode}
            />
          </div>

          {stepByStepMode && (
            <Button
              onClick={onRunNextStep}
              variant="outline"
              className="w-full border-primary/50 hover:bg-primary/10"
              disabled={currentStepIndex >= steps.length || sessionStatus === 'completed'}
            >
              Next Step
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Steps List */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border transition-all duration-300 ${
                index === currentStepIndex && step.status === 'running'
                  ? 'bg-primary/10 border-primary shadow-lg shadow-primary/20'
                  : step.status === 'success'
                  ? 'bg-secondary/50 border-primary/30'
                  : 'bg-secondary/30 border-border'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step.status === 'success' ? 'bg-gradient-cyber text-primary-foreground' :
                    step.status === 'running' ? 'bg-primary text-primary-foreground' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {step.status === 'running' || step.status === 'success' ? getStepIcon(step.status) : index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{step.label}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                  </div>
                </div>
                <Badge variant={getStepBadgeVariant(step.status)} className="text-xs">
                  {step.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
