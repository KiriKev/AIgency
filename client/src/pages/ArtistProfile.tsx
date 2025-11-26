import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Heart, Eye, Grid, UserPlus, ExternalLink } from "lucide-react";
import { useState } from "react";
import type { Artwork, Artist } from "@shared/schema";

export default function ArtistProfile() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const artistId = params.id;
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: artist, isLoading: artistLoading } = useQuery<Artist>({
    queryKey: [`/api/artists/${artistId}`],
  });

  const { data: artworks, isLoading: artworksLoading } = useQuery<Artwork[]>({
    queryKey: [`/api/artists/${artistId}/artworks`],
  });

  const isLoading = artistLoading || artworksLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto">
            <Skeleton className="h-48 w-full rounded-lg mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-lg" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-8 px-4">
          <div className="max-w-6xl mx-auto text-center py-12">
            <h1 className="text-2xl font-bold text-white mb-4">Artist not found</h1>
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Artist Profile</h1>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    {artist.displayName?.charAt(0) || 'A'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-white">{artist.displayName}</h2>
                    <Badge variant="secondary">Artist</Badge>
                  </div>
                  <p className="text-muted-foreground mb-2">@{artist.username}</p>
                  {artist.bio && (
                    <p className="text-white/80">{artist.bio}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-4">
                  <div className="flex gap-6 text-center">
                    <div>
                      <p className="text-2xl font-bold text-white">{artworks?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Artworks</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{artist.followerCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{artist.followingCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                  </div>
                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    onClick={() => setIsFollowing(!isFollowing)}
                    data-testid="button-follow"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Artworks ({artworks?.length || 0})
            </h3>
          </div>

          {artworks && artworks.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artworks.map((artwork) => (
                <Card 
                  key={artwork.id}
                  className="overflow-hidden hover-elevate cursor-pointer group"
                  onClick={() => setLocation(`/artwork/${artwork.id}`)}
                  data-testid={`card-artwork-${artwork.id}`}
                >
                  <div className="aspect-square relative">
                    <img 
                      src={artwork.imageUrl} 
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex gap-4 text-white">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {artwork.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {artwork.views}
                        </span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-white truncate">{artwork.title}</h3>
                    {artwork.description && (
                      <p className="text-xs text-muted-foreground truncate mt-1">{artwork.description}</p>
                    )}
                    {artwork.tags && Array.isArray(artwork.tags) && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {(artwork.tags as string[]).slice(0, 2).map((tag: string, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Grid className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No artworks yet</h3>
              <p className="text-muted-foreground">This artist hasn't published any work yet</p>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
