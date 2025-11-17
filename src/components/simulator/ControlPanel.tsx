import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { DeviceConfig } from "@/pages/Simulator";
import { Settings, Play } from "lucide-react";

interface ControlPanelProps {
  deviceConfig: DeviceConfig;
  onConfigChange: (config: DeviceConfig) => void;
  onInitializeSession: () => void;
  onRunEnrollment: () => void;
  onRunAuthentication: () => void;
  onRunFullSimulation: () => void;
  sessionStatus: 'not-started' | 'active' | 'completed';
}

export const ControlPanel = ({
  deviceConfig,
  onConfigChange,
  onInitializeSession,
  onRunEnrollment,
  onRunAuthentication,
  onRunFullSimulation,
  sessionStatus,
}: ControlPanelProps) => {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Simulation Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Device Configuration */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Device Configuration</h3>
          
          <div className="space-y-2">
            <Label htmlFor="device-id" className="text-xs">Device ID</Label>
            <Input
              id="device-id"
              value={deviceConfig.deviceId}
              onChange={(e) => onConfigChange({ ...deviceConfig, deviceId: e.target.value })}
              className="bg-secondary border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="puf-type" className="text-xs">PUF Type</Label>
            <Select
              value={deviceConfig.pufType}
              onValueChange={(value: DeviceConfig['pufType']) => 
                onConfigChange({ ...deviceConfig, pufType: value })
              }
            >
              <SelectTrigger id="puf-type" className="bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="arbiter">Arbiter (Simulated)</SelectItem>
                <SelectItem value="sram">SRAM (Simulated)</SelectItem>
                <SelectItem value="fallback">Fallback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="crp-count" className="text-xs">Number of CRPs for Enrollment</Label>
              <span className="text-xs text-muted-foreground">{deviceConfig.crpCount}</span>
            </div>
            <Slider
              id="crp-count"
              min={10}
              max={100}
              step={10}
              value={[deviceConfig.crpCount]}
              onValueChange={([value]) => onConfigChange({ ...deviceConfig, crpCount: value })}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-border">
          <Button
            onClick={onInitializeSession}
            variant="outline"
            className="w-full border-primary/50 hover:bg-primary/10"
            disabled={sessionStatus !== 'not-started'}
          >
            Initialize Session
          </Button>

          <Button
            onClick={onRunEnrollment}
            variant="outline"
            className="w-full"
            disabled={sessionStatus === 'not-started'}
          >
            <Play className="h-4 w-4 mr-2" />
            Run Enrollment Only
          </Button>

          <Button
            onClick={onRunAuthentication}
            variant="outline"
            className="w-full"
            disabled={sessionStatus === 'not-started'}
          >
            <Play className="h-4 w-4 mr-2" />
            Run Authentication Only
          </Button>

          <Button
            onClick={onRunFullSimulation}
            className="w-full bg-gradient-cyber hover:opacity-90"
            disabled={sessionStatus === 'completed'}
          >
            <Play className="h-4 w-4 mr-2" />
            Run Full Simulation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
