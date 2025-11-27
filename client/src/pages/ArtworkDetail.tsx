import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Heart, Eye, Share2, Download, MessageCircle, Bookmark } from "lucide-react";
import { useState } from "react";
import type { Artwork, Artist } from "@shared/schema";

export default function ArtworkDetail() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const artworkId = params.id;
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { data: artwork, isLoading: artworkLoading } = useQuery<Artwork>({
    queryKey: [`/api/artworks/${artworkId}`],
  });

  const artistId = artwork?.artistId;
  
  const { data: artist, isLoading: artistLoading } = useQuery<Artist>({
    queryKey: artistId ? [`/api/artists/${artistId}`] : ['artist-placeholder'],
    enabled: !!artistId,
  });

  const isLoading = artworkLoading || (artistId && artistLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-48 mb-6" />
            <Skeleton className="aspect-square max-w-2xl mx-auto rounded-lg mb-6" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-8 px-4">
          <div className="max-w-4xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold text-white mb-4">Artwork not found</h1>
            <Button onClick={() => setLocation('/')} data-testid="button-go-home">
              Go Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-white">{artwork.title}</h1>
          </div>

          <div className="grid lg:grid-cols-[1fr,350px] gap-6">
            <div className="space-y-4">
              <Card className="overflow-hidden">
                <img 
                  src={artwork.imageUrl} 
                  alt={artwork.title}
                  className="w-full object-contain max-h-[70vh]"
                />
              </Card>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsLiked(!isLiked)}
                    data-testid="button-like"
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                    {(artwork.likes || 0) + (isLiked ? 1 : 0)}
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-comment">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                  <Button variant="outline" size="sm" data-testid="button-share">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={isSaved ? "default" : "outline"}
                    size="icon"
                    onClick={() => setIsSaved(!isSaved)}
                    data-testid="button-save"
                  >
                    <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="outline" size="icon" data-testid="button-download">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Card 
                className="hover-elevate cursor-pointer"
                onClick={() => artist && setLocation(`/artist/${artist.id}`)}
                data-testid="card-artist"
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {artist?.displayName?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-white">{artist?.displayName}</p>
                      <p className="text-sm text-muted-foreground">@{artist?.username}</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid="button-view-profile">
                      View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">{artwork.title}</h3>
                    {artwork.description && (
                      <p className="text-sm text-muted-foreground">{artwork.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {artwork.views} views
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {artwork.likes} likes
                    </span>
                  </div>

                  {artwork.tags && Array.isArray(artwork.tags) && (artwork.tags as string[]).length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Tags</p>
                      <div className="flex gap-2 flex-wrap">
                        {(artwork.tags as string[]).map((tag, i) => (
                          <Badge key={i} variant="secondary">
                            {String(tag)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {artwork.promptUsed && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Prompt Used</p>
                      <Card className="p-3 bg-muted/50">
                        <p className="text-sm text-white font-mono">{artwork.promptUsed}</p>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
