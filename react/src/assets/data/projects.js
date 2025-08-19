export const DEMO = [
  {
    id: "c01",
    title: "UxUnite — Design System",
    client: "UxUnite",
    year: "2022",
    lot: null,
    tags: ["Design System", "Accessibility", "Color", "Typography", "Audit"],
    services: [
      "Design System",
      "Color Palette",
      "Accessibility",
      "Typography",
      "Design Audit",
    ],
    status: "LIVE",
    hours: null,
    readMinutes: 4,
    image: null,
    summary:
      "Design system to align teams: UI audit, refreshed color palette to meet WCAG, modular type scale (1.25), shared tokens/components, docs and onboarding.",
    link: "/cases/case-1.pdf",
  },
  {
    id: "c02",
    title: "Artsy — Museum UX App",
    client: "—",
    year: "2022",
    lot: null,
    tags: ["UX Research", "Personas", "Wireframing", "Prototyping"],
    services: [
      "Interviews",
      "Personas",
      "Journey Mapping",
      "Wireframes",
      "Hi‑fi Prototype",
    ],
    status: "ARCHIVED",
    hours: null,
    readMinutes: 5,
    image: null,
    summary:
      "12 interviews uncovered pain points (tickets, inconsistent storytelling, navigation). Ideation (Crazy 8s), low‑fi wireframes → high‑fi prototype for personalized tours, maps, and easier booking.",
    link: "/cases/case-2.pdf",
  },
  {
    id: "c03",
    title: "Firefly — Ecommerce Website",
    client: "Firefly",
    year: "2024",
    lot: null,
    tags: ["Ecommerce", "Web", "Figma", "Branding"],
    services: [
      "Information Architecture",
      "Visual Design",
      "Prototype",
      "Site Build",
    ],
    status: "LIVE",
    hours: null,
    readMinutes: 3,
    image: null,
    summary:
      "Site for a stove alarm product; clear structure for buyers/owners (manuals, sheets), simple UX, collaboration with two junior designers; defined palette and Cardo type in Figma/FigJam.",
    link: "/cases/case-3.pdf",
  },
  {
    id: "c04",
    title: "Cloud First Nordics — Knowledge Hub",
    client: "Accenture",
    year: "2023",
    lot: null,
    tags: ["WordPress", "UI/UX", "Research", "Redesign"],
    services: [
      "Information Architecture",
      "Content Structuring",
      "Design",
      "WordPress (YOOtheme)",
    ],
    status: "LIVE",
    hours: null,
    readMinutes: 4,
    image: null,
    summary:
      "Internal portal aggregating Cloud First content; led IA, categorization, design and launch on WordPress/YOOtheme. MVP shipped in ~1 month with minimal bugs.",
    link: "/cases/cloud-first.pdf",
  },
];

// Back-compat alias if other files import PROJECTS
export const PROJECTS = DEMO;
export const ALL_TAGS = Array.from(new Set(DEMO.flatMap((p) => p.tags || [])));
