import { 
  type User, 
  type InsertUser, 
  type Prompt, 
  type InsertPrompt,
  type Variable,
  type InsertVariable
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private prompts: Map<string, Prompt>;
  private variables: Map<string, Variable>;

  constructor() {
    this.users = new Map();
    this.prompts = new Map();
    this.variables = new Map();
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
      userId: insertPrompt.userId ?? null
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
      options: insertVariable.options ?? null
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
}

export const storage = new MemStorage();
