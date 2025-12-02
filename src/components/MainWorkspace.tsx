import { useState } from 'react';
import { Frame, PipelineStatus, ScanRange, EnhancementStyles, APIKeyConfig } from '@/types';
import { ControlBar } from './ControlBar';
import { PipelineVisualizer } from './PipelineVisualizer';
import { FrameGallery } from './FrameGallery';
import { DetailModal } from './DetailModal';
import { VideoPreviewHero } from './VideoPreviewHero';
import { QuickPreviewStrip } from './QuickPreviewStrip';
import { AIAgentReadyPanel } from './AIAgentReadyPanel';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { exportLibrary } from '@/services/exportService';

interface MainWorkspaceProps {
  projectName: string;
  videoDuration: number;
  videoFile: File;
  frames: Frame[];
  pipelineStatus: PipelineStatus;
  scanRange: ScanRange;
  scanInterval: number;
  apiConfig: APIKeyConfig;
  onScanRangeChange: (range: ScanRange) => void;
  onScanIntervalChange: (interval: number) => void;
  onStartScan: () => void;
  onNewScan: () => void;
  onFrameSelect: (frame: Frame) => void;
  onFrameDelete: (frameId: string) => void;
  onToggleKeeper: (frameId: string, isKeeper: boolean) => void;
  onEnhance: (frameId: string, styles: EnhancementStyles) => Promise<void>;
  onSaveAsNew: (frameId: string) => void;
}

export function MainWorkspace({
  projectName,
  videoDuration,
  videoFile,
  frames,
  pipelineStatus,
  scanRange,
  scanInterval,
  onScanRangeChange,
  onScanIntervalChange,
  onStartScan,
  onNewScan,
  onFrameDelete,
  onToggleKeeper,
  onEnhance,
  onSaveAsNew,
}: MainWorkspaceProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [viewKeepersOnly, setViewKeepersOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'originals' | 'enhanced'>('all');
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);

  const isScanned = frames.length > 0 && pipelineStatus.stage === 'complete';
  const isScanning = pipelineStatus.stage !== 'idle' && pipelineStatus.stage !== 'complete';

  const displayFrames = viewKeepersOnly ? frames.filter((f) => f.isKeeper) : frames;

  const handleExport = async () => {
    const keeperFrames = frames.filter((f) => f.isKeeper);
    if (keeperFrames.length === 0) {
      toast.error('No keeper frames to export');
      return;
    }

    toast.promise(
      exportLibrary(projectName, frames, (progress) => {
        console.log(`Export progress: ${progress}%`);
      }),
      {
        loading: 'Creating export package...',
        success: 'Library exported successfully!',
        error: 'Failed to export library',
      }
    );
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedFrame) return;
    const currentIndex = displayFrames.findIndex((f) => f.id === selectedFrame.id);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedFrame(displayFrames[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < displayFrames.length - 1) {
      setSelectedFrame(displayFrames[currentIndex + 1]);
    }
  };

  const keeperCount = frames.filter((f) => f.isKeeper).length;
  const estimatedFrames = Math.floor(videoDuration / scanInterval);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950">
      <ControlBar
        isScanned={isScanned}
        isScanning={isScanning}
        videoDuration={videoDuration}
        scanRange={scanRange}
        scanInterval={scanInterval}
        showFilters={showFilters}
        viewKeepersOnly={viewKeepersOnly}
        onScanRangeChange={onScanRangeChange}
        onScanIntervalChange={onScanIntervalChange}
        onStartScan={onStartScan}
        onNewScan={onNewScan}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onToggleKeepersView={() => setViewKeepersOnly(!viewKeepersOnly)}
      />

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{projectName}</h1>
            <p className="text-muted-foreground">
              {frames.length} frames extracted • {keeperCount} keepers
            </p>
          </div>

          {keeperCount > 0 && (
            <Button
              onClick={handleExport}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-900/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Library
            </Button>
          )}
        </div>

        {/* Pipeline Status */}
        {isScanning && <PipelineVisualizer status={pipelineStatus} />}

        {/* Pre-Scan Hero */}
        {frames.length === 0 && !isScanning && (
          <div className="space-y-6">
            <VideoPreviewHero 
              videoFile={videoFile}
              videoDuration={videoDuration}
              scanInterval={scanInterval}
            />
            <QuickPreviewStrip 
              videoFile={videoFile}
              videoDuration={videoDuration}
            />
            <AIAgentReadyPanel 
              estimatedFrames={estimatedFrames}
            />
          </div>
        )}

        {/* Gallery */}
        {frames.length > 0 && (
          <FrameGallery
            frames={displayFrames}
            videoDuration={videoDuration}
            scanRange={scanRange}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onFrameSelect={setSelectedFrame}
            onFrameDelete={onFrameDelete}
            onToggleKeeper={onToggleKeeper}
          />
        )}

        {/* Detail Modal */}
        <DetailModal
          frame={selectedFrame}
          allFrames={displayFrames}
          onClose={() => setSelectedFrame(null)}
          onNavigate={handleNavigate}
          onEnhance={onEnhance}
          onToggleKeeper={onToggleKeeper}
          onSaveAsNew={onSaveAsNew}
        />
      </div>
    </div>
  );
}
