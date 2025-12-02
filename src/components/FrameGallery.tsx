import { Frame, ScanRange } from '@/types';
import { FrameCard } from './FrameCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateScanRange, formatTimestamp } from '@/services/videoProcessor';

interface FrameGalleryProps {
  frames: Frame[];
  videoDuration: number;
  scanRange: ScanRange;
  activeTab: 'all' | 'originals' | 'enhanced';
  onTabChange: (tab: 'all' | 'originals' | 'enhanced') => void;
  onFrameSelect: (frame: Frame) => void;
  onFrameDelete: (frameId: string) => void;
  onToggleKeeper: (frameId: string, isKeeper: boolean) => void;
}

export function FrameGallery({
  frames,
  videoDuration,
  scanRange,
  activeTab,
  onTabChange,
  onFrameSelect,
  onFrameDelete,
  onToggleKeeper,
}: FrameGalleryProps) {
  const { start, end } = calculateScanRange(videoDuration, scanRange);

  const filteredFrames = frames.filter((frame) => {
    if (activeTab === 'originals') return !frame.isEnhanced;
    if (activeTab === 'enhanced') return frame.isEnhanced;
    return true;
  });

  const scanRangeLabels: Record<ScanRange, string> = {
    full: 'Full Video',
    'first-half': 'First Half',
    'second-half': 'Second Half',
    'first-quarter': 'First Quarter',
    'last-quarter': 'Last Quarter',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Extracted Library</h2>
          <p className="text-muted-foreground">
            {filteredFrames.length} {filteredFrames.length === 1 ? 'frame' : 'frames'}
            {' • '}
            {scanRangeLabels[scanRange]}: {formatTimestamp(start)} - {formatTimestamp(end)}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as any)}>
          <TabsList className="bg-gray-800 border border-gray-700">
            <TabsTrigger value="all" className="data-[state=active]:bg-gray-700">
              All
            </TabsTrigger>
            <TabsTrigger value="originals" className="data-[state=active]:bg-gray-700">
              Originals
            </TabsTrigger>
            <TabsTrigger value="enhanced" className="data-[state=active]:bg-gray-700">
              Enhanced
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredFrames.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No frames to display</p>
          {activeTab !== 'all' && (
            <p className="text-sm mt-2">Try switching to a different tab</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFrames.map((frame) => (
            <FrameCard
              key={frame.id}
              frame={frame}
              onSelect={() => onFrameSelect(frame)}
              onDelete={() => onFrameDelete(frame.id)}
              onToggleKeeper={(isKeeper) => onToggleKeeper(frame.id, isKeeper)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
