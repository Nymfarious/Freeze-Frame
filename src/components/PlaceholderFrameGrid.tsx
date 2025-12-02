import { Skeleton } from '@/components/ui/skeleton';
import { Image, Sparkles } from 'lucide-react';

interface PlaceholderFrameGridProps {
  estimatedFrames: number;
}

export function PlaceholderFrameGrid({ estimatedFrames }: PlaceholderFrameGridProps) {
  // Show up to 12 placeholder cards
  const displayCount = Math.min(estimatedFrames, 12);
  const placeholders = Array.from({ length: displayCount }, (_, i) => i);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Frame Preview</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Awaiting scan...</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {placeholders.map((index) => (
          <div
            key={index}
            className="group relative aspect-square rounded-lg overflow-hidden border border-border bg-muted/30 hover:border-primary/50 transition-all"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
            
            <Skeleton className="w-full h-full" />
            
            {/* Overlay content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
              <Image className="w-8 h-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground font-medium">
                Frame #{index + 1}
              </span>
            </div>

            {/* Corner decoration */}
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary/30 animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* Summary bar */}
      <div className="flex items-center justify-between bg-muted/30 border border-border rounded-lg px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-sm text-foreground">
            Ready to extract <span className="font-bold">{estimatedFrames}</span> frames
          </span>
        </div>
        {estimatedFrames > displayCount && (
          <span className="text-xs text-muted-foreground">
            +{estimatedFrames - displayCount} more
          </span>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
