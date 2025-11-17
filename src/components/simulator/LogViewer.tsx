import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { LogEntry } from "@/pages/Simulator";
import { Terminal } from "lucide-react";
import { useEffect, useRef } from "react";

interface LogViewerProps {
  logs: LogEntry[];
}

export const LogViewer = ({ logs }: LogViewerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getSourceColor = (source: LogEntry['source']) => {
    switch (source) {
      case 'DEVICE':
        return 'bg-cyber-primary/20 text-cyber-primary border-cyber-primary/30';
      case 'SERVER':
        return 'bg-cyber-secondary/20 text-cyber-secondary border-cyber-secondary/30';
      case 'DH':
        return 'bg-accent/20 text-accent border-accent/30';
      case 'PROVISIONING':
        return 'bg-cyber-accent/20 text-cyber-accent border-cyber-accent/30';
      case 'SYSTEM':
        return 'bg-muted text-muted-foreground border-border';
      default:
        return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          Protocol Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-lg bg-secondary/30 p-4" ref={scrollRef}>
          {logs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No logs yet. Start a simulation to see protocol messages.
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded bg-background/50 border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-2 mb-1">
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatTime(log.timestamp)}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getSourceColor(log.source)}`}
                    >
                      {log.source}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed pl-20">
                    {log.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
