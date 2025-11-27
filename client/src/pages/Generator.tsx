import Navbar from "@/components/Navbar";
import GeneratorInterface from "@/components/GeneratorInterface";
import { useParams } from "wouter";

const mockPrompts: Record<string, { title: string; artistName: string; artistId: string; imageUrl: string }> = {
  "1": { title: "Cyberpunk Cityscape", artistName: "NeonArtist", artistId: "artist-neon", imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=800&fit=crop" },
  "2": { title: "Fantasy Portrait Magic", artistName: "MagicCreator", artistId: "artist-magic", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=800&fit=crop" },
  "3": { title: "Abstract Digital Dreams", artistName: "ModernMind", artistId: "artist-modern", imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=800&fit=crop" },
  "4": { title: "Neon Samurai Warrior", artistName: "CyberSensei", artistId: "artist-cyber", imageUrl: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=800&h=800&fit=crop" },
  "5": { title: "Ethereal Forest Spirit", artistName: "NatureWhisperer", artistId: "artist-nature", imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=800&fit=crop" },
  "6": { title: "Geometric Void", artistName: "ShapeShifter", artistId: "artist-shape", imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&h=800&fit=crop" },
  "7": { title: "Retro Futuristic Car", artistName: "VehicleVision", artistId: "artist-vehicle", imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=800&fit=crop" },
  "8": { title: "Dragon's Realm", artistName: "MythicMaster", artistId: "artist-mythic", imageUrl: "https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=800&h=800&fit=crop" },
};

export default function Generator() {
  const params = useParams<{ id: string }>();
  const promptId = params.id || "1";
  const promptData = mockPrompts[promptId] || mockPrompts["1"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="w-full px-6 lg:px-8 py-8">
        <GeneratorInterface 
          title={promptData.title}
          artistName={promptData.artistName}
          artistId={promptData.artistId}
          imageUrl={promptData.imageUrl}
        />
      </main>
    </div>
  );
}
