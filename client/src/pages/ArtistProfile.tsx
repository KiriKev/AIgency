import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Grid, UserPlus, Sparkles, MessageCircle, Send, Eye, Heart } from "lucide-react";
import { useState } from "react";
import ArtworkGrid, { type ArtworkItem } from "@/components/ArtworkGrid";
import type { Artwork, Artist } from "@shared/schema";

interface Comment {
  id: string;
  username: string;
  content: string;
  createdAt: string;
}

export default function ArtistProfile() {
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const artistId = params.id;
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [commentText, setCommentText] = useState("");

  const isOwnProfile = false;

  const [comments] = useState<Comment[]>([
    { id: "c1", username: "ArtLover42", content: "Amazing style! Love the colors.", createdAt: "2h ago" },
    { id: "c2", username: "PixelMaster", content: "This is incredible work!", createdAt: "5h ago" },
    { id: "c3", username: "DigitalDreamer", content: "How do you achieve this effect?", createdAt: "1d ago" },
  ]);

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

          {!isOwnProfile && artworks && artworks.length > 0 ? (
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Artworks ({artworks.length})
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {artworks.map((artwork) => (
                    <div
                      key={artwork.id}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer group ${
                        selectedArtwork?.id === artwork.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedArtwork(artwork)}
                      data-testid={`artwork-${artwork.id}`}
                    >
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <p className="text-white text-sm font-medium text-center px-2">{artwork.title}</p>
                        <div className="flex items-center gap-3 text-white/80 text-xs">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {artwork.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" /> {artwork.likes || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedArtwork && (
                <Card className="w-80 shrink-0 sticky top-24 h-fit">
                  <CardContent className="p-4 space-y-4">
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <img
                        src={selectedArtwork.imageUrl}
                        alt={selectedArtwork.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-white">{selectedArtwork.title}</h4>
                      <p className="text-xs text-muted-foreground">by {artist?.displayName}</p>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" /> {selectedArtwork.views || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" /> {selectedArtwork.likes || 0}
                      </span>
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => setLocation(`/generator/${selectedArtwork.id}`)}
                      data-testid="button-generate-from"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate from this
                    </Button>

                    <div className="border-t border-border pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-white">Comments</span>
                        <Badge variant="secondary" className="text-xs">{comments.length}</Badge>
                      </div>

                      <ScrollArea className="h-32 mb-3">
                        <div className="space-y-3 pr-2">
                          {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2">
                              <Avatar className="h-6 w-6 shrink-0">
                                <AvatarFallback className="text-[10px] bg-primary/20 text-primary">
                                  {comment.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-white">{comment.username}</span>
                                  <span className="text-[10px] text-muted-foreground">{comment.createdAt}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>

                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Add a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="min-h-[36px] h-9 text-xs resize-none py-2"
                          data-testid="input-comment"
                        />
                        <Button size="sm" className="h-9 px-3" data-testid="button-send-comment">
                          <Send className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : artworks && artworks.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Artworks ({artworks.length})
                </h3>
              </div>
              <ArtworkGrid
                items={artworks.map((artwork): ArtworkItem => ({
                  id: artwork.id,
                  title: artwork.title,
                  artistId: artwork.artistId,
                  artistName: artist?.displayName || 'Unknown',
                  imageUrl: artwork.imageUrl,
                  likes: artwork.likes || 0,
                  views: artwork.views || 0,
                  tags: artwork.tags as string[] | undefined
                }))}
                variant="artwork"
                showArtist={false}
                useMasonryLayout={true}
                onCardClick={(id) => setLocation(`/artwork/${id}`)}
              />
            </>
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
