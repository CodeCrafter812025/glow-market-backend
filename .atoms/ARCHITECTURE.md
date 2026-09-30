---
last_updated: 2026-07-25T13:34:51Z
---

# Architecture Design

## System Overview
A modern, responsive customer landing page for a two-sided beauty/skincare marketplace. Single-page application with header, hero, AI recommendation, and product grid sections.

## Tech Stack
- React + TypeScript + Vite
- Tailwind CSS + Shadcn/ui
- Lucide React icons

## Module Design
| Module | Responsibility | Key Files |
|--------|---------------|-----------|
| Landing Page | Main page composition | src/pages/Index.tsx |
| Header | Navigation, search, profile/cart | src/components/Header.tsx |
| Hero | Banner with tagline | src/components/HeroSection.tsx |
| AI Recommendation | Skin quiz CTA | src/components/AIRecommendation.tsx |
| Product Grid | Product cards with badges | src/components/ProductGrid.tsx |
| Product Card | Individual product display | src/components/ProductCard.tsx |

## Tech Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Color palette | Rose gold, soft pastels, off-white | Premium beauty brand aesthetic |
| Typography | Cormorant (display) + Inter (body) | Elegant serif + clean sans-serif pairing |
| Layout | CSS Grid + Flexbox | Responsive product grid with mobile optimization |
| Icons | Lucide React | Consistent, lightweight icon set |

## File Tree Plan
```
src/
├── pages/Index.tsx          (main landing page)
├── components/
│   ├── Header.tsx           (navigation header)
│   ├── HeroSection.tsx      (hero banner)
│   ├── AIRecommendation.tsx (skin quiz section)
│   ├── ProductGrid.tsx      (product cards grid)
│   └── ProductCard.tsx      (individual product card)
├── index.css                (theme tokens & global styles)
└── App.tsx                  (router)
```

## Implementation Guide
1. Update index.css with beauty-themed color tokens (rose gold primary, soft pastels)
2. Generate hero banner and product images
3. Build components bottom-up: ProductCard → ProductGrid → AIRecommendation → HeroSection → Header
4. Compose all in Index.tsx
5. Ensure responsive breakpoints for mobile

