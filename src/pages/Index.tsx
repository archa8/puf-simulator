import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Shield, Wifi, Key, ChevronRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const steps = [
    "Enrollment",
    "Boot",
    "Authentication",
    "Key Exchange",
    "Provisioning",
    "Operation"
  ];

  const features = [
    {
      icon: Shield,
      title: "PUF-Based Identity",
      description: "Hardware-rooted security using Physical Unclonable Functions for unique device fingerprints"
    },
    {
      icon: Wifi,
      title: "Zero-Touch Onboarding",
      description: "Automatic device provisioning without manual configuration or intervention"
    },
    {
      icon: Key,
      title: "Secure Key Exchange",
      description: "Diffie-Hellman protocol ensures encrypted communication channels"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-dark dark">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-cyber bg-clip-text text-transparent">
              PUF-based Zero-Touch IoT Provisioning Simulator
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Visualize how an IoT device with a PUF enrolls, authenticates, exchanges keys, 
              and gets securely provisioned in a zero-touch workflow.
            </p>
          </div>

          <Button 
            size="lg" 
            onClick={() => navigate('/simulator')}
            className="bg-gradient-cyber hover:opacity-90 text-primary-foreground font-semibold px-8 py-6 text-lg shadow-lg shadow-cyber-glow/20 transition-all hover:shadow-cyber-glow/40"
          >
            Start Simulation
            <ChevronRight className="ml-2 h-5 w-5" />
          </Button>

          {/* Timeline */}
          <div className="mt-16">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
              {steps.map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-card border-2 border-primary flex items-center justify-center text-sm font-semibold shadow-lg shadow-primary/20">
                      {index + 1}
                    </div>
                    <span className="text-xs mt-2 text-muted-foreground">{step}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="w-8 md:w-16 h-0.5 bg-gradient-to-r from-primary to-accent mb-6" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <Card 
              key={feature.title} 
              className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-cyber flex items-center justify-center mb-4 shadow-lg shadow-cyber-glow/20">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
