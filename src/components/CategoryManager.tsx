import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Sparkles, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Frame } from '@/types';

interface CategoryManagerProps {
  frames: Frame[];
  onCategoriesUpdate: (frameId: string, categories: string[]) => void;
}

export function CategoryManager({ frames, onCategoriesUpdate }: CategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [customCategory, setCustomCategory] = useState('');

  const allCategories = Array.from(
    new Set(frames.flatMap(f => f.categories || []))
  );

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    try {
      // Sample up to 5 frames for analysis
      const sampleFrames = frames.slice(0, 5).map(f => ({
        imageData: f.enhancedImageData || f.imageData,
        analysis: f.analysis
      }));

      const { data, error } = await supabase.functions.invoke('suggest-categories', {
        body: { frames: sampleFrames }
      });

      if (error) throw error;
      
      setSuggestions(data.suggestions || []);
      toast.success('AI suggestions generated!');
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast.error('Failed to get AI suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomCategory = () => {
    if (customCategory.trim() && !suggestions.includes(customCategory.trim())) {
      setSuggestions(prev => [...prev, customCategory.trim()]);
      setCustomCategory('');
    }
  };

  const toggleFrameCategory = (frameId: string, category: string) => {
    const frame = frames.find(f => f.id === frameId);
    if (!frame) return;

    const currentCategories = frame.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];

    onCategoriesUpdate(frameId, newCategories);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="gap-2">
        <Sparkles className="w-4 h-4" />
        Manage Categories
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Organize Frames by Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* AI Suggestions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">AI Category Suggestions</h3>
                <Button
                  onClick={handleGetSuggestions}
                  disabled={isLoading}
                  variant="secondary"
                  size="sm"
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Get AI Suggestions
                    </>
                  )}
                </Button>
              </div>

              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(category => (
                    <Badge key={category} variant="secondary" className="gap-1">
                      {category}
                      <button
                        onClick={() => setSuggestions(prev => prev.filter(c => c !== category))}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Add Custom Category */}
            <div className="flex gap-2">
              <Input
                placeholder="Add custom category..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomCategory()}
              />
              <Button onClick={handleAddCustomCategory} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Current Categories */}
            {allCategories.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Current Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {allCategories.map(category => (
                    <Badge key={category} variant="outline">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Frame Grid */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Assign Categories to Frames</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {frames.filter(f => f.isKeeper).map(frame => (
                  <div key={frame.id} className="space-y-2">
                    <img
                      src={frame.enhancedImageData || frame.imageData}
                      alt="Frame"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                    <div className="flex flex-wrap gap-1">
                      {suggestions.map(category => (
                        <Badge
                          key={category}
                          variant={frame.categories?.includes(category) ? 'default' : 'outline'}
                          className="cursor-pointer text-xs"
                          onClick={() => toggleFrameCategory(frame.id, category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
