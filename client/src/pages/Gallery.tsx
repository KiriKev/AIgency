import Navbar from "@/components/Navbar";
import FilterBar from "@/components/FilterBar";
import ArtworkGrid, { type ArtworkItem } from "@/components/ArtworkGrid";
import { useLocation } from "wouter";

export default function Gallery() {
  const [, setLocation] = useLocation();
  
  const mockPrompts: ArtworkItem[] = [
    {
      id: "1",
      title: "Cyberpunk Cityscape",
      artistId: "artist-neon",
      artistName: "NeonArtist",
      price: 5,
      isFree: false,
      rating: 4.8,
      downloads: 1234,
      imageUrl: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=400&fit=crop",
      category: "Sci-Fi"
    },
    {
      id: "2",
      title: "Fantasy Portrait Magic",
      artistId: "artist-magic",
      artistName: "MagicCreator",
      price: 0,
      isFree: true,
      rating: 4.9,
      downloads: 2456,
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=400&fit=crop",
      category: "Fantasy"
    },
    {
      id: "3",
      title: "Abstract Digital Dreams",
      artistId: "artist-modern",
      artistName: "ModernMind",
      price: 3,
      isFree: false,
      rating: 4.6,
      downloads: 876,
      imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=400&fit=crop",
      category: "Abstract"
    },
    {
      id: "4",
      title: "Neon Samurai Warrior",
      artistId: "artist-cyber",
      artistName: "CyberSensei",
      price: 8,
      isFree: false,
      rating: 4.9,
      downloads: 3421,
      imageUrl: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?w=400&h=400&fit=crop",
      category: "Sci-Fi"
    },
    {
      id: "5",
      title: "Ethereal Forest Spirit",
      artistId: "artist-nature",
      artistName: "NatureWhisperer",
      price: 0,
      isFree: true,
      rating: 4.7,
      downloads: 1876,
      imageUrl: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&h=400&fit=crop",
      category: "Fantasy"
    },
    {
      id: "6",
      title: "Geometric Void",
      artistId: "artist-shape",
      artistName: "ShapeShifter",
      price: 4,
      isFree: false,
      rating: 4.5,
      downloads: 654,
      imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&h=400&fit=crop",
      category: "Abstract"
    },
    {
      id: "7",
      title: "Retro Futuristic Car",
      artistId: "artist-vehicle",
      artistName: "VehicleVision",
      price: 6,
      isFree: false,
      rating: 4.8,
      downloads: 2103,
      imageUrl: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop",
      category: "Sci-Fi"
    },
    {
      id: "8",
      title: "Dragon's Realm",
      artistId: "artist-mythic",
      artistName: "MythicMaster",
      price: 0,
      isFree: true,
      rating: 4.9,
      downloads: 4123,
      imageUrl: "https://images.unsplash.com/photo-1577493340887-b7bfff550145?w=400&h=400&fit=crop",
      category: "Fantasy"
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />
      <FilterBar onFilterChange={(f) => console.log('Filters:', f)} />
      
      <main className="w-full px-2 py-2">
        <ArtworkGrid
          items={mockPrompts}
          variant="prompt"
          showArtist={true}
          useMasonryLayout={true}
          onCardClick={(id) => setLocation(`/generator/${id}`)}
        />
      </main>
    </div>
  );
}
