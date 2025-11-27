# AI Prompt Marketplace

## Overview

An AI-powered prompt marketplace platform where users can create, share, and customize prompt templates with dynamic variables. The application features a sophisticated prompt editor with variable management, a gallery for browsing templates, and an AI generation interface powered by Google's Gemini AI. Users can create reusable prompt templates with customizable parameters (text fields, checkboxes, sliders, select dropdowns) and generate AI content based on these templates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for component-based UI development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching
- Tailwind CSS with shadcn/ui component library for consistent design system

**Design Philosophy:**
- Dark-themed UI inspired by creative marketplaces (Behance, Dribbble) and enterprise editors (Figma, Linear)
- Custom design tokens defined in CSS variables for theming
- Inter font for UI elements and JetBrains Mono for code/prompt displays
- Responsive layout system using Tailwind's utility classes

**Component Structure:**
- Page components: Gallery, Editor, Generator, Showcase
- Reusable UI components: PromptCard, CreationCard, FilterBar, Navbar, GeneratorInterface
- Extensive shadcn/ui component library integration (40+ components)
- Form management with react-hook-form and Zod validation

**State Management Strategy:**
- React Query handles all server data fetching, caching, and synchronization
- Local component state for UI interactions
- No global state management library (Redux/Zustand) - keeping it simple with Query and local state

### Backend Architecture

**Server Framework:**
- Express.js REST API with TypeScript
- Dual server modes: development (with Vite middleware) and production (static file serving)
- Session-based architecture prepared (connect-pg-simple for PostgreSQL sessions)

**API Design:**
- RESTful endpoints for CRUD operations on prompts and variables
- Route structure: `/api/prompts`, `/api/prompts/:id`, `/api/variables`
- Validation using Zod schemas derived from Drizzle ORM schema
- Error handling with appropriate HTTP status codes

**Storage Layer:**
- PostgreSQL-backed DatabaseStorage implementation with encrypted prompt storage
- AES-256-GCM encryption for all prompt content
- Separation of concerns between storage interface and implementation
- Encryption key required via PROMPT_ENCRYPTION_KEY environment variable

### Data Storage Solutions

**Database:**
- PostgreSQL via Neon serverless (@neondatabase/serverless with WebSocket support)
- Drizzle ORM for type-safe database queries and schema management
- Schema-first approach with automatic TypeScript type inference

**Database Schema:**
- `users` table: id, username, password (authentication ready)
- `prompts` table: id, title, encrypted_content, iv, auth_tag, userId, artistId, category, tags, aiModel, price, aspectRatio, photoCount, promptType, uploadedPhotos, resolution, previewImageUrl, downloads, rating, createdAt
- `variables` table: id, promptId, name, label, description, type, defaultValue, required, position, min, max, step, options, defaultOptionIndex, placeholder
- `artists` table: id, username, displayName, bio, avatarUrl, coverImageUrl, followerCount, followingCount
- `artworks` table: id, artistId, title, description, imageUrl, promptUsed, promptId, likes, views, isPublic, tags, createdAt
- Support for complex variable types stored as JSONB (defaultValue, options arrays)

**Variable Types System:**
- Text inputs with default values
- Checkboxes for conditional prompt sections
- Single-select (radio groups) with custom options
- Multi-select with multiple choice support
- Sliders with min/max range configurations

### Authentication and Authorization

**Prepared Authentication Mechanism:**
- User schema with username/password fields defined
- Session storage configuration with connect-pg-simple
- Storage interface includes user lookup methods (getUser, getUserByUsername, createUser)
- Not yet fully implemented in routes - infrastructure ready for implementation

**Security Considerations:**
- Password storage structure exists (needs hashing implementation)
- Session-based authentication prepared
- Credential-based fetch requests configured

## External Dependencies

### Third-Party Services

**AI Generation:**
- Google Generative AI (@google/genai) - Gemini models for content generation
- Integration points in GeneratorInterface component
- Model selection support (gemini-2.5, gemini-3.0)

**Database Service:**
- Neon PostgreSQL serverless database
- WebSocket-based connection pooling
- Connection string via DATABASE_URL environment variable

### Development Tools

**Replit-Specific Integrations:**
- @replit/vite-plugin-runtime-error-modal for error overlays
- @replit/vite-plugin-cartographer for development mapping
- @replit/vite-plugin-dev-banner for development notifications

**Build and Development:**
- Drizzle Kit for database migrations and schema management
- ESBuild for production server bundling
- PostCSS with Tailwind CSS for styling
- TypeScript for type safety across the stack

### UI Component Libraries

**Radix UI Primitives:**
- Complete set of unstyled, accessible components (30+ primitives)
- Dialog, Dropdown, Select, Slider, Tooltip, Accordion, and more
- Customized via shadcn/ui wrapper components with Tailwind styling

**Additional UI Libraries:**
- cmdk for command palette interfaces
- react-day-picker for calendar/date selection
- embla-carousel-react for carousels
- recharts for potential data visualization
- class-variance-authority for variant-based component styling