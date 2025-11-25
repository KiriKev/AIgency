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
import { Plus, Trash2, HelpCircle, X, FolderOpen, Settings, FileText, Sparkles, List, ArrowLeft } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
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
  defaultOptionIndex?: number;
}

interface PromptEditorProps {
  onBack?: () => void;
}

export default function PromptEditor({ onBack }: PromptEditorProps = {}) {
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  const [promptTitle, setPromptTitle] = useState("");
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
  const [resolution, setResolution] = useState<string | null>(null);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number } | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: savedPrompts = [] } = useQuery<any[]>({
    queryKey: ['/api/prompts'],
    enabled: showLoadDialog
  });

  const getCaretCoordinates = (element: HTMLTextAreaElement, position: number) => {
    // Create mirror div
    const div = document.createElement('div');
    const style = window.getComputedStyle(element);
    const properties = [
      'fontFamily', 'fontSize', 'fontWeight', 'letterSpacing', 'lineHeight',
      'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'borderWidth', 'borderStyle', 'borderLeftWidth', 'borderRightWidth',
      'borderTopWidth', 'borderBottomWidth', 'boxSizing', 'wordWrap', 
      'whiteSpace', 'width', 'height'
    ];
    
    properties.forEach(prop => {
      div.style[prop as any] = style[prop as any];
    });
    
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.top = '0';
    div.style.left = '0';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.overflowWrap = 'break-word';
    div.style.overflow = 'hidden';
    
    document.body.appendChild(div);
    
    // Set text up to caret position
    const textBeforeCaret = element.value.substring(0, position);
    div.textContent = textBeforeCaret;
    
    // Add a span to measure caret position
    const span = document.createElement('span');
    span.textContent = '|';
    div.appendChild(span);
    
    const coordinates = {
      top: span.offsetTop,
      left: span.offsetLeft,
      height: span.offsetHeight
    };
    
    document.body.removeChild(div);
    
    return coordinates;
  };

  const updateButtonPosition = useCallback(() => {
    if (!textareaRef.current || !selectionRange) {
      setButtonPosition(null);
      return;
    }
    
    // Get accurate caret position within textarea
    const coords = getCaretCoordinates(textareaRef.current, selectionRange.end);
    const textarea = textareaRef.current;
    
    // Position RELATIVE to textarea (for absolute positioning within parent)
    // Add padding offset (px-3 py-[11px] on textarea = 12px left, 11px top)
    let top = coords.top + coords.height + 11 + 8; // +8 for spacing below text
    let left = coords.left + 12; // Account for px-3 padding
    
    // Make sure button doesn't overflow the container
    const containerWidth = textarea.clientWidth;
    const buttonWidth = 120; // Increased for "+ Variable" text
    
    // Keep button within bounds with padding
    if (left + buttonWidth > containerWidth - 12) {
      left = Math.max(12, containerWidth - buttonWidth - 12);
    }
    
    // Also check if it goes off left edge
    if (left < 12) {
      left = 12;
    }
    
    setButtonPosition({ top, left });
  }, [selectionRange]);

  const handleTextSelection = () => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = prompt.substring(start, end);
    
    // Always clear previous selection first
    if (!selected || selected.trim().length === 0 || start === end) {
      setSelectedText("");
      setSelectionRange(null);
      setButtonPosition(null);
      return;
    }
    
    const isInsideVariable = checkIfInsideVariable(start, end);
    if (!isInsideVariable) {
      setSelectedText(selected);
      setSelectionRange({ start, end });
    } else {
      setSelectedText("");
      setSelectionRange(null);
      setButtonPosition(null);
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

  const createNewEmptyVariable = () => {
    const baseVarName = "NewVariable";
    let counter = 1;
    let varName = baseVarName;
    
    // Find a unique name
    while (variables.some(v => v.name === varName)) {
      varName = `${baseVarName}${counter}`;
      counter++;
    }
    
    const newVariable: Variable = {
      id: varName,
      name: varName,
      label: varName,
      description: '',
      type: 'text',
      defaultValue: '',
      required: false,
      position: variables.length
    };
    
    setVariables([...variables, newVariable]);
    setOpenVariables([varName]);
    
    // Add the variable placeholder to the prompt
    const varPlaceholder = `[${varName}]`;
    const currentPos = textareaRef.current?.selectionStart || prompt.length;
    const newPrompt = 
      prompt.substring(0, currentPos) + 
      (prompt.length > 0 && currentPos > 0 && prompt[currentPos - 1] !== ' ' ? ' ' : '') +
      varPlaceholder + 
      ' ' + 
      prompt.substring(currentPos);
    setPrompt(newPrompt);
    
    // Focus and move cursor after the variable
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = currentPos + varPlaceholder.length + (prompt.length > 0 && currentPos > 0 && prompt[currentPos - 1] !== ' ' ? 2 : 1);
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 100);
    
    // Open variable editor overlay on mobile
    setEditingVariableId(varName);
    setShowVariableEditor(true);
    
    toast({
      title: "Variable erstellt",
      description: `Variable "${varName}" wurde zum Prompt hinzugefügt.`,
    });
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
    
    // Open variable editor overlay on mobile
    setEditingVariableId(varName);
    setShowVariableEditor(true);
    
    const newPrompt = 
      prompt.substring(0, selectionRange.start) + 
      varPlaceholder + 
      prompt.substring(selectionRange.end);
    setPrompt(newPrompt);
    
    // Move cursor to after the variable (right after the closing bracket)
    const newCursorPos = selectionRange.start + varPlaceholder.length;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 100);
    
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

  // Update button position when selection changes
  useEffect(() => {
    if (selectionRange && textareaRef.current) {
      updateButtonPosition();
    }
  }, [selectionRange, updateButtonPosition]);

  // Update button position on scroll
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const handleScroll = () => {
      if (selectionRange) {
        updateButtonPosition();
      }
    };
    
    textarea.addEventListener('scroll', handleScroll);
    return () => textarea.removeEventListener('scroll', handleScroll);
  }, [selectionRange, updateButtonPosition]);

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
        uploadedPhotos,
        resolution
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
    // Validate required fields
    if (!promptTitle.trim() || !category.trim() || tags.length === 0 || !aspectRatio) {
      setShowValidationDialog(true);
      return;
    }
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
      setResolution(promptData.resolution || null);
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
    setPromptTitle("");
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
    uploadedPhotos,
    resolution
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
    if (updates.resolution !== undefined) setResolution(updates.resolution);
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
        const defaultIndex = variable.defaultOptionIndex ?? 0;
        const defaultOption = variable.options?.[defaultIndex];
        defaultDisplay = defaultOption?.promptValue || '';
      } else if (variable.type === 'slider') {
        defaultDisplay = String(variable.defaultValue || variable.min || 0);
      }
      
      // Use split/join instead of RegExp to avoid issues with special characters in variable names
      previewText = previewText.split(placeholder).join(defaultDisplay);
    });
    
    return previewText;
  };

  const [mobileTab, setMobileTab] = useState<'settings' | 'editor' | 'generation'>('settings');
  const [showVariableEditor, setShowVariableEditor] = useState(false);
  const [editingVariableId, setEditingVariableId] = useState<string | null>(null);
  const scrollYRef = useRef(0);
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  // Lock mobile container scroll when variable editor overlay is open
  useEffect(() => {
    const mobileContainer = mobileContainerRef.current;
    if (!mobileContainer) return;

    if (showVariableEditor) {
      // Save current scroll position of the mobile container
      const scrollY = mobileContainer.scrollTop;
      scrollYRef.current = scrollY;
      // Lock the mobile container's vertical scroll
      mobileContainer.style.overflowY = 'hidden';
    } else {
      // Restore mobile container scroll
      const savedScroll = scrollYRef.current;
      mobileContainer.style.overflowY = 'auto';
      // Use requestAnimationFrame to ensure DOM has updated before setting scroll
      requestAnimationFrame(() => {
        if (mobileContainer) {
          mobileContainer.scrollTop = savedScroll;
        }
      });
      scrollYRef.current = 0;
    }
    
    // Cleanup on unmount - always restore overflow
    return () => {
      if (mobileContainer) {
        mobileContainer.style.overflowY = 'auto';
      }
    };
  }, [showVariableEditor]);

  return (
    <TooltipProvider>
      {/* Desktop View */}
      <div className="hidden lg:grid h-[calc(100vh-6rem)] grid-cols-[minmax(200px,_0.75fr)_minmax(350px,_2fr)_minmax(250px,_1.25fr)_minmax(280px,_1.5fr)] gap-1">
        {/* Settings Panel */}
        <PromptSettingsPanel 
          settings={settingsData}
          onUpdate={handleSettingsUpdate}
        />

        {/* Editor Panel */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="pb-2 px-3 shrink-0 flex flex-row items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">Prompt Editor</CardTitle>
            <Button
              onClick={createNewEmptyVariable}
              size="sm"
              variant="default"
              className="shrink-0"
              data-testid="button-add-variable-desktop"
            >
              <Plus className="h-3 w-3 mr-1" />
              Variable
            </Button>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 flex flex-col gap-2 px-3 pb-3">
            <div 
              className="relative flex-1 border border-border rounded-md min-h-[200px] max-h-[400px] overflow-auto" 
              onClick={() => textareaRef.current?.focus()}
            >
              <div 
                className="absolute inset-0 font-mono text-sm whitespace-pre-wrap pointer-events-none select-none"
                style={{ 
                  wordBreak: 'break-word', 
                  overflowWrap: 'anywhere',
                  padding: '8px 12px',
                  lineHeight: '1.625',
                  boxSizing: 'border-box'
                }}
              >
                {prompt.split(/(\[[^\]]+\])/).map((part, index) => {
                  const match = part.match(/\[([^\]]+)\]/);
                  if (match) {
                    const varName = match[1];
                    const variable = variables.find(v => v.name === varName);
                    if (variable) {
                      return (
                        <span key={index} className="select-none text-teal-400 dark:text-teal-300 cursor-pointer pointer-events-auto"
                          onClick={(e) => {
                            e.preventDefault();
                            setOpenVariables([...openVariables, variable.id]);
                            const element = document.getElementById(`variable-${variable.id}`);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }}
                          onMouseDown={(e) => e.preventDefault()}
                          data-testid={`badge-inline-variable-${variable.id}`}
                        >[{varName}]</span>
                      );
                    }
                  }
                  return <span key={index} className="select-none">{part}</span>;
                })}
              </div>
              <Textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onSelect={handleTextSelection}
                onMouseUp={handleTextSelection}
                onKeyUp={(e) => {
                  if (e.shiftKey) handleTextSelection();
                }}
                onKeyDown={(e) => {
                  if (!textareaRef.current) return;
                  const pos = textareaRef.current.selectionStart;
                  
                  // Check if cursor is inside a variable
                  const beforeCursor = prompt.substring(0, pos);
                  const afterCursor = prompt.substring(pos);
                  
                  const openBracketBefore = beforeCursor.lastIndexOf('[');
                  const closeBracketBefore = beforeCursor.lastIndexOf(']');
                  const closeBracketAfter = afterCursor.indexOf(']');
                  
                  // If cursor is inside [variable]
                  if (openBracketBefore > closeBracketBefore && closeBracketAfter !== -1) {
                    const newPos = pos + closeBracketAfter + 1;
                    e.preventDefault();
                    textareaRef.current.setSelectionRange(newPos, newPos);
                  }
                }}
                onClick={(e) => {
                  if (!textareaRef.current) return;
                  setTimeout(() => {
                    if (!textareaRef.current) return;
                    const pos = textareaRef.current.selectionStart;
                    
                    // Find if cursor is inside a variable
                    const beforeCursor = prompt.substring(0, pos);
                    const afterCursor = prompt.substring(pos);
                    
                    const openBracketBefore = beforeCursor.lastIndexOf('[');
                    const closeBracketBefore = beforeCursor.lastIndexOf(']');
                    const closeBracketAfter = afterCursor.indexOf(']');
                    
                    // If cursor is inside [variable]
                    if (openBracketBefore > closeBracketBefore && closeBracketAfter !== -1) {
                      // Move cursor to after the ]
                      const newPos = pos + closeBracketAfter + 1;
                      textareaRef.current.setSelectionRange(newPos, newPos);
                    }
                  }, 0);
                }}
                className="absolute inset-0 font-mono text-sm bg-transparent text-transparent caret-foreground z-10 selection:bg-primary/30 whitespace-pre-wrap border-0 shadow-none ring-0 focus:ring-0 focus:outline-none focus-visible:ring-0 rounded-none"
                style={{ 
                  wordBreak: 'break-word', 
                  overflowWrap: 'anywhere',
                  resize: 'none',
                  padding: '8px 12px',
                  lineHeight: '1.625',
                  boxSizing: 'border-box'
                }}
                placeholder="Schreibe deinen Prompt hier... Nutze [VariableName] für Variablen"
                data-testid="textarea-prompt"
              />
              
              {/* Floating "+ Variable" button - positioned relative to textarea */}
              {selectedText && selectionRange && buttonPosition && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    createVariableFromSelection();
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="absolute z-[9999] shadow-xl cursor-pointer bg-primary text-primary-foreground border-2 border-background"
                  style={{
                    top: `${buttonPosition.top}px`,
                    left: `${buttonPosition.left}px`,
                    pointerEvents: 'all'
                  }}
                  data-testid="button-create-variable"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Variable
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-1">
              {variables.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  <span className="text-xs text-foreground">Variablen:</span>
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

            <Card className="p-2 shrink-0">
              <h4 className="text-xs font-medium mb-1.5">Vorschau</h4>
              <div className="font-mono text-xs whitespace-pre-wrap break-words text-foreground max-h-[150px] overflow-y-auto">
                {renderPreviewWithDefaults()}
              </div>
            </Card>
          </CardContent>
        </Card>

        {/* Variables Panel */}
        <Card className="flex flex-col overflow-hidden" id="desktop-variables-panel">
            <CardHeader className="pb-2 px-3 shrink-0">
              <CardTitle className="text-base">Variablen</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 px-3 pb-3">
              <ScrollArea className="h-full pr-4">
                {variables.length === 0 ? (
                  <p className="text-sm text-foreground text-center py-8">
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
                              <Label className="text-xs text-white">Label</Label>
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
                            <Label className="text-xs text-white">Interner Name</Label>
                            <Badge variant="secondary" className="text-xs font-mono">
                              {variable.name}
                            </Badge>
                          </div>

                          <div className="space-y-0">
                            <Label className="text-xs text-white">Typ</Label>
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
                              <Label className="text-xs text-white">Default-Wert</Label>
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
                              <Label htmlFor={`checkbox-${variable.id}`} className="text-xs text-white">
                                Standardmäßig aktiv
                              </Label>
                            </div>
                          )}

                          {(variable.type === 'multi-select' || variable.type === 'single-select') && (
                            <div className="space-y-1">
                              <div className="grid grid-cols-2 gap-2">
                                <Label className="text-xs text-white">Optionen</Label>
                                <Label className="text-xs text-white text-right">Default</Label>
                              </div>
                              <div className="space-y-1">
                                {variable.options?.map((option, index) => {
                                  const isDefault = (variable.defaultOptionIndex ?? 0) === index;
                                  return (
                                  <Card key={index} className={`p-1.5 ${isDefault ? 'border-teal-500/50 bg-teal-500/5' : ''}`}>
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1">
                                        <div className="flex flex-col items-center gap-0.5 mt-4">
                                          <Checkbox
                                            checked={isDefault}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                updateVariable(variable.id, { defaultOptionIndex: index });
                                              }
                                            }}
                                            disabled={promptType === 'showcase'}
                                            data-testid={`checkbox-default-option-${variable.id}-${index}`}
                                          />
                                          {isDefault && <span className="text-[9px] text-teal-600 dark:text-teal-400 font-medium">Default</span>}
                                        </div>
                                        <div className="flex-1">
                                          <Label className="text-xs text-white">Sichtbarer Name</Label>
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
                                        <Label className="text-xs text-white">Prompt-Wert</Label>
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
                                  );
                                })}
                                
                                <Card className="p-1.5 bg-muted/50">
                                  <div className="space-y-1">
                                    <div>
                                      <Label className="text-xs text-white">Sichtbarer Name</Label>
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
                                      <Label className="text-xs text-white">Prompt-Wert</Label>
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
                                  <Label className="text-xs text-white">Min</Label>
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
                                  <Label className="text-xs text-white">Max</Label>
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
                                <Label className="text-xs text-white">Default: {variable.defaultValue as number}</Label>
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

                          <div className="flex items-center space-x-2 pt-1">
                            <Checkbox
                              id={`required-${variable.id}`}
                              checked={variable.required}
                              onCheckedChange={(checked) => updateVariable(variable.id, { required: checked as boolean })}
                              data-testid={`checkbox-required-${variable.id}`}
                            />
                            <Label htmlFor={`required-${variable.id}`} className="text-xs text-white">
                              Pflichtfeld
                            </Label>
                          </div>
                          
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setOpenVariables(openVariables.filter(id => id !== variable.id));
                            }}
                            className="w-full mt-2"
                            data-testid={`button-save-variable-${variable.id}`}
                          >
                            Fertig
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
        <Card className="flex flex-col overflow-hidden">
            <CardHeader className="pb-2 px-3 shrink-0">
              <CardTitle className="text-sm">Generierung</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 flex flex-col gap-2 px-3 pb-3">
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
                <div className="flex-1 flex items-center justify-center text-center text-foreground text-sm">
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
                  {savePromptMutation.isPending ? 'Releasing...' : 'Release'}
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

      {/* Mobile View */}
      <div ref={mobileContainerRef} className="lg:hidden flex flex-col h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden w-full max-w-full">
        {/* Header - inside scrollable area */}
        <div className="shrink-0 flex items-center gap-4 px-6 py-4 border-b w-full max-w-full overflow-x-hidden">
          {onBack && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBack}
              data-testid="button-back"
              className="text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück
            </Button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-foreground truncate">Create Prompt Template</h1>
            <p className="text-xs text-foreground truncate">
              Design reusable prompt templates with customizable variables
            </p>
          </div>
        </div>

        {mobileTab === 'settings' && (
          <div className="w-full max-w-full overflow-x-hidden">
            <PromptSettingsPanel 
              settings={settingsData}
              onUpdate={handleSettingsUpdate}
              useScrollArea={false}
            />
          </div>
        )}

        {mobileTab === 'editor' && (
            <div className="flex flex-col w-full max-w-full overflow-x-hidden">
              {/* Sticky Toolbar with Variables Button */}
              <div className="sticky top-0 z-10 bg-background border-b px-3 py-2 flex items-center justify-end w-full max-w-full shrink-0">
                <Button
                  onClick={() => {
                    setEditingVariableId(null);
                    setShowVariableEditor(true);
                  }}
                  size="sm"
                  variant="outline"
                  className="bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20 hover:bg-teal-500/20"
                  data-testid="button-show-variables"
                >
                  <List className="h-4 w-4 mr-1" />
                  Variablen
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="px-3 pt-3 pb-3 w-full max-w-full overflow-x-hidden">
                <div className="relative min-h-[500px] w-full max-w-full overflow-visible border border-border rounded-md">
                  <div 
                    className="absolute inset-0 font-mono text-sm whitespace-pre-wrap pointer-events-none overflow-hidden select-none text-white"
                    style={{ 
                      wordBreak: 'break-word', 
                      overflowWrap: 'anywhere',
                      padding: '8px 12px',
                      lineHeight: '1.625',
                      boxSizing: 'border-box'
                    }}
                  >
                    {prompt.split(/(\[[^\]]+\])/).map((part, index) => {
                      const match = part.match(/\[([^\]]+)\]/);
                      if (match) {
                        const varName = match[1];
                        const variable = variables.find(v => v.name === varName);
                        if (variable) {
                          return (
                            <span key={index} className="select-none text-teal-400 dark:text-teal-300 cursor-pointer pointer-events-auto"
                              onClick={(e) => {
                                e.preventDefault();
                                setEditingVariableId(variable.id);
                                setShowVariableEditor(true);
                              }}
                              onMouseDown={(e) => e.preventDefault()}
                              data-testid={`badge-inline-variable-${variable.id}`}
                            >[{varName}]</span>
                          );
                        }
                      }
                      return <span key={index} className="select-none">{part}</span>;
                    })}
                  </div>

                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onSelect={handleTextSelection}
                    onClick={(e) => {
                      handleTextSelection();
                      setTimeout(() => {
                        const pos = textareaRef.current?.selectionStart ?? 0;
                        const regex = /\[([^\]]+)\]/g;
                        let match;
                        while ((match = regex.exec(prompt)) !== null) {
                          if (pos > match.index && pos < match.index + match[0].length) {
                            const newPos = match.index + match[0].length;
                            if (textareaRef.current) {
                              textareaRef.current.setSelectionRange(newPos, newPos);
                            }
                            break;
                          }
                        }
                      }, 0);
                    }}
                    onKeyUp={(e) => {
                      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                        const pos = textareaRef.current?.selectionStart ?? 0;
                        const regex = /\[([^\]]+)\]/g;
                        let match;
                        while ((match = regex.exec(prompt)) !== null) {
                          if (pos > match.index && pos < match.index + match[0].length) {
                            const newPos = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? match.index : match.index + match[0].length;
                            setTimeout(() => {
                              if (textareaRef.current) {
                                textareaRef.current.setSelectionRange(newPos, newPos);
                              }
                            }, 0);
                            break;
                          }
                        }
                      }
                    }}
                    placeholder="Schreiben Sie Ihren Prompt... Markieren Sie Text und erstellen Sie Variablen oder nutzen Sie [VariablenName] Syntax."
                    className="absolute inset-0 w-full font-mono text-sm resize-none bg-transparent text-transparent caret-white focus:outline-none focus:ring-0 border-0 shadow-none ring-0 focus-visible:ring-0 rounded-none whitespace-pre-wrap overflow-hidden selection:bg-primary/20"
                    style={{ 
                      wordBreak: 'break-word', 
                      overflowWrap: 'anywhere',
                      caretColor: 'white',
                      padding: '8px 12px',
                      lineHeight: '1.625',
                      boxSizing: 'border-box'
                    }}
                    data-testid="textarea-prompt"
                  />
                  {selectedText && selectionRange && buttonPosition && (
                    <Button
                      onClick={createVariableFromSelection}
                      variant="secondary"
                      size="sm"
                      className="absolute z-20 shadow-lg"
                      style={{
                        top: `${buttonPosition.top}px`,
                        left: `${buttonPosition.left}px`,
                      }}
                      data-testid="button-create-from-selection"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Variable erstellen: "{selectedText.slice(0, 20)}{selectedText.length > 20 ? '...' : ''}"
                    </Button>
                  )}
                </div>
              </div>
            </div>
        )}

        {mobileTab === 'generation' && (
          <div className="px-3 pt-3 pb-3 flex flex-col w-full max-w-full overflow-x-hidden">
            {generatedImage ? (
              <div className="flex-1 flex flex-col">
                <img 
                  src={generatedImage} 
                  alt="Generated" 
                  className="w-full h-auto rounded border object-contain"
                  data-testid="img-generated"
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-foreground text-sm">
                Noch kein Bild generiert
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
                {savePromptMutation.isPending ? 'Releasing...' : 'Release'}
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
          </div>
        )}

      {/* Editor Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background w-full max-w-full">
          <div className="grid grid-cols-3 w-full max-w-full">
            <Button
              variant={mobileTab === 'settings' ? 'default' : 'ghost'}
              onClick={() => setMobileTab('settings')}
              className="flex flex-col h-auto py-3 gap-1 rounded-none no-default-hover-elevate"
              data-testid="button-mobile-tab-settings"
            >
              <Settings className="h-5 w-5" />
              <span className="text-xs font-medium">Settings</span>
            </Button>
            <Button
              variant={mobileTab === 'editor' ? 'default' : 'ghost'}
              onClick={() => setMobileTab('editor')}
              className="flex flex-col h-auto py-3 gap-1 rounded-none no-default-hover-elevate"
              data-testid="button-mobile-tab-editor"
            >
              <FileText className="h-5 w-5" />
              <span className="text-xs font-medium">Prompt</span>
            </Button>
            <Button
              variant={mobileTab === 'generation' ? 'default' : 'ghost'}
              onClick={() => setMobileTab('generation')}
              className="flex flex-col h-auto py-3 gap-1 rounded-none no-default-hover-elevate"
              data-testid="button-mobile-tab-generation"
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-medium">Generate</span>
            </Button>
          </div>
        </div>

        {/* Variable Editor Overlay (Mobile) */}
        {showVariableEditor && (
          <div className="fixed inset-0 bg-background z-50 flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center justify-between p-4 border-b w-full max-w-full overflow-x-hidden">
              <h2 className="text-lg font-semibold text-foreground">Variablen</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowVariableEditor(false);
                  setEditingVariableId(null);
                }}
                className="text-foreground"
                data-testid="button-close-variables"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 w-full max-w-full overflow-x-hidden">
              <div className="p-4 space-y-2 w-full max-w-full overflow-x-hidden">
                {variables.length === 0 ? (
                  <p className="text-sm text-foreground text-center py-8">
                    Keine Variablen vorhanden.
                    <br />
                    Markiere Text oder nutze [Name]
                  </p>
                ) : (
                  <Accordion type="multiple" value={editingVariableId ? [editingVariableId] : openVariables} onValueChange={setOpenVariables}>
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
                        <AccordionContent className="px-1.5 pt-1 space-y-2 w-full max-w-full overflow-x-hidden">
                          <div className="space-y-2">
                            <Label className="text-xs text-white">Label</Label>
                            <Input
                              value={variable.label}
                              onChange={(e) => updateVariable(variable.id, { label: e.target.value })}
                              className="h-8 text-sm text-foreground"
                              placeholder="Label"
                              disabled={promptType === 'showcase'}
                              data-testid={`input-label-${variable.id}`}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs text-white">Beschreibung</Label>
                            <Textarea
                              value={variable.description}
                              onChange={(e) => updateVariable(variable.id, { description: e.target.value })}
                              placeholder="Beschreibung hinzufügen..."
                              className="min-h-[60px] text-sm text-foreground"
                              disabled={promptType === 'showcase'}
                              data-testid={`input-description-${variable.id}`}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs text-white">Interner Name</Label>
                            <Badge variant="secondary" className="text-xs font-mono">
                              {variable.name}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs text-white">Typ</Label>
                            <Select
                              value={variable.type}
                              onValueChange={(value) => updateVariable(variable.id, { type: value as VariableType })}
                              disabled={promptType === 'showcase'}
                            >
                              <SelectTrigger className="h-9 text-sm" data-testid={`select-type-${variable.id}`}>
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
                            <div className="space-y-2">
                              <Label className="text-xs text-white">Default-Wert</Label>
                              <Textarea
                                value={variable.defaultValue as string}
                                onChange={(e) => updateVariable(variable.id, { defaultValue: e.target.value })}
                                placeholder="Default-Wert"
                                className="min-h-[80px] text-sm"
                                disabled={promptType === 'showcase'}
                                data-testid={`input-default-${variable.id}`}
                              />
                            </div>
                          )}

                          {variable.type === 'checkbox' && (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`checkbox-mobile-${variable.id}`}
                                checked={variable.defaultValue as boolean}
                                onCheckedChange={(checked) => updateVariable(variable.id, { defaultValue: checked })}
                                disabled={promptType === 'showcase'}
                                data-testid={`checkbox-default-${variable.id}`}
                              />
                              <Label htmlFor={`checkbox-mobile-${variable.id}`} className="text-sm text-white">
                                Standardmäßig aktiv
                              </Label>
                            </div>
                          )}

                          {(variable.type === 'multi-select' || variable.type === 'single-select') && (
                            <div className="space-y-2">
                              <Label className="text-xs text-white">Optionen & Default</Label>
                              <div className="space-y-2">
                                {variable.options?.map((option, index) => {
                                  const isDefault = (variable.defaultOptionIndex ?? 0) === index;
                                  return (
                                    <Card key={index} className={`p-2 w-full max-w-full overflow-x-hidden ${isDefault ? 'border-teal-500/50 bg-teal-500/5' : ''}`}>
                                      <div className="space-y-2 w-full max-w-full overflow-x-hidden">
                                        <div className="flex items-center gap-2">
                                          <Checkbox
                                            checked={isDefault}
                                            onCheckedChange={(checked) => {
                                              if (checked) {
                                                updateVariable(variable.id, { defaultOptionIndex: index });
                                              }
                                            }}
                                            disabled={promptType === 'showcase'}
                                            data-testid={`checkbox-default-option-${variable.id}-${index}`}
                                          />
                                          <Label className="text-xs text-white font-medium">Default</Label>
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs text-white">Anzeigename</Label>
                                          <Input
                                            value={option.visibleName}
                                            onChange={(e) => {
                                              const newOptions = [...(variable.options || [])];
                                              newOptions[index] = { ...option, visibleName: e.target.value };
                                              updateVariable(variable.id, { options: newOptions });
                                            }}
                                            placeholder="Anzeigename"
                                            className="h-8 text-sm"
                                            disabled={promptType === 'showcase'}
                                            data-testid={`input-visible-name-${variable.id}-${index}`}
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-xs text-white">Prompt-Wert</Label>
                                          <Input
                                            value={option.promptValue}
                                            onChange={(e) => {
                                              const newOptions = [...(variable.options || [])];
                                              newOptions[index] = { ...option, promptValue: e.target.value };
                                              updateVariable(variable.id, { options: newOptions });
                                            }}
                                            placeholder="Prompt-Wert"
                                            className="h-8 text-sm"
                                            disabled={promptType === 'showcase'}
                                            data-testid={`input-prompt-value-${variable.id}-${index}`}
                                          />
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            const newOptions = variable.options?.filter((_, i) => i !== index) || [];
                                            updateVariable(variable.id, { options: newOptions });
                                          }}
                                          className="w-full text-destructive"
                                          disabled={promptType === 'showcase'}
                                          data-testid={`button-remove-option-${variable.id}-${index}`}
                                        >
                                          <Trash2 className="h-3 w-3 mr-1" />
                                          Option entfernen
                                        </Button>
                                      </div>
                                    </Card>
                                  );
                                })}
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  value={newOptionInput[variable.id] || ''}
                                  onChange={(e) => setNewOptionInput({ ...newOptionInput, [variable.id]: e.target.value })}
                                  placeholder="Neue Option"
                                  className="h-8 text-sm"
                                  disabled={promptType === 'showcase'}
                                  data-testid={`input-new-option-${variable.id}`}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    const optionText = newOptionInput[variable.id];
                                    if (!optionText) return;
                                    const newOptions = [...(variable.options || []), { visibleName: optionText, promptValue: optionText }];
                                    updateVariable(variable.id, { options: newOptions });
                                    setNewOptionInput({ ...newOptionInput, [variable.id]: '' });
                                  }}
                                  disabled={promptType === 'showcase'}
                                  data-testid={`button-add-option-${variable.id}`}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {variable.type === 'slider' && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                  <Label className="text-xs text-white">Min</Label>
                                  <Input
                                    type="number"
                                    value={variable.min || 0}
                                    onChange={(e) => updateVariable(variable.id, { min: parseInt(e.target.value) || 0 })}
                                    className="h-8 text-sm"
                                    disabled={promptType === 'showcase'}
                                    data-testid={`input-min-${variable.id}`}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs text-white">Max</Label>
                                  <Input
                                    type="number"
                                    value={variable.max || 100}
                                    onChange={(e) => updateVariable(variable.id, { max: parseInt(e.target.value) || 100 })}
                                    className="h-8 text-sm"
                                    disabled={promptType === 'showcase'}
                                    data-testid={`input-max-${variable.id}`}
                                  />
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs text-white">Default-Wert</Label>
                                <Input
                                  type="number"
                                  value={variable.defaultValue as number}
                                  onChange={(e) => updateVariable(variable.id, { defaultValue: parseInt(e.target.value) || 0 })}
                                  className="h-8 text-sm"
                                  disabled={promptType === 'showcase'}
                                  data-testid={`input-default-${variable.id}`}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`required-mobile-${variable.id}`}
                              checked={variable.required}
                              onCheckedChange={(checked) => updateVariable(variable.id, { required: checked as boolean })}
                              disabled={promptType === 'showcase'}
                              data-testid={`checkbox-required-${variable.id}`}
                            />
                            <Label htmlFor={`required-mobile-${variable.id}`} className="text-sm text-white">
                              Pflichtfeld
                            </Label>
                          </div>

                          <div className="flex gap-2 mt-4 pt-4 border-t">
                            <Button
                              onClick={() => {
                                setShowVariableEditor(false);
                              }}
                              className="flex-1"
                              data-testid={`button-save-variable-${variable.id}`}
                            >
                              Fertig
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => {
                                setVariableToDelete(variable.id);
                                setDeleteDialogOpen(true);
                              }}
                              data-testid={`button-delete-${variable.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
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

      <AlertDialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fehlende Informationen</AlertDialogTitle>
            <AlertDialogDescription>
              Bitte füllen Sie alle erforderlichen Felder aus: Title, Category, Tags und Aspect Ratio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowValidationDialog(false)} data-testid="button-validation-ok">
              OK
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
                      <span className="text-xs text-foreground">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Kürzlich'}
                      </span>
                    </div>
                  </Button>
                ))
              ) : (
                <p className="text-sm text-foreground text-center py-4">
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
