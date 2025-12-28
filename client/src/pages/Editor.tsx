import Navbar from "@/components/Navbar";
import PromptEditor from "@/components/PromptEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Editor() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      
      <main className="w-full px-3 lg:px-8 py-3">
        <PromptEditor onBack={() => setLocation('/')} />
      </main>
    </div>
  );
}
