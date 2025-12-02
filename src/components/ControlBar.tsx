import { ScanRange } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Library, RotateCcw, Sparkles, Play } from 'lucide-react';
import { formatDuration } from '@/services/videoProcessor';

interface ControlBarProps {
  isScanned: boolean;
  isScanning: boolean;
  videoDuration: number;
  scanRange: ScanRange;
  scanInterval: number;
  showFilters: boolean;
  viewKeepersOnly: boolean;
  showGalleryView?: boolean;
  onScanRangeChange: (range: ScanRange) => void;
  onScanIntervalChange: (interval: number) => void;
  onStartScan: () => void;
  onNewScan: () => void;
  onToggleFilters: () => void;
  onToggleKeepersView: () => void;
  onToggleGalleryView?: () => void;
  onToggleLibrary?: () => void;
}

export function ControlBar({
  isScanned,
  isScanning,
  videoDuration,
  scanRange,
  scanInterval,
  showFilters,
  viewKeepersOnly,
  showGalleryView = true,
  onScanRangeChange,
  onScanIntervalChange,
  onStartScan,
  onNewScan,
  onToggleFilters,
  onToggleKeepersView,
  onToggleGalleryView,
  onToggleLibrary,
}: ControlBarProps) {
  return (
    <div className="bg-card/80 backdrop-blur-md border-b border-border shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {!isScanned && !isScanning ? (
            <>
              <div className="flex items-center gap-4 flex-1">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Scan Range</label>
                  <Select value={scanRange} onValueChange={onScanRangeChange}>
                    <SelectTrigger className="w-40 bg-background/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Video</SelectItem>
                      <SelectItem value="first-half">First Half</SelectItem>
                      <SelectItem value="second-half">Second Half</SelectItem>
                      <SelectItem value="first-quarter">First Quarter</SelectItem>
                      <SelectItem value="last-quarter">Last Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Interval</label>
                  <Select
                    value={scanInterval.toString()}
                    onValueChange={(v) => onScanIntervalChange(Number(v))}
                  >
                    <SelectTrigger className="w-32 bg-background/50 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Every 1s</SelectItem>
                      <SelectItem value="2">Every 2s</SelectItem>
                      <SelectItem value="3">Every 3s</SelectItem>
                      <SelectItem value="5">Every 5s</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col justify-center">
                  <span className="text-xs text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium text-foreground">
                    {formatDuration(videoDuration)}
                  </span>
                </div>
              </div>

              <Button
                onClick={onStartScan}
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground px-6 h-10 shadow-lg shadow-primary/20"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start Intelligent Scan
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <Button
                  onClick={onNewScan}
                  variant="outline"
                  className="border-border bg-background/50 hover:bg-background"
                  disabled={isScanning}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  New Scan
                </Button>

                <Button
                  onClick={onToggleFilters}
                  variant="outline"
                  className={`${
                    showFilters ? 'bg-primary/20 border-primary' : 'border-border bg-background/50 hover:bg-background'
                  }`}
                  disabled={isScanning}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>

                {onToggleGalleryView && (
                  <Button
                    onClick={onToggleGalleryView}
                    variant="outline"
                    className={`${
                      !showGalleryView ? 'bg-primary/20 border-primary' : 'border-border bg-background/50 hover:bg-background'
                    }`}
                    disabled={isScanning}
                  >
                    {showGalleryView ? (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        View Video Preview
                      </>
                    ) : (
                      <>
                        <Library className="w-4 h-4 mr-2" />
                        View Extracted Frames
                      </>
                    )}
                  </Button>
                )}

                {onToggleLibrary && (
                  <Button
                    onClick={onToggleLibrary}
                    variant="outline"
                    className="border-border bg-background/50 hover:bg-background"
                    disabled={isScanning}
                  >
                    <Library className="w-4 h-4 mr-2" />
                    View Library
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
