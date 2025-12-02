import { useEffect, useState } from 'react';
import { extractFrame } from '@/services/videoProcessor';
import { Skeleton } from '@/components/ui/skeleton';
import { Film } from 'lucide-react';
import { formatTimestamp } from '@/services/videoProcessor';

interface QuickPreviewStripProps {
  videoFile: File;
  videoDuration: number;
}

interface PreviewFrame {
  timestamp: number;
  imageData: string | null;
  isLoading: boolean;
}

export function QuickPreviewStrip({ videoFile, videoDuration }: QuickPreviewStripProps) {
  const [previewFrames, setPreviewFrames] = useState<PreviewFrame[]>([]);

  useEffect(() => {
    const extractPreviews = async () => {
      // Create 6 frames at even intervals: 0%, 20%, 40%, 60%, 80%, 100%
      const intervals = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
      const initialFrames: PreviewFrame[] = intervals.map(ratio => ({
        timestamp: videoDuration * ratio,
        imageData: null,
        isLoading: true,
      }));

      setPreviewFrames(initialFrames);

      const videoUrl = URL.createObjectURL(videoFile);

      // Extract each frame
      for (let i = 0; i < intervals.length; i++) {
        try {
          const timestamp = videoDuration * intervals[i];
          const imageData = await extractFrame(videoUrl, timestamp);
          
          setPreviewFrames(prev => prev.map((frame, idx) => 
            idx === i ? { ...frame, imageData, isLoading: false } : frame
          ));
        } catch (error) {
          console.error(`Failed to extract frame at ${intervals[i] * 100}%:`, error);
          setPreviewFrames(prev => prev.map((frame, idx) => 
            idx === i ? { ...frame, isLoading: false } : frame
          ));
        }
      }

      URL.revokeObjectURL(videoUrl);
    };

    extractPreviews();
  }, [videoFile, videoDuration]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Film className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Quick Preview</h3>
        <div className="flex-1 h-px bg-border"></div>
      </div>

      <div className="relative">
        {/* Film reel perforations decoration */}
        <div className="absolute -top-2 left-0 right-0 flex justify-around">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-border rounded-sm"></div>
          ))}
        </div>
        <div className="absolute -bottom-2 left-0 right-0 flex justify-around">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="w-2 h-2 bg-border rounded-sm"></div>
          ))}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-thin scrollbar-thumb-primary scrollbar-track-muted">
          {previewFrames.map((frame, index) => (
            <div
              key={index}
              className="flex-shrink-0 group cursor-pointer transition-transform duration-200 hover:scale-105"
            >
              <div className="relative w-32 aspect-video rounded-lg overflow-hidden bg-muted border-2 border-border shadow-md group-hover:border-primary group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
                {frame.isLoading ? (
                  <Skeleton className="w-full h-full" />
                ) : frame.imageData ? (
                  <>
                    <img
                      src={frame.imageData}
                      alt={`Preview at ${formatTimestamp(frame.timestamp)}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Timestamp overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent px-2 py-1">
                      <span className="text-xs font-mono text-foreground">
                        {formatTimestamp(frame.timestamp)}
                      </span>
                    </div>
                    {/* Hover glow effect */}
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Film className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: hsl(var(--muted));
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: hsl(var(--primary));
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: hsl(var(--primary) / 0.8);
        }
      `}</style>
    </div>
  );
}
