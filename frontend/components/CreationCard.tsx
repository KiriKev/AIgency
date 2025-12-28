"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Eye, Sparkles } from "lucide-react";
import { useState } from "react";

interface CreationCardProps {
  id: string;
  imageUrl?: string;
  creator: string;
  originalPrompt: string;
  likes: number;
  views: number;
  comments: number;
  iterations: number;
}

export default function CreationCard({
  id,
  imageUrl,
  creator,
  originalPrompt,
  likes,
  views,
  comments,
  iterations
}: CreationCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <Card className="overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 hover:scale-[1.02]" data-testid={`card-creation-${id}`}>
      <div className="relative aspect-square bg-muted overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-chart-1/20 to-chart-3/20 flex items-center justify-center">
          <Sparkles className="h-16 w-16 text-primary/30" />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <div className="w-full space-y-2">
            <Badge variant="secondary" className="backdrop-blur-sm">
              From: {originalPrompt}
            </Badge>
            <Button size="sm" className="w-full" data-testid={`button-view-${id}`}>
              View Details
            </Button>
          </div>
        </div>

        <Badge variant="outline" className="absolute top-3 right-3 backdrop-blur-sm">
          {iterations} iterations
        </Badge>
      </div>

      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium truncate flex-1">by {creator}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 hover-elevate active-elevate-2 rounded px-2 py-1"
            data-testid={`button-like-${id}`}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{likeCount}</span>
          </button>
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{views}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{comments}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
