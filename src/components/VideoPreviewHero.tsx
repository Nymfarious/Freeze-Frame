import { useEffect, useState } from 'react';
import { extractFrame } from '@/services/videoProcessor';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Film, Sparkles } from 'lucide-react';

interface VideoPreviewHeroProps {
  videoFile: File;
  videoDuration: number;
  scanInterval: number;
}

export function VideoPreviewHero({ videoFile, videoDuration, scanInterval }: VideoPreviewHeroProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const extractPreview = async () => {
      try {
        const videoUrl = URL.createObjectURL(videoFile);
        const firstFrame = await extractFrame(videoUrl, 0.1);
        setPreviewImage(firstFrame);
        URL.revokeObjectURL(videoUrl);
      } catch (error) {
        console.error('Failed to extract preview:', error);
      } finally {
        setIsLoading(false);
      }
    };

    extractPreview();
  }, [videoFile]);

  const estimatedFrames = Math.floor(videoDuration / scanInterval);
  const fileSize = (videoFile.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="relative">
      {/* Animated gradient border */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl opacity-75 blur-md animate-pulse"></div>
      
      <div className="relative bg-background/95 backdrop-blur-sm rounded-3xl p-6 border border-border">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Video Preview */}
          <div className="flex-shrink-0 lg:w-2/5">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : previewImage ? (
                <>
                  <img 
                    src={previewImage} 
                    alt="Video preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Sparkle overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <Sparkles className="absolute top-4 right-4 w-6 h-6 text-primary animate-pulse" />
                    <Sparkles className="absolute bottom-6 left-6 w-4 h-4 text-accent animate-pulse delay-300" />
                    <Sparkles className="absolute top-1/2 left-1/3 w-3 h-3 text-primary/60 animate-pulse delay-700" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Film className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Video Ready for Analysis</h3>
              <p className="text-muted-foreground">Press "Start Intelligent Scan" to begin extracting frames</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Duration</span>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.floor(videoDuration / 60)}:{String(Math.floor(videoDuration % 60)).padStart(2, '0')}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Film className="w-4 h-4" />
                  <span className="text-sm">Estimated Frames</span>
                </div>
                <p className="text-2xl font-bold text-foreground">~{estimatedFrames}</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm">File Size</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{fileSize} MB</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Film className="w-4 h-4" />
                  <span className="text-sm">Scan Interval</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{scanInterval}s</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
