import Navbar from "@/components/Navbar";
import PromptEditor from "@/components/PromptEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Editor() {
  const [, setLocation] = useLocation();

  return (
    <div className="h-screen bg-background overflow-hidden">
      <Navbar />
      
      <main className="w-full h-full pt-16 px-3 lg:px-8 py-3 overflow-hidden">
        <PromptEditor onBack={() => setLocation('/')} />
      </main>
    </div>
  );
}
