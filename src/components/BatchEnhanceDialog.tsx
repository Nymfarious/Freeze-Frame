import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { EnhancementStyles, Frame } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BatchEnhanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frames: Frame[];
  onBatchEnhance: (frameIds: string[], styles: EnhancementStyles) => Promise<void>;
}

const MAX_BATCH_SIZE = 10;

export function BatchEnhanceDialog({
  open,
  onOpenChange,
  frames,
  onBatchEnhance
}: BatchEnhanceDialogProps) {
  const [selectedFrames, setSelectedFrames] = useState<string[]>([]);
  const [styles, setStyles] = useState<EnhancementStyles>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleToggleFrame = (frameId: string) => {
    setSelectedFrames(prev => {
      if (prev.includes(frameId)) {
        return prev.filter(id => id !== frameId);
      }
      if (prev.length >= MAX_BATCH_SIZE) {
        return prev;
      }
      return [...prev, frameId];
    });
  };

  const handleToggleStyle = (style: keyof EnhancementStyles) => {
    setStyles(prev => ({
      ...prev,
      [style]: !prev[style]
    }));
  };

  const handleEnhance = async () => {
    if (selectedFrames.length === 0 || Object.values(styles).every(v => !v)) {
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      // Process frames one by one to track progress
      for (let i = 0; i < selectedFrames.length; i++) {
        await onBatchEnhance([selectedFrames[i]], styles);
        setProgress(((i + 1) / selectedFrames.length) * 100);
      }
      
      onOpenChange(false);
      setSelectedFrames([]);
      setStyles({});
    } catch (error) {
      console.error('Batch enhancement error:', error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const estimatedCost = selectedFrames.length * 0.1; // Rough estimate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Enhancement (Max {MAX_BATCH_SIZE} images)</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enhancement Options */}
          <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
            <h3 className="text-sm font-medium">Enhancement Options</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unblur"
                  checked={styles.unblur || false}
                  onCheckedChange={() => handleToggleStyle('unblur')}
                />
                <Label htmlFor="unblur" className="cursor-pointer">Unblur</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="colorPop"
                  checked={styles.colorPop || false}
                  onCheckedChange={() => handleToggleStyle('colorPop')}
                />
                <Label htmlFor="colorPop" className="cursor-pointer">Color Pop</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enhanceDetail"
                  checked={styles.enhanceDetail || false}
                  onCheckedChange={() => handleToggleStyle('enhanceDetail')}
                />
                <Label htmlFor="enhanceDetail" className="cursor-pointer">Enhance Detail</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="removeBackground"
                  checked={styles.removeBackground || false}
                  onCheckedChange={() => handleToggleStyle('removeBackground')}
                />
                <Label htmlFor="removeBackground" className="cursor-pointer">Remove Background</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="upscale"
                  checked={styles.upscale || false}
                  onCheckedChange={() => handleToggleStyle('upscale')}
                />
                <Label htmlFor="upscale" className="cursor-pointer">Upscale</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="denoise"
                  checked={styles.denoise || false}
                  onCheckedChange={() => handleToggleStyle('denoise')}
                />
                <Label htmlFor="denoise" className="cursor-pointer">Denoise</Label>
              </div>
            </div>
          </div>

          {/* Cost Estimate */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Selected: {selectedFrames.length} / {MAX_BATCH_SIZE} frames
              <br />
              Estimated cost: ~${estimatedCost.toFixed(2)} (varies by enhancement type)
            </AlertDescription>
          </Alert>

          {/* Frame Selection Grid */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Select Frames (max {MAX_BATCH_SIZE})</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {frames.filter(f => f.isKeeper).map(frame => (
                <div
                  key={frame.id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedFrames.includes(frame.id)
                      ? 'border-primary ring-2 ring-primary/50'
                      : 'border-transparent hover:border-border'
                  } ${
                    selectedFrames.length >= MAX_BATCH_SIZE && !selectedFrames.includes(frame.id)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  onClick={() => handleToggleFrame(frame.id)}
                >
                  <img
                    src={frame.enhancedImageData || frame.imageData}
                    alt="Frame"
                    className="w-full aspect-video object-cover"
                  />
                  {selectedFrames.includes(frame.id) && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {selectedFrames.indexOf(frame.id) + 1}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Progress */}
          {isProcessing && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Enhancing frames... {Math.round(progress)}%
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleEnhance}
              disabled={
                isProcessing ||
                selectedFrames.length === 0 ||
                Object.values(styles).every(v => !v)
              }
              className="flex-1 gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Enhance {selectedFrames.length} Frame{selectedFrames.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              disabled={isProcessing}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
