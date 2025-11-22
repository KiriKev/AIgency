import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Download, Sparkles } from "lucide-react";
import { useState } from "react";

interface PromptCardProps {
  id: string;
  title: string;
  artist: string;
  price: number;
  isFree: boolean;
  rating: number;
  downloads: number;
  thumbnail: string;
  category: string;
  onClick?: () => void;
}

export default function PromptCard({
  id,
  title,
  artist,
  price,
  isFree,
  rating,
  downloads,
  thumbnail,
  category,
  onClick
}: PromptCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`card-prompt-${id}`}
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center">
          <Sparkles className="h-16 w-16 text-primary/30" />
        </div>
        
        <Badge 
          variant={isFree ? "secondary" : "default"} 
          className="absolute top-3 right-3 backdrop-blur-sm"
          data-testid={`badge-price-${id}`}
        >
          {isFree ? 'FREE' : `${price} credits`}
        </Badge>

        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent flex items-end p-4">
            <Button size="sm" className="w-full" data-testid={`button-use-${id}`}>
              Use Prompt
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base truncate" data-testid={`text-title-${id}`}>
              {title}
            </h3>
            <p className="text-sm text-muted-foreground truncate">by {artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-primary text-primary" />
            <span>{rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-3 w-3" />
            <span>{downloads}</span>
          </div>
          <Badge variant="outline" className="text-xs">
            {category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
