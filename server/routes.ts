import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPromptSchema, insertVariableSchema, insertArtistSchema, insertArtworkSchema, insertPromptGenerationSchema, insertGenerationChatSchema, insertGenerationChatMessageSchema, insertPromptCommentSchema } from "@shared/schema";
import { generateImage } from "./gemini";
import { addWatermark } from "./watermark";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/prompts", async (req, res) => {
    try {
      const prompts = await storage.getAllPrompts();
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prompts" });
    }
  });

  app.get("/api/prompts/:id", async (req, res) => {
    try {
      const prompt = await storage.getPrompt(req.params.id);
      if (!prompt) {
        return res.status(404).json({ error: "Prompt not found" });
      }
      res.json(prompt);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch prompt" });
    }
  });

  app.post("/api/prompts", async (req, res) => {
    try {
      const validatedData = insertPromptSchema.parse(req.body);
      const prompt = await storage.createPrompt(validatedData);
      res.status(201).json(prompt);
    } catch (error) {
      res.status(400).json({ error: "Invalid prompt data" });
    }
  });

  app.patch("/api/prompts/:id", async (req, res) => {
    try {
      const validatedData = insertPromptSchema.parse(req.body);
      const prompt = await storage.updatePrompt(req.params.id, validatedData);
      if (!prompt) {
        return res.status(404).json({ error: "Prompt not found" });
      }
      res.json(prompt);
    } catch (error) {
      res.status(500).json({ error: "Failed to update prompt" });
    }
  });

  app.delete("/api/prompts/:id", async (req, res) => {
    try {
      await storage.deleteVariablesByPromptId(req.params.id);
      const deleted = await storage.deletePrompt(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Prompt not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete prompt" });
    }
  });

  app.get("/api/prompts/:promptId/variables", async (req, res) => {
    try {
      const variables = await storage.getVariablesByPromptId(req.params.promptId);
      res.json(variables);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch variables" });
    }
  });

  app.post("/api/variables", async (req, res) => {
    try {
      const validatedData = insertVariableSchema.parse(req.body);
      const variable = await storage.createVariable(validatedData);
      res.status(201).json(variable);
    } catch (error) {
      res.status(400).json({ error: "Invalid variable data" });
    }
  });

  app.patch("/api/variables/:id", async (req, res) => {
    try {
      const variable = await storage.updateVariable(req.params.id, req.body);
      if (!variable) {
        return res.status(404).json({ error: "Variable not found" });
      }
      res.json(variable);
    } catch (error) {
      res.status(500).json({ error: "Failed to update variable" });
    }
  });

  app.delete("/api/variables/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVariable(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Variable not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete variable" });
    }
  });

  app.post("/api/generate-image", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const imageDataUrl = await generateImage(prompt);
      res.json({ imageUrl: imageDataUrl });
    } catch (error: any) {
      console.error("Image generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });

  // Artist routes
  app.get("/api/artists", async (req, res) => {
    try {
      const artists = await storage.getAllArtists();
      res.json(artists);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch artists" });
    }
  });

  app.get("/api/artists/:id", async (req, res) => {
    try {
      const artist = await storage.getArtist(req.params.id);
      if (!artist) {
        return res.status(404).json({ error: "Artist not found" });
      }
      res.json(artist);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch artist" });
    }
  });

  app.get("/api/artists/username/:username", async (req, res) => {
    try {
      const artist = await storage.getArtistByUsername(req.params.username);
      if (!artist) {
        return res.status(404).json({ error: "Artist not found" });
      }
      res.json(artist);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch artist" });
    }
  });

  app.post("/api/artists", async (req, res) => {
    try {
      const validatedData = insertArtistSchema.parse(req.body);
      const artist = await storage.createArtist(validatedData);
      res.status(201).json(artist);
    } catch (error) {
      res.status(400).json({ error: "Invalid artist data" });
    }
  });

  app.patch("/api/artists/:id", async (req, res) => {
    try {
      const artist = await storage.updateArtist(req.params.id, req.body);
      if (!artist) {
        return res.status(404).json({ error: "Artist not found" });
      }
      res.json(artist);
    } catch (error) {
      res.status(500).json({ error: "Failed to update artist" });
    }
  });

  // Artwork routes
  app.get("/api/artworks", async (req, res) => {
    try {
      const artworks = await storage.getPublicArtworks();
      res.json(artworks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch artworks" });
    }
  });

  app.get("/api/artworks/:id", async (req, res) => {
    try {
      const artwork = await storage.getArtwork(req.params.id);
      if (!artwork) {
        return res.status(404).json({ error: "Artwork not found" });
      }
      res.json(artwork);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch artwork" });
    }
  });

  app.get("/api/artists/:artistId/artworks", async (req, res) => {
    try {
      const artworks = await storage.getArtworksByArtistId(req.params.artistId);
      res.json(artworks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch artworks" });
    }
  });

  app.post("/api/artworks", async (req, res) => {
    try {
      const validatedData = insertArtworkSchema.parse(req.body);
      const artwork = await storage.createArtwork(validatedData);
      res.status(201).json(artwork);
    } catch (error) {
      res.status(400).json({ error: "Invalid artwork data" });
    }
  });

  app.patch("/api/artworks/:id", async (req, res) => {
    try {
      const artwork = await storage.updateArtwork(req.params.id, req.body);
      if (!artwork) {
        return res.status(404).json({ error: "Artwork not found" });
      }
      res.json(artwork);
    } catch (error) {
      res.status(500).json({ error: "Failed to update artwork" });
    }
  });

  app.delete("/api/artworks/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteArtwork(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Artwork not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete artwork" });
    }
  });

  // Prompt Generation routes
  app.get("/api/prompts/:promptId/generations", async (req, res) => {
    try {
      const generations = await storage.getGenerationsByPromptId(req.params.promptId);
      res.json(generations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch generations" });
    }
  });

  app.get("/api/generations/:id", async (req, res) => {
    try {
      const generation = await storage.getPromptGeneration(req.params.id);
      if (!generation) {
        return res.status(404).json({ error: "Generation not found" });
      }
      res.json(generation);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch generation" });
    }
  });

  app.post("/api/generations", async (req, res) => {
    try {
      const { prompt, promptId, userId, settingsSnapshot } = req.body;
      
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: "Prompt text is required" });
      }

      const imageDataUrl = await generateImage(prompt);
      const watermarkedUrl = addWatermark(imageDataUrl);
      
      const generation = await storage.createPromptGeneration({
        promptId: promptId || "temp",
        userId: userId || "anonymous",
        imageUrl: imageDataUrl,
        watermarkedImageUrl: watermarkedUrl,
        settingsSnapshot: settingsSnapshot || null,
        status: "completed",
        accepted: false
      });

      const chat = await storage.createGenerationChat({
        generationId: generation.id,
        userId: userId || "anonymous",
        active: true
      });

      res.status(201).json({ generation, chatId: chat.id });
    } catch (error: any) {
      console.error("Generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate image" });
    }
  });

  app.post("/api/generations/:id/accept", async (req, res) => {
    try {
      const generation = await storage.acceptGeneration(req.params.id);
      if (!generation) {
        return res.status(404).json({ error: "Generation not found" });
      }
      res.json(generation);
    } catch (error) {
      res.status(500).json({ error: "Failed to accept generation" });
    }
  });

  // Generation Chat routes
  app.get("/api/generations/:generationId/chat", async (req, res) => {
    try {
      const chat = await storage.getChatByGenerationId(req.params.generationId);
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }
      const messages = await storage.getChatMessages(chat.id);
      res.json({ chat, messages });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat" });
    }
  });

  app.post("/api/chats/:chatId/messages", async (req, res) => {
    try {
      const { role, content } = req.body;
      if (!role || !content) {
        return res.status(400).json({ error: "Role and content are required" });
      }
      const message = await storage.createChatMessage({
        chatId: req.params.chatId,
        role,
        content
      });
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to create message" });
    }
  });

  // Prompt Comment routes
  app.get("/api/prompts/:promptId/comments", async (req, res) => {
    try {
      const comments = await storage.getPromptComments(req.params.promptId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/prompts/:promptId/comments", async (req, res) => {
    try {
      const { userId, generationId, content } = req.body;
      
      const hasGenerated = await storage.hasUserGeneratedFromPrompt(userId, req.params.promptId);
      if (!hasGenerated) {
        return res.status(403).json({ error: "Only users who have generated from this prompt can comment" });
      }
      
      const comment = await storage.createPromptComment({
        promptId: req.params.promptId,
        userId,
        generationId,
        content
      });
      res.status(201).json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.get("/api/prompts/:promptId/can-comment/:userId", async (req, res) => {
    try {
      const canComment = await storage.hasUserGeneratedFromPrompt(req.params.userId, req.params.promptId);
      res.json({ canComment });
    } catch (error) {
      res.status(500).json({ error: "Failed to check comment permission" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
