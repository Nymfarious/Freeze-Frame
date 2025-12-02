import { Bot, Sparkles, User, Zap } from 'lucide-react';

interface AIAgentReadyPanelProps {
  estimatedFrames: number;
}

export function AIAgentReadyPanel({ estimatedFrames }: AIAgentReadyPanelProps) {
  const agents = [
    {
      name: 'Sampler',
      role: 'Frame Extraction',
      status: `~${estimatedFrames} frames`,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      pulseColor: 'bg-blue-500',
      state: 'active' as const,
    },
    {
      name: 'Analyzer',
      role: 'Vision AI',
      status: 'Awaiting data',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      pulseColor: 'bg-purple-500',
      state: 'waking' as const,
    },
    {
      name: 'Cluster',
      role: 'Grouping',
      status: 'On standby',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      pulseColor: 'bg-emerald-500',
      state: 'dormant' as const,
    },
  ];

  const getStateStyles = (state: 'dormant' | 'waking' | 'active') => {
    switch (state) {
      case 'active':
        return {
          avatarOpacity: 'opacity-100',
          glowOpacity: 'opacity-100',
          animation: 'animate-pulse',
          pulseSpeed: 'duration-1000',
        };
      case 'waking':
        return {
          avatarOpacity: 'opacity-70',
          glowOpacity: 'opacity-50',
          animation: 'animate-pulse',
          pulseSpeed: 'duration-2000',
        };
      case 'dormant':
        return {
          avatarOpacity: 'opacity-40 grayscale',
          glowOpacity: 'opacity-20',
          animation: '',
          pulseSpeed: '',
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">AI Agents Ready</h3>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {agents.map((agent, index) => {
          const styles = getStateStyles(agent.state);
          return (
            <div
              key={agent.name}
              className="flex flex-col items-center gap-3"
              style={{ animationDelay: `${index * 300}ms` }}
            >
              {/* Avatar with glow */}
              <div className="relative">
                {/* Outer glow ring */}
                <div className={`absolute -inset-4 bg-gradient-to-br ${agent.color} rounded-full blur-xl ${styles.glowOpacity} ${styles.animation} ${styles.pulseSpeed}`}></div>
                
                {/* Middle ring */}
                <div className={`absolute -inset-2 ${agent.bgColor} rounded-full border-2 border-border ${styles.animation} ${styles.pulseSpeed}`}></div>
                
                {/* Avatar container */}
                <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${agent.color} p-0.5 ${styles.avatarOpacity} transition-all duration-500`}>
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    {agent.state === 'active' && (
                      <Bot className="w-10 h-10 text-foreground" />
                    )}
                    {agent.state === 'waking' && (
                      <User className="w-10 h-10 text-foreground" />
                    )}
                    {agent.state === 'dormant' && (
                      <Zap className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Status pulse dot */}
                <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full ${agent.bgColor} border-2 border-background flex items-center justify-center`}>
                  <div className={`w-2.5 h-2.5 rounded-full ${agent.pulseColor} ${styles.animation} ${styles.pulseSpeed}`}></div>
                </div>
              </div>

              {/* Agent info */}
              <div className="text-center">
                <h4 className="text-sm font-bold text-foreground">{agent.name}</h4>
                <p className="text-xs text-muted-foreground mb-1">{agent.role}</p>
                <div className={`inline-block px-3 py-1 rounded-full ${agent.bgColor} border border-border`}>
                  <p className="text-xs font-medium text-foreground">{agent.status}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info banner */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <p className="text-sm text-foreground font-medium">
            Agents will activate sequentially during scan
          </p>
        </div>
      </div>
    </div>
  );
}
