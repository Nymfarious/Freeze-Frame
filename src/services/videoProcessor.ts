import { Frame, ScanRange } from '@/types';

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}

export async function getVideoMetadata(videoFile: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = URL.createObjectURL(videoFile);
  });
}

export function calculateScanRange(
  duration: number,
  range: ScanRange
): { start: number; end: number } {
  switch (range) {
    case 'full':
      return { start: 0, end: duration };
    case 'first-half':
      return { start: 0, end: duration / 2 };
    case 'second-half':
      return { start: duration / 2, end: duration };
    case 'first-quarter':
      return { start: 0, end: duration / 4 };
    case 'last-quarter':
      return { start: (duration * 3) / 4, end: duration };
  }
}

export async function extractFrame(
  videoUrl: string,
  timestamp: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Failed to get canvas context'));
      return;
    }
    
    video.preload = 'metadata';
    video.src = videoUrl;
    
    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = canvas.toDataURL('image/jpeg', 0.85);
      resolve(imageData);
    };
    
    video.onerror = () => {
      reject(new Error('Failed to load video'));
    };
    
    video.onloadedmetadata = () => {
      video.currentTime = timestamp;
    };
  });
}

export async function extractFrames(
  videoFile: File,
  scanRange: ScanRange,
  intervalSeconds: number,
  projectId: string,
  onProgress: (progress: number, count: number) => void
): Promise<Frame[]> {
  const metadata = await getVideoMetadata(videoFile);
  const videoUrl = URL.createObjectURL(videoFile);
  const { start, end } = calculateScanRange(metadata.duration, scanRange);
  
  const frames: Frame[] = [];
  const timestamps: number[] = [];
  
  for (let t = start; t < end; t += intervalSeconds) {
    timestamps.push(Math.min(t, end - 0.1)); // Avoid exactly at end
  }
  
  for (let i = 0; i < timestamps.length; i++) {
    const timestamp = timestamps[i];
    const imageData = await extractFrame(videoUrl, timestamp);
    
    frames.push({
      id: `${projectId}-frame-${i}`,
      projectId,
      timestamp,
      imageData,
      isKeeper: false,
      isEnhanced: false,
      isProcessing: false,
      createdAt: Date.now(),
    });
    
    onProgress(((i + 1) / timestamps.length) * 100, i + 1);
  }
  
  URL.revokeObjectURL(videoUrl);
  return frames;
}

export function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
