import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProjectSetupProps {
  onProjectCreated: (name: string, videoFile: File, frameNamingTemplate?: string) => void;
}

export function ProjectSetup({ onProjectCreated }: ProjectSetupProps) {
  const [projectName, setProjectName] = useState('');
  const [frameNamingTemplate, setFrameNamingTemplate] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0] && files[0].type.startsWith('video/')) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (projectName.trim() && selectedFile) {
      onProjectCreated(projectName.trim(), selectedFile, frameNamingTemplate.trim() || undefined);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/10 flex items-center justify-center p-8">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-4">
            FramePerfect AI
          </h1>
          <p className="text-foreground/90 text-lg">
            Extract, analyze, and enhance high-quality photos from your videos
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-md border border-border rounded-3xl p-8 shadow-2xl shadow-primary/10">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="project-name" className="text-foreground text-base font-semibold">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-name"
                type="text"
                placeholder="Required: Enter your project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-background/50 border-border text-foreground placeholder:text-destructive/80 h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frame-naming" className="text-foreground text-base font-semibold">
                Frame Naming Template (Optional)
              </Label>
              <Input
                id="frame-naming"
                type="text"
                placeholder="e.g., MyProject_Frame or Event2024_"
                value={frameNamingTemplate}
                onChange={(e) => setFrameNamingTemplate(e.target.value)}
                className="bg-background/50 border-border text-foreground h-12 text-base"
              />
              <p className="text-sm text-muted-foreground">
                Custom prefix for extracted frame names. Leave empty for default naming.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground text-base font-semibold">Video File</Label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer ${
                  dragActive
                    ? 'border-primary bg-primary/5'
                    : selectedFile
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-background/30 hover:border-border/70 hover:bg-background/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center text-center">
                  <Upload
                    className={`w-16 h-16 mb-4 ${
                      selectedFile ? 'text-accent' : 'text-foreground/60'
                    }`}
                  />
                  {selectedFile ? (
                    <>
                      <p className="text-foreground font-medium mb-1">
                        {selectedFile.name}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-foreground font-medium mb-1">
                        Drop your video here or click to browse
                      </p>
                      <p className="text-muted-foreground text-sm">
                        Supports MP4, MOV, AVI, and other video formats
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!projectName.trim() || !selectedFile}
              className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg shadow-primary/30"
            >
              Start Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
