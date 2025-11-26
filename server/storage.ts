import { 
  type User, 
  type InsertUser, 
  type Prompt, 
  type InsertPrompt,
  type Variable,
  type InsertVariable,
  type Artist,
  type InsertArtist,
  type Artwork,
  type InsertArtwork
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getPrompt(id: string): Promise<Prompt | undefined>;
  getAllPrompts(): Promise<Prompt[]>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  updatePrompt(id: string, prompt: Partial<InsertPrompt>): Promise<Prompt | undefined>;
  deletePrompt(id: string): Promise<boolean>;
  
  getVariablesByPromptId(promptId: string): Promise<Variable[]>;
  createVariable(variable: InsertVariable): Promise<Variable>;
  updateVariable(id: string, variable: Partial<InsertVariable>): Promise<Variable | undefined>;
  deleteVariable(id: string): Promise<boolean>;
  deleteVariablesByPromptId(promptId: string): Promise<void>;
  
  // Artist methods
  getArtist(id: string): Promise<Artist | undefined>;
  getArtistByUsername(username: string): Promise<Artist | undefined>;
  getAllArtists(): Promise<Artist[]>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(id: string, artist: Partial<InsertArtist>): Promise<Artist | undefined>;
  
  // Artwork methods
  getArtwork(id: string): Promise<Artwork | undefined>;
  getArtworksByArtistId(artistId: string): Promise<Artwork[]>;
  getAllArtworks(): Promise<Artwork[]>;
  getPublicArtworks(): Promise<Artwork[]>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  updateArtwork(id: string, artwork: Partial<InsertArtwork>): Promise<Artwork | undefined>;
  deleteArtwork(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private prompts: Map<string, Prompt>;
  private variables: Map<string, Variable>;
  private artists: Map<string, Artist>;
  private artworks: Map<string, Artwork>;

  constructor() {
    this.users = new Map();
    this.prompts = new Map();
    this.variables = new Map();
    this.artists = new Map();
    this.artworks = new Map();
    
    // Create default artist for demo
    const defaultArtistId = "default-artist";
    this.artists.set(defaultArtistId, {
      id: defaultArtistId,
      username: "artist",
      displayName: "Artist",
      bio: "Digital artist and AI enthusiast",
      avatarUrl: null,
      coverImageUrl: null,
      followerCount: 42,
      followingCount: 12
    });
    
    // Add some sample artworks
    const sampleArtworks = [
      { title: "Cosmic Dreams", description: "A surreal journey through space", promptUsed: "cosmic nebula with stars" },
      { title: "Forest Spirit", description: "Mystical creature in enchanted woods", promptUsed: "magical forest spirit glowing" },
      { title: "Neon City", description: "Futuristic cyberpunk cityscape", promptUsed: "neon lit cyberpunk city at night" },
      { title: "Ocean Depths", description: "Deep sea wonders", promptUsed: "underwater bioluminescent creatures" },
      { title: "Mountain Serenity", description: "Peaceful mountain landscape", promptUsed: "serene mountain lake sunset" },
    ];
    
    sampleArtworks.forEach((art, index) => {
      const id = `artwork-${index + 1}`;
      this.artworks.set(id, {
        id,
        artistId: defaultArtistId,
        title: art.title,
        description: art.description,
        imageUrl: `https://picsum.photos/seed/${index + 1}/400/400`,
        promptUsed: art.promptUsed,
        promptId: null,
        likes: Math.floor(Math.random() * 100) + 10,
        views: Math.floor(Math.random() * 500) + 50,
        isPublic: true,
        tags: ["ai-art", "digital"],
        createdAt: new Date().toISOString()
      });
    });
    
    // Add another artist with artworks
    const artist2Id = "artist-2";
    this.artists.set(artist2Id, {
      id: artist2Id,
      username: "creative_mind",
      displayName: "Creative Mind",
      bio: "Exploring the boundaries of AI art",
      avatarUrl: null,
      coverImageUrl: null,
      followerCount: 128,
      followingCount: 45
    });
    
    // Add artists for Art Hub mock prompts
    const hubArtists = [
      { id: "artist-neon", username: "neon_artist", displayName: "NeonArtist", bio: "Cyberpunk and neon aesthetics specialist" },
      { id: "artist-magic", username: "magic_creator", displayName: "MagicCreator", bio: "Creating magical fantasy worlds" },
      { id: "artist-modern", username: "modern_mind", displayName: "ModernMind", bio: "Digital abstract art enthusiast" },
      { id: "artist-cyber", username: "cyber_sensei", displayName: "CyberSensei", bio: "Master of futuristic warrior art" },
      { id: "artist-nature", username: "nature_whisperer", displayName: "NatureWhisperer", bio: "Bringing nature spirits to life" },
      { id: "artist-shape", username: "shape_shifter", displayName: "ShapeShifter", bio: "Geometric and abstract designs" },
      { id: "artist-vehicle", username: "vehicle_vision", displayName: "VehicleVision", bio: "Retro-futuristic vehicle designs" },
      { id: "artist-mythic", username: "mythic_master", displayName: "MythicMaster", bio: "Mythological creature creator" },
    ];
    
    hubArtists.forEach((artist, artistIdx) => {
      this.artists.set(artist.id, {
        id: artist.id,
        username: artist.username,
        displayName: artist.displayName,
        bio: artist.bio,
        avatarUrl: null,
        coverImageUrl: null,
        followerCount: Math.floor(Math.random() * 500) + 50,
        followingCount: Math.floor(Math.random() * 100) + 10
      });
      
      // Add sample artworks for each hub artist
      const artworkCount = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < artworkCount; i++) {
        const artworkId = `artwork-${artist.id}-${i + 1}`;
        this.artworks.set(artworkId, {
          id: artworkId,
          artistId: artist.id,
          title: `${artist.displayName} Creation #${i + 1}`,
          description: `A beautiful piece by ${artist.displayName}`,
          imageUrl: `https://picsum.photos/seed/${artist.id}${i}/400/400`,
          promptUsed: null,
          promptId: null,
          likes: Math.floor(Math.random() * 200) + 20,
          views: Math.floor(Math.random() * 1000) + 100,
          isPublic: true,
          tags: ["ai-art", artist.username.split('_')[0]],
          createdAt: new Date().toISOString()
        });
      }
    });
    
    const artist2Artworks = [
      { title: "Abstract Flow", description: "Fluid abstract patterns" },
      { title: "Digital Garden", description: "Virtual nature" },
      { title: "Retro Future", description: "80s inspired scifi" },
    ];
    
    artist2Artworks.forEach((art, index) => {
      const id = `artwork-a2-${index + 1}`;
      this.artworks.set(id, {
        id,
        artistId: artist2Id,
        title: art.title,
        description: art.description,
        imageUrl: `https://picsum.photos/seed/a2${index + 10}/400/400`,
        promptUsed: null,
        promptId: null,
        likes: Math.floor(Math.random() * 100) + 10,
        views: Math.floor(Math.random() * 500) + 50,
        isPublic: true,
        tags: ["ai-art"],
        createdAt: new Date().toISOString()
      });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getPrompt(id: string): Promise<Prompt | undefined> {
    return this.prompts.get(id);
  }

  async getAllPrompts(): Promise<Prompt[]> {
    return Array.from(this.prompts.values());
  }

  async createPrompt(insertPrompt: InsertPrompt): Promise<Prompt> {
    const id = randomUUID();
    const prompt: Prompt = { 
      ...insertPrompt, 
      id,
      userId: insertPrompt.userId ?? null,
      tags: insertPrompt.tags ?? null,
      category: insertPrompt.category ?? null,
      aiModel: insertPrompt.aiModel ?? null,
      price: insertPrompt.price ?? null,
      aspectRatio: insertPrompt.aspectRatio ?? null,
      photoCount: insertPrompt.photoCount ?? null,
      promptType: insertPrompt.promptType ?? null,
      uploadedPhotos: insertPrompt.uploadedPhotos ?? null,
      resolution: insertPrompt.resolution ?? null
    };
    this.prompts.set(id, prompt);
    return prompt;
  }

  async updatePrompt(id: string, update: Partial<InsertPrompt>): Promise<Prompt | undefined> {
    const prompt = this.prompts.get(id);
    if (!prompt) return undefined;
    
    const updated = { ...prompt, ...update };
    this.prompts.set(id, updated);
    return updated;
  }

  async deletePrompt(id: string): Promise<boolean> {
    return this.prompts.delete(id);
  }

  async getVariablesByPromptId(promptId: string): Promise<Variable[]> {
    return Array.from(this.variables.values())
      .filter((v) => v.promptId === promptId)
      .sort((a, b) => a.position - b.position);
  }

  async createVariable(insertVariable: InsertVariable): Promise<Variable> {
    const id = randomUUID();
    const variable: Variable = { 
      ...insertVariable,
      id,
      description: insertVariable.description ?? null,
      required: insertVariable.required ?? null,
      defaultValue: insertVariable.defaultValue ?? null,
      min: insertVariable.min ?? null,
      max: insertVariable.max ?? null,
      options: insertVariable.options ?? null,
      defaultOptionIndex: insertVariable.defaultOptionIndex ?? null
    };
    this.variables.set(id, variable);
    return variable;
  }

  async updateVariable(id: string, update: Partial<InsertVariable>): Promise<Variable | undefined> {
    const variable = this.variables.get(id);
    if (!variable) return undefined;
    
    const updated = { ...variable, ...update };
    this.variables.set(id, updated);
    return updated;
  }

  async deleteVariable(id: string): Promise<boolean> {
    return this.variables.delete(id);
  }

  async deleteVariablesByPromptId(promptId: string): Promise<void> {
    const toDelete = Array.from(this.variables.entries())
      .filter(([, v]) => v.promptId === promptId)
      .map(([id]) => id);
    
    toDelete.forEach(id => this.variables.delete(id));
  }

  // Artist methods
  async getArtist(id: string): Promise<Artist | undefined> {
    return this.artists.get(id);
  }

  async getArtistByUsername(username: string): Promise<Artist | undefined> {
    return Array.from(this.artists.values()).find(
      (artist) => artist.username === username,
    );
  }

  async getAllArtists(): Promise<Artist[]> {
    return Array.from(this.artists.values());
  }

  async createArtist(insertArtist: InsertArtist): Promise<Artist> {
    const id = randomUUID();
    const artist: Artist = {
      ...insertArtist,
      id,
      bio: insertArtist.bio ?? null,
      avatarUrl: insertArtist.avatarUrl ?? null,
      coverImageUrl: insertArtist.coverImageUrl ?? null,
      followerCount: insertArtist.followerCount ?? 0,
      followingCount: insertArtist.followingCount ?? 0
    };
    this.artists.set(id, artist);
    return artist;
  }

  async updateArtist(id: string, update: Partial<InsertArtist>): Promise<Artist | undefined> {
    const artist = this.artists.get(id);
    if (!artist) return undefined;
    
    const updated = { ...artist, ...update };
    this.artists.set(id, updated);
    return updated;
  }

  // Artwork methods
  async getArtwork(id: string): Promise<Artwork | undefined> {
    return this.artworks.get(id);
  }

  async getArtworksByArtistId(artistId: string): Promise<Artwork[]> {
    return Array.from(this.artworks.values())
      .filter((a) => a.artistId === artistId)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }

  async getAllArtworks(): Promise<Artwork[]> {
    return Array.from(this.artworks.values())
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }

  async getPublicArtworks(): Promise<Artwork[]> {
    return Array.from(this.artworks.values())
      .filter((a) => a.isPublic)
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const id = randomUUID();
    const artwork: Artwork = {
      ...insertArtwork,
      id,
      description: insertArtwork.description ?? null,
      promptUsed: insertArtwork.promptUsed ?? null,
      promptId: insertArtwork.promptId ?? null,
      likes: insertArtwork.likes ?? 0,
      views: insertArtwork.views ?? 0,
      isPublic: insertArtwork.isPublic ?? true,
      tags: insertArtwork.tags ?? null,
      createdAt: new Date().toISOString()
    };
    this.artworks.set(id, artwork);
    return artwork;
  }

  async updateArtwork(id: string, update: Partial<InsertArtwork>): Promise<Artwork | undefined> {
    const artwork = this.artworks.get(id);
    if (!artwork) return undefined;
    
    const updated = { ...artwork, ...update };
    this.artworks.set(id, updated);
    return updated;
  }

  async deleteArtwork(id: string): Promise<boolean> {
    return this.artworks.delete(id);
  }
}

export const storage = new MemStorage();
