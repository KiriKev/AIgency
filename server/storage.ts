import { 
  users,
  prompts,
  variables,
  artists,
  artworks,
  generatedVariations,
  artworkComments,
  type User, 
  type InsertUser, 
  type Prompt, 
  type InsertPrompt,
  type Variable,
  type InsertVariable,
  type Artist,
  type InsertArtist,
  type Artwork,
  type InsertArtwork,
  type GeneratedVariation,
  type InsertGeneratedVariation,
  type ArtworkComment,
  type InsertArtworkComment
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { encryptPrompt, decryptPrompt } from "./encryption";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getPrompt(id: string): Promise<(Prompt & { decryptedContent?: string }) | undefined>;
  getPromptBySlug(slug: string): Promise<Prompt | undefined>;
  getPromptWithDecryptedContent(id: string): Promise<(Prompt & { decryptedContent: string }) | undefined>;
  getAllPrompts(): Promise<Prompt[]>;
  getPublicPrompts(): Promise<Prompt[]>;
  getPromptsByArtistId(artistId: string): Promise<Prompt[]>;
  createPrompt(promptData: { content: string } & Omit<InsertPrompt, 'encryptedContent' | 'iv' | 'authTag'>): Promise<Prompt>;
  updatePrompt(id: string, promptData: Partial<{ content: string } & Omit<InsertPrompt, 'encryptedContent' | 'iv' | 'authTag'>>): Promise<Prompt | undefined>;
  deletePrompt(id: string): Promise<boolean>;
  
  getVariablesByPromptId(promptId: string): Promise<Variable[]>;
  createVariable(variable: InsertVariable): Promise<Variable>;
  updateVariable(id: string, variable: Partial<InsertVariable>): Promise<Variable | undefined>;
  deleteVariable(id: string): Promise<boolean>;
  deleteVariablesByPromptId(promptId: string): Promise<void>;
  
  getArtist(id: string): Promise<Artist | undefined>;
  getArtistByUsername(username: string): Promise<Artist | undefined>;
  getAllArtists(): Promise<Artist[]>;
  createArtist(artist: InsertArtist): Promise<Artist>;
  updateArtist(id: string, artist: Partial<InsertArtist>): Promise<Artist | undefined>;
  
  getArtwork(id: string): Promise<Artwork | undefined>;
  getArtworksByArtistId(artistId: string): Promise<Artwork[]>;
  getAllArtworks(): Promise<Artwork[]>;
  getPublicArtworks(): Promise<Artwork[]>;
  createArtwork(artwork: InsertArtwork): Promise<Artwork>;
  updateArtwork(id: string, artwork: Partial<InsertArtwork>): Promise<Artwork | undefined>;
  deleteArtwork(id: string): Promise<boolean>;
  
  getVariationsByArtworkId(artworkId: string): Promise<GeneratedVariation[]>;
  createVariation(variation: InsertGeneratedVariation): Promise<GeneratedVariation>;
  
  getCommentsByArtworkId(artworkId: string): Promise<ArtworkComment[]>;
  createComment(comment: InsertArtworkComment): Promise<ArtworkComment>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getPrompt(id: string): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    return prompt || undefined;
  }

  async getPromptBySlug(slug: string): Promise<Prompt | undefined> {
    const normalizedSlug = slug.toLowerCase().replace(/-/g, ' ');
    const allPrompts = await db.select().from(prompts);
    const prompt = allPrompts.find(p => 
      p.title.toLowerCase() === normalizedSlug || 
      p.title.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
    );
    return prompt || undefined;
  }

  async getPromptWithDecryptedContent(id: string): Promise<(Prompt & { decryptedContent: string }) | undefined> {
    const prompt = await this.getPrompt(id);
    if (!prompt) return undefined;
    
    const decryptedContent = decryptPrompt({
      encryptedContent: prompt.encryptedContent,
      iv: prompt.iv,
      authTag: prompt.authTag
    });
    
    return { ...prompt, decryptedContent };
  }

  async getAllPrompts(): Promise<Prompt[]> {
    return db.select().from(prompts).orderBy(desc(prompts.createdAt));
  }

  async getPublicPrompts(): Promise<Prompt[]> {
    return db.select().from(prompts).orderBy(desc(prompts.createdAt));
  }

  async getPromptsByArtistId(artistId: string): Promise<Prompt[]> {
    return db.select().from(prompts).where(eq(prompts.artistId, artistId)).orderBy(desc(prompts.createdAt));
  }

  async createPrompt(promptData: { content: string } & Omit<InsertPrompt, 'encryptedContent' | 'iv' | 'authTag'>): Promise<Prompt> {
    const { content, ...rest } = promptData;
    const encrypted = encryptPrompt(content);
    
    const [prompt] = await db.insert(prompts).values({
      ...rest,
      encryptedContent: encrypted.encryptedContent,
      iv: encrypted.iv,
      authTag: encrypted.authTag
    }).returning();
    
    return prompt;
  }

  async updatePrompt(id: string, promptData: Partial<{ content: string } & Omit<InsertPrompt, 'encryptedContent' | 'iv' | 'authTag'>>): Promise<Prompt | undefined> {
    const { content, ...rest } = promptData;
    
    let updateData: Partial<InsertPrompt> = { ...rest };
    
    if (content !== undefined) {
      const encrypted = encryptPrompt(content);
      updateData = {
        ...updateData,
        encryptedContent: encrypted.encryptedContent,
        iv: encrypted.iv,
        authTag: encrypted.authTag
      };
    }
    
    const [prompt] = await db.update(prompts).set(updateData).where(eq(prompts.id, id)).returning();
    return prompt || undefined;
  }

  async deletePrompt(id: string): Promise<boolean> {
    const result = await db.delete(prompts).where(eq(prompts.id, id));
    return true;
  }

  async getVariablesByPromptId(promptId: string): Promise<Variable[]> {
    return db.select().from(variables).where(eq(variables.promptId, promptId)).orderBy(variables.position);
  }

  async createVariable(insertVariable: InsertVariable): Promise<Variable> {
    const [variable] = await db.insert(variables).values(insertVariable).returning();
    return variable;
  }

  async updateVariable(id: string, update: Partial<InsertVariable>): Promise<Variable | undefined> {
    const [variable] = await db.update(variables).set(update).where(eq(variables.id, id)).returning();
    return variable || undefined;
  }

  async deleteVariable(id: string): Promise<boolean> {
    await db.delete(variables).where(eq(variables.id, id));
    return true;
  }

  async deleteVariablesByPromptId(promptId: string): Promise<void> {
    await db.delete(variables).where(eq(variables.promptId, promptId));
  }

  async getArtist(id: string): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.id, id));
    return artist || undefined;
  }

  async getArtistByUsername(username: string): Promise<Artist | undefined> {
    const [artist] = await db.select().from(artists).where(eq(artists.username, username));
    return artist || undefined;
  }

  async getAllArtists(): Promise<Artist[]> {
    return db.select().from(artists);
  }

  async createArtist(insertArtist: InsertArtist): Promise<Artist> {
    const [artist] = await db.insert(artists).values(insertArtist).returning();
    return artist;
  }

  async updateArtist(id: string, update: Partial<InsertArtist>): Promise<Artist | undefined> {
    const [artist] = await db.update(artists).set(update).where(eq(artists.id, id)).returning();
    return artist || undefined;
  }

  async getArtwork(id: string): Promise<Artwork | undefined> {
    const [artwork] = await db.select().from(artworks).where(eq(artworks.id, id));
    return artwork || undefined;
  }

  async getArtworksByArtistId(artistId: string): Promise<Artwork[]> {
    return db.select().from(artworks).where(eq(artworks.artistId, artistId)).orderBy(desc(artworks.createdAt));
  }

  async getAllArtworks(): Promise<Artwork[]> {
    return db.select().from(artworks).orderBy(desc(artworks.createdAt));
  }

  async getPublicArtworks(): Promise<Artwork[]> {
    return db.select().from(artworks).where(eq(artworks.isPublic, true)).orderBy(desc(artworks.createdAt));
  }

  async createArtwork(insertArtwork: InsertArtwork): Promise<Artwork> {
    const [artwork] = await db.insert(artworks).values(insertArtwork).returning();
    return artwork;
  }

  async updateArtwork(id: string, update: Partial<InsertArtwork>): Promise<Artwork | undefined> {
    const [artwork] = await db.update(artworks).set(update).where(eq(artworks.id, id)).returning();
    return artwork || undefined;
  }

  async deleteArtwork(id: string): Promise<boolean> {
    await db.delete(artworks).where(eq(artworks.id, id));
    return true;
  }

  async getVariationsByArtworkId(artworkId: string): Promise<GeneratedVariation[]> {
    return db.select().from(generatedVariations).where(eq(generatedVariations.artworkId, artworkId)).orderBy(desc(generatedVariations.createdAt));
  }

  async createVariation(insertVariation: InsertGeneratedVariation): Promise<GeneratedVariation> {
    const [variation] = await db.insert(generatedVariations).values(insertVariation).returning();
    return variation;
  }

  async getCommentsByArtworkId(artworkId: string): Promise<ArtworkComment[]> {
    return db.select().from(artworkComments).where(eq(artworkComments.artworkId, artworkId)).orderBy(desc(artworkComments.createdAt));
  }

  async createComment(insertComment: InsertArtworkComment): Promise<ArtworkComment> {
    const [comment] = await db.insert(artworkComments).values(insertComment).returning();
    return comment;
  }
}

export const storage = new DatabaseStorage();
