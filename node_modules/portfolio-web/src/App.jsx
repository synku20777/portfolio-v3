import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Mail,
  Github,
  Linkedin,
  Download,
  Filter,
  Scissors,
} from "lucide-react";

/**
 * Industrial Portfolio — "Label/Receipt" Edition (All squared corners)
 * -------------------------------------------------------------------
 * - High-contrast black/white
 * - Technical typography + strict grid
 * - Barcode + faux-QR aesthetics
 * - Case study cards styled like thermal receipts
 * - Inline comments throughout (especially on non-trivial bits)
 */

// -----------------------------
// Barcode (aesthetic, not scannable)
// -----------------------------
function Barcode({ value = "PORTFOLIO-2025", height = 48, density = 3 }) {
  /**
   * We synthesize simple bar patterns from the input string by
   * 1) converting each char to its charCode
   * 2) mapping code → bar width 1..5
   * 3) alternating black/white to get a convincing label look
   * This is deterministic but *not* a real barcode encoding.
   */
  const bars = useMemo(() => {
    const codes = Array.from(value).map((c) => c.charCodeAt(0));
    const arr = [];
    let toggle = true; // flip black/white each bar for rhythm
    for (let i = 0; i < codes.length; i++) {
      const n = (codes[i] % 5) + 1; // width 1..5
      arr.push({ w: n, black: toggle });
      toggle = !toggle;
    }
    // Add symmetric guard bars for a more authentic silhouette
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
      {/* Draw the bars left→right by accumulating x */}
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
      {/* Text strip along the bottom to sell the illusion */}
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
// Real QR with graceful fallback to FauxQR (no deps)
// -----------------------------
function RealQR({ data, size = 108 }) {
  const [ok, setOk] = useState(true);
  if (!data) return <FauxQR seed="" size={size} />;
  const src =
    "https://api.qrserver.com/v1/create-qr-code/?size=" +
    size +
    "x" +
    size +
    "&data=" +
    encodeURIComponent(data);
  return ok ? (
    <img
      src={src}
      width={size}
      height={size}
      alt="QR"
      onError={() => setOk(false)}
      className="block select-none"
      loading="lazy"
    />
  ) : (
    <FauxQR seed={data} size={size} />
  );
}

// -----------------------------
// Faux QR (visual only)
// -----------------------------
function FauxQR({ seed = "PORTFOLIO-QR", size = 108, modules = 21 }) {
  /**
   * Lightweight + deterministic RNG so the pattern is stable for a seed.
   * We intentionally do not generate a valid QR matrix — just a vibe.
   */
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

  const cell = size / modules; // size of one module (square)
  const boxes = [];

  // Place three finder-like squares at classic QR corners for recognizability
  const addFinder = (x, y) => boxes.push({ x, y, s: 7 });
  addFinder(0, 0);
  addFinder(modules - 7, 0);
  addFinder(0, modules - 7);

  // Build the module grid
  const cells = [];
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      // Keep finder zones solid/concentric; the rest is random-sparse
      const inFinder = boxes.some(
        (b) => x >= b.x && x < b.x + b.s && y >= b.y && y < b.y + b.s
      );
      let on = false;
      if (inFinder) {
        const ring = Math.min(x, y, modules - 1 - x, modules - 1 - y);
        on = ring % 2 === 0; // concentric rings
      } else {
        on = rng() > 0.58; // ~42% fill gives a crisp 1-bit texture
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
// Helpers: read time + thermal paper texture
// -----------------------------
const estimateReadMinutes = (text, wpm = 220) => {
  const words = (text || "").trim().split(/ +/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wpm));
};

const thermalPaperBg = {
  // Layer order: first = top, last = bottom. We push stripes to the BACK.
  backgroundImage:
    // faint horizontal banding (top layer)
    "repeating-linear-gradient(0deg,rgba(0,0,0,0.02) 0 2px,transparent 2px 14px)," +
    // vertical feed stripes at 10% alpha (bottom layer)
    "repeating-linear-gradient(90deg,rgba(0,0,0,0.1) 0 8px,transparent 8px 16px)",
  // Banding covers full card; stripes are a shallow 8px height row, then non-repeated vertically
  backgroundSize: "100% 100%, 100% 8px",
  backgroundRepeat: "repeat, no-repeat",
  backgroundPosition: "0 0, 0 0",
};

// -----------------------------
// Services → "products" derivation helpers
// -----------------------------
const SERVICE_ALIAS = {
  "Design System": "Design System Package",
  Components: "Component Kit",
  Governance: "Governance Playbook",
  "UX Research": "UX Research Sprint",
  Flows: "User Flow Mapping",
  Web: "Web Build",
  Prototyping: "Prototype Kit",
  Responsive: "Responsive QA",
};

function mapServiceName(s) {
  return SERVICE_ALIAS[s] || s;
}

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function productCode(name, seed) {
  const abbr = name
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(" ")
    .map((w) => (w[0] || "").toUpperCase())
    .join("")
    .slice(0, 4)
    .padEnd(3, "X");
  const num = (hashStr(name + ":" + seed) % 1000).toString().padStart(3, "0");
  return `SKU-${abbr}-${num}`;
}

function deriveProducts(p) {
  const base = p?.services?.length ? p.services : p?.tags || [];
  return base.map((s, i) => {
    const name = mapServiceName(s);
    return { name, code: productCode(name, `${p.id}-${i}`), qty: 1 };
  });
}

// -----------------------------
// ReceiptRow — key/value with dashed divider
// -----------------------------
function ReceiptRow({ k, v }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-3 py-1 border-b border-dashed border-black text-[11px] uppercase">
      <span className="font-semibold tracking-wide">{k}</span>
      <span className="font-mono">{v}</span>
    </div>
  );
}

// -----------------------------
// Project card → "thermal receipt" styling
// -----------------------------
function ProjectCard({ p }) {
  const readMin = p.readMinutes ?? estimateReadMinutes(p.summary);
  const items = deriveProducts(p);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      // All squared corners (no rounded); hard 1px frame
      className="relative group border border-black bg-white text-black shadow-[0_0_0_1px_#000] overflow-hidden"
      style={thermalPaperBg}
    >
      {/* Side perforation strips (pure CSS via repeating radial gradients) */}
      <div
        aria-hidden
        className="absolute left-0 top-0 h-full w-3 border-r border-black bg-[repeating-radial-gradient(circle_at_1.5px_1.5px,#fff_0_1.5px,transparent_1.5px_6px)]"
      />
      <div
        aria-hidden
        className="absolute right-0 top-0 h-full w-3 border-l border-black bg-[repeating-radial-gradient(circle_at_1.5px_1.5px,#fff_0_1.5px,transparent_1.5px_6px)]"
      />

      {/* Header band — receipt masthead */}
      <div className="px-4 pt-3 pb-2 border-b border-black">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-black tracking-tight leading-none text-[clamp(14px,2vw,22px)] uppercase">
            {p.title}
          </h3>
          <span className="text-[10px] leading-none uppercase">{p.year}</span>
        </div>
        <div className="mt-2 text-[10px] uppercase font-mono flex items-center justify-between">
          <span>CASE ID: {p.id}</span>
          <span>LOT: {p.lot ?? "—"}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 grid gap-3">
        {/* Monochrome image — styled like thermal print */}
        <div className="aspect-[16/9] w-full border border-black overflow-hidden bg-white">
          {p.image ? (
            <img
              src={p.image}
              alt="project preview"
              loading="lazy"
              className="h-full w-full object-cover filter grayscale contrast-200"
            />
          ) : (
            <div className="h-full w-full grid place-items-center">
              <FauxQR seed={p.title || p.id} size={96} />
              <span className="text-[10px] uppercase mt-2">no image</span>
            </div>
          )}
        </div>

        {/* Key/value rows */}
        <div>
          <ReceiptRow k="Tags" v={p.tags.join(" · ")} />
          <ReceiptRow k="Status" v={p.status} />
        </div>

        {/* Summary line with dashed cap */}
        <div className="border-y border-dashed border-black p-2 text-sm leading-snug font-medium">
          {p.summary}
        </div>

        {/* Products purchased (derived from services/tags) */}
        {items.length ? (
          <div>
            <div className="px-2 py-1 text-[10px] uppercase font-semibold border-b border-black">
              Products
            </div>
            <div className="p-2">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[auto_1fr_auto] items-baseline gap-3 py-1 border-b border-dashed border-black text-[12px]"
                >
                  <span className="font-mono">{it.code}</span>
                  <span className="uppercase">{it.name}</span>
                  <span className="font-mono">x{it.qty}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-2 py-1 text-[10px] uppercase border border-dashed border-black">
            No products
          </div>
        )}
        {/* Hours + read time (no tax/total) */}
        <div className="mt-1">
          <div className="grid grid-cols-[1fr_auto] gap-3 py-1 text-[11px] uppercase">
            <span className="tracking-wide">Subtotal (Hours)</span>
            <span className="font-mono">
              {p.hours != null ? `${p.hours}h` : "—"}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-3 py-1 border-t border-dashed border-black text-[11px] uppercase">
            <span className="tracking-wide font-semibold">
              Read Time (Case)
            </span>
            <span className="font-mono">≈ {readMin} min</span>
          </div>
        </div>

        {/* Footer strip with barcode + action as label button */}
        <div className="flex items-center justify-between pt-2">
          <div className="w-1/2 max-w-[220px]">
            <Barcode value={`${p.id}-${p.year}`} height={36} />
          </div>
          <a
            href={p.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 border border-black uppercase text-[11px] font-bold hover:bg-black hover:text-white transition-colors"
          >
            Case Study <ArrowUpRight size={16} />
          </a>
        </div>

        {/* Stub separator (perforation) */}
        <div className="mt-3 border-t border-dashed border-black" />
        {/* Tear-off stub */}
        <div className="grid grid-cols-[1fr_auto] gap-3 items-center py-2">
          <div className="text-[10px] uppercase">
            <div className="flex items-center gap-2">
              <Scissors size={14} />
              <span>Cut along the perforation · Keep stub</span>
            </div>
            <div className="font-mono mt-1">
              {p.id}/{p.year} · LOT {p.lot}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[96px]">
              <Barcode value={`STUB-${p.id}`} height={32} />
            </div>
            <RealQR data={p.link} size={80} />
          </div>
        </div>
        <p className="text-[10px] uppercase tracking-wide">
          No returns · Keep for your records · Printed{" "}
          {new Date().toISOString().slice(0, 10)}
        </p>
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
    title: "Ennova Design System",
    year: "2025",
    lot: null,
    tags: ["Design System", "Components", "Governance"],
    status: "ACTIVE",
    hours: null,
    readMinutes: 2,
    image: null,
    summary:
      "Built a reusable, tokenized component library adopted by 3+ internal teams; set standards (tokens, naming, best practices), maintained docs/versioning, and led 2 onboarding workshops to drive adoption. ",
    link: "https://nestux.site",
  },
  {
    id: "x02",
    title: "Aurora Marketplace — System & UX",
    year: "2024",
    lot: null,
    tags: ["Design System", "UX Research", "Flows"],
    status: "ACTIVE",
    hours: null,
    readMinutes: 3,
    image: null,
    summary:
      "Developed a scalable design system used across multiple product teams; ran interviews, surveys, and usability tests to validate needs; iterated user flows to enhance usability and satisfaction. ",
    link: "https://nestux.site",
  },
  {
    id: "x03",
    title: "Cloud First Nordics (Accenture) — Web Suite",
    year: "2023",
    lot: null,
    tags: ["Web", "Prototyping", "Responsive"],
    status: "ARCHIVED",
    hours: null,
    readMinutes: 3,
    image: null,
    summary:
      "Produced wireframes/prototypes, aligned stakeholders, and shipped responsive, cross-browser websites; identified improvements, balanced business/user needs, and supported marketing/process definition (Figma, WordPress, YOOtheme). ",
    link: "https://nestux.site",
  },
];

// -----------------------------
// Filters helper
// -----------------------------
const allTags = Array.from(new Set(DEMO.flatMap((p) => p.tags || [])));

export default function IndustrialPortfolio() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState([]);

  /**
   * Filtering is tiny but memoized:
   * - text search over title/summary/tags
   * - AND filter for selected tags
   */
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
    <div className="min-h-screen bg-white text-black">
      {/* Grid background — thin 1px grid, purely decorative */}
      <div
        className="pointer-events-none fixed inset-0 [background:repeating-linear-gradient(0deg,#e5e5e5_0px,#e5e5e5_1px,transparent_1px,transparent_24px),repeating-linear-gradient(90deg,#f0f0f0_0px,#f0f0f0_1px,transparent_1px,transparent_24px)]"
        aria-hidden
      />

      {/* Top label header — all squared; nav chips are square too */}
      <header className="sticky top-0 z-40 border-b border-black bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
          <div className="shrink-0 w-24">
            <Barcode value="PORTFOLIO/LOT-001" height={40} />
          </div>
          <div className="flex-1 leading-tight">
            <h1 className="font-black uppercase tracking-[-0.02em] text-[clamp(18px,2.6vw,28px)]">
              Utilitarian Portfolio: Technical Aesthetic
            </h1>
            <p className="uppercase text-[10px]">
              spec: bw/hi-contrast · grid: 24px · medium: web · origin: earth ·
              qc: passed
            </p>
          </div>
          <nav className="hidden md:flex items-center gap-3 text-[11px] uppercase">
            <a
              href="#work"
              className="px-2 py-1 border border-black hover:bg-black hover:text-white"
            >
              Work
            </a>
            <a
              href="#about"
              className="px-2 py-1 border border-black hover:bg-black hover:text-white"
            >
              About
            </a>
            <a
              href="#contact"
              className="px-2 py-1 border border-black hover:bg-black hover:text-white"
            >
              Contact
            </a>
          </nav>
        </div>
      </header>

      {/* Hero slab */}
      <section className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-[1fr_auto] gap-8 items-start">
        <div className="grid gap-4">
          <div className="border border-black p-4">
            <h2 className="font-black uppercase text-[clamp(24px,6vw,72px)] leading-[0.95] tracking-tight">
              Brutalist, Minimal, Systematic.
            </h2>
            <p className="mt-3 max-w-[60ch] text-[15px] md:text-base font-medium">
              I build typography‑driven interfaces and industrial brand systems.
              This template leans into label codes, strict grids, and honest
              black/white contrast for a durable portfolio presence.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] uppercase">
              <span className="px-2 py-1 border border-black">
                performance ≤ 1s lcp
              </span>
              <span className="px-2 py-1 border border-black">a11y AA</span>
              <span className="px-2 py-1 border border-black">
                responsive grid
              </span>
              <span className="px-2 py-1 border border-black">2025-ready</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="border border-black p-3">
              <p className="text-[10px] uppercase">version</p>
              <p className="font-mono text-xl">v1.0.0</p>
            </div>
            <div className="border border-black p-3">
              <p className="text-[10px] uppercase">lot</p>
              <p className="font-mono text-xl">B15D305</p>
            </div>
            <div className="border border-black p-3">
              <p className="text-[10px] uppercase">date</p>
              <p className="font-mono text-xl">
                {new Date().toISOString().slice(0, 10)}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <RealQR data="mailto:contact@yourname" />
          <p className="text-[10px] uppercase">
            scan to contact · fallback safe
          </p>
        </div>
      </section>

      {/* Controls */}
      <section id="work" className="mx-auto max-w-6xl px-4 pb-3">
        <div className="flex flex-wrap items-center gap-3 border border-black p-3">
          {/* Search box */}
          <label className="flex items-center gap-2 bg-white border border-black px-3 py-2">
            <Filter size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects…"
              className="outline-none placeholder-black/40 bg-transparent text-sm"
            />
          </label>

          {/* Tag filters */}
          <div className="flex flex-wrap gap-2">
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className={`px-2 py-1 text-[11px] uppercase border border-black ${
                  selected.includes(t) ? "bg-black text-white" : "bg-white"
                }`}
              >
                {t}
              </button>
            ))}
            {selected.length > 0 && (
              <button
                onClick={() => setSelected([])}
                className="px-2 py-1 text-[11px] uppercase border border-dashed border-black"
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
        <div className="border border-black p-5 bg-white">
          <h3 className="font-black uppercase text-2xl">About</h3>
          <p className="mt-3 font-medium max-w-prose">
            Designer/engineer focused on utilitarian visual systems. I like
            grids, label vernacular, and readable code. I work end‑to‑end:
            research → IA → UI → engineering → performance QA.
          </p>
          <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-[12px]">
            <li className="border border-black p-2">
              Grid discipline: <b>24px</b> baseline
            </li>
            <li className="border border-black p-2">
              Type stack: <b>Inter / Mono</b>
            </li>
            <li className="border border-black p-2">
              Perf budget: <b>170kb</b> JS
            </li>
            <li className="border border-black p-2">
              A11y: <b>Keyboard + SR</b>
            </li>
          </ul>
        </div>
        <div className="border border-black p-5 bg-white">
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
                className="flex items-center justify-between border border-black p-3"
              >
                <span className="uppercase">{s}</span>
                <span className="font-mono">
                  SVC-{(i + 1).toString().padStart(3, "0")}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-black p-5 bg-white">
          <h3 className="font-black uppercase text-2xl">Credentials</h3>
          <ol className="mt-3 space-y-2 text-[12px]">
            <li className="border border-black p-3 flex items-center justify-between">
              <span>HSE · Visual Research in Utilitarian Design</span>
              <span className="font-mono">DOC‑2018</span>
            </li>
            <li className="border border-black p-3 flex items-center justify-between">
              <span>Data‑Aesthetic Thesis · Bartlett</span>
              <span className="font-mono">TH‑2017</span>
            </li>
            <li className="border border-black p-3 flex items-center justify-between">
              <span>WCAG 2.2 Practitioner</span>
              <span className="font-mono">CERT‑AA</span>
            </li>
          </ol>
          <a
            href="#"
            className="mt-4 inline-flex items-center gap-2 px-3 py-2 border border-black uppercase text-[11px] font-bold hover:bg-black hover:text-white"
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
              <div className="border border-black p-3">
                <p className="uppercase">Primary</p>
                <a
                  className="font-mono flex items-center gap-2 mt-1 hover:underline"
                  href="mailto:contact@yourname"
                >
                  {" "}
                  <Mail size={16} /> contact@yourname
                </a>
              </div>
              <div className="border border-black p-3">
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
              <div className="border border-black p-3">
                <p className="uppercase">Quote</p>
                <p className="font-mono">RFQ‑{new Date().getFullYear()}‑001</p>
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
        className="sr-only focus:not-sr-only fixed top-2 left-2 bg-white border border-black px-3 py-2 text-[12px]"
      >
        Skip to work
      </a>

      {/* Print styles: force 1‑bit for clean hardcopies */}
      <style>{`
        @media print { 
          * { color: #000 !important; background: #fff !important; box-shadow: none !important; }
          a::after { content: " (" attr(href) ")"; font-size: 10px; }
        }
      `}</style>
    </div>
  );
}
