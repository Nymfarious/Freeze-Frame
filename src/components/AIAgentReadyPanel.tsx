import { Bot, Sparkles, User, Zap } from 'lucide-react';
import { PipelineStatus } from '@/types';

interface AIAgentReadyPanelProps {
  estimatedFrames: number;
  pipelineStatus?: PipelineStatus;
}

export function AIAgentReadyPanel({ estimatedFrames, pipelineStatus }: AIAgentReadyPanelProps) {
  const getAgentState = (agentName: string): 'dormant' | 'waking' | 'active' => {
    if (!pipelineStatus || pipelineStatus.stage === 'idle') {
      return agentName === 'Sampler' ? 'active' : agentName === 'Analyzer' ? 'waking' : 'dormant';
    }

    if (pipelineStatus.stage === 'sampling') {
      return agentName === 'Sampler' ? 'active' : agentName === 'Analyzer' ? 'waking' : 'dormant';
    }

    if (pipelineStatus.stage === 'analyzing') {
      return agentName === 'Sampler' ? 'active' : agentName === 'Analyzer' ? 'active' : 'waking';
    }

    if (pipelineStatus.stage === 'clustering' || pipelineStatus.stage === 'complete') {
      return 'active';
    }

    return 'dormant';
  };

  const getAgentStatus = (agentName: string): string => {
    if (!pipelineStatus || pipelineStatus.stage === 'idle') {
      return agentName === 'Sampler' ? `~${estimatedFrames} frames` : agentName === 'Analyzer' ? 'Awaiting data' : 'On standby';
    }

    if (pipelineStatus.stage === 'sampling') {
      return agentName === 'Sampler' ? `Extracting... ${Math.round(pipelineStatus.samplingProgress)}%` : agentName === 'Analyzer' ? 'Awaiting data' : 'On standby';
    }

    if (pipelineStatus.stage === 'analyzing') {
      const analyzingProgress = pipelineStatus.analyzingTotal > 0 
        ? Math.round((pipelineStatus.analyzingCurrent / pipelineStatus.analyzingTotal) * 100)
        : 0;
      return agentName === 'Sampler' ? 'Complete' : agentName === 'Analyzer' ? `Analyzing... ${analyzingProgress}%` : 'Awaiting data';
    }

    if (pipelineStatus.stage === 'clustering') {
      return agentName === 'Sampler' ? 'Complete' : agentName === 'Analyzer' ? 'Complete' : 'Grouping...';
    }

    if (pipelineStatus.stage === 'complete') {
      return 'Complete';
    }

    return 'On standby';
  };

  const agents = [
    {
      name: 'Sampler',
      role: 'Frame Extraction',
      status: getAgentStatus('Sampler'),
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      pulseColor: 'bg-blue-500',
      state: getAgentState('Sampler'),
    },
    {
      name: 'Analyzer',
      role: 'Vision AI',
      status: getAgentStatus('Analyzer'),
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      pulseColor: 'bg-purple-500',
      state: getAgentState('Analyzer'),
    },
    {
      name: 'Cluster',
      role: 'Grouping',
      status: getAgentStatus('Cluster'),
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-500/10',
      pulseColor: 'bg-emerald-500',
      state: getAgentState('Cluster'),
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
