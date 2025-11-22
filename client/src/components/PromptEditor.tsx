import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Save, Eye, Sparkles, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

const ASPECT_RATIOS = [
  { value: "1:1", label: "1:1", width: 1024, height: 1024 },
  { value: "16:9", label: "16:9", width: 1920, height: 1080 },
  { value: "9:16", label: "9:16", width: 1080, height: 1920 },
  { value: "4:3", label: "4:3", width: 1024, height: 768 },
  { value: "3:4", label: "3:4", width: 768, height: 1024 },
];

export default function PromptEditor() {
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("A {{subject}} in a {{style}} setting with {{atmosphere}} lighting");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [evilSlider, setEvilSlider] = useState([50]);
  const [fireSlider, setFireSlider] = useState([60]);
  const [priceType, setPriceType] = useState<'free' | 'paid'>('free');
  const [price, setPrice] = useState(0);

  const currentRatio = ASPECT_RATIOS.find(r => r.value === aspectRatio);
  const baseCost = selectedModel === "gemini-3.0" ? 0.3 : 0.1;
  const totalCost = baseCost + (evilSlider[0] / 100 * 0.2) + (fireSlider[0] / 100 * 0.2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_400px] gap-6 h-full">
      <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-12rem)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Give title for your prompt"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="input-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select defaultValue="scifi">
                <SelectTrigger id="category" data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scifi">Sci-Fi</SelectItem>
                  <SelectItem value="fantasy">Fantasy</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Price per generation</Label>
              <div className="flex gap-2">
                <Button
                  variant={priceType === 'free' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setPriceType('free')}
                  data-testid="button-price-free"
                >
                  Free
                </Button>
                <Button
                  variant={priceType === 'paid' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setPriceType('paid')}
                  data-testid="button-price-paid"
                >
                  USD
                </Button>
              </div>
              {priceType === 'paid' && (
                <Input
                  type="number"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="mt-2"
                  data-testid="input-price"
                />
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>AI Model</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={selectedModel === 'gemini-2.5' ? 'default' : 'outline'}
                  size="sm"
                  className="flex flex-col h-auto py-3"
                  onClick={() => setSelectedModel('gemini-2.5')}
                  data-testid="button-model-2.5"
                >
                  <span className="font-semibold">Gemini 2.5</span>
                  <span className="text-xs text-muted-foreground">up to 1024px</span>
                </Button>
                <Button
                  variant={selectedModel === 'gemini-3.0' ? 'default' : 'outline'}
                  size="sm"
                  className="flex flex-col h-auto py-3"
                  onClick={() => setSelectedModel('gemini-3.0')}
                  data-testid="button-model-3.0"
                >
                  <span className="font-semibold">Gemini 3.0</span>
                  <span className="text-xs text-muted-foreground">up to 4096px</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
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
              {currentRatio && (
                <p className="text-xs text-muted-foreground">
                  {currentRatio.width} x {currentRatio.height} px
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Image Settings</CardTitle>
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
          </CardContent>
        </Card>
      </div>

      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Prompt Editor</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-5rem)]">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="h-full font-mono text-sm resize-none"
            placeholder="Write your prompt here... Use {{variable}} for dynamic values"
            data-testid="textarea-prompt"
          />
          <div className="mt-4 flex gap-2">
            <Button variant="default" className="flex-1" data-testid="button-save">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" className="flex-1" data-testid="button-validate">
              <Eye className="h-4 w-4 mr-2" />
              Validate
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="aspect-square bg-muted rounded-md flex items-center justify-center border-2 border-dashed">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No preview generated yet</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Generated Prompt:</p>
              <div className="p-3 bg-muted rounded-md font-mono text-xs">
                {prompt}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost Calculator</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Generation</span>
                <span className="font-mono">{baseCost.toFixed(2)}$</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Evil {evilSlider[0]}%</span>
                <span className="font-mono">{(evilSlider[0] / 100 * 0.2).toFixed(2)}$</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fire {fireSlider[0]}%</span>
                <span className="font-mono">{(fireSlider[0] / 100 * 0.2).toFixed(2)}$</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="font-mono text-primary">{totalCost.toFixed(2)}$</span>
              </div>
            </div>

            <Button className="w-full" size="lg" data-testid="button-generate">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate ({totalCost.toFixed(2)}$)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
