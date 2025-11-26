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
      imageUrl: "https://picsum.photos/seed/cyber1/400/400",
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
      imageUrl: "https://picsum.photos/seed/fantasy2/400/400",
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
      imageUrl: "https://picsum.photos/seed/abstract3/400/400",
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
      imageUrl: "https://picsum.photos/seed/samurai4/400/400",
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
      imageUrl: "https://picsum.photos/seed/forest5/400/400",
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
      imageUrl: "https://picsum.photos/seed/geo6/400/400",
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
      imageUrl: "https://picsum.photos/seed/retro7/400/400",
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
      imageUrl: "https://picsum.photos/seed/dragon8/400/400",
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
