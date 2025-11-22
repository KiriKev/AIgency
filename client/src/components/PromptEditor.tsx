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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, HelpCircle, Sparkles, Save } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

type VariableType = 'text' | 'checkbox' | 'multi-select' | 'single-select' | 'slider';

interface Variable {
  id: string;
  name: string;
  label: string;
  description: string;
  type: VariableType;
  defaultValue: string | number | boolean | string[];
  options?: string[];
  min?: number;
  max?: number;
  required: boolean;
  position: number;
}

export default function PromptEditor() {
  const [prompt, setPrompt] = useState("");
  const [variables, setVariables] = useState<Variable[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variableToDelete, setVariableToDelete] = useState<string | null>(null);
  const [editingVariable, setEditingVariable] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextSelection = () => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = prompt.substring(start, end);
    
    if (selected && selected.trim().length > 0) {
      setSelectedText(selected);
      setSelectionRange({ start, end });
    } else {
      setSelectedText("");
      setSelectionRange(null);
    }
  };

  const createVariableFromSelection = () => {
    if (!selectedText || !selectionRange) return;
    
    const varName = `var_${Date.now()}`;
    const varPlaceholder = `[${varName}]`;
    
    const isDuplicate = variables.some(v => v.name === varName);
    if (isDuplicate) {
      alert('Diese Variable existiert bereits!');
      return;
    }
    
    const newVariable: Variable = {
      id: varName,
      name: varName,
      label: selectedText,
      description: '',
      type: 'text',
      defaultValue: selectedText,
      required: false,
      position: variables.length
    };
    
    setVariables([...variables, newVariable]);
    
    const newPrompt = 
      prompt.substring(0, selectionRange.start) + 
      varPlaceholder + 
      prompt.substring(selectionRange.end);
    setPrompt(newPrompt);
    
    setSelectedText("");
    setSelectionRange(null);
    setEditingVariable(varName);
  };

  const detectBracketVariables = (text: string) => {
    const regex = /\[([^\]]+)\]/g;
    const matches = Array.from(text.matchAll(regex));
    
    matches.forEach(match => {
      const varName = match[1];
      const exists = variables.some(v => v.name === varName);
      
      if (!exists) {
        const newVariable: Variable = {
          id: varName,
          name: varName,
          label: varName,
          description: '',
          type: 'text',
          defaultValue: '',
          required: true,
          position: variables.length
        };
        
        setVariables(prev => [...prev, newVariable]);
        setEditingVariable(varName);
      }
    });
  };

  useEffect(() => {
    detectBracketVariables(prompt);
  }, [prompt]);

  const deleteVariable = (varId: string) => {
    setVariableToDelete(varId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteVariable = () => {
    if (!variableToDelete) return;
    
    const variable = variables.find(v => v.id === variableToDelete);
    if (!variable) return;
    
    const varPlaceholder = `[${variable.name}]`;
    const newPrompt = prompt.replace(new RegExp(`\\[${variable.name}\\]`, 'g'), variable.defaultValue as string || '');
    setPrompt(newPrompt);
    
    setVariables(variables.filter(v => v.id !== variableToDelete));
    setDeleteDialogOpen(false);
    setVariableToDelete(null);
  };

  const updateVariable = (varId: string, updates: Partial<Variable>) => {
    setVariables(variables.map(v => 
      v.id === varId ? { ...v, ...updates } : v
    ));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const handleSubmit = () => {
    console.log('Submitting prompt with variables:', { prompt, variables });
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-[3fr_1fr] gap-4 h-[calc(100vh-12rem)]">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Prompt Editor</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onSelect={handleTextSelection}
                className="h-full font-mono text-sm resize-none"
                placeholder="Schreibe deinen Prompt hier... Nutze [VariableName] für Variablen"
                data-testid="textarea-prompt"
              />
              
              {selectedText && selectionRange && (
                <div className="absolute" style={{
                  top: `${(selectionRange.start / prompt.length) * 100}%`,
                  right: '-120px'
                }}>
                  <Button
                    size="sm"
                    onClick={createVariableFromSelection}
                    data-testid="button-create-variable"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Variable
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                data-testid="button-generate"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generiere...' : 'Generieren'}
              </Button>
              <Button
                variant="outline"
                onClick={handleSubmit}
                disabled={isGenerating}
                data-testid="button-submit"
              >
                <Save className="h-4 w-4 mr-2" />
                Submitten
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-base">Variablen</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {variables.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Keine Variablen vorhanden.
                    <br />
                    Markiere Text oder nutze [Name]
                  </p>
                ) : (
                  variables.map((variable) => (
                    <Card key={variable.id} className="p-3">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                value={variable.label}
                                onChange={(e) => updateVariable(variable.id, { label: e.target.value })}
                                className="h-8 text-sm font-medium"
                                placeholder="Label"
                                data-testid={`input-label-${variable.id}`}
                              />
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <HelpCircle className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <Input
                                    value={variable.description}
                                    onChange={(e) => updateVariable(variable.id, { description: e.target.value })}
                                    placeholder="Beschreibung hinzufügen..."
                                    className="w-48"
                                    data-testid={`input-description-${variable.id}`}
                                  />
                                </TooltipContent>
                              </Tooltip>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => deleteVariable(variable.id)}
                                data-testid={`button-delete-${variable.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>

                            <Badge variant="outline" className="text-xs">
                              {variable.name}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs">Typ</Label>
                          <Select
                            value={variable.type}
                            onValueChange={(value) => updateVariable(variable.id, { type: value as VariableType })}
                          >
                            <SelectTrigger className="h-8 text-sm" data-testid={`select-type-${variable.id}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                              <SelectItem value="multi-select">Multi-Select</SelectItem>
                              <SelectItem value="single-select">Single-Select</SelectItem>
                              <SelectItem value="slider">Regler</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {variable.type === 'text' && (
                          <Input
                            value={variable.defaultValue as string}
                            onChange={(e) => updateVariable(variable.id, { defaultValue: e.target.value })}
                            placeholder="Default-Wert"
                            className="h-8 text-sm"
                            data-testid={`input-default-${variable.id}`}
                          />
                        )}

                        {variable.type === 'checkbox' && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`checkbox-${variable.id}`}
                              checked={variable.defaultValue as boolean}
                              onCheckedChange={(checked) => updateVariable(variable.id, { defaultValue: checked })}
                              data-testid={`checkbox-default-${variable.id}`}
                            />
                            <Label htmlFor={`checkbox-${variable.id}`} className="text-sm">
                              Standardmäßig aktiv
                            </Label>
                          </div>
                        )}

                        {(variable.type === 'multi-select' || variable.type === 'single-select') && (
                          <div className="space-y-2">
                            <Label className="text-xs">Optionen (kommagetrennt)</Label>
                            <Input
                              value={variable.options?.join(', ') || ''}
                              onChange={(e) => updateVariable(variable.id, { 
                                options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                              })}
                              placeholder="Option 1, Option 2, Option 3"
                              className="h-8 text-sm"
                              data-testid={`input-options-${variable.id}`}
                            />
                          </div>
                        )}

                        {variable.type === 'slider' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Min</Label>
                                <Input
                                  type="number"
                                  value={variable.min || 0}
                                  onChange={(e) => updateVariable(variable.id, { min: parseInt(e.target.value) })}
                                  className="h-8 text-sm"
                                  data-testid={`input-min-${variable.id}`}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Max</Label>
                                <Input
                                  type="number"
                                  value={variable.max || 100}
                                  onChange={(e) => updateVariable(variable.id, { max: parseInt(e.target.value) })}
                                  className="h-8 text-sm"
                                  data-testid={`input-max-${variable.id}`}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Default: {variable.defaultValue as number}</Label>
                              <Slider
                                value={[variable.defaultValue as number]}
                                onValueChange={([value]) => updateVariable(variable.id, { defaultValue: value })}
                                min={variable.min || 0}
                                max={variable.max || 100}
                                step={1}
                                data-testid={`slider-default-${variable.id}`}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center space-x-2 pt-2 border-t">
                          <Checkbox
                            id={`required-${variable.id}`}
                            checked={variable.required}
                            onCheckedChange={(checked) => updateVariable(variable.id, { required: checked as boolean })}
                            data-testid={`checkbox-required-${variable.id}`}
                          />
                          <Label htmlFor={`required-${variable.id}`} className="text-xs">
                            Pflichtfeld
                          </Label>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Variable löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diese Variable löschen möchten? Der Text bleibt als normaler Text im Prompt erhalten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nein</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteVariable}>Ja, löschen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
