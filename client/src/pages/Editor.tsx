import Navbar from "@/components/Navbar";
import PromptEditor from "@/components/PromptEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Editor() {
  const [, setLocation] = useLocation();

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      
      <main className="w-full bg-background h-[calc(100vh-4rem)] mt-16 p-1">
        <PromptEditor onBack={() => setLocation('/')} />
      </main>
    </div>
  );
}
