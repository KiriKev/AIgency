import { useState } from "react";
import Navbar from "@/components/Navbar";
import CreationCard from "@/components/CreationCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Showcase() {
  const mockCreations = [
    {
      id: "1",
      creator: "ArtLover",
      originalPrompt: "Cyberpunk Cityscape",
      likes: 234,
      views: 1520,
      comments: 45,
      iterations: 3
    },
    {
      id: "2",
      creator: "DigitalDreamer",
      originalPrompt: "Fantasy Portrait",
      likes: 456,
      views: 2340,
      comments: 67,
      iterations: 2
    },
    {
      id: "3",
      creator: "NeonArtist",
      originalPrompt: "Abstract Dreams",
      likes: 189,
      views: 980,
      comments: 23,
      iterations: 5
    },
    {
      id: "4",
      creator: "PixelPainter",
      originalPrompt: "Dragon's Realm",
      likes: 567,
      views: 3210,
      comments: 89,
      iterations: 4
    },
    {
      id: "5",
      creator: "VisionaryVox",
      originalPrompt: "Neon Samurai",
      likes: 423,
      views: 2890,
      comments: 56,
      iterations: 3
    },
    {
      id: "6",
      creator: "CreativeCore",
      originalPrompt: "Geometric Void",
      likes: 312,
      views: 1650,
      comments: 34,
      iterations: 2
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Showcase</h1>
          <p className="text-muted-foreground">
            Explore amazing creations from our community
          </p>
        </div>

        <Tabs defaultValue="featured" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="featured" data-testid="tab-featured">Featured</TabsTrigger>
            <TabsTrigger value="recent" data-testid="tab-recent">Recent</TabsTrigger>
            <TabsTrigger value="trending" data-testid="tab-trending">Trending</TabsTrigger>
            <TabsTrigger value="top" data-testid="tab-top">Top Rated</TabsTrigger>
          </TabsList>

          <TabsContent value="featured" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockCreations.map(creation => (
                <CreationCard key={creation.id} {...creation} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recent" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockCreations.slice(0, 4).map(creation => (
                <CreationCard key={creation.id} {...creation} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockCreations.slice(1, 5).map(creation => (
                <CreationCard key={creation.id} {...creation} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="top" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {mockCreations.slice(0, 3).map(creation => (
                <CreationCard key={creation.id} {...creation} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
