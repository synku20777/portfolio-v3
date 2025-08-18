import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from "framer-motion";
import {
  Mail,
  Github,
  Linkedin,
  Download,
  Filter,
  Scissors,
  X,
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
    "repeating-linear-gradient(90deg,rgba(0,0,0,0.04) 0 8px,transparent 8px 16px)",
  // Banding covers full card; stripes are a shallow 8px height row, then non-repeated vertically
  backgroundSize: "100% 100%, 100% 8px",
  backgroundRepeat: "repeat, no-repeat",
  backgroundPosition: "0 0, 0 0",
};

// ------------------------------------------------------
// MagneticBackground (replaces the static grid background)
// Adapted from your snippet to work with framer-motion v12
// ------------------------------------------------------
function useViewportGrid(cell = 40) {
  const [dims, setDims] = useState({ width: 0, height: 0, cols: 0, rows: 0 });
  useEffect(() => {
    const measure = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const cols = Math.max(1, Math.floor(width / cell));
      const rows = Math.max(1, Math.floor(height / cell));
      setDims({ width, height, cols, rows });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [cell]);
  return dims;
}

function useElementCenter(ref) {
  const [center, setCenter] = useState(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      setCenter({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [ref]);
  return center;
}

const PointerContext = createContext(null);
function usePointer() {
  const ctx = useContext(PointerContext);
  if (!ctx) throw new Error("MagneticBackground: PointerContext missing");
  return ctx;
}

function Filing({ color = "#D1D5DB", thickness = 1 }) {
  const { x: pointerX, y: pointerY } = usePointer();
  const ref = useRef(null);
  const center = useElementCenter(ref);
  // Derived rotation based on pointer → element center vector
  const rotate = useTransform(() => {
    if (!center) return 0;
    const dx = pointerX.get() - center.x;
    const dy = pointerY.get() - center.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
  });
  return (
    <motion.div
      ref={ref}
      className="mag-filing"
      style={{ rotate, backgroundColor: color, height: thickness }}
    />
  );
}

function MagneticBackground({ cell = 40, color = "#E5E7EB", thickness = 1 }) {
  const { cols, rows } = useViewportGrid(cell);
  const total = useMemo(() => cols * rows, [cols, rows]);
  // Window-level pointer tracker
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  useEffect(() => {
    const onMove = (e) => {
      px.set(e.clientX);
      py.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [px, py]);
  return (
    <PointerContext.Provider value={{ x: px, y: py }}>
      <div className="magnetic-bg" aria-hidden>
        <div className="mag-grid" style={{ "--cols": cols, "--rows": rows }}>
          {Array.from({ length: total }).map((_, i) => (
            <Filing key={i} color={color} thickness={thickness} />
          ))}
        </div>
        <style>{`
          .magnetic-bg { position: fixed; inset: 0; background: #fff; pointer-events: none; z-index: 0; }
          .mag-grid { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(var(--cols), 1fr); grid-template-rows: repeat(var(--rows), 1fr); }
          .mag-filing { width: 70%; border-radius: 2px; justify-self: center; align-self: center; transform-origin: 50% 50%; will-change: transform; }
          @media (max-width: 640px) { .mag-filing { width: 66%; } }
        `}</style>
      </div>
    </PointerContext.Provider>
  );
}

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
        className="absolute left-0 top-0 h-full w-3 bg-[repeating-radial-gradient(circle_at_1.5px_1.5px,rgba(0,0,0,0.08)_0_1.5px,transparent_1.5px_6px)]"
      />
      <div
        aria-hidden
        className="absolute right-0 top-0 h-full w-3 bg-[repeating-radial-gradient(circle_at_1.5px_1.5px,rgba(0,0,0,0.08)_0_1.5px,transparent_1.5px_6px)]"
        style={{ borderColor: "rgba(0,0,0,0.12)" }}
      />
      {/* Header band — receipt masthead */}
      <div className="px-4 pt-3 pb-2 border-b border-black">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-black tracking-tight leading-none text-[clamp(14px,2vw,22px)] uppercase">
            {p.title}
          </h3>
          <span className="text-[12px] leading-none uppercase">{p.year}</span>
        </div>
        <div className="mt-2 text-[10px] flex items-center justify-between">
          <span>Client: {p.client ?? "—"}</span>
          <span>Case ID: {p.id}</span>
          <span>Lot: {p.lot ?? "—"}</span>
        </div>
      </div>
      {/* Body */}
      <div className="p-4 grid gap-3">
        {/* Monochrome image — styled like thermal print */}
        <div className="aspect-[16/9] w-full overflow-hidden bg-white">
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
              <span className="text-[10px] uppercase">no image</span>
            </div>
          )}
        </div>

        {/* Key/value rows */}
        <div>
          <ReceiptRow k="Tags" v={p.tags.join(" · ")} />
          <ReceiptRow k="Status" v={p.status} />
        </div>

        {/* Summary line with dashed cap */}
        <div className="px-1 text-sm leading-snug font-medium">{p.summary}</div>

        {/* Products purchased (derived from services/tags) */}
        {items.length ? (
          <div>
            <div className="px-1 text-[16px] font-bold font-semibold border-b border-black">
              Artifacts
            </div>
            <div className="p-2">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[auto_1fr_auto] items-baseline gap-3 border-b border-dashed border-black text-[12px]"
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
        <div>
          <div className="grid grid-cols-[1fr_auto] gap-3 text-[14px]">
            <span className="tracking-wide">Subtotal (Hours)</span>
            <span className="font-mono">
              {p.hours != null ? `${p.hours}h` : "—"}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-3 border-t border-dashed border-black text-[14px]">
            <span className="tracking-wide font-semibold">
              Read Time (Case)
            </span>
            <span className="font-mono">≈ {readMin} min</span>
          </div>
        </div>

        {/* Footer strip with barcode + action as label button */}
        <div className="flex items-center justify-between">
          <div className="max-w-[220px]">
            <Barcode value={`${p.id}-${p.year}`} height={36} />
          </div>
          <a
            href={p.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 border border-transparent hover:border-black transition-colors"
          >
            Case Study →
          </a>
        </div>

        {/* Stub separator (perforation) */}
        <div className="border-t border-dashed border-black" />
        {/* Tear-off stub */}
        <div className="flex flex-col">
          <div className="text-[10px] uppercase flex items-stretch justify-between py-1">
            <div className="flex items-center gap-2">
              <Scissors size={14} />
              <span>Cut along the perforation · Keep stub</span>
            </div>
            <div className="font-mono">
              {p.id}/{p.year} · LOT {p.lot}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="w-auto">
              <Barcode value={`STUB-${p.id}`} height={40} />
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

// -----------------------------
// Filters helper
// -----------------------------
const allTags = Array.from(new Set(DEMO.flatMap((p) => p.tags || [])));

// -----------------------------
// GSAP ScrollSmoother (progressive enhancement)
// -----------------------------
function useGsapSmoother({
  smooth = 1.2,
  effects = true,
  normalizeScroll = true,
  wrapper = "#smooth-wrapper",
  content = "#smooth-content",
  gsapSrc = "/gsap.min.js",
  pluginSrc = "/ScrollSmoother.min.js",
} = {}) {
  useEffect(() => {
    let smoother;

    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.async = true;
        s.onload = () => resolve(true);
        s.onerror = () => reject(new Error("Failed to load " + src));
        document.head.appendChild(s);
      });

    const ensureGsap = async () => {
      if (window.gsap) return true;
      try {
        await loadScript(gsapSrc);
      } catch {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"
        );
      }
      return !!window.gsap;
    };

    const ensureSmoother = async () => {
      if (window.ScrollSmoother) return true;
      try {
        await loadScript(pluginSrc);
      } catch (e) {
        console.warn("ScrollSmoother plugin not found at", pluginSrc, e);
        return false;
      }
      return !!window.ScrollSmoother;
    };

    const init = async () => {
      const okGsap = await ensureGsap();
      const okPlugin = await ensureSmoother();
      if (!okGsap || !okPlugin) return;
      try {
        window.gsap.registerPlugin(window.ScrollSmoother);
        smoother = window.ScrollSmoother.create({
          wrapper,
          content,
          smooth,
          effects,
          normalizeScroll,
        });
        window.__smoother = smoother;
      } catch (err) {
        console.warn("ScrollSmoother init failed", err);
      }
    };

    if (typeof window !== "undefined") init();
    return () => {
      try {
        smoother?.kill?.();
      } catch {}
    };
  }, [smooth, effects, normalizeScroll, wrapper, content, gsapSrc, pluginSrc]);
}

export default function IndustrialPortfolio() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState([]);

  // Initialize GSAP ScrollSmoother (looks for /gsap.min.js and /ScrollSmoother.min.js in public/)
  useGsapSmoother({ smooth: 1.2, effects: true, normalizeScroll: true });

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
    <div id="smooth-wrapper" className="fixed inset-0 overflow-hidden">
      {/* Grid overlay — sits above page background, below all content */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <MagneticBackground cell={44} color="#E5E7EB" thickness={1} />
      </div>
      {/* Content wrapper ensures everything stays above the overlay */}
      <div id="smooth-content" className="min-w-screen bg-white text-black">
        <div className="relative z-10">
          {/* Top label header — all squared; nav chips are square too */}
          <header className="sticky top-0 z-40 border-b border-black bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
            <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-4">
              <div className="flex-1 leading-tight">
                <h1 className="font-black tracking-[-0.02em] text-[clamp(18px,2.6vw,28px)]">
                  neStudio
                </h1>
                <p className="uppercase text-[10px]">
                  Web development and design studio
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
              <div>
                <h2 className="font-black text-[clamp(24px,6vw,72px)] leading-[0.95] tracking-tight">
                  Making the complex simple.
                  <br />
                  And having fun doing it.
                </h2>
                <p className="mt-3 max-w-[60ch] text-[15px] md:text-base font-medium">
                  Designing and building user‑centric products.
                  <br />
                  Simplifying complex systems into intuitive, engaging
                  experiences.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] uppercase">
                  <span className="px-2 py-1 border border-black">
                    User research & usability
                  </span>
                  <span className="px-2 py-1 border border-black">
                    Design systems
                  </span>
                  <span className="px-2 py-1 border border-black">
                    Front‑end development
                  </span>
                  <span className="px-2 py-1 border border-black">
                    Service design
                  </span>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="border border-black p-3">
                  <p className="text-[10px] uppercase">version</p>
                  <p className="font-mono text-xl">v1.0.0</p>
                </div>
                <div className="border border-black p-3">
                  <p className="text-[10px] uppercase">lot</p>
                  <p className="font-mono text-xl">P0R7F0L1O</p>
                </div>
                <div className="border border-black p-3">
                  <p className="text-[10px] uppercase">date</p>
                  <p className="font-mono text-xl">
                    {new Date().toISOString().slice(0, 10)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex z-10 flex-col items-center gap-3">
              <RealQR data="mailto:nestor.kulik@gmail.com" />
              <p className="text-[10px] uppercase">
                scan to contact · fallback safe
              </p>
            </div>
          </section>
          {/* Controls */}
          <section id="work" className="mx-auto max-w-6xl px-4 pb-3">
            <div className="flex flex-wrap items-center gap-3 py-3 z-10">
              {/* Search box */}
              <label className="flex items-center gap-2 bg-white border border-black h-10 px-3">
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
                    className={`inline-flex items-center h-10 px-3 text-[11px] uppercase border border-black ${
                      selected.includes(t) ? "bg-black text-white" : "bg-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
                {selected.length > 0 && (
                  <button
                    onClick={() => setSelected([])}
                    className="inline-flex items-center h-10 px-3 text-[11px] uppercase border border-dashed border-black"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
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
            className="mx-auto max-w-6xl px-4 pb-16 grid lg:grid-cols-3 gap-8 items-stretch"
          >
            <div className="border border-black p-5 bg-white flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <h3 className="font-black uppercase text-2xl">About</h3>
                <p className="max-w-prose">
                  Agile UX/UI designer & web‑developer. I make complex products
                  simple by pairing research with interaction design, design
                  systems, and front‑end craft.
                </p>
              </div>
              <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-[12px]">
                <li className="border border-black p-2">
                  Location: <b>Europe (GMT+3)</b>
                </li>
                <li className="border border-black p-2">
                  Email:{" "}
                  <a
                    href="mailto:nestor.kulik@gmail.com"
                    className="underline font-mono"
                  >
                    nestors@nestux.site
                  </a>
                </li>
                <li className="border border-black p-2">
                  Phone:{" "}
                  <a href="tel:+4571405920" className="underline font-mono">
                    +45 71 40 59 20
                  </a>
                </li>
                <li className="border border-black p-2">
                  Website:{" "}
                  <a
                    href="https://nestux.site"
                    target="_blank"
                    rel="noreferrer"
                    className="underline font-mono"
                  >
                    nestux.site
                  </a>
                </li>
              </ul>
            </div>
            <div className="border border-black p-5 bg-white">
              <h3 className="font-black uppercase text-2xl">Skills</h3>
              <div className="mt-3 grid gap-2 text-[12px]">
                {[
                  {
                    name: "User Research & Usability",
                    desc: "Interviews, analysis, heatmaps, journeys, usability tests",
                  },
                  {
                    name: "Front‑End Development",
                    desc: "HTML, CSS, WordPress, Bootstrap, Power Apps, SharePoint, Mendix, OutSystems",
                  },
                  {
                    name: "Service Design",
                    desc: "Card sorting, storytelling, service blueprints, CX",
                  },
                  {
                    name: "Interaction Design & Design Systems",
                    desc: "IA, task flows, wireframing, responsive UI, tokens & components",
                  },
                  {
                    name: "Motion Design & VFX",
                    desc: "UI motion, 2D graphics, editing, VFX",
                  },
                  {
                    name: "Graphic & Visual Design",
                    desc: "Color, composition, typography, branding, print, decks",
                  },
                ].map((s, i) => (
                  <div key={i} className="border border-black p-3">
                    <div className="uppercase font-semibold">{s.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-black p-5 bg-white flex flex-col justify-between">
              <div>
                <h3 className="font-black uppercase text-2xl">Experience</h3>
                <ol className="mt-3 space-y-3 text-[12px]">
                  <li className="border border-black p-3">
                    <div className="flex items-center justify-between">
                      <span>Design System Engineer — Ennova ApS</span>
                      <span className="font-mono">01/2025 – Present</span>
                    </div>
                  </li>
                  <li className="border border-black p-3">
                    <div className="flex items-center justify-between">
                      <span>Design Engineer — Aurora Marketplace</span>
                      <span className="font-mono">11/2024 – Present</span>
                    </div>
                  </li>
                  <li className="border border-black p-3">
                    <div className="flex items-center justify-between">
                      <span>Cloud First Nordics — Accenture</span>
                      <span className="font-mono">02/2023 – 09/2023</span>
                    </div>
                  </li>
                </ol>
                <a
                  href="/cv.pdf"
                  className="mt-4 inline-flex items-center gap-2 px-3 py-2 border border-black uppercase text-[11px] font-bold hover:bg-black hover:text-white"
                >
                  <Download size={16} /> Download CV
                </a>
              </div>
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
                      href="mailto:nestor.kulik@gmail.com"
                    >
                      <Mail size={16} /> nestor.kulik@gmail.com
                    </a>
                  </div>
                  <div className="border border-black p-3">
                    <p className="uppercase">Website</p>
                    <a
                      className="font-mono hover:underline"
                      href="https://nestux.site"
                      target="_blank"
                      rel="noreferrer"
                    >
                      nestux.site
                    </a>
                  </div>
                  <div className="border border-black p-3">
                    <p className="uppercase">Quote</p>
                    <p className="font-mono">
                      RFQ‑{new Date().getFullYear()}‑001
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-32 self-center md:self-start">
                <Barcode value="MADE‑IN‑WEB/CE" height={80} />
                <p className="text-[10px] text-center mt-1">Europe (GMT+3)</p>
              </div>
            </div>
            <div className="border-t border-black py-4 text-center text-[14px] ">
              © {new Date().getFullYear()} neStudio · All rights reserved
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
      </div>
    </div>
  );
}
