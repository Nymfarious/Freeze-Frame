import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Cloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CloudUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (provider: 'drive' | 'dropbox' | 'local') => Promise<void>;
}

export function CloudUploadDialog({ open, onOpenChange, onUpload }: CloudUploadDialogProps) {
  const [provider, setProvider] = useState<'drive' | 'dropbox' | 'local'>('local');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      await onUpload(provider);
      toast.success(`Successfully exported to ${provider === 'local' ? 'local folder' : provider}!`);
      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to export to ${provider}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Keeper Frames</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <RadioGroup value={provider} onValueChange={(v) => setProvider(v as any)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="local" id="local" />
              <Label htmlFor="local" className="cursor-pointer">
                Save to Local Folder (ZIP Download)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="drive" id="drive" />
              <Label htmlFor="drive" className="cursor-pointer">
                Upload to Google Drive
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="dropbox" id="dropbox" />
              <Label htmlFor="dropbox" className="cursor-pointer">
                Upload to Dropbox
              </Label>
            </div>
          </RadioGroup>

          {provider !== 'local' && (
            <div className="bg-muted/50 p-4 rounded-lg text-sm text-muted-foreground">
              <p>Note: Cloud upload integration requires authentication.</p>
              <p className="mt-2">You'll be redirected to authorize access to your {provider === 'drive' ? 'Google Drive' : 'Dropbox'} account.</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  Export
                </>
              )}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
