import { useState, useEffect } from 'react';
import { ProjectSetup } from '@/components/ProjectSetup';
import { MainWorkspace } from '@/components/MainWorkspace';
import { Project, Frame, PipelineStatus, ScanRange, EnhancementStyles, APIKeyConfig } from '@/types';
import { getVideoMetadata, extractFrames } from '@/services/videoProcessor';
import { analyzeFrame, enhanceFrame } from '@/services/geminiAPI';
import { saveProject, saveFrames, updateFrame, deleteFrame as dbDeleteFrame } from '@/services/indexedDB';
import { toast } from 'sonner';
import { exportLibrary } from '@/services/exportService';

export default function Index() {
  const [project, setProject] = useState<Project | null>(null);
  const [frames, setFrames] = useState<Frame[]>([]);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus>({
    stage: 'idle',
    samplingProgress: 0,
    analyzingCurrent: 0,
    analyzingTotal: 0,
    extractedCount: 0,
  });
  const [apiConfig] = useState<APIKeyConfig>({ mode: 'lovable' });

  const handleProjectCreated = async (name: string, videoFile: File, frameNamingTemplate?: string) => {
    try {
      const metadata = await getVideoMetadata(videoFile);
      const videoUrl = URL.createObjectURL(videoFile);

      const newProject: Project = {
        id: `project-${Date.now()}`,
        name,
        videoFile,
        videoDuration: metadata.duration,
        videoUrl,
        scanRange: 'full',
        scanInterval: 2,
        frames: [],
        createdAt: Date.now(),
        lastModified: Date.now(),
        frameNamingTemplate,
      };

      setProject(newProject);
      await saveProject(newProject);
      toast.success('Project created successfully');
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
    }
  };

  const handleStartScan = async () => {
    if (!project) return;

    try {
      setPipelineStatus({
        stage: 'sampling',
        samplingProgress: 0,
        analyzingCurrent: 0,
        analyzingTotal: 0,
        extractedCount: 0,
      });

      // Extract frames
      const extractedFrames = await extractFrames(
        project.videoFile!,
        project.scanRange,
        project.scanInterval,
        project.id,
        (progress, count) => {
          setPipelineStatus((prev) => ({
            ...prev,
            samplingProgress: progress,
            extractedCount: count,
          }));
        }
      );

      // Apply custom naming if template provided
      const framesWithNames = extractedFrames.map((frame, index) => {
        if (project.frameNamingTemplate) {
          return {
            ...frame,
            customName: `${project.frameNamingTemplate}_${index + 1}`
          };
        }
        return frame;
      });

      setFrames(framesWithNames);
      await saveFrames(framesWithNames);

      setPipelineStatus({
        stage: 'analyzing',
        samplingProgress: 100,
        analyzingCurrent: 0,
        analyzingTotal: framesWithNames.length,
        extractedCount: framesWithNames.length,
      });

      // Analyze frames
      for (let i = 0; i < framesWithNames.length; i++) {
        const frame = framesWithNames[i];
        
        try {
          const analysis = await analyzeFrame(
            frame.imageData,
            apiConfig.mode,
            apiConfig.customKey
          );

          const updatedFrame = { ...frame, analysis };
          framesWithNames[i] = updatedFrame;
          setFrames([...framesWithNames]);
          await updateFrame(frame.id, { analysis });

          setPipelineStatus((prev) => ({
            ...prev,
            analyzingCurrent: i + 1,
          }));
        } catch (error) {
          console.error(`Failed to analyze frame ${frame.id}:`, error);
        }
      }

      setPipelineStatus((prev) => ({
        ...prev,
        stage: 'clustering',
      }));

      // Simulate clustering
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPipelineStatus((prev) => ({
        ...prev,
        stage: 'complete',
      }));

      toast.success('Scan completed successfully');
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Scan failed');
      setPipelineStatus({
        stage: 'idle',
        samplingProgress: 0,
        analyzingCurrent: 0,
        analyzingTotal: 0,
        extractedCount: 0,
      });
    }
  };

  const handleEnhance = async (frameId: string, styles: EnhancementStyles) => {
    const frameIndex = frames.findIndex((f) => f.id === frameId);
    if (frameIndex === -1) return;

    const frame = frames[frameIndex];
    
    // Set processing state
    const updatedFrames = [...frames];
    updatedFrames[frameIndex] = { ...frame, isProcessing: true };
    setFrames(updatedFrames);
    await updateFrame(frameId, { isProcessing: true });

    try {
      // Use the latest enhanced image as input if it exists, otherwise use original
      const inputImage = frame.enhancedImageData || frame.imageData;
      
      const enhancedImage = await enhanceFrame(
        inputImage,
        styles,
        apiConfig.mode,
        apiConfig.customKey
      );

      // Create enhancement record
      const enhancementRecord = {
        id: `enhancement-${Date.now()}`,
        timestamp: Date.now(),
        styles,
        inputImageData: inputImage,
        outputImageData: enhancedImage,
      };

      // Update applied enhancements list
      const currentApplied = frame.appliedEnhancements || [];
      const newApplied = Object.keys(styles).filter(
        key => styles[key as keyof EnhancementStyles]
      ) as (keyof EnhancementStyles)[];
      const updatedApplied = [...new Set([...currentApplied, ...newApplied])];

      // Update enhancement history
      const history = frame.enhancementHistory || [];
      const updatedHistory = [...history, enhancementRecord];

      updatedFrames[frameIndex] = {
        ...frame,
        enhancedImageData: enhancedImage,
        isEnhanced: true,
        isProcessing: false,
        enhancementHistory: updatedHistory,
        appliedEnhancements: updatedApplied,
      };
      setFrames(updatedFrames);
      await updateFrame(frameId, {
        enhancedImageData: enhancedImage,
        isEnhanced: true,
        isProcessing: false,
        enhancementHistory: updatedHistory,
        appliedEnhancements: updatedApplied,
      });

      toast.success('Enhancement completed');
    } catch (error) {
      console.error('Enhancement failed:', error);
      toast.error('Enhancement failed');
      updatedFrames[frameIndex] = { ...frame, isProcessing: false };
      setFrames(updatedFrames);
      await updateFrame(frameId, { isProcessing: false });
    }
  };

  const handleBatchEnhance = async (frameIds: string[], styles: EnhancementStyles) => {
    for (const frameId of frameIds) {
      await handleEnhance(frameId, styles);
    }
  };

  const handleToggleKeeper = async (frameId: string, isKeeper: boolean) => {
    const updatedFrames = frames.map((f) =>
      f.id === frameId ? { ...f, isKeeper } : f
    );
    setFrames(updatedFrames);
    await updateFrame(frameId, { isKeeper });
  };

  const handleFrameDelete = async (frameId: string) => {
    const updatedFrames = frames.filter((f) => f.id !== frameId);
    setFrames(updatedFrames);
    await dbDeleteFrame(frameId);
    toast.success('Frame deleted');
  };

  const handleSaveAsNew = async (frameId: string) => {
    const frame = frames.find((f) => f.id === frameId);
    if (!frame) return;

    // If the frame has been enhanced, flatten the enhancement history
    if (frame.isEnhanced && frame.enhancedImageData) {
      const savedFrame: Frame = {
        ...frame,
        id: `${frame.id}-saved-${Date.now()}`,
        imageData: frame.enhancedImageData, // Flattened: enhanced becomes new original
        enhancedImageData: undefined,
        isEnhanced: false,
        enhancementHistory: [], // Clear history
        // Keep appliedEnhancements to remember what was done
        parentFrameId: frame.id,
        isSavedState: true,
        createdAt: Date.now(),
      };

      const updatedFrames = [...frames, savedFrame];
      setFrames(updatedFrames);
      await saveFrames([savedFrame]);
      toast.success('Saved current state as new frame');
    }
  };

  const handleCategoriesUpdate = async (frameId: string, categories: string[]) => {
    const updatedFrames = frames.map((f) =>
      f.id === frameId ? { ...f, categories } : f
    );
    setFrames(updatedFrames);
    await updateFrame(frameId, { categories });
  };

  const handleCloudExport = async (provider: 'drive' | 'dropbox' | 'local') => {
    const keeperFrames = frames.filter((f) => f.isKeeper);
    
    if (keeperFrames.length === 0) {
      toast.error('No keeper frames to export');
      return;
    }

    if (provider === 'local') {
      // Local export (existing ZIP download)
      await exportLibrary(project!.name, frames);
      toast.success('Exported locally');
    } else {
      // Cloud export - would integrate with actual cloud APIs
      toast.info(`${provider} integration coming soon!`);
    }
  };

  const handleNewScan = () => {
    setProject(null);
    setFrames([]);
    setPipelineStatus({
      stage: 'idle',
      samplingProgress: 0,
      analyzingCurrent: 0,
      analyzingTotal: 0,
      extractedCount: 0,
    });
  };

  if (!project) {
    return <ProjectSetup onProjectCreated={handleProjectCreated} />;
  }

  return (
    <MainWorkspace
      projectName={project.name}
      videoDuration={project.videoDuration}
      videoFile={project.videoFile!}
      frames={frames}
      pipelineStatus={pipelineStatus}
      scanRange={project.scanRange}
      scanInterval={project.scanInterval}
      apiConfig={apiConfig}
      onScanRangeChange={(range) => setProject({ ...project, scanRange: range })}
      onScanIntervalChange={(interval) => setProject({ ...project, scanInterval: interval })}
      onStartScan={handleStartScan}
      onNewScan={handleNewScan}
      onFrameSelect={() => {}}
      onFrameDelete={handleFrameDelete}
      onToggleKeeper={handleToggleKeeper}
      onEnhance={handleEnhance}
      onSaveAsNew={handleSaveAsNew}
      onCategoriesUpdate={handleCategoriesUpdate}
      onBatchEnhance={handleBatchEnhance}
      onCloudExport={handleCloudExport}
    />
  );
}
