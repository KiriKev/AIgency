import { useState } from "react";
import Navbar from "@/components/Navbar";
import FilterBar from "@/components/FilterBar";
import PromptCard from "@/components/PromptCard";
import { useLocation } from "wouter";

export default function Gallery() {
  const [, setLocation] = useLocation();
  
  const mockPrompts = [
    {
      id: "1",
      title: "Cyberpunk Cityscape",
      artist: "NeonArtist",
      price: 5,
      isFree: false,
      rating: 4.8,
      downloads: 1234,
      thumbnail: "",
      category: "Sci-Fi"
    },
    {
      id: "2",
      title: "Fantasy Portrait Magic",
      artist: "MagicCreator",
      price: 0,
      isFree: true,
      rating: 4.9,
      downloads: 2456,
      thumbnail: "",
      category: "Fantasy"
    },
    {
      id: "3",
      title: "Abstract Digital Dreams",
      artist: "ModernMind",
      price: 3,
      isFree: false,
      rating: 4.6,
      downloads: 876,
      thumbnail: "",
      category: "Abstract"
    },
    {
      id: "4",
      title: "Neon Samurai Warrior",
      artist: "CyberSensei",
      price: 8,
      isFree: false,
      rating: 4.9,
      downloads: 3421,
      thumbnail: "",
      category: "Sci-Fi"
    },
    {
      id: "5",
      title: "Ethereal Forest Spirit",
      artist: "NatureWhisperer",
      price: 0,
      isFree: true,
      rating: 4.7,
      downloads: 1876,
      thumbnail: "",
      category: "Fantasy"
    },
    {
      id: "6",
      title: "Geometric Void",
      artist: "ShapeShifter",
      price: 4,
      isFree: false,
      rating: 4.5,
      downloads: 654,
      thumbnail: "",
      category: "Abstract"
    },
    {
      id: "7",
      title: "Retro Futuristic Car",
      artist: "VehicleVision",
      price: 6,
      isFree: false,
      rating: 4.8,
      downloads: 2103,
      thumbnail: "",
      category: "Sci-Fi"
    },
    {
      id: "8",
      title: "Dragon's Realm",
      artist: "MythicMaster",
      price: 0,
      isFree: true,
      rating: 4.9,
      downloads: 4123,
      thumbnail: "",
      category: "Fantasy"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FilterBar onFilterChange={(f) => console.log('Filters:', f)} />
      
      <main className="w-full max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Marketplace Gallery</h1>
          <p className="text-muted-foreground">
            Discover thousands of AI prompt templates from talented artists
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockPrompts.map(prompt => (
            <PromptCard
              key={prompt.id}
              {...prompt}
              onClick={() => setLocation(`/generator/${prompt.id}`)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
