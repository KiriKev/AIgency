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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, HelpCircle, X, FolderOpen } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import PromptSettingsPanel from "./PromptSettingsPanel";

type VariableType = 'text' | 'checkbox' | 'multi-select' | 'single-select' | 'slider';

interface SelectOption {
  visibleName: string;
  promptValue: string;
}

interface Variable {
  id: string;
  name: string;
  label: string;
  description: string;
  type: VariableType;
  defaultValue: string | number | boolean | string[];
  options?: SelectOption[];
  min?: number;
  max?: number;
  required: boolean;
  position: number;
}

export default function PromptEditor() {
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  const [promptTitle, setPromptTitle] = useState("Untitled Prompt");
  const [prompt, setPrompt] = useState("");
  const [variables, setVariables] = useState<Variable[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [unsavedVariableDialog, setUnsavedVariableDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [variableToDelete, setVariableToDelete] = useState<string | null>(null);
  const [openVariables, setOpenVariables] = useState<string[]>([]);
  const [newOptionInput, setNewOptionInput] = useState<Record<string, string>>({});
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [aiModel, setAiModel] = useState("gemini");
  const [price, setPrice] = useState(0.0001);
  const [aspectRatio, setAspectRatio] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(1);
  const [promptType, setPromptType] = useState("create-now");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: savedPrompts = [] } = useQuery<any[]>({
    queryKey: ['/api/prompts'],
    enabled: showLoadDialog
  });

  const handleTextSelection = () => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = prompt.substring(start, end);
    
    if (selected && selected.trim().length > 0) {
      const isInsideVariable = checkIfInsideVariable(start, end);
      if (!isInsideVariable) {
        setSelectedText(selected);
        setSelectionRange({ start, end });
      }
    } else {
      setSelectedText("");
      setSelectionRange(null);
    }
  };

  const checkIfInsideVariable = (start: number, end: number): boolean => {
    const regex = /\[([^\]]+)\]/g;
    let match;
    
    while ((match = regex.exec(prompt)) !== null) {
      const varStart = match.index;
      const varEnd = match.index + match[0].length;
      
      if ((start >= varStart && start < varEnd) || (end > varStart && end <= varEnd)) {
        return true;
      }
    }
    return false;
  };

  const createVariableFromSelection = () => {
    if (!selectedText || !selectionRange) return;
    
    const varName = selectedText.replace(/\s+/g, '_').replace(/[^\w-]/g, '');
    const varPlaceholder = `[${varName}]`;
    
    const isDuplicate = variables.some(v => v.name === varName);
    if (isDuplicate) {
      toast({
        title: "Fehler",
        description: "Diese Variable existiert bereits!",
        variant: "destructive"
      });
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
    setOpenVariables([varName]);
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
        setOpenVariables(prev => [...prev, varName]);
      }
    });
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentPlaceholders = new Set<string>();
      const regex = /\[([^\]]+)\]/g;
      let match;
      while ((match = regex.exec(prompt)) !== null) {
        currentPlaceholders.add(match[1]);
      }
      
      detectBracketVariables(prompt);
      
      setVariables(prev => prev.filter(v => currentPlaceholders.has(v.name)));
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [prompt]);

  const deleteVariable = (varId: string) => {
    setVariableToDelete(varId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteVariable = () => {
    if (!variableToDelete) return;
    
    const variable = variables.find(v => v.id === variableToDelete);
    if (!variable) return;
    
    const placeholderRegex = new RegExp(`\\[${variable.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 'g');
    const newPrompt = prompt.replace(placeholderRegex, '');
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

  const handleVariableLinkClick = (varName: string) => {
    const variable = variables.find(v => v.name === varName || v.label === varName);
    if (variable) {
      setOpenVariables([variable.id]);
      
      setTimeout(() => {
        const element = document.getElementById(`variable-${variable.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
    }
  };

  const renderPromptWithLinks = () => {
    const regex = /\[([^\]]+)\]/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(prompt)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {prompt.substring(lastIndex, match.index)}
          </span>
        );
      }

      const varName = match[1];
      const variable = variables.find(v => v.name === varName);
      const displayText = variable ? variable.label : varName;
      
      parts.push(
        <button
          key={`var-${match.index}`}
          type="button"
          onClick={() => handleVariableLinkClick(varName)}
          className="text-primary hover-elevate px-1 rounded"
          data-testid={`link-variable-${varName}`}
        >
          [{displayText}]
        </button>
      );

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < prompt.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {prompt.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : prompt;
  };

  const addOption = (varId: string) => {
    const input = newOptionInput[varId] || '';
    if (!input.trim()) return;

    const parts = input.split('|||');
    const visibleName = parts[0]?.trim() || '';
    const promptValue = parts[1]?.trim() || '';

    if (!visibleName || !promptValue) return;

    const variable = variables.find(v => v.id === varId);
    if (!variable) return;

    const newOption: SelectOption = {
      visibleName,
      promptValue
    };

    updateVariable(varId, {
      options: [...(variable.options || []), newOption]
    });

    setNewOptionInput({ ...newOptionInput, [varId]: '' });
  };

  const removeOption = (varId: string, index: number) => {
    const variable = variables.find(v => v.id === varId);
    if (!variable || !variable.options) return;

    const newOptions = variable.options.filter((_, i) => i !== index);
    updateVariable(varId, { options: newOptions });
  };

  const updateOption = (varId: string, index: number, field: 'visibleName' | 'promptValue', value: string) => {
    const variable = variables.find(v => v.id === varId);
    if (!variable || !variable.options) return;

    const newOptions = [...variable.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    updateVariable(varId, { options: newOptions });
  };

  const handleGenerate = async () => {
    if (openVariables.length > 0) {
      setUnsavedVariableDialog(true);
      return;
    }

    const previewText = renderPreviewWithDefaults();
    if (!previewText.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Prompt ein.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await apiRequest('POST', '/api/generate-image', { prompt: previewText });
      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      toast({
        title: "Generierung abgeschlossen",
        description: "Ihr Bild wurde erfolgreich generiert."
      });
    } catch (error: any) {
      toast({
        title: "Generierung fehlgeschlagen",
        description: error.message || "Fehler bei der Bildgenerierung.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const proceedWithGenerate = async () => {
    setUnsavedVariableDialog(false);
    setOpenVariables([]);
    const previewText = renderPreviewWithDefaults();
    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const response = await apiRequest('POST', '/api/generate-image', { prompt: previewText });
      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      toast({
        title: "Generierung abgeschlossen",
        description: "Ihr Bild wurde erfolgreich generiert."
      });
    } catch (error: any) {
      toast({
        title: "Generierung fehlgeschlagen",
        description: error.message || "Fehler bei der Bildgenerierung.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const savePromptMutation = useMutation({
    mutationFn: async () => {
      let savedPrompt;
      
      const promptData = {
        title: promptTitle,
        content: prompt,
        userId: null,
        category,
        tags,
        aiModel,
        price: Math.round(price * 10000),
        aspectRatio,
        photoCount,
        promptType,
        uploadedPhotos
      };
      
      if (currentPromptId) {
        const response = await apiRequest('PATCH', `/api/prompts/${currentPromptId}`, promptData);
        savedPrompt = await response.json();
        
        const existingVarsResponse = await fetch(`/api/prompts/${currentPromptId}/variables`);
        const existingVars = await existingVarsResponse.json();
        
        for (const existingVar of existingVars) {
          await apiRequest('DELETE', `/api/variables/${existingVar.id}`, {});
        }
      } else {
        const response = await apiRequest('POST', '/api/prompts', promptData);
        savedPrompt = await response.json();
      }

      for (const variable of variables) {
        const variableData: Record<string, any> = {
          promptId: savedPrompt.id,
          name: variable.name,
          label: variable.label,
          description: variable.description || null,
          type: variable.type,
          defaultValue: variable.defaultValue,
          required: variable.required,
          position: variable.position,
          min: variable.min ?? null,
          max: variable.max ?? null,
          options: variable.options ?? null
        };

        await apiRequest('POST', '/api/variables', variableData);
      }

      setCurrentPromptId(savedPrompt.id);
      return savedPrompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/prompts'] });
      toast({
        title: "Gespeichert",
        description: "Ihr Prompt wurde erfolgreich gespeichert."
      });
    },
    onError: (error) => {
      console.error('Save error:', error);
      toast({
        title: "Fehler",
        description: "Beim Speichern ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = () => {
    savePromptMutation.mutate();
  };

  const loadPrompt = async (promptId: string) => {
    try {
      const promptResponse = await fetch(`/api/prompts/${promptId}`);
      const promptData = await promptResponse.json();
      
      const variablesResponse = await fetch(`/api/prompts/${promptId}/variables`);
      const variablesData = await variablesResponse.json();
      
      setCurrentPromptId(promptId);
      setPromptTitle(promptData.title);
      setPrompt(promptData.content);
      setCategory(promptData.category || '');
      setTags(promptData.tags || []);
      setAiModel(promptData.aiModel || 'gemini');
      setPrice((promptData.price || 1) / 10000);
      setAspectRatio(promptData.aspectRatio || null);
      setPhotoCount(promptData.photoCount || 1);
      setPromptType(promptData.promptType || 'create-now');
      setUploadedPhotos(promptData.uploadedPhotos || []);
      
      setVariables(variablesData.map((v: any) => ({
        id: v.id,
        name: v.name,
        label: v.label,
        description: v.description || '',
        type: v.type,
        defaultValue: v.defaultValue,
        required: v.required,
        position: v.position,
        min: v.min,
        max: v.max,
        options: v.options
      })));
      setOpenVariables([]);
      setShowLoadDialog(false);
      
      toast({
        title: "Geladen",
        description: "Prompt wurde erfolgreich geladen."
      });
    } catch (error) {
      console.error('Load error:', error);
      toast({
        title: "Fehler",
        description: "Beim Laden ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  };

  const newPrompt = () => {
    setCurrentPromptId(null);
    setPromptTitle("Untitled Prompt");
    setPrompt("");
    setVariables([]);
    setOpenVariables([]);
  };

  const settingsData = {
    title: promptTitle,
    category,
    tags,
    aiModel,
    price,
    aspectRatio,
    photoCount,
    promptType,
    uploadedPhotos
  };

  const handleSettingsUpdate = (updates: Partial<typeof settingsData>) => {
    if (updates.title !== undefined) setPromptTitle(updates.title);
    if (updates.category !== undefined) setCategory(updates.category);
    if (updates.tags !== undefined) setTags(updates.tags);
    if (updates.aiModel !== undefined) setAiModel(updates.aiModel);
    if (updates.price !== undefined) setPrice(updates.price);
    if (updates.aspectRatio !== undefined) setAspectRatio(updates.aspectRatio);
    if (updates.photoCount !== undefined) setPhotoCount(updates.photoCount);
    if (updates.promptType !== undefined) setPromptType(updates.promptType);
    if (updates.uploadedPhotos !== undefined) setUploadedPhotos(updates.uploadedPhotos);
  };

  const renderPreviewWithDefaults = () => {
    let previewText = prompt;
    
    variables.forEach(variable => {
      const placeholder = `[${variable.name}]`;
      let defaultDisplay = '';
      
      if (variable.type === 'text') {
        defaultDisplay = (variable.defaultValue as string) || '';
      } else if (variable.type === 'checkbox') {
        defaultDisplay = (variable.defaultValue as boolean) ? variable.label : '';
      } else if (variable.type === 'multi-select' || variable.type === 'single-select') {
        const firstOption = variable.options?.[0];
        defaultDisplay = firstOption?.promptValue || '';
      } else if (variable.type === 'slider') {
        defaultDisplay = String(variable.defaultValue || variable.min || 0);
      }
      
      previewText = previewText.replace(new RegExp(`\\[${variable.name}\\]`, 'g'), defaultDisplay);
    });
    
    return previewText;
  };

  return (
    <TooltipProvider>
      <div className="h-[calc(100vh-10rem)] grid grid-cols-[minmax(200px,_0.75fr)_minmax(350px,_2fr)_minmax(250px,_1.25fr)_minmax(280px,_1.5fr)] gap-2">
        {/* Settings Panel */}
        <PromptSettingsPanel 
          settings={settingsData}
          onUpdate={handleSettingsUpdate}
        />

        {/* Editor Panel */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Prompt Editor</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-2">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onSelect={handleTextSelection}
              className="flex-1 font-mono text-sm resize-none min-h-[200px]"
              placeholder="Schreibe deinen Prompt hier... Nutze [VariableName] für Variablen"
              data-testid="textarea-prompt"
            />
            
            <div className="flex flex-wrap gap-1">
              {selectedText && selectionRange && (
                <Button
                  size="sm"
                  onClick={createVariableFromSelection}
                  data-testid="button-create-variable"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Variable
                </Button>
              )}
              
              {variables.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-xs text-muted-foreground">Variablen:</span>
                  {variables.map((variable) => (
                    <Badge
                      key={variable.id}
                      className="text-xs cursor-pointer hover-elevate bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded-full px-2.5 py-0.5"
                      onClick={() => {
                        setOpenVariables([...openVariables, variable.id]);
                        const element = document.getElementById(`variable-${variable.id}`);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                      data-testid={`badge-variable-link-${variable.id}`}
                    >
                      [{variable.name}]
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Card className="p-2">
              <h4 className="text-xs font-medium mb-1.5">Vorschau</h4>
              <div className="font-mono text-xs whitespace-pre-wrap break-words text-muted-foreground">
                {renderPreviewWithDefaults()}
              </div>
            </Card>
          </CardContent>
        </Card>

        {/* Variables Panel */}
        <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-base">Variablen</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              <ScrollArea className="h-full pr-4">
                {variables.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Keine Variablen vorhanden.
                    <br />
                    Markiere Text oder nutze [Name]
                  </p>
                ) : (
                  <Accordion type="multiple" value={openVariables} onValueChange={setOpenVariables}>
                    {variables.map((variable) => (
                      <AccordionItem 
                        key={variable.id} 
                        value={variable.id}
                        id={`variable-${variable.id}`}
                      >
                        <AccordionTrigger className="hover-elevate px-2 rounded" data-testid={`accordion-trigger-${variable.id}`}>
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-sm font-medium">{variable.label}</span>
                            <Badge variant="outline" className="text-xs">{variable.type}</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-1.5 pt-1 space-y-1">
                          <div className="flex items-start gap-1">
                            <div className="flex-1">
                              <Label className="text-xs">Label</Label>
                              <Input
                                value={variable.label}
                                onChange={(e) => updateVariable(variable.id, { label: e.target.value })}
                                className="h-7 text-xs mt-0.5"
                                placeholder="Label"
                                disabled={promptType === 'showcase'}
                                data-testid={`input-label-${variable.id}`}
                              />
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 mt-4">
                                  <HelpCircle className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="w-64">
                                <Textarea
                                  value={variable.description}
                                  onChange={(e) => updateVariable(variable.id, { description: e.target.value })}
                                  placeholder="Beschreibung hinzufügen..."
                                  className="min-h-[60px] text-xs"
                                  disabled={promptType === 'showcase'}
                                  data-testid={`input-description-${variable.id}`}
                                />
                              </TooltipContent>
                            </Tooltip>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 mt-4"
                              onClick={() => deleteVariable(variable.id)}
                              disabled={promptType === 'showcase'}
                              data-testid={`button-delete-${variable.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>

                          <div className="space-y-0">
                            <Label className="text-xs">Interner Name</Label>
                            <Badge variant="secondary" className="text-xs font-mono">
                              {variable.name}
                            </Badge>
                          </div>

                          <div className="space-y-0">
                            <Label className="text-xs">Typ</Label>
                            <Select
                              value={variable.type}
                              onValueChange={(value) => updateVariable(variable.id, { type: value as VariableType })}
                              disabled={promptType === 'showcase'}
                            >
                              <SelectTrigger className="h-7 text-xs" data-testid={`select-type-${variable.id}`}>
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
                            <div className="space-y-0">
                              <Label className="text-xs">Default-Wert</Label>
                              <Textarea
                                value={variable.defaultValue as string}
                                onChange={(e) => updateVariable(variable.id, { defaultValue: e.target.value })}
                                placeholder="Default-Wert"
                                className="min-h-8 text-xs resize-y"
                                disabled={promptType === 'showcase'}
                                data-testid={`input-default-${variable.id}`}
                              />
                            </div>
                          )}

                          {variable.type === 'checkbox' && (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`checkbox-${variable.id}`}
                                checked={variable.defaultValue as boolean}
                                onCheckedChange={(checked) => updateVariable(variable.id, { defaultValue: checked })}
                                disabled={promptType === 'showcase'}
                                data-testid={`checkbox-default-${variable.id}`}
                              />
                              <Label htmlFor={`checkbox-${variable.id}`} className="text-xs">
                                Standardmäßig aktiv
                              </Label>
                            </div>
                          )}

                          {(variable.type === 'multi-select' || variable.type === 'single-select') && (
                            <div className="space-y-1">
                              <Label className="text-xs">Optionen</Label>
                              <div className="space-y-1">
                                {variable.options?.map((option, index) => (
                                  <Card key={index} className="p-1.5">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1">
                                        <div className="flex-1">
                                          <Label className="text-xs">Sichtbarer Name</Label>
                                          <Input
                                            value={option.visibleName}
                                            onChange={(e) => updateOption(variable.id, index, 'visibleName', e.target.value)}
                                            className="h-7 text-xs mt-0.5"
                                            placeholder="Sichtbarer Name"
                                            disabled={promptType === 'showcase'}
                                            data-testid={`input-option-visible-${variable.id}-${index}`}
                                          />
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 mt-4"
                                          onClick={() => removeOption(variable.id, index)}
                                          disabled={promptType === 'showcase'}
                                          data-testid={`button-remove-option-${variable.id}-${index}`}
                                        >
                                          <X className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                      <div>
                                        <Label className="text-xs">Prompt-Wert</Label>
                                        <Textarea
                                          value={option.promptValue}
                                          onChange={(e) => updateOption(variable.id, index, 'promptValue', e.target.value)}
                                          className="min-h-[50px] text-xs mt-0.5 resize-y"
                                          placeholder="Prompt-Wert"
                                          disabled={promptType === 'showcase'}
                                          data-testid={`input-option-prompt-${variable.id}-${index}`}
                                        />
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                                
                                <Card className="p-1.5 bg-muted/50">
                                  <div className="space-y-1">
                                    <div>
                                      <Label className="text-xs">Sichtbarer Name</Label>
                                      <Input
                                        value={newOptionInput[variable.id]?.split('|||')[0] || ''}
                                        onChange={(e) => {
                                          const currentValue = newOptionInput[variable.id] || '|||';
                                          const parts = currentValue.split('|||');
                                          setNewOptionInput({
                                            ...newOptionInput,
                                            [variable.id]: `${e.target.value}|||${parts[1] || ''}`
                                          });
                                        }}
                                        placeholder="z.B. Professional"
                                        className="h-7 text-xs mt-0.5"
                                        disabled={promptType === 'showcase'}
                                        data-testid={`input-new-option-visible-${variable.id}`}
                                      />
                                    </div>
                                    <div>
                                      <Label className="text-xs">Prompt-Wert</Label>
                                      <Textarea
                                        value={newOptionInput[variable.id]?.split('|||')[1] || ''}
                                        onChange={(e) => {
                                          const currentValue = newOptionInput[variable.id] || '|||';
                                          const parts = currentValue.split('|||');
                                          setNewOptionInput({
                                            ...newOptionInput,
                                            [variable.id]: `${parts[0] || ''}|||${e.target.value}`
                                          });
                                        }}
                                        placeholder="z.B. professional, detailed"
                                        className="min-h-[50px] text-xs mt-0.5 resize-y"
                                        disabled={promptType === 'showcase'}
                                        data-testid={`input-new-option-prompt-${variable.id}`}
                                      />
                                    </div>
                                    <Button
                                      size="sm"
                                      onClick={() => addOption(variable.id)}
                                      className="w-full"
                                      disabled={promptType === 'showcase' || !newOptionInput[variable.id]?.split('|||').every(p => p.trim())}
                                      data-testid={`button-add-option-${variable.id}`}
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Option hinzufügen
                                    </Button>
                                  </div>
                                </Card>
                              </div>
                            </div>
                          )}

                          {variable.type === 'slider' && (
                            <div className="space-y-1">
                              <div className="grid grid-cols-2 gap-1.5">
                                <div className="space-y-0">
                                  <Label className="text-xs">Min</Label>
                                  <Input
                                    type="number"
                                    value={variable.min || 0}
                                    onChange={(e) => updateVariable(variable.id, { min: parseInt(e.target.value) })}
                                    className="h-7 text-xs"
                                    disabled={promptType === 'showcase'}
                                    data-testid={`input-min-${variable.id}`}
                                  />
                                </div>
                                <div className="space-y-0">
                                  <Label className="text-xs">Max</Label>
                                  <Input
                                    type="number"
                                    value={variable.max || 100}
                                    onChange={(e) => updateVariable(variable.id, { max: parseInt(e.target.value) })}
                                    className="h-7 text-xs"
                                    disabled={promptType === 'showcase'}
                                    data-testid={`input-max-${variable.id}`}
                                  />
                                </div>
                              </div>
                              <div className="space-y-0">
                                <Label className="text-xs">Default: {variable.defaultValue as number}</Label>
                                <Slider
                                  value={[variable.defaultValue as number || 0]}
                                  onValueChange={([value]) => updateVariable(variable.id, { defaultValue: value })}
                                  min={variable.min || 0}
                                  max={variable.max || 100}
                                  step={1}
                                  disabled={promptType === 'showcase'}
                                  data-testid={`slider-default-${variable.id}`}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-2 pt-1 border-t">
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
                          
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              handleSubmit();
                              setOpenVariables(openVariables.filter(id => id !== variable.id));
                            }}
                            disabled={savePromptMutation.isPending}
                            className="w-full mt-2"
                            data-testid={`button-save-variable-${variable.id}`}
                          >
                            {savePromptMutation.isPending ? 'Speichere...' : 'Speichern'}
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

        {/* Generation Panel */}
        <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Generierung</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-2">
              {generatedImage ? (
                <div className="flex-1 flex flex-col">
                  <img 
                    src={generatedImage} 
                    alt="Generated by Gemini" 
                    className="w-full h-auto rounded-md border"
                    data-testid="generated-image"
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-muted-foreground text-sm">
                  Kein generiertes Bild vorhanden.
                  <br />
                  Klicke auf Generieren.
                </div>
              )}
              
              <div className="space-y-2 mt-auto">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full"
                  data-testid="button-generate"
                >
                  {isGenerating ? 'Generiere...' : 'Generieren'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSubmit}
                  disabled={isGenerating || savePromptMutation.isPending}
                  className="w-full"
                  data-testid="button-submit"
                >
                  {savePromptMutation.isPending ? 'Speichere...' : 'Speichern'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowLoadDialog(true)}
                  className="w-full"
                  data-testid="button-load"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Laden
                </Button>
              </div>
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
            <AlertDialogCancel data-testid="button-cancel-delete">Nein</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteVariable} data-testid="button-confirm-delete">
              Ja, löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={unsavedVariableDialog} onOpenChange={setUnsavedVariableDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ungespeicherte Variablen</AlertDialogTitle>
            <AlertDialogDescription>
              Sie haben offene Variablen mit möglicherweise ungespeicherten Änderungen. Möchten Sie trotzdem generieren?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-generate">Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={proceedWithGenerate} data-testid="button-proceed-generate">
              Generieren
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Prompt laden</AlertDialogTitle>
            <AlertDialogDescription>
              Wählen Sie einen gespeicherten Prompt, um ihn zu laden und zu bearbeiten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-2 p-1">
              {savedPrompts && savedPrompts.length > 0 ? (
                savedPrompts.map((p: any) => (
                  <Button
                    key={p.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => loadPrompt(p.id)}
                    data-testid={`button-load-prompt-${p.id}`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{p.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Kürzlich'}
                      </span>
                    </div>
                  </Button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Keine gespeicherten Prompts gefunden.
                </p>
              )}
            </div>
          </ScrollArea>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-load">Abbrechen</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
