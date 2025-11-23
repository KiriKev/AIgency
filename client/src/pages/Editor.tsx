import Navbar from "@/components/Navbar";
import PromptEditor from "@/components/PromptEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Editor() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="w-full px-6 lg:px-8 py-6">
        <div className="mb-4 flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Create Prompt Template</h1>
            <p className="text-xs text-muted-foreground">
              Design reusable prompt templates with customizable variables
            </p>
          </div>
        </div>

        <PromptEditor />
      </main>
    </div>
  );
}
