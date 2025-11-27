import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Download, Sparkles, Heart, Eye, Maximize2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import ImageLightbox from "./ImageLightbox";

export interface ArtworkItem {
  id: string;
  title: string;
  artistId?: string;
  artistName: string;
  price?: number;
  isFree?: boolean;
  rating?: number;
  downloads?: number;
  likes?: number;
  views?: number;
  thumbnail?: string;
  imageUrl?: string;
  category?: string;
  tags?: string[];
}

interface ArtworkCardProps {
  item: ArtworkItem;
  showArtist?: boolean;
  onArtistClick?: (artistId: string) => void;
  onCardClick?: (id: string) => void;
  onImageClick?: (item: ArtworkItem) => void;
  variant?: 'prompt' | 'artwork';
}

function ArtworkCard({ item, showArtist = true, onArtistClick, onCardClick, onImageClick, variant = 'prompt' }: ArtworkCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = item.imageUrl || item.thumbnail || '';

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.artistId && onArtistClick) {
      onArtistClick(item.artistId);
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onImageClick) {
      onImageClick(item);
    }
  };

  return (
    <Card
      className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 hover:scale-[1.01] h-full border-[0.5px]"
      onClick={() => onCardClick?.(item.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-artwork-${item.id}`}
    >
      <div className="relative h-full bg-muted overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
            onClick={handleImageClick}
            data-testid={`image-artwork-${item.id}`}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-primary/30" />
          </div>
        )}
        
        {isHovered && imageUrl && (
          <button
            onClick={handleImageClick}
            className="absolute top-2 left-2 p-1.5 rounded-md bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-all z-10"
            data-testid={`button-expand-${item.id}`}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        )}
        
        {variant === 'prompt' && item.price !== undefined && (
          <Badge 
            variant={item.isFree ? "secondary" : "default"} 
            className="absolute top-2 right-2 backdrop-blur-sm text-xs"
            data-testid={`badge-price-${item.id}`}
          >
            {item.isFree ? 'FREE' : `${item.price}cr`}
          </Badge>
        )}

        <div className={`absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent flex flex-col justify-end p-3 gap-1 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-90'}`}>
          <h3 className="font-semibold text-sm text-white truncate" data-testid={`text-title-${item.id}`}>
            {item.title}
          </h3>
          
          {showArtist && (
            <p 
              className={`text-xs text-muted-foreground truncate ${item.artistId && onArtistClick ? 'hover:text-primary cursor-pointer hover:underline' : ''}`}
              onClick={item.artistId && onArtistClick ? handleArtistClick : undefined}
              data-testid={`text-artist-${item.id}`}
            >
              by {item.artistName}
            </p>
          )}
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {variant === 'prompt' && item.rating !== undefined && (
              <>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-primary text-primary" />
                  <span>{item.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  <span>{item.downloads}</span>
                </div>
              </>
            )}
            {variant === 'artwork' && (
              <>
                {item.likes !== undefined && (
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    <span>{item.likes}</span>
                  </div>
                )}
                {item.views !== undefined && (
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{item.views}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {isHovered && variant === 'prompt' && (
            <Button size="sm" className="w-full mt-2" data-testid={`button-use-${item.id}`}>
              Use Prompt
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

interface ArtworkGridProps {
  items: ArtworkItem[];
  variant?: 'prompt' | 'artwork';
  showArtist?: boolean;
  useMasonryLayout?: boolean;
  onCardClick?: (id: string) => void;
  onArtistClick?: (artistId: string) => void;
}

export default function ArtworkGrid({ 
  items, 
  variant = 'prompt',
  showArtist = true,
  useMasonryLayout = true,
  onCardClick,
  onArtistClick
}: ArtworkGridProps) {
  const [, setLocation] = useLocation();
  const [lightboxItem, setLightboxItem] = useState<ArtworkItem | null>(null);

  const handleArtistClick = (artistId: string) => {
    if (onArtistClick) {
      onArtistClick(artistId);
    } else {
      setLocation(`/artist/${artistId}`);
    }
  };

  const handleCardClick = (id: string) => {
    if (onCardClick) {
      onCardClick(id);
    }
  };

  const handleImageClick = (item: ArtworkItem) => {
    setLightboxItem(item);
  };

  const closeLightbox = () => {
    setLightboxItem(null);
  };

  if (useMasonryLayout) {
    return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 auto-rows-[200px]">
          {items.map((item, idx) => {
            const spans = idx % 7 === 0 ? 'row-span-2 col-span-2' : idx % 5 === 0 ? 'row-span-2' : '';
            return (
              <div key={item.id} className={spans}>
                <ArtworkCard
                  item={item}
                  variant={variant}
                  showArtist={showArtist}
                  onCardClick={handleCardClick}
                  onArtistClick={handleArtistClick}
                  onImageClick={handleImageClick}
                />
              </div>
            );
          })}
        </div>
        <ImageLightbox
          isOpen={!!lightboxItem}
          onClose={closeLightbox}
          imageUrl={lightboxItem?.imageUrl || lightboxItem?.thumbnail || ''}
          title={lightboxItem?.title}
        />
      </>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <ArtworkCard
            key={item.id}
            item={item}
            variant={variant}
            showArtist={showArtist}
            onCardClick={handleCardClick}
            onArtistClick={handleArtistClick}
            onImageClick={handleImageClick}
          />
        ))}
      </div>
      <ImageLightbox
        isOpen={!!lightboxItem}
        onClose={closeLightbox}
        imageUrl={lightboxItem?.imageUrl || lightboxItem?.thumbnail || ''}
        title={lightboxItem?.title}
      />
    </>
  );
}

export { ArtworkCard };
