import { useState, useEffect } from 'react';
import { Frame, PipelineStatus, ScanRange, EnhancementStyles, APIKeyConfig, Project } from '@/types';
import { ControlBar } from './ControlBar';
import { PipelineVisualizer } from './PipelineVisualizer';
import { FrameGallery } from './FrameGallery';
import { DetailModal } from './DetailModal';
import { VideoPreviewHero } from './VideoPreviewHero';
import { QuickPreviewStrip } from './QuickPreviewStrip';
import { AIAgentReadyPanel } from './AIAgentReadyPanel';
import { PlaceholderFrameGrid } from './PlaceholderFrameGrid';
import { FullLibrary } from './FullLibrary';
import { BatchEnhanceDialog } from './BatchEnhanceDialog';
import { CloudUploadDialog } from './CloudUploadDialog';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Sparkles, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import { exportLibrary } from '@/services/exportService';
import { getAllProjects, getAllKeeperFrames } from '@/services/indexedDB';

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
  onCategoriesUpdate: (frameId: string, categories: string[]) => void;
  onBatchEnhance: (frameIds: string[], styles: EnhancementStyles) => Promise<void>;
  onCloudExport: (provider: 'drive' | 'dropbox' | 'local') => Promise<void>;
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
  onCategoriesUpdate,
  onBatchEnhance,
  onCloudExport,
}: MainWorkspaceProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [viewKeepersOnly, setViewKeepersOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'originals' | 'enhanced'>('all');
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null);
  const [showGalleryView, setShowGalleryView] = useState(true);
  const [showLibraryView, setShowLibraryView] = useState(false);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [allKeeperFrames, setAllKeeperFrames] = useState<Frame[]>([]);
  const [showBatchEnhance, setShowBatchEnhance] = useState(false);
  const [showCloudExport, setShowCloudExport] = useState(false);

  // Load library data
  useEffect(() => {
    const loadLibrary = async () => {
      const projects = await getAllProjects();
      const keepers = await getAllKeeperFrames();
      setAllProjects(projects);
      setAllKeeperFrames(keepers);
    };
    loadLibrary();
  }, [frames]); // Reload when frames change

  const isScanned = frames.length > 0 && pipelineStatus.stage === 'complete';
  const isScanning = pipelineStatus.stage !== 'idle' && pipelineStatus.stage !== 'complete';

  const displayFrames = viewKeepersOnly ? frames.filter((f) => f.isKeeper) : frames;

  // If showing library, render library view
  if (showLibraryView) {
    return (
      <FullLibrary
        allProjects={allProjects}
        allKeeperFrames={allKeeperFrames}
        onFrameSelect={(frame) => {
          setSelectedFrame(frame);
          setShowLibraryView(false);
        }}
        onFrameDelete={onFrameDelete}
        onToggleKeeper={onToggleKeeper}
        onCategoriesUpdate={onCategoriesUpdate}
        onBack={() => setShowLibraryView(false)}
      />
    );
  }

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
        showGalleryView={showGalleryView}
        onScanRangeChange={onScanRangeChange}
        onScanIntervalChange={onScanIntervalChange}
        onStartScan={onStartScan}
        onNewScan={onNewScan}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onToggleKeepersView={() => setViewKeepersOnly(!viewKeepersOnly)}
        onToggleGalleryView={() => setShowGalleryView(!showGalleryView)}
        onToggleLibrary={() => setShowLibraryView(true)}
      />

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={onNewScan}
              variant="outline"
              size="icon"
              className="border-border bg-background/50 hover:bg-background"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{projectName}</h1>
              <p className="text-muted-foreground">
                {frames.length} frames extracted • {keeperCount} keepers
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {keeperCount > 1 && (
              <Button
                onClick={() => setShowBatchEnhance(true)}
                variant="outline"
                className="border-border bg-background/50 hover:bg-background gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Batch Enhance
              </Button>
            )}
            {keeperCount > 0 && (
              <>
                <Button
                  onClick={() => setShowCloudExport(true)}
                  variant="outline"
                  className="border-border bg-background/50 hover:bg-background gap-2"
                >
                  <Cloud className="w-4 h-4" />
                  Export
                </Button>
                <Button
                  onClick={handleExport}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-900/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download ZIP
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Pipeline Status */}
        {isScanning && (
          <div className="space-y-6">
            <AIAgentReadyPanel 
              estimatedFrames={estimatedFrames}
              pipelineStatus={pipelineStatus}
            />
            <PipelineVisualizer status={pipelineStatus} />
          </div>
        )}

        {/* Pre-Scan Hero */}
        {frames.length === 0 && !isScanning && (
          <div className="space-y-8">
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
            <PlaceholderFrameGrid 
              estimatedFrames={estimatedFrames}
            />
          </div>
        )}

        {/* Video Preview or Gallery based on toggle */}
        {frames.length > 0 && !isScanning && (
          <>
            {!showGalleryView ? (
              <div className="space-y-8">
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
            ) : (
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
          </>
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

        {/* Batch Enhance Dialog */}
        <BatchEnhanceDialog
          open={showBatchEnhance}
          onOpenChange={setShowBatchEnhance}
          frames={frames}
          onBatchEnhance={onBatchEnhance}
        />

        {/* Cloud Export Dialog */}
        <CloudUploadDialog
          open={showCloudExport}
          onOpenChange={setShowCloudExport}
          onUpload={onCloudExport}
        />
      </div>
    </div>
  );
}
