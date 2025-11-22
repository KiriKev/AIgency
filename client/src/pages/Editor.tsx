import Navbar from "@/components/Navbar";
import PromptEditor from "@/components/PromptEditor";

export default function Editor() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="w-full px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Create Prompt Template</h1>
          <p className="text-muted-foreground">
            Design reusable prompt templates with customizable variables
          </p>
        </div>

        <PromptEditor />
      </main>
    </div>
  );
}
