import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const prompts = pgTable("prompts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: varchar("user_id"),
  category: text("category"),
  tags: jsonb("tags"),
  aiModel: text("ai_model").default("gemini"),
  price: integer("price").default(1),
  aspectRatio: text("aspect_ratio"),
  photoCount: integer("photo_count").default(1),
  promptType: text("prompt_type").default("create-now"),
  uploadedPhotos: jsonb("uploaded_photos"),
  resolution: text("resolution"),
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
});

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;

export const variables = pgTable("variables", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  promptId: varchar("prompt_id").notNull(),
  name: text("name").notNull(),
  label: text("label").notNull(),
  description: text("description").default(""),
  type: text("type").notNull(),
  defaultValue: jsonb("default_value"),
  required: boolean("required").default(false),
  position: integer("position").notNull(),
  min: integer("min"),
  max: integer("max"),
  options: jsonb("options"),
  defaultOptionIndex: integer("default_option_index").default(0),
});

export const insertVariableSchema = createInsertSchema(variables).omit({
  id: true,
});

export type InsertVariable = z.infer<typeof insertVariableSchema>;
export type Variable = typeof variables.$inferSelect;

// Artists table for user profiles
export const artists = pgTable("artists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  coverImageUrl: text("cover_image_url"),
  followerCount: integer("follower_count").default(0),
  followingCount: integer("following_count").default(0),
});

export const insertArtistSchema = createInsertSchema(artists).omit({
  id: true,
});

export type InsertArtist = z.infer<typeof insertArtistSchema>;
export type Artist = typeof artists.$inferSelect;

// Artworks table for generated images
export const artworks = pgTable("artworks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artistId: varchar("artist_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  promptUsed: text("prompt_used"),
  promptId: varchar("prompt_id"),
  likes: integer("likes").default(0),
  views: integer("views").default(0),
  isPublic: boolean("is_public").default(true),
  tags: jsonb("tags"),
  createdAt: text("created_at").default(sql`now()`),
});

export const insertArtworkSchema = createInsertSchema(artworks).omit({
  id: true,
});

export type InsertArtwork = z.infer<typeof insertArtworkSchema>;
export type Artwork = typeof artworks.$inferSelect;

// Prompt generations - stores each image generation with settings snapshot
export const promptGenerations = pgTable("prompt_generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  promptId: varchar("prompt_id").notNull(),
  userId: varchar("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  watermarkedImageUrl: text("watermarked_image_url"),
  settingsSnapshot: jsonb("settings_snapshot"),
  status: text("status").default("pending"),
  accepted: boolean("accepted").default(false),
  createdAt: text("created_at").default(sql`now()`),
});

export const insertPromptGenerationSchema = createInsertSchema(promptGenerations).omit({
  id: true,
});

export type InsertPromptGeneration = z.infer<typeof insertPromptGenerationSchema>;
export type PromptGeneration = typeof promptGenerations.$inferSelect;

// Generation chats - temporary chat sessions for image refinement
export const generationChats = pgTable("generation_chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  generationId: varchar("generation_id").notNull(),
  userId: varchar("user_id").notNull(),
  active: boolean("active").default(true),
  createdAt: text("created_at").default(sql`now()`),
});

export const insertGenerationChatSchema = createInsertSchema(generationChats).omit({
  id: true,
});

export type InsertGenerationChat = z.infer<typeof insertGenerationChatSchema>;
export type GenerationChat = typeof generationChats.$inferSelect;

// Generation chat messages
export const generationChatMessages = pgTable("generation_chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: varchar("chat_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").default(sql`now()`),
});

export const insertGenerationChatMessageSchema = createInsertSchema(generationChatMessages).omit({
  id: true,
});

export type InsertGenerationChatMessage = z.infer<typeof insertGenerationChatMessageSchema>;
export type GenerationChatMessage = typeof generationChatMessages.$inferSelect;

// Prompt comments - only users who generated from this prompt can comment
export const promptComments = pgTable("prompt_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  promptId: varchar("prompt_id").notNull(),
  userId: varchar("user_id").notNull(),
  generationId: varchar("generation_id").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").default(sql`now()`),
});

export const insertPromptCommentSchema = createInsertSchema(promptComments).omit({
  id: true,
});

export type InsertPromptComment = z.infer<typeof insertPromptCommentSchema>;
export type PromptComment = typeof promptComments.$inferSelect;
