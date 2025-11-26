import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Heart, Eye, Grid, List, Plus, ImageIcon } from "lucide-react";
import { useState } from "react";
import type { Artwork, Artist } from "@shared/schema";

const CURRENT_ARTIST_ID = "default-artist";

export default function MyGallery() {
  const [, setLocation] = useLocation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { data: artist, isLoading: artistLoading } = useQuery<Artist>({
    queryKey: ['/api/artists', CURRENT_ARTIST_ID],
  });

  const { data: artworks, isLoading: artworksLoading } = useQuery<Artwork[]>({
    queryKey: ['/api/artists', CURRENT_ARTIST_ID, 'artworks'],
  });

  const isLoading = artistLoading || artworksLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/')}
              data-testid="button-back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">My Gallery</h1>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-lg" />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                        {artist?.displayName?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-white">{artist?.displayName}</h2>
                      <p className="text-muted-foreground">@{artist?.username}</p>
                      {artist?.bio && (
                        <p className="text-sm text-muted-foreground mt-1">{artist.bio}</p>
                      )}
                    </div>
                    <div className="flex gap-6 text-center">
                      <div>
                        <p className="text-2xl font-bold text-white">{artworks?.length || 0}</p>
                        <p className="text-xs text-muted-foreground">Artworks</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{artist?.followerCount || 0}</p>
                        <p className="text-xs text-muted-foreground">Followers</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{artist?.followingCount || 0}</p>
                        <p className="text-xs text-muted-foreground">Following</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    data-testid="button-view-grid"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    data-testid="button-view-list"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={() => setLocation('/editor')} data-testid="button-create-new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </div>

              {artworks && artworks.length > 0 ? (
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  : "flex flex-col gap-4"
                }>
                  {artworks.map((artwork) => (
                    <Card 
                      key={artwork.id}
                      className="overflow-hidden hover-elevate cursor-pointer group"
                      onClick={() => setLocation(`/artwork/${artwork.id}`)}
                      data-testid={`card-artwork-${artwork.id}`}
                    >
                      {viewMode === 'grid' ? (
                        <>
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
                        </>
                      ) : (
                        <div className="flex gap-4 p-4">
                          <img 
                            src={artwork.imageUrl} 
                            alt={artwork.title}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium text-white">{artwork.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{artwork.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" />
                                {artwork.likes}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {artwork.views}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No artworks yet</h3>
                  <p className="text-muted-foreground mb-4">Start creating to fill your gallery</p>
                  <Button onClick={() => setLocation('/editor')} data-testid="button-start-creating">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Artwork
                  </Button>
                </Card>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
