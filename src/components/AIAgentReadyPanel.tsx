import { Brain, Eye, GitMerge } from 'lucide-react';

interface AIAgentReadyPanelProps {
  estimatedFrames: number;
}

export function AIAgentReadyPanel({ estimatedFrames }: AIAgentReadyPanelProps) {
  const agents = [
    {
      name: 'Frame Sampler',
      icon: GitMerge,
      status: `Ready to extract ~${estimatedFrames} candidates`,
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400',
      glowColor: 'shadow-blue-500/50',
    },
    {
      name: 'Vision Analyzer',
      icon: Eye,
      status: 'Awaiting frames',
      color: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400',
      glowColor: 'shadow-purple-500/50',
    },
    {
      name: 'Clustering Agent',
      icon: Brain,
      status: 'Standing by',
      color: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-400',
      glowColor: 'shadow-emerald-500/50',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">AI Pipeline Ready</h3>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {agents.map((agent, index) => (
          <div
            key={agent.name}
            className="relative group"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            {/* Breathing glow effect */}
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${agent.color} rounded-xl blur-md opacity-75 animate-pulse`}></div>
            
            <div className="relative bg-background/95 backdrop-blur-sm rounded-xl p-6 border border-border hover:border-primary/50 transition-all">
              <div className="flex items-start gap-4">
                {/* Icon with glow */}
                <div className="relative">
                  <div className={`absolute inset-0 ${agent.glowColor} blur-lg opacity-50 animate-pulse`}></div>
                  <div className="relative bg-muted/50 p-3 rounded-lg">
                    <agent.icon className={`w-6 h-6 ${agent.iconColor}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground mb-1">
                    {agent.name}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {agent.status}
                  </p>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 mt-4">
                <div className={`w-2 h-2 rounded-full ${agent.iconColor} animate-pulse`}></div>
                <span className="text-xs text-muted-foreground font-medium">READY</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info banner */}
      <div className="bg-muted/30 border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          <span className="font-semibold text-foreground">AI agents are initialized.</span> Press "Start Intelligent Scan" to begin the pipeline.
        </p>
      </div>
    </div>
  );
}
