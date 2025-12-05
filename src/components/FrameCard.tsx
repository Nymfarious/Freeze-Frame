import { useState } from 'react';
import { Frame } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Sparkles, Trash2, User } from 'lucide-react';
import { formatTimestamp } from '@/services/videoProcessor';

interface FrameCardProps {
  frame: Frame;
  onSelect: () => void;
  onDelete: () => void;
  onToggleKeeper: (isKeeper: boolean) => void;
}

export function FrameCard({ frame, onSelect, onDelete, onToggleKeeper }: FrameCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const displayImage = frame.enhancedImageData || frame.imageData;
  const quality = frame.analysis?.quality;
  const qualityColors = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    fair: 'bg-yellow-500',
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

  return (
    <>
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Frame?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this frame at {formatTimestamp(frame.timestamp)}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div
      className="group relative bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer"
      onClick={onSelect}
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={displayImage}
          alt={`Frame at ${formatTimestamp(frame.timestamp)}`}
          className="w-full h-full object-cover"
        />

        {frame.isProcessing && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          {quality && (
            <span
              className={`${qualityColors[quality]} text-white text-xs px-2 py-0.5 rounded-full font-medium`}
            >
              {quality.charAt(0).toUpperCase() + quality.slice(1)}
            </span>
          )}
          {frame.analysis?.tags[0] && (
            <span className="bg-gray-900/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
              {frame.analysis.tags[0]}
            </span>
          )}
          {frame.analysis?.shotType && frame.analysis.shotType !== 'uncertain' && (
            <span className="bg-gray-900/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
              {frame.analysis.shotType}
            </span>
          )}
        </div>

        {/* Top-right badges */}
        <div className="absolute top-2 right-2 flex gap-1.5">
          {frame.isEnhanced && (
            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Enhanced
            </span>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 bg-gray-900/80 backdrop-blur-sm hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleDeleteClick}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>

        {/* Center hover button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <Button
            variant="secondary"
            className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/20 pointer-events-auto"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            AI Restore
          </Button>
        </div>
      </div>

      {/* Bottom info */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground">
            {formatTimestamp(frame.timestamp)}
          </div>
          {frame.analysis?.people && frame.analysis.people.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <User className="w-3 h-3" />
              <span className="truncate">
                {frame.analysis.people.slice(0, 2).join(', ')}
                {frame.analysis.people.length > 2 && ` +${frame.analysis.people.length - 2}`}
              </span>
            </div>
          )}
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center"
        >
          <Checkbox
            checked={frame.isKeeper}
            onCheckedChange={onToggleKeeper}
            className="border-gray-600 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      </div>
      </div>
    </>
  );
}
