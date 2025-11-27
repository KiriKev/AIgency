import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, RefreshCw, Check, X, Image as ImageIcon, ArrowLeft, Maximize2, MessageSquare, Send, Clock, User } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ImageLightbox from "./ImageLightbox";
import type { PromptGeneration } from "@shared/schema";

const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1" },
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "4:3", label: "4:3" },
  { value: "3:4", label: "3:4" },
];

interface SettingsSnapshot {
  evilSlider: number;
  fireSlider: number;
  aspectRatio: string;
  selectedModel: string;
  upscale4k: boolean;
  middleFinger: boolean;
}

interface GeneratorInterfaceProps {
  title?: string;
  artistName?: string;
  artistId?: string;
  imageUrl?: string;
  promptId?: string;
}

interface MockGeneration {
  id: string;
  imageUrl: string;
  watermarkedImageUrl: string;
  settingsSnapshot: SettingsSnapshot;
  createdAt: string;
  accepted: boolean;
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  createdAt: string;
}

export default function GeneratorInterface({ 
  title = "Cyberpunk Cityscape",
  artistName = "NeonArtist",
  artistId = "artist-neon",
  imageUrl = "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=800&fit=crop",
  promptId = "demo-prompt"
}: GeneratorInterfaceProps) {
  const [, setLocation] = useLocation();
  
  const [evilSlider, setEvilSlider] = useState([75]);
  const [fireSlider, setFireSlider] = useState([60]);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5");
  const [upscale4k, setUpscale4k] = useState(false);
  const [middleFinger, setMiddleFinger] = useState(false);
  
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: string; content: string}[]>([
    { role: "assistant", content: "Image generated! What adjustments would you like?" }
  ]);
  
  const [selectedGenerationId, setSelectedGenerationId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const currentUserId = "current-user";
  const hasGeneratedImage = true;
  
  const [generations] = useState<MockGeneration[]>([
    {
      id: "gen-1",
      imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=400&fit=crop",
      watermarkedImageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=400&fit=crop",
      settingsSnapshot: { evilSlider: 75, fireSlider: 60, aspectRatio: "16:9", selectedModel: "gemini-2.5", upscale4k: false, middleFinger: false },
      createdAt: new Date().toISOString(),
      accepted: false
    },
    {
      id: "gen-2",
      imageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=400&fit=crop",
      watermarkedImageUrl: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=400&fit=crop",
      settingsSnapshot: { evilSlider: 50, fireSlider: 80, aspectRatio: "1:1", selectedModel: "gemini-3.0", upscale4k: true, middleFinger: false },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      accepted: true
    },
    {
      id: "gen-3",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop",
      watermarkedImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop",
      settingsSnapshot: { evilSlider: 90, fireSlider: 40, aspectRatio: "4:3", selectedModel: "gemini-2.5", upscale4k: false, middleFinger: true },
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      accepted: false
    }
  ]);

  const [comments] = useState<Comment[]>([
    { id: "c1", userId: "user1", username: "ArtLover", content: "Great prompt! The variations are amazing.", createdAt: new Date(Date.now() - 1800000).toISOString() },
    { id: "c2", userId: "user2", username: "DigitalCreator", content: "Love the cyberpunk vibes!", createdAt: new Date(Date.now() - 900000).toISOString() }
  ]);

  const handleSelectGeneration = (gen: MockGeneration) => {
    setSelectedGenerationId(gen.id);
    setEvilSlider([gen.settingsSnapshot.evilSlider]);
    setFireSlider([gen.settingsSnapshot.fireSlider]);
    setAspectRatio(gen.settingsSnapshot.aspectRatio);
    setSelectedModel(gen.settingsSnapshot.selectedModel);
    setUpscale4k(gen.settingsSnapshot.upscale4k);
    setMiddleFinger(gen.settingsSnapshot.middleFinger);
  };

  const handleSendChat = () => {
    if (!chatMessage.trim()) return;
    setChatMessages(prev => [...prev, { role: "user", content: chatMessage }]);
    setChatMessage("");
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Processing your request... Generating refined version." }]);
    }, 500);
  };

  const handleAcceptImage = () => {
    setChatOpen(false);
    setChatMessages([{ role: "assistant", content: "Image generated! What adjustments would you like?" }]);
  };

  const baseCost = selectedModel === "gemini-3.0" ? 15 : 15;
  const upscaleCost = upscale4k ? 5 : 0;
  const imageUploadCost = 20;
  const premiumCost = 50;
  const totalCost = baseCost + baseCost + upscaleCost + imageUploadCost + premiumCost;

  const selectedGeneration = generations.find(g => g.id === selectedGenerationId) || generations[0];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation('/')}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p 
            className="text-sm text-muted-foreground hover:text-primary cursor-pointer hover:underline"
            onClick={() => setLocation(`/artist/${artistId}`)}
            data-testid="text-artist-link"
          >
            by {artistName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px_200px] gap-4">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Prompt Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Evil</Label>
                  <span className="text-sm font-mono">{evilSlider[0]}%</span>
                </div>
                <Slider
                  value={evilSlider}
                  onValueChange={setEvilSlider}
                  max={100}
                  step={1}
                  data-testid="slider-evil"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Fire</Label>
                  <span className="text-sm font-mono">{fireSlider[0]}%</span>
                </div>
                <Slider
                  value={fireSlider}
                  onValueChange={setFireSlider}
                  max={100}
                  step={1}
                  data-testid="slider-fire"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Choose trained model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger data-testid="select-model">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.5">Gemini 2.5 Flash</SelectItem>
                    <SelectItem value="gemini-3.0">Gemini 3.0 Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Aspect ratio</Label>
                <div className="grid grid-cols-5 gap-1">
                  {ASPECT_RATIOS.map(ratio => (
                    <Button
                      key={ratio.value}
                      variant={aspectRatio === ratio.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAspectRatio(ratio.value)}
                      data-testid={`button-ratio-${ratio.value}`}
                    >
                      {ratio.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="upscale"
                    checked={upscale4k}
                    onCheckedChange={(checked) => setUpscale4k(checked as boolean)}
                    data-testid="checkbox-upscale"
                  />
                  <Label htmlFor="upscale" className="text-sm font-normal cursor-pointer">
                    4K Upscale
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="finger"
                    checked={middleFinger}
                    onCheckedChange={(checked) => setMiddleFinger(checked as boolean)}
                    data-testid="checkbox-finger"
                  />
                  <Label htmlFor="finger" className="text-sm font-normal cursor-pointer">
                    Middle finger
                  </Label>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Evil {evilSlider[0]}%</span>
                  <span className="font-mono text-primary">${baseCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fire {fireSlider[0]}%</span>
                  <span className="font-mono text-primary">${baseCost.toFixed(2)}</span>
                </div>
                {upscale4k && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">4K Upscale</span>
                    <span className="font-mono">${upscaleCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="font-mono text-primary">${totalCost.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" data-testid="button-create">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Image
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div 
            className="aspect-square bg-muted rounded-lg overflow-hidden border border-border cursor-zoom-in relative group"
            onClick={() => setLightboxImage(selectedGeneration?.watermarkedImageUrl || imageUrl)}
            data-testid="main-generated-image"
          >
            <img 
              src={selectedGeneration?.watermarkedImageUrl || imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
                <defs>
                  <pattern id="watermark-pattern" patternUnits="userSpaceOnUse" width="150" height="150" patternTransform="rotate(-30)">
                    <text x="0" y="75" fill="white" fontSize="12" fontFamily="monospace" fontWeight="bold">
                      AI GENERATED
                    </text>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#watermark-pattern)" />
              </svg>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white/80 text-[10px] px-2 py-1 rounded font-mono border border-white/20">
                AI Generated
              </div>
            </div>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="h-8 w-8 text-white" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" size="sm" onClick={handleAcceptImage} data-testid="button-accept">
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button variant="outline" size="sm" onClick={() => setChatOpen(true)} data-testid="button-refine">
              <MessageSquare className="h-4 w-4 mr-1" />
              Refine
            </Button>
            <Button variant="outline" size="sm" data-testid="button-regenerate">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <ScrollArea className="h-[350px]">
              <div className="space-y-2 pr-2">
                {generations.map((gen) => (
                  <div
                    key={gen.id}
                    className={`relative rounded-md overflow-hidden cursor-pointer border-2 transition-all ${
                      selectedGenerationId === gen.id || (!selectedGenerationId && gen.id === generations[0].id)
                        ? 'border-primary'
                        : 'border-transparent hover:border-muted-foreground/50'
                    }`}
                    onClick={() => handleSelectGeneration(gen)}
                    data-testid={`history-item-${gen.id}`}
                  >
                    <img 
                      src={gen.watermarkedImageUrl}
                      alt="Generation"
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <svg className="absolute inset-0 w-full h-full opacity-15" preserveAspectRatio="none">
                        <defs>
                          <pattern id={`wm-${gen.id}`} patternUnits="userSpaceOnUse" width="80" height="80" patternTransform="rotate(-30)">
                            <text x="0" y="40" fill="white" fontSize="8" fontFamily="monospace" fontWeight="bold">
                              AI
                            </text>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#wm-${gen.id})`} />
                      </svg>
                    </div>
                    {gen.accepted && (
                      <div className="absolute top-1 right-1">
                        <Badge variant="secondary" className="text-[10px] px-1 py-0">
                          <Check className="h-3 w-3" />
                        </Badge>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white/70 text-[9px] px-1 py-0.5">
                      {new Date(gen.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Comments
            {!hasGeneratedImage && (
              <Badge variant="outline" className="ml-2 text-xs">Generate to comment</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-32">
            <div className="space-y-3 pr-2">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2" data-testid={`comment-${comment.id}`}>
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{comment.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {hasGeneratedImage ? (
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                data-testid="input-comment"
              />
              <Button size="sm" data-testid="button-post-comment">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-2 text-sm text-muted-foreground">
              Generate an image from this prompt to join the conversation
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Refine Image
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img 
                src={selectedGeneration?.watermarkedImageUrl || imageUrl}
                alt="Current generation"
                className="w-full h-full object-cover"
              />
            </div>

            <ScrollArea className="h-48 rounded-md border p-3">
              <div className="space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-2 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Textarea
                placeholder="Describe what you'd like to change..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="min-h-[60px] resize-none"
                data-testid="input-refine-chat"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={handleSendChat}
                disabled={!chatMessage.trim()}
                data-testid="button-send-refine"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
              <Button 
                variant="outline" 
                onClick={handleAcceptImage}
                data-testid="button-accept-close"
              >
                <Check className="h-4 w-4 mr-2" />
                Accept & Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImageLightbox
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        imageUrl={lightboxImage || ''}
      />
    </div>
  );
}
