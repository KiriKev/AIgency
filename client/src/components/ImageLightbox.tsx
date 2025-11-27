import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { useState, useEffect } from "react";

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
}

export default function ImageLightbox({ isOpen, onClose, imageUrl, title }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setScale(1);
      setRotation(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setScale(s => Math.min(s + 0.25, 3));
      if (e.key === '-') setScale(s => Math.max(s - 0.25, 0.5));
      if (e.key === 'r') setRotation(r => r + 90);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotation(r => r + 90);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-black/95 border-none overflow-hidden"
        data-testid="lightbox-container"
      >
        <div className="absolute top-2 right-2 z-50 flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomOut}
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            data-testid="button-zoom-out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-white/70 text-xs min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomIn}
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            data-testid="button-zoom-in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleRotate}
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            data-testid="button-rotate"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            data-testid="button-close-lightbox"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {title && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-40">
            <h3 className="text-white font-medium text-center">{title}</h3>
          </div>
        )}

        <div 
          className="flex items-center justify-center w-full h-full min-h-[50vh] p-8 cursor-move overflow-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <img
            src={imageUrl}
            alt={title || 'Artwork'}
            className="max-w-full max-h-[85vh] object-contain transition-transform duration-200 select-none"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
            }}
            draggable={false}
            data-testid="lightbox-image"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
