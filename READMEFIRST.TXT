================================================================================
                         FRAME PERFECT - VIDEO FRAME EXTRACTOR
                                    Version 0.99
================================================================================

Frame Perfect is an AI-powered video frame extraction and enhancement tool that 
helps you find the perfect moments in your videos. Extract high-quality frames, 
analyze them with AI, enhance selected frames, and organize your keeper library.

================================================================================
                                    FEATURES
================================================================================

✨ INTELLIGENT FRAME EXTRACTION
   - Upload any video file and extract frames at customizable intervals
   - Choose scan range: Full video, First/Second half, First/Last quarter
   - Configurable extraction intervals: 1s, 2s, 3s, or 5s

🤖 AI-POWERED ANALYSIS
   - Automatic quality grading (Excellent, Good, Fair)
   - People detection in frames
   - Smart tagging and categorization
   - Composition scoring

🎨 FRAME ENHANCEMENT
   - Single frame enhancement with AI
   - Batch enhancement (up to 10 frames at once)
   - Enhancement styles: Unblur, Lighting, Color Pop, Upscale
   - Save enhancement states to preserve editing history

📚 KEEPER LIBRARY
   - Mark frames as "keepers" for easy organization
   - AI-suggested category management
   - Custom frame naming with templates
   - Filter by original vs enhanced frames
   - Organized by project

📤 EXPORT OPTIONS
   - Download individual frames
   - Export keeper library as ZIP
   - Cloud upload support (Google Drive, Dropbox) - requires OAuth setup

================================================================================
                               GETTING STARTED
================================================================================

1. CREATE A PROJECT
   - Click "New Project" on the landing page
   - Enter a project name and optional frame naming template
   - Templates support: {project}, {timestamp}, {sequence}

2. UPLOAD YOUR VIDEO
   - Drag and drop or click to select a video file
   - Supported formats: MP4, WebM, MOV, AVI

3. CONFIGURE SCAN SETTINGS
   - Select your scan range (full video or portion)
   - Choose extraction interval (1-5 seconds)
   - Click "Start Intelligent Scan"

4. REVIEW & SELECT FRAMES
   - Browse extracted frames in the gallery
   - AI analysis shows quality ratings and detected people
   - Click frames to view details
   - Toggle "Keep" checkbox on frames you want to save

5. ENHANCE YOUR KEEPERS
   - Open frame detail view and click "Enhance"
   - Use batch enhancement for multiple frames (max 10)
   - Choose enhancement styles to apply

6. EXPORT YOUR WORK
   - Click "Export" to download your keeper library
   - Individual frames can be downloaded from detail view

================================================================================
                                 LIMITATIONS
================================================================================

⚠️  CURRENT KNOWN LIMITATIONS:

VIDEO PROCESSING:
   - One video/project at a time
   - Large videos (>500MB) may cause browser memory issues
   - Video processing happens client-side, limited by device capabilities
   - Very long videos (>30 min) may experience slow extraction

AI ANALYSIS:
   - Quality grading (Fair/Good/Excellent) thresholds need fine-tuning
   - AI analysis requires active internet connection
   - Rate limits may apply during heavy usage

CLOUD EXPORT (99% COMPLETE):
   - Google Drive export requires OAuth configuration
   - Dropbox export requires OAuth configuration
   - Local ZIP download works fully

BROWSER STORAGE:
   - Project data stored in IndexedDB (browser local storage)
   - Clearing browser data will delete saved projects
   - No cross-device sync without cloud export

ENHANCEMENT:
   - Batch enhancement limited to 10 frames maximum
   - Enhancement quality depends on original frame quality
   - Some enhancement styles work better on certain content

================================================================================
                              TECHNOLOGY STACK
================================================================================

- React 18 + TypeScript
- Vite build system
- Tailwind CSS + shadcn/ui components
- Supabase Edge Functions for AI processing
- IndexedDB for local storage
- JSZip for export functionality

================================================================================
                               WHAT'S REMAINING
================================================================================

To reach 100% completion:

1. OAUTH CONFIGURATION
   - Configure Google Drive API credentials
   - Configure Dropbox API credentials
   - Implement OAuth flow for cloud providers

2. AI GRADING REFINEMENT
   - Adjust quality thresholds for Fair/Good/Excellent ratings
   - Fine-tune composition scoring algorithm

================================================================================
                                   LICENSE
================================================================================

This project was built with Lovable.dev

================================================================================
