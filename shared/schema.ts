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
  encryptedContent: text("encrypted_content").notNull(),
  iv: text("iv").notNull(),
  authTag: text("auth_tag").notNull(),
  userId: varchar("user_id"),
  artistId: varchar("artist_id"),
  category: text("category"),
  tags: jsonb("tags").$type<string[]>(),
  aiModel: text("ai_model").default("gemini"),
  price: integer("price").default(1),
  aspectRatio: text("aspect_ratio"),
  photoCount: integer("photo_count").default(1),
  promptType: text("prompt_type").default("create-now"),
  uploadedPhotos: jsonb("uploaded_photos").$type<string[]>(),
  resolution: text("resolution"),
  previewImageUrl: text("preview_image_url"),
  downloads: integer("downloads").default(0),
  rating: integer("rating").default(0),
  createdAt: text("created_at").default(sql`now()`),
  isFreeShowcase: boolean("is_free_showcase").default(false),
  publicPromptText: text("public_prompt_text"),
  everydayObject: text("everyday_object"),
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
});

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;

export interface VariableOption {
  label: string;
  promptValue: string;
}

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
  step: integer("step").default(1),
  options: jsonb("options").$type<VariableOption[]>(),
  defaultOptionIndex: integer("default_option_index").default(0),
  placeholder: text("placeholder"),
  referenceImageAllowed: boolean("reference_image_allowed").default(false),
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

// Generated variations for each prompt (right-side history panel)
export const generatedVariations = pgTable("generated_variations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artworkId: varchar("artwork_id").notNull(),
  userId: varchar("user_id").notNull(),
  imageUrl: text("image_url").notNull(),
  watermarkedImageUrl: text("watermarked_image_url"),
  isAccepted: boolean("is_accepted").default(false),
  settings: jsonb("settings"),
  createdAt: text("created_at").default(sql`now()`),
});

export const insertGeneratedVariationSchema = createInsertSchema(generatedVariations).omit({
  id: true,
});

export type InsertGeneratedVariation = z.infer<typeof insertGeneratedVariationSchema>;
export type GeneratedVariation = typeof generatedVariations.$inferSelect;

// Comments on artworks (only users who generated from this artwork can comment)
export const artworkComments = pgTable("artwork_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  artworkId: varchar("artwork_id").notNull(),
  userId: varchar("user_id").notNull(),
  username: text("username").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").default(sql`now()`),
});

export const insertArtworkCommentSchema = createInsertSchema(artworkComments).omit({
  id: true,
});

export type InsertArtworkComment = z.infer<typeof insertArtworkCommentSchema>;
export type ArtworkComment = typeof artworkComments.$inferSelect;
