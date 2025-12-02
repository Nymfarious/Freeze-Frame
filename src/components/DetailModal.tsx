import { useState } from 'react';
import { Frame, EnhancementStyles } from '@/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
  ChevronDown,
  ChevronUp,
  Save,
} from 'lucide-react';
import { formatTimestamp } from '@/services/videoProcessor';
import { Separator } from '@/components/ui/separator';

interface DetailModalProps {
  frame: Frame | null;
  allFrames: Frame[];
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onEnhance: (frameId: string, styles: EnhancementStyles) => Promise<void>;
  onToggleKeeper: (frameId: string, isKeeper: boolean) => void;
  onSaveAsNew: (frameId: string) => void;
}

export function DetailModal({
  frame,
  allFrames,
  onClose,
  onNavigate,
  onEnhance,
  onToggleKeeper,
  onSaveAsNew,
}: DetailModalProps) {
  const [styles, setStyles] = useState<EnhancementStyles>({
    unblur: false,
    cinematicLighting: false,
    portraitBokeh: false,
    removeBackground: false,
    colorPop: false,
    hdr: false,
  });
  const [showAdvice, setShowAdvice] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  if (!frame) return null;

  const currentIndex = allFrames.findIndex((f) => f.id === frame.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allFrames.length - 1;

  const qualityColors = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    fair: 'bg-yellow-500',
  };

  const styleOptions = [
    { key: 'unblur', label: 'Unblur & Sharpen' },
    { key: 'cinematicLighting', label: 'Cinematic Lighting' },
    { key: 'portraitBokeh', label: 'Portrait Bokeh' },
    { key: 'removeBackground', label: 'Remove Background' },
    { key: 'colorPop', label: 'Color Pop' },
    { key: 'hdr', label: 'HDR' },
  ] as const;

  const toggleStyle = (key: keyof EnhancementStyles) => {
    setStyles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEnhance = async () => {
    setIsEnhancing(true);
    try {
      await onEnhance(frame.id, styles);
    } finally {
      setIsEnhancing(false);
    }
  };

  const appliedEnhancements = Object.entries(styles)
    .filter(([_, value]) => value)
    .map(([key]) => styleOptions.find((opt) => opt.key === key)?.label);

  return (
    <Dialog open={!!frame} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 bg-gray-900 border-gray-800">
        <div className="flex h-full">
          {/* Image Viewer */}
          <div className="flex-1 flex flex-col bg-black">
            <div className="flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-foreground">Image Enhancer</h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-8">
              {frame.isEnhanced && frame.enhancedImageData ? (
                <div className="flex gap-6 max-h-full items-start">
                  {/* Original - Mini Pic (30% width) */}
                  <div className="w-[30%] flex flex-col">
                    <div className="mb-3">
                      <span className="text-sm font-semibold text-foreground">Original</span>
                    </div>
                    <img
                      src={frame.imageData}
                      alt="Original"
                      className="max-h-full w-full object-contain rounded-lg border border-border"
                    />
                  </div>
                  
                  {/* Enhanced - Larger (70% width) */}
                  <div className="flex-1 flex flex-col">
                    <div className="mb-3">
                      <span className="text-sm font-semibold text-foreground">Enhanced</span>
                      {frame.appliedEnhancements && frame.appliedEnhancements.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {frame.appliedEnhancements.map((key) => {
                            const option = styleOptions.find((opt) => opt.key === key);
                            return option?.label;
                          }).filter(Boolean).join(' + ')}
                        </div>
                      )}
                    </div>
                    <img
                      src={frame.enhancedImageData}
                      alt="Enhanced"
                      className="max-h-full w-full object-contain rounded-lg border border-border"
                    />
                  </div>
                </div>
              ) : (
                <img
                  src={frame.imageData}
                  alt="Frame"
                  className="max-h-full max-w-full object-contain rounded-lg border border-border"
                />
              )}

              {/* Navigation arrows */}
              {hasPrev && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm hover:bg-gray-800"
                  onClick={() => onNavigate('prev')}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}
              {hasNext && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm hover:bg-gray-800"
                  onClick={() => onNavigate('next')}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Control Sidebar */}
          <div className="w-96 bg-gray-800/50 backdrop-blur-md border-l border-gray-700 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Stats */}
              <div className="space-y-3">
                {frame.analysis?.quality && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Quality</span>
                    <Badge
                      className={`${
                        qualityColors[frame.analysis.quality]
                      } text-white border-0`}
                    >
                      {frame.analysis.quality.charAt(0).toUpperCase() +
                        frame.analysis.quality.slice(1)}
                    </Badge>
                  </div>
                )}
                {frame.analysis?.compositionScore !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Composition Score</span>
                    <span className="text-sm font-medium text-foreground">
                      {frame.analysis.compositionScore}/100
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Timestamp</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatTimestamp(frame.timestamp)}
                  </span>
                </div>
              </div>

              <Separator className="bg-gray-700" />

              {/* Creative Styles */}
              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">Creative Styles</h3>
                <div className="grid grid-cols-2 gap-2">
                  {styleOptions.map((option) => (
                    <Button
                      key={option.key}
                      variant="outline"
                      size="sm"
                      className={`justify-start ${
                        styles[option.key]
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'border-gray-700 bg-gray-900/50 hover:bg-gray-900'
                      }`}
                      onClick={() => toggleStyle(option.key)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Technical Advice */}
              {frame.analysis?.technicalAdvice &&
                frame.analysis.technicalAdvice.length > 0 && (
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-muted-foreground hover:text-foreground"
                      onClick={() => setShowAdvice(!showAdvice)}
                    >
                      <span>Technical Advice</span>
                      {showAdvice ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                    {showAdvice && (
                      <ul className="space-y-1 text-sm text-muted-foreground pl-4">
                        {frame.analysis.technicalAdvice.map((advice, idx) => (
                          <li key={idx} className="list-disc">
                            {advice}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

              {/* Applied Enhancements */}
              {appliedEnhancements.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground text-sm">
                    Applied Enhancements
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {appliedEnhancements.map((enhancement) => (
                      <Badge
                        key={enhancement}
                        variant="secondary"
                        className="bg-green-500/20 text-green-400 border-green-500/30"
                      >
                        ✓ {enhancement}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="bg-gray-700" />

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleEnhance}
                  disabled={
                    isEnhancing ||
                    frame.isProcessing ||
                    !Object.values(styles).some((v) => v)
                  }
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-purple-500/20"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {isEnhancing ? 'Enhancing...' : 'Magical Enhancements'}
                </Button>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="keeper"
                    checked={frame.isKeeper}
                    onCheckedChange={(checked) =>
                      onToggleKeeper(frame.id, checked as boolean)
                    }
                    className="border-gray-600"
                  />
                  <label
                    htmlFor="keeper"
                    className="text-sm text-foreground cursor-pointer"
                  >
                    Keep this frame
                  </label>
                </div>

                {frame.isEnhanced && (
                  <Button
                    onClick={() => onSaveAsNew(frame.id)}
                    variant="outline"
                    className="w-full border-gray-700 bg-gray-900/50 hover:bg-gray-900"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as New Version
                  </Button>
                )}

                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full border-gray-700 bg-gray-900/50 hover:bg-gray-900"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
