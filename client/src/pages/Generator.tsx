import Navbar from "@/components/Navbar";
import GeneratorInterface from "@/components/GeneratorInterface";

export default function Generator() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="w-full px-6 lg:px-8 py-8">
        <GeneratorInterface />
      </main>
    </div>
  );
}
