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
import { Sparkles, RefreshCw, Check, X, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";

const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1" },
  { value: "16:9", label: "16:9" },
  { value: "9:16", label: "9:16" },
  { value: "4:3", label: "4:3" },
  { value: "3:4", label: "3:4" },
];

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
  const [iterations, setIterations] = useState(0);
  const [chatMessage, setChatMessage] = useState("");

  const baseCost = selectedModel === "gemini-3.0" ? 15 : 15;
  const upscaleCost = upscale4k ? 5 : 0;
  const imageUploadCost = 20;
  const premiumCost = 50;
  const totalCost = baseCost + baseCost + upscaleCost + imageUploadCost + premiumCost;

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
        <Badge variant="secondary" className="ml-auto" data-testid="badge-iterations">
          {iterations} / 5 iterations
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-1">
            {[1, 2, 3, 4].map((idx) => (
              <div
                key={idx}
                className="aspect-square bg-muted rounded-sm overflow-hidden border-[0.5px] border-border hover-elevate cursor-pointer relative group"
              >
                <img 
                  src={`${imageUrl.replace('w=800', `w=400`).replace('h=800', 'h=400')}&variant=${idx}`}
                  alt={`${title} variation ${idx}`}
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
                  <p className="text-white text-sm font-medium">Variation {idx}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button className="flex-1" size="lg" data-testid="button-accept">
              <Check className="h-4 w-4 mr-2" />
              Accept & Save
            </Button>
            <Button variant="outline" className="flex-1" size="lg" data-testid="button-regenerate">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
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
                <Badge variant="outline" className="w-full justify-center">
                  Standard V3
                </Badge>
              </div>

              <div className="space-y-2">
                <Label>Item left hand</Label>
                <Input placeholder="Select image..." data-testid="input-left-hand" />
              </div>

              <div className="space-y-2">
                <Label>Aspect ratio</Label>
                <div className="grid grid-cols-3 gap-2">
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

              <div className="space-y-3">
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Evil 75%</span>
                  <span className="font-mono text-primary">${baseCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fire 60%</span>
                  <span className="font-mono text-primary">${baseCost.toFixed(2)}</span>
                </div>
                {upscale4k && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">4K Upscale</span>
                    <span className="font-mono">${upscaleCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Image uploads 2</span>
                  <span className="font-mono">${imageUploadCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Premium base service</span>
                  <span className="font-mono">${premiumCost.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="font-mono text-primary">${totalCost.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full" size="lg" data-testid="button-create">
                <Sparkles className="h-4 w-4 mr-2" />
                Create Now
              </Button>

              <Button variant="outline" className="w-full" data-testid="button-personalized">
                Personalized
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Refine with Chat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-48 rounded-md border p-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 bg-muted rounded-md p-3">
                  <p className="text-sm">Image generated successfully! What would you like to adjust?</p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              placeholder="Type your refinement request... (e.g., 'make the sky bluer')"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              data-testid="input-chat-message"
            />
            <Button data-testid="button-send-chat">Send</Button>
          </div>

          {iterations >= 4 && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <X className="h-4 w-4 text-destructive" />
              <p className="text-sm text-destructive">Last refinement available!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
