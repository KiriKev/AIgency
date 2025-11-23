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
