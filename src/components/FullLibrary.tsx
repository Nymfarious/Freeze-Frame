import { useState, useEffect } from 'react';
import { Frame, Project } from '@/types';
import { FrameCard } from './FrameCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatTimestamp } from '@/services/videoProcessor';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FullLibraryProps {
  allProjects: Project[];
  allKeeperFrames: Frame[];
  onFrameSelect: (frame: Frame) => void;
  onFrameDelete: (frameId: string) => void;
  onToggleKeeper: (frameId: string, isKeeper: boolean) => void;
  onBack: () => void;
}

export function FullLibrary({
  allProjects,
  allKeeperFrames,
  onFrameSelect,
  onFrameDelete,
  onToggleKeeper,
  onBack,
}: FullLibraryProps) {
  const [activeTab, setActiveTab] = useState('all');

  // Group frames by project
  const framesByProject = allKeeperFrames.reduce((acc, frame) => {
    if (!acc[frame.projectId]) {
      acc[frame.projectId] = [];
    }
    acc[frame.projectId].push(frame);
    return acc;
  }, {} as Record<string, Frame[]>);

  // Filter frames based on active tab
  const getFilteredFrames = (frames: Frame[]) => {
    switch (activeTab) {
      case 'originals':
        return frames.filter((f) => !f.isEnhanced);
      case 'enhanced':
        return frames.filter((f) => f.isEnhanced);
      default:
        return frames;
    }
  };

  const allFilteredFrames = getFilteredFrames(allKeeperFrames);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="hover:bg-accent"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Full Library</h1>
              <p className="text-muted-foreground mt-1">
                {allKeeperFrames.length} keeper frames across {Object.keys(framesByProject).length} projects
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              All ({allKeeperFrames.length})
            </TabsTrigger>
            <TabsTrigger value="originals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Originals ({allKeeperFrames.filter(f => !f.isEnhanced).length})
            </TabsTrigger>
            <TabsTrigger value="enhanced" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Enhanced ({allKeeperFrames.filter(f => f.isEnhanced).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* No frames message */}
        {allFilteredFrames.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No keeper frames yet. Mark frames as keepers to build your library!
            </p>
          </div>
        )}

        {/* Frames grouped by project */}
        <div className="space-y-12">
          {Object.entries(framesByProject).map(([projectId, projectFrames]) => {
            const project = allProjects.find(p => p.id === projectId);
            const filteredProjectFrames = getFilteredFrames(projectFrames);
            
            if (filteredProjectFrames.length === 0) return null;

            return (
              <div key={projectId} className="space-y-4">
                <div className="border-b border-border pb-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {project?.name || 'Unknown Project'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredProjectFrames.length} frames
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProjectFrames.map((frame) => (
                    <FrameCard
                      key={frame.id}
                      frame={frame}
                      onSelect={() => onFrameSelect(frame)}
                      onDelete={() => onFrameDelete(frame.id)}
                      onToggleKeeper={(isKeeper) => onToggleKeeper(frame.id, isKeeper)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
