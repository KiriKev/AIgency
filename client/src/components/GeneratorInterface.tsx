import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sparkles, RefreshCw, Check, Image as ImageIcon, ArrowLeft, Maximize2, Send, MessageCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";
import ImageLightbox from "./ImageLightbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1" },
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "4:3", label: "4:3" },
  { value: "3:4", label: "3:4" },
];

interface VariationSettings {
  evil: number;
  fire: number;
  aspectRatio: string;
  model: string;
  upscale4k: boolean;
}

interface Variation {
  id: string;
  imageUrl: string;
  settings: VariationSettings;
  createdAt: string;
}

interface Comment {
  id: string;
  username: string;
  content: string;
  createdAt: string;
}

interface GeneratorInterfaceProps {
  title?: string;
  artistName?: string;
  artistId?: string;
  imageUrl?: string;
}

export default function GeneratorInterface({ 
  title = "Cyberpunk Cityscape",
  artistName = "NeonArtist",
  artistId = "artist-neon",
  imageUrl = "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=800&fit=crop"
}: GeneratorInterfaceProps) {
  const [, setLocation] = useLocation();
  const [evilSlider, setEvilSlider] = useState([75]);
  const [fireSlider, setFireSlider] = useState([60]);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5");
  const [upscale4k, setUpscale4k] = useState(false);
  const [middleFinger, setMiddleFinger] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [selectedVariation, setSelectedVariation] = useState<string | null>(null);

  const [variations] = useState<Variation[]>([
    { id: "v1", imageUrl: `${imageUrl}&v=1`, settings: { evil: 80, fire: 50, aspectRatio: "16:9", model: "gemini-2.5", upscale4k: false }, createdAt: "2 min ago" },
    { id: "v2", imageUrl: `${imageUrl}&v=2`, settings: { evil: 65, fire: 70, aspectRatio: "1:1", model: "gemini-3.0", upscale4k: true }, createdAt: "5 min ago" },
    { id: "v3", imageUrl: `${imageUrl}&v=3`, settings: { evil: 90, fire: 40, aspectRatio: "9:16", model: "gemini-2.5", upscale4k: false }, createdAt: "10 min ago" },
    { id: "v4", imageUrl: `${imageUrl}&v=4`, settings: { evil: 55, fire: 85, aspectRatio: "4:3", model: "gemini-2.5", upscale4k: true }, createdAt: "15 min ago" },
    { id: "v5", imageUrl: `${imageUrl}&v=5`, settings: { evil: 70, fire: 60, aspectRatio: "16:9", model: "gemini-3.0", upscale4k: false }, createdAt: "20 min ago" },
  ]);

  const [comments] = useState<Comment[]>([
    { id: "c1", username: "ArtLover42", content: "Love the color scheme on this one!", createdAt: "1h ago" },
    { id: "c2", username: "PixelMaster", content: "The lighting effects are incredible", createdAt: "3h ago" },
  ]);

  const [hasGeneratedFromThisArtwork] = useState(true);

  const baseCost = selectedModel === "gemini-3.0" ? 15 : 15;
  const upscaleCost = upscale4k ? 5 : 0;
  const imageUploadCost = 20;
  const premiumCost = 50;
  const totalCost = baseCost + baseCost + upscaleCost + imageUploadCost + premiumCost;

  const handleVariationSelect = (variation: Variation) => {
    setSelectedVariation(variation.id);
    setEvilSlider([variation.settings.evil]);
    setFireSlider([variation.settings.fire]);
    setAspectRatio(variation.settings.aspectRatio);
    setSelectedModel(variation.settings.model);
    setUpscale4k(variation.settings.upscale4k);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-3 p-3 border-b border-border/50 shrink-0">
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
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p 
            className="text-xs text-muted-foreground hover:text-primary cursor-pointer hover:underline"
            onClick={() => setLocation(`/artist/${artistId}`)}
            data-testid="text-artist-link"
          >
            by {artistName}
          </p>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <ScrollArea className="w-full lg:w-80 shrink-0 border-r border-border/50">
            <div className="p-3 space-y-3">
              <Card className="border-0 bg-card/50">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm">Settings</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Evil</Label>
                      <span className="text-xs font-mono text-muted-foreground">{evilSlider[0]}%</span>
                    </div>
                    <Slider
                      value={evilSlider}
                      onValueChange={setEvilSlider}
                      max={100}
                      step={1}
                      className="h-1"
                      data-testid="slider-evil"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Fire</Label>
                      <span className="text-xs font-mono text-muted-foreground">{fireSlider[0]}%</span>
                    </div>
                    <Slider
                      value={fireSlider}
                      onValueChange={setFireSlider}
                      max={100}
                      step={1}
                      className="h-1"
                      data-testid="slider-fire"
                    />
                  </div>

                  <Separator className="my-2" />

                  <div className="space-y-1.5">
                    <Label className="text-xs">Model</Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger className="h-8 text-xs" data-testid="select-model">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemini-2.5">Gemini 2.5 Flash</SelectItem>
                        <SelectItem value="gemini-3.0">Gemini 3.0 Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Aspect ratio</Label>
                    <div className="grid grid-cols-5 gap-1">
                      {ASPECT_RATIOS.map(ratio => (
                        <Button
                          key={ratio.value}
                          variant={aspectRatio === ratio.value ? 'default' : 'outline'}
                          size="sm"
                          className="h-7 text-xs px-1"
                          onClick={() => setAspectRatio(ratio.value)}
                          data-testid={`button-ratio-${ratio.value}`}
                        >
                          {ratio.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="upscale"
                        checked={upscale4k}
                        onCheckedChange={(checked) => setUpscale4k(checked as boolean)}
                        className="h-3.5 w-3.5"
                        data-testid="checkbox-upscale"
                      />
                      <Label htmlFor="upscale" className="text-xs font-normal cursor-pointer">
                        4K Upscale
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="finger"
                        checked={middleFinger}
                        onCheckedChange={(checked) => setMiddleFinger(checked as boolean)}
                        className="h-3.5 w-3.5"
                        data-testid="checkbox-finger"
                      />
                      <Label htmlFor="finger" className="text-xs font-normal cursor-pointer">
                        Middle finger
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card/50">
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm">Cost</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-2">
                  <div className="space-y-1 text-xs">
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
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Image uploads</span>
                      <span className="font-mono">${imageUploadCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Premium</span>
                      <span className="font-mono">${premiumCost.toFixed(2)}</span>
                    </div>
                    <Separator className="my-1" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="font-mono text-primary">${totalCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button className="w-full h-9" data-testid="button-create">
                    <Sparkles className="h-3.5 w-3.5 mr-2" />
                    Create Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 p-3 overflow-auto">
              <div className="grid grid-cols-2 gap-1 max-w-2xl mx-auto">
                {[1, 2, 3, 4].map((idx) => {
                  const variationUrl = `${imageUrl.replace('w=800', `w=400`).replace('h=800', 'h=400')}&variant=${idx}`;
                  return (
                    <div
                      key={idx}
                      className="aspect-square bg-muted rounded-sm overflow-hidden border-[0.5px] border-border hover-elevate cursor-zoom-in relative group"
                      onClick={() => setLightboxImage(imageUrl)}
                      data-testid={`generated-image-${idx}`}
                    >
                      <img 
                        src={variationUrl}
                        alt={`Variation ${idx}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden absolute inset-0 flex items-center justify-center bg-muted">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-xs text-muted-foreground">Image {idx}</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 mt-3 max-w-2xl mx-auto">
                <Button className="flex-1" size="sm" data-testid="button-accept">
                  <Check className="h-4 w-4 mr-2" />
                  Accept & Save
                </Button>
                <Button variant="outline" className="flex-1" size="sm" data-testid="button-regenerate">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>

            <div className="border-t border-border/50 p-3 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-white">Comments</span>
                <Badge variant="secondary" className="text-xs">{comments.length}</Badge>
              </div>
              
              <ScrollArea className="h-24 mb-2">
                <div className="space-y-2 pr-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2" data-testid={`comment-${comment.id}`}>
                      <Avatar className="h-6 w-6">
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

              {hasGeneratedFromThisArtwork ? (
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
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  Generate an image from this artwork to comment
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="w-20 lg:w-24 border-l border-border/50 bg-card/30 shrink-0">
          <div className="p-2 border-b border-border/50">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">History</span>
          </div>
          <ScrollArea className="h-[calc(100%-2rem)]">
            <div className="p-1.5 space-y-1.5">
              {variations.map((variation) => (
                <div
                  key={variation.id}
                  className={`relative aspect-square rounded-sm overflow-hidden cursor-pointer transition-all ${
                    selectedVariation === variation.id 
                      ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' 
                      : 'hover:opacity-80'
                  }`}
                  onClick={() => handleVariationSelect(variation)}
                  data-testid={`variation-${variation.id}`}
                >
                  <img
                    src={variation.imageUrl}
                    alt={`Variation ${variation.id}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                    <p className="text-[8px] text-white/80 text-center">{variation.createdAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <ImageLightbox
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        imageUrl={lightboxImage || ''}
      />
    </div>
  );
}
