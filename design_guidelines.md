# AI Prompt Marketplace - Design Guidelines

## Design Approach

**Hybrid Strategy**: Combine creative marketplace aesthetics (Dribbble, Behance) with enterprise-grade editor precision (Figma, Linear). Dark theme throughout with vibrant accent colors for generated artwork and interactive elements.

**Inspiration Sources**:
- Gallery/Showcase: Behance's masonry grid + ArtStation's filtering
- Editor Interface: Figma's three-panel workspace + VS Code's dark theme
- Chat Interface: ChatGPT's conversational flow + Midjourney's iteration patterns

## Typography

**Font Stack**:
- **Primary**: Inter (headings, UI elements)
- **Secondary**: JetBrains Mono (code editor, prompt display)

**Hierarchy**:
- Hero/Page Titles: text-4xl lg:text-5xl font-bold
- Section Headers: text-2xl lg:text-3xl font-semibold
- Card Titles: text-lg font-semibold
- Body Text: text-base
- Captions/Meta: text-sm text-gray-400
- Code/Prompts: font-mono text-sm

## Layout System

**Spacing Scale**: Use Tailwind units 2, 4, 6, 8, 12, 16, 20, 24 consistently.

**Containers**:
- Full-width sections: w-full with max-w-7xl px-6 lg:px-8
- Editor workspace: Full viewport with no max-width
- Gallery grid: max-w-7xl with responsive gutters

**Grid Patterns**:
- Gallery: Masonry with gap-6, responsive columns (1/2/3/4)
- Editor: Fixed three-panel (300px / flex-1 / 400px) on desktop, stacked on mobile
- Settings forms: Two-column grid on desktop, single column mobile

## Component Library

### Navigation
**Top Navigation Bar**: Sticky dark header (h-16) with:
- Logo left
- Search bar center (max-w-xl)
- Credit balance + user menu right
- Subtle border-b with gradient accent

### Gallery Cards
**Prompt Template Cards**:
- Aspect ratio 4:3 for thumbnails
- Hover: Scale 1.02 with shadow-xl transition
- Overlay: Gradient bottom with title, artist, price
- Free/Paid badge: Absolute top-right with backdrop-blur
- Generated examples: 2x2 grid preview

### Filters Panel
**Horizontal Filter Bar**:
- Sticky below nav
- Toggle buttons for Free/Paid (active state: bright accent)
- Dropdown menus for categories, sort
- Tag chips with x-close icons
- Reset filters link right-aligned

### Prompt Editor (Three-Panel Layout)

**Left Panel - Settings (300px)**:
- Scrollable config panel
- Grouped sections with collapsible headers
- AI Model selector: Card grid with badges (2.5/3.0)
- Aspect ratio: Visual button grid showing ratios
- Sliders with value displays (Evil/Fire mockup style)
- Resolution display with pixel dimensions

**Center Panel - Editor (Flex)**:
- Monaco-style code editor with dark theme
- Syntax highlighting for {{variables}}
- Line numbers left gutter
- Toolbar top: Save, Validate, Test buttons
- Variable insertion autocomplete

**Right Panel - Preview (400px)**:
- Live prompt preview box (read-only, monospace)
- Cost calculator card with itemized breakdown
- Generate button (prominent, gradient)
- Thumbnail preview of example outputs

### Chat-Based Generator Interface

**Iteration Workflow**:
- Generated image: Large display (max-h-screen)
- Chat box below: Input with Send/Regenerate buttons
- Iteration counter: "3 of 5 iterations remaining" badge
- Accept/Reject buttons: Prominent split layout
  - Accept: Green gradient with "Save & Showcase" option
  - Reject: Secondary with "Refine in chat"
- Previous iterations: Thumbnail carousel left sidebar

**Cost Display**:
- Per-iteration pricing breakdown
- Running total with credit deduction animation
- Warning at iteration 4/5: "Last refinement"

### Community Showcase Gallery

**Creation Cards**:
- Full image display with subtle border
- Hover info overlay: Original prompt name, creator, likes
- Original prompt link: Chip badge bottom-left
- View details: Opens modal with full prompt chain + iterations

### Pricing/Credit Components

**Credit Display**: Always visible in nav
- Current balance with coin icon
- Animated decrement on generation
- Buy credits button with gradient

**Cost Calculator Card**:
- Itemized rows: Base generation, model tier, resolution, iterations
- Subtotal with bold emphasis
- "Generate (X credits)" primary button

## Images

**Hero Section**: Full-width showcase carousel
- Curated featured creations (1920x800)
- Auto-play slideshow of best community generations
- Overlay: "Create Your Own" CTA with blurred button background

**Gallery Thumbnails**: AI-generated example images for each prompt
- 4:3 aspect ratio cards
- Lazy-loaded masonry layout

**Creation Showcase**: User-accepted generations
- Original resolution display
- Lightbox modal on click

## Animations

**Minimal & Purposeful**:
- Gallery cards: hover scale transform
- Chat messages: Slide-in from bottom
- Credit deduction: Number count-down animation
- Image generation: Pulsing loader with progress text
- Accept button: Subtle success glow on click

**No** page transitions, scroll animations, or decorative motion.