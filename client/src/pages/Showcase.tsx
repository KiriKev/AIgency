import { useState } from "react";
import Navbar from "@/components/Navbar";
import FilterBar from "@/components/FilterBar";
import PromptCard from "@/components/PromptCard";
import { useLocation } from "wouter";

export default function Showcase() {
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
    <div className="min-h-screen bg-background pb-16">
      <Navbar />
      <FilterBar onFilterChange={(f) => console.log('Filters:', f)} />
      
      <main className="w-full px-2 py-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1 auto-rows-[200px]">
          {mockPrompts.map((prompt, idx) => {
            const spans = idx % 7 === 0 ? 'row-span-2 col-span-2' : idx % 5 === 0 ? 'row-span-2' : '';
            return (
              <div key={prompt.id} className={spans}>
                <PromptCard
                  {...prompt}
                  onClick={() => setLocation(`/generator/${prompt.id}`)}
                />
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
