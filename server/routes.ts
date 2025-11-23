import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPromptSchema, insertVariableSchema } from "@shared/schema";
import { generateImage } from "./gemini";

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

  const httpServer = createServer(app);

  return httpServer;
}
