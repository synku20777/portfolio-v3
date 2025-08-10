import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Mail,
  Github,
  Linkedin,
  Download,
  Filter,
} from "lucide-react";

// -----------------------------
// Barcode (aesthetic, not scannable)
// -----------------------------
function Barcode({ value = "PORTFOLIO-2025", height = 48, density = 3 }) {
  const bars = useMemo(() => {
    // Deterministic pseudo-bars based on char codes
    const codes = Array.from(value).map((c) => c.charCodeAt(0));
    const arr = [];
    let toggle = true;
    for (const code of codes) {
      const n = (code % 5) + 1; // width 1..5
      arr.push({ w: n, black: toggle });
      toggle = !toggle;
    }
    // Add guard bars
    arr.unshift(
      { w: 2, black: true },
      { w: 1, black: false },
      { w: 2, black: true }
    );
    arr.push(
      { w: 2, black: true },
      { w: 1, black: false },
      { w: 2, black: true }
    );
    return arr;
  }, [value]);

  const width = bars.reduce((acc, b) => acc + b.w, 0) * density;
  let x = 0;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      aria-label={`barcode ${value}`}
      role="img"
    >
      {bars.map((b, i) => {
        const rect = (
          <rect
            key={i}
            x={x}
            y={0}
            width={b.w * density}
            height={height}
            fill={b.black ? "#111" : "#fff"}
          />
        );
        x += b.w * density;
        return rect;
      })}
      {/* Text strip */}
      <rect x={0} y={height - 12} width={width} height={12} fill="#fff" />
      <text
        x={8}
        y={height - 3}
        fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
        fontSize="10"
        fill="#111"
      >
        {value}
      </text>
    </svg>
  );
}

// -----------------------------
// Fake QR (visual only)
// -----------------------------
function FauxQR({ seed = "PORTFOLIO-QR", size = 108, modules = 21 }) {
  // Lightweight seeded RNG
  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rng = mulberry32(
    [...seed].reduce((a, c) => a + c.charCodeAt(0), 0) || 1
  );

  const cell = size / modules;
  const boxes = [];

  // Draw finder-like patterns at three corners
  const addFinder = (x, y) => {
    boxes.push({ x, y, s: 7, invert: false });
  };
  addFinder(0, 0);
  addFinder(modules - 7, 0);
  addFinder(0, modules - 7);

  const cells = [];
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      // Reserve finder zones
      const inFinder = boxes.some(
        (b) => x >= b.x && x < b.x + b.s && y >= b.y && y < b.y + b.s
      );
      let on = false;
      if (inFinder) {
        // concentric squares
        const min = Math.min(
          x - (x >= boxes[0].x ? boxes[0].x : 0),
          y - (y >= boxes[0].y ? boxes[0].y : 0)
        );
        const ring = Math.min(x, y, modules - 1 - x, modules - 1 - y);
        on = ring % 2 === 0;
      } else {
        on = rng() > 0.58; // sparse, brutalist
      }
      cells.push({ x, y, on });
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label="decorative QR code"
    >
      <rect width={size} height={size} fill="#fff" />
      {cells.map((c, i) =>
        c.on ? (
          <rect
            key={i}
            x={c.x * cell}
            y={c.y * cell}
            width={Math.ceil(cell)}
            height={Math.ceil(cell)}
            fill="#111"
          />
        ) : null
      )}
    </svg>
  );
}

// -----------------------------
// Project card
// -----------------------------
function ProjectCard({ p }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="relative group rounded-2xl border border-neutral-900 bg-white text-black shadow-[0_0_0_1px_#000] overflow-hidden"
    >
      <div className="flex items-start justify-between px-4 pt-3 pb-2 border-b border-black">
        <h3 className="font-black tracking-tight leading-none text-[clamp(14px,2vw,22px)] uppercase">
          {p.title}
        </h3>
        <span className="text-[10px] leading-none uppercase">{p.year}</span>
      </div>
      <div className="p-4 grid gap-3">
        <div className="text-[11px] uppercase tracking-wider grid grid-cols-3 gap-2">
          <div className="border border-black p-2 rounded-lg">
            <p className="font-semibold">Lot</p>
            <p className="font-mono">{p.lot}</p>
          </div>
          <div className="border border-black p-2 rounded-lg">
            <p className="font-semibold">Tags</p>
            <p className="font-mono">{p.tags.join(" · ")}</p>
          </div>
          <div className="border border-black p-2 rounded-lg">
            <p className="font-semibold">Status</p>
            <p className="font-mono">{p.status}</p>
          </div>
        </div>
        <div className="aspect-[16/9] w-full border border-black rounded-xl overflow-hidden bg-neutral-100">
          {/* Image placeholder */}
          <img
            src={p.image}
            alt="project preview"
            loading="lazy"
            className="h-full w-full object-cover mix-blend-multiply"
          />
        </div>
        <p className="text-sm leading-snug font-medium">{p.summary}</p>
        <div className="flex items-center justify-between border-t border-black pt-3">
          <Barcode value={`${p.id}-${p.year}`} height={36} />
          <a
            href={p.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 border border-black rounded-md uppercase text-[11px] font-bold hover:bg-black hover:text-white transition-colors"
          >
            Case Study <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

// -----------------------------
// Demo data (replace with CMS/API later)
// -----------------------------
const DEMO = [
  {
    id: "x01",
    title: "System UI – Design System",
    year: "2025",
    lot: "B15D305",
    tags: ["UI", "System", "Docs"],
    status: "RELEASED",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    summary:
      "Enterprise-grade design system: 200+ tokens, 48 components, barcode docs, and CLI style audit.",
    link: "https://example.com",
  },
  {
    id: "x02",
    title: "Info-Aesthetic Posters",
    year: "2024",
    lot: "E22-43R-0098",
    tags: ["Print", "DataViz"],
    status: "ARCHIVED",
    image:
      "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=1200&auto=format&fit=crop",
    summary:
      "Brutalist poster series translating CSV datasets into 1-bit typographic layouts.",
    link: "https://example.com",
  },
  {
    id: "x03",
    title: "Responsive Label E‑Commerce",
    year: "2025",
    lot: "E11-43R-0007",
    tags: ["Web", "E‑Com", "Perf"],
    status: "LIVE",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
    summary:
      "0.9s LCP storefront; industrial SKU cards; offline QR receipts; a11y AA across flows.",
    link: "https://example.com",
  },
  {
    id: "x04",
    title: "Urban Wayfinding",
    year: "2023",
    lot: "FR025-900-40",
    tags: ["Wayfinding", "Brand"],
    status: "LIVE",
    image:
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1200&auto=format&fit=crop",
    summary:
      "City-scale icon suite; reflective ink typography; GPS-to-QR incident mapping.",
    link: "https://example.com",
  },
];

// -----------------------------
// Filters helper
// -----------------------------
const allTags = Array.from(new Set(DEMO.flatMap((p) => p.tags)));

export default function IndustrialPortfolio() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState([]);

  const projects = useMemo(() => {
    return DEMO.filter(
      (p) =>
        (q
          ? (p.title + p.summary + p.tags.join(" "))
              .toLowerCase()
              .includes(q.toLowerCase())
          : true) &&
        (selected.length ? selected.every((t) => p.tags.includes(t)) : true)
    );
  }, [q, selected]);

  const toggleTag = (t) =>
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  return (
    <div className="min-w-screen bg-white text-black">
      {/* Grid background */}
      <div
        className="pointer-events-none fixed inset-0 [background:repeating-linear-gradient(0deg,#e5e5e5_0px,#e5e5e5_1px,transparent_1px,transparent_24px),repeating-linear-gradient(90deg,#f0f0f0_0px,#f0f0f0_1px,transparent_1px,transparent_24px)]"
        aria-hidden
      />

      {/* Top label header */}
      <div className="relative z-10">
        <header className="sticky top-0 z-40 border-b border-black bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
            <div className="shrink-0 w-24">
              <Barcode value="PORTFOLIO/LOT-001" height={40} />
            </div>
            <div className="flex-1 leading-tight">
              <h1 className="font-black uppercase tracking-[-0.02em] text-[clamp(18px,2.6vw,28px)]">
                Nestors Portfolio
              </h1>
              <p className="uppercase text-[10px]">
                spec: bw/hi-contrast · grid: 24px · medium: web · origin: earth
                · qc: passed
              </p>
            </div>
            <nav className="hidden md:flex items-center gap-3 text-[11px] uppercase">
              <a
                href="#work"
                className="px-2 py-1 border border-black rounded hover:bg-black hover:text-white"
              >
                Work
              </a>
              <a
                href="#about"
                className="px-2 py-1 border border-black rounded hover:bg-black hover:text-white"
              >
                About
              </a>
              <a
                href="#contact"
                className="px-2 py-1 border border-black rounded hover:bg-black hover:text-white"
              >
                Contact
              </a>
            </nav>
          </div>
        </header>

        {/* Hero slab */}
        <section className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-[1fr_auto] gap-8 items-start">
          <div className="grid gap-4">
            <div className="rounded-2xl">
              <h2 className="font-black uppercase text-[clamp(24px,6vw,72px)] leading-[0.95] tracking-tight">
                Brutalist, Minimal, Systematic.
              </h2>
              <p className="mt-3 max-w-[60ch] text-[15px] md:text-base font-medium">
                I build typography‑driven interfaces and industrial brand
                systems. This template leans into label codes, strict grids, and
                honest black/white contrast for a durable portfolio presence.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] uppercase">
                <span className="px-2 py-1 border border-black rounded">
                  performance ≤ 1s lcp
                </span>
                <span className="px-2 py-1 border border-black rounded">
                  a11y AA
                </span>
                <span className="px-2 py-1 border border-black rounded">
                  responsive grid
                </span>
                <span className="px-2 py-1 border border-black rounded">
                  2025-ready
                </span>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-3">
                <p className="text-[10px] uppercase">version</p>
                <p className="font-mono text-xl">v1.0.0</p>
              </div>
              <div className="p-3">
                <p className="text-[10px] uppercase">lot</p>
                <p className="font-mono text-xl">B15D305</p>
              </div>
              <div className="p-3">
                <p className="text-[10px] uppercase">date</p>
                <p className="font-mono text-xl">
                  {new Date().toISOString().slice(0, 10)}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <FauxQR seed="contact@yourname" />
            <p className="text-[10px] uppercase">
              scan-like graphic · decorative
            </p>
          </div>
        </section>

        {/* Controls */}
        <section id="work" className="mx-auto max-w-6xl px-4 pb-3">
          <div className="flex flex-wrap items-center gap-3 border border-black rounded-2xl p-3">
            <div className="flex items-center gap-2 bg-white border border-black rounded-xl px-3 py-2">
              <Filter size={16} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search projects…"
                className="outline-none placeholder-black/40 bg-transparent text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleTag(t)}
                  className={`px-2 py-1 text-[11px] uppercase border border-black rounded  ${
                    selected.includes(t) ? "bg-black text-white" : "bg-white"
                  }`}
                >
                  {t}
                </button>
              ))}
              {selected.length > 0 && (
                <button
                  onClick={() => setSelected([])}
                  className="px-2 py-1 text-[11px] uppercase border border-dashed border-black rounded"
                >
                  Clear
                </button>
              )}
            </div>
            <span className="ml-auto text-[11px] uppercase">
              {projects.length} / {DEMO.length} shown
            </span>
          </div>
        </section>

        {/* Projects grid */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {projects.map((p) => (
                <ProjectCard key={p.id} p={p} />
              ))}
            </AnimatePresence>
          </div>
        </section>

        {/* About / Credentials */}
        <section
          id="about"
          className="mx-auto max-w-6xl px-4 pb-16 grid lg:grid-cols-3 gap-8 items-start"
        >
          <div className="rounded-2xl border border-black p-5 bg-white">
            <h3 className="font-black uppercase text-2xl">About</h3>
            <p className="mt-3 font-medium max-w-prose">
              Designer/engineer focused on utilitarian visual systems. I like
              grids, label vernacular, and readable code. I work end‑to‑end:
              research → IA → UI → engineering → performance QA.
            </p>
            <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-[12px]">
              <li className="border border-black rounded-lg p-2">
                Grid discipline: <b>24px</b> baseline
              </li>
              <li className="border border-black rounded-lg p-2">
                Type stack: <b>Inter / Mono</b>
              </li>
              <li className="border border-black rounded-lg p-2">
                Perf budget: <b>170kb</b> JS
              </li>
              <li className="border border-black rounded-lg p-2">
                A11y: <b>Keyboard + SR</b>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-black p-5 bg-white">
            <h3 className="font-black uppercase text-2xl">Services</h3>
            <div className="mt-3 grid gap-2 text-[12px]">
              {[
                "Design systems & tokens",
                "Identity & industrial brand",
                "Data visualization & dashboards",
                "Web apps (Next.js) with performance SLAs",
              ].map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border border-black rounded-lg p-3"
                >
                  <span className="uppercase">{s}</span>
                  <span className="font-mono">
                    SVC-{(i + 1).toString().padStart(3, "0")}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-black p-5 bg-white">
            <h3 className="font-black uppercase text-2xl">Credentials</h3>
            <ol className="mt-3 space-y-2 text-[12px]">
              <li className="border border-black rounded-lg p-3 flex items-center justify-between">
                <span>HSE · Visual Research in Utilitarian Design</span>
                <span className="font-mono">DOC‑2018</span>
              </li>
              <li className="border border-black rounded-lg p-3 flex items-center justify-between">
                <span>Data‑Aesthetic Thesis · Bartlett</span>
                <span className="font-mono">TH‑2017</span>
              </li>
              <li className="border border-black rounded-lg p-3 flex items-center justify-between">
                <span>WCAG 2.2 Practitioner</span>
                <span className="font-mono">CERT‑AA</span>
              </li>
            </ol>
            <a
              href="#"
              className="mt-4 inline-flex items-center gap-2 px-3 py-2 border border-black rounded-md uppercase text-[11px] font-bold hover:bg-black hover:text-white"
            >
              <Download size={16} /> Download Resume
            </a>
          </div>
        </section>

        {/* Contact */}
        <footer id="contact" className="border-t border-black bg-white/80">
          <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-[1fr_auto] gap-6 items-start">
            <div>
              <h3 className="font-black uppercase text-2xl">Contact</h3>
              <p className="mt-2 text-sm max-w-prose">
                Available for select collaborations. Quote number on
                correspondence for faster routing.
              </p>
              <div className="mt-4 grid sm:grid-cols-3 gap-3 text-[12px]">
                <div className="border border-black rounded-xl p-3">
                  <p className="uppercase">Primary</p>
                  <a
                    className="font-mono flex items-center gap-2 mt-1 hover:underline"
                    href="mailto:contact@yourname"
                  >
                    {" "}
                    <Mail size={16} /> contact@yourname
                  </a>
                </div>
                <div className="border border-black rounded-xl p-3">
                  <p className="uppercase">Networks</p>
                  <div className="flex items-center gap-3 mt-1">
                    <a className="font-mono hover:underline" href="#">
                      <Github size={16} className="inline" /> GitHub
                    </a>
                    <a className="font-mono hover:underline" href="#">
                      <Linkedin size={16} className="inline" /> LinkedIn
                    </a>
                  </div>
                </div>
                <div className="border border-black rounded-xl p-3">
                  <p className="uppercase">Quote</p>
                  <p className="font-mono">
                    RFQ‑{new Date().getFullYear()}‑001
                  </p>
                </div>
              </div>
            </div>
            <div className="w-32 self-center md:self-start">
              <Barcode value="MADE‑IN‑WEB/CE" height={80} />
              <p className="text-[10px] uppercase text-center mt-1">
                made in web · ce
              </p>
            </div>
          </div>
          <div className="border-t border-black py-4 text-center text-[10px] uppercase">
            © {new Date().getFullYear()} Your Name — utilitarian portfolio · all
            rights reserved
          </div>
        </footer>

        {/* Accessibility: skip link */}
        <a
          href="#work"
          className="sr-only focus:not-sr-only fixed top-2 left-2 bg-white border border-black px-3 py-2 text-[12px] rounded"
        >
          Skip to work
        </a>

        {/* Print styles: clean 1‑bit */}
        <style>{`
        @media print { 
          * { color: #000 !important; background: #fff !important; box-shadow: none !important; }
          a::after { content: " (" attr(href) ")"; font-size: 10px; }
        }
      `}</style>
      </div>
    </div>
  );
}
