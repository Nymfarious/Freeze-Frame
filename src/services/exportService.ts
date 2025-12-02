import JSZip from 'jszip';
import { Frame, ExportManifest } from '@/types';

export async function exportLibrary(
  projectName: string,
  frames: Frame[],
  onProgress?: (progress: number) => void
): Promise<void> {
  const zip = new JSZip();
  const keeperFrames = frames.filter(f => f.isKeeper);
  
  if (keeperFrames.length === 0) {
    throw new Error('No keeper frames to export');
  }

  const manifest: ExportManifest = {
    projectName,
    exportDate: new Date().toISOString(),
    frames: [],
  };

  for (let i = 0; i < keeperFrames.length; i++) {
    const frame = keeperFrames[i];
    const imageData = frame.enhancedImageData || frame.imageData;
    const base64Data = imageData.split(',')[1];
    const filename = `frame_${i + 1}_${frame.timestamp.toFixed(2)}s.jpg`;
    
    zip.file(filename, base64Data, { base64: true });
    
    if (frame.analysis) {
      manifest.frames.push({
        filename,
        timestamp: frame.timestamp,
        quality: frame.analysis.quality,
        people: frame.analysis.people,
        shotType: frame.analysis.shotType,
        tags: frame.analysis.tags,
        compositionScore: frame.analysis.compositionScore,
        technicalAdvice: frame.analysis.technicalAdvice,
      });
    }
    
    if (onProgress) {
      onProgress(((i + 1) / keeperFrames.length) * 100);
    }
  }

  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName.replace(/\s+/g, '_')}_library.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
