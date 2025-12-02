// Core data types for FramePerfect AI

export interface Project {
  id: string;
  name: string;
  videoFile: File | null;
  videoDuration: number;
  videoUrl: string;
  scanRange: ScanRange;
  scanInterval: number;
  frames: Frame[];
  createdAt: number;
  lastModified: number;
  frameNamingTemplate?: string; // NEW: Custom naming template for frames
  categories?: string[]; // NEW: AI-suggested or user-defined categories
}

export type ScanRange = 
  | "full"
  | "first-half"
  | "second-half"
  | "first-quarter"
  | "last-quarter";

export interface EnhancementRecord {
  id: string;
  timestamp: number;
  styles: EnhancementStyles;
  inputImageData: string;  // What image was enhanced (original or previous enhancement)
  outputImageData: string; // The result
}

export interface Frame {
  id: string;
  projectId: string;
  timestamp: number;
  imageData: string; // Base64 JPEG
  enhancedImageData?: string; // Base64 JPEG
  analysis?: FrameAnalysis;
  isKeeper: boolean;
  isEnhanced: boolean;
  isProcessing: boolean;
  createdAt: number;
  enhancementHistory?: EnhancementRecord[]; // Track all enhancements
  appliedEnhancements?: (keyof EnhancementStyles)[]; // List of all applied enhancement types
  customName?: string; // NEW: Custom name from template
  categories?: string[]; // NEW: User-assigned categories
  parentFrameId?: string; // NEW: Track if this is a saved version of another frame
  isSavedState?: boolean; // NEW: Mark frames that were explicitly saved
}

export interface FrameAnalysis {
  quality: "excellent" | "good" | "fair";
  qualityReason: string;
  people: string[];
  shotType: "posed" | "candid" | "uncertain";
  tags: string[];
  compositionScore: number;
  technicalAdvice: string[];
}

export interface EnhancementStyles {
  unblur?: boolean;
  cinematicLighting?: boolean;
  portraitBokeh?: boolean;
  removeBackground?: boolean;
  colorPop?: boolean;
  hdr?: boolean;
  enhanceDetail?: boolean;
  upscale?: boolean;
  denoise?: boolean;
}

export interface PipelineStatus {
  stage: "idle" | "sampling" | "analyzing" | "clustering" | "complete";
  samplingProgress: number;
  analyzingCurrent: number;
  analyzingTotal: number;
  extractedCount: number;
}

export interface APIKeyConfig {
  mode: "lovable" | "custom";
  customKey?: string;
}

export interface ExportManifest {
  projectName: string;
  exportDate: string;
  frames: Array<{
    filename: string;
    timestamp: number;
    quality: string;
    people: string[];
    shotType: string;
    tags: string[];
    compositionScore: number;
    technicalAdvice: string[];
  }>;
}
