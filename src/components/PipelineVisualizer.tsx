import { PipelineStatus } from '@/types';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface PipelineVisualizerProps {
  status: PipelineStatus;
}

export function PipelineVisualizer({ status }: PipelineVisualizerProps) {
  const stages = [
    {
      id: 'sampling',
      label: 'Frame Sampler Agent',
      active: status.stage === 'sampling',
      complete: ['analyzing', 'clustering', 'complete'].includes(status.stage),
      progress: status.samplingProgress,
      message:
        status.stage === 'sampling'
          ? `Scanning... ${Math.round(status.samplingProgress)}%`
          : status.extractedCount > 0
          ? `Extracted ${status.extractedCount} candidates`
          : '',
    },
    {
      id: 'analyzing',
      label: 'Vision Analyzer Agent',
      active: status.stage === 'analyzing',
      complete: ['clustering', 'complete'].includes(status.stage),
      progress:
        status.analyzingTotal > 0
          ? (status.analyzingCurrent / status.analyzingTotal) * 100
          : 0,
      message:
        status.stage === 'analyzing'
          ? `Analyzing... ${status.analyzingCurrent}/${status.analyzingTotal}`
          : '',
    },
    {
      id: 'clustering',
      label: 'Clustering Agent',
      active: status.stage === 'clustering',
      complete: status.stage === 'complete',
      progress: status.stage === 'clustering' ? 50 : 0,
      message: status.stage === 'clustering' ? 'Processing...' : '',
    },
  ];

  if (status.stage === 'idle') return null;

  return (
    <div className="bg-card/50 backdrop-blur-md border border-border rounded-2xl p-6 shadow-lg shadow-primary/10">
      <h3 className="text-lg font-semibold text-foreground mb-4">AI Pipeline Status</h3>
      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex items-start gap-3">
            <div className="mt-1">
              {stage.complete ? (
                <CheckCircle2 className="w-5 h-5 text-accent" />
              ) : stage.active ? (
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-muted" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`font-medium ${
                    stage.active || stage.complete ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {stage.label}
                </span>
                {stage.message && (
                  <span className="text-sm text-muted-foreground">{stage.message}</span>
                )}
              </div>
              {stage.active && stage.progress > 0 && (
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                    style={{ width: `${stage.progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
