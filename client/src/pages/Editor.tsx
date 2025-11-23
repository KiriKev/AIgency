import Navbar from "@/components/Navbar";
import PromptEditor from "@/components/PromptEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Editor() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="w-full py-6 flex-1 bg-background">
        <div className="mb-4 flex items-center gap-4 px-6 lg:px-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setLocation('/')}
            data-testid="button-back"
            className="text-foreground"
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

        <div className="px-6 lg:px-8 bg-background">
          <PromptEditor />
        </div>
      </main>
    </div>
  );
}
