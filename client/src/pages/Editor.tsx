import Navbar from "@/components/Navbar";
import PromptEditor from "@/components/PromptEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Editor() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col bg-background h-screen">
      <Navbar />
      
      <main className="w-full bg-background flex-1 overflow-auto">
        <PromptEditor onBack={() => setLocation('/')} />
      </main>
    </div>
  );
}
