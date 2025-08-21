import React from "react";
import { motion } from "framer-motion";
import { Scissors } from "lucide-react";
import Barcode from "@/components/visuals/barcode";
import RealQR from "@/components/visuals/qr-gen";
import { deriveProducts, estimateReadMinutes } from "@/utils/receipt";

export default function ProjectCard({ p }) {
  const readMin = p.readMinutes ?? estimateReadMinutes(p.summary);
  const items = deriveProducts(p);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="relative group border border-black dark:border-neutral-300 bg-white dark:bg-black text-black dark:text-neutral-100 overflow-hidden shadow-[0_0_0_1px_#000] dark:shadow-[0_0_0_1px_#fff]
         [background-image:repeating-linear-gradient(0deg,rgba(0,0,0,0.02)_0_2px,transparent_2px_14px),repeating-linear-gradient(90deg,rgba(0,0,0,0.04)_0_8px,transparent_8px_16px)]
         [background-size:100%_100%,100%_8px]
         [background-repeat:repeat,no-repeat]
         [background-position:0_0,0_0]
         dark:[background-image:repeating-linear-gradient(0deg,rgba(255,255,255,0.06)_0_2px,transparent_2px_14px),repeating-linear-gradient(90deg,rgba(255,255,255,0.1)_0_8px,transparent_8px_16px)]"
    >
      {/* perforation sides */}
      <div
        aria-hidden
        className="absolute left-0 top-0 h-full w-3 bg-[repeating-radial-gradient(circle_at_1.5px_1.5px,rgba(0,0,0,0.08)_0_1.5px,transparent_1.5px_6px)] dark:bg-[repeating-radial-gradient(circle_at_1.5px_1.5px,rgba(255,255,255,0.15)_0_1.5px,transparent_1.5px_6px)]"
      />
      <div
        aria-hidden
        className="absolute right-0 top-0 h-full w-3 bg-[repeating-radial-gradient(circle_at_1.5px_1.5px,rgba(0,0,0,0.08)_0_1.5px,transparent_1.5px_6px)] dark:bg-[repeating-radial-gradient(circle_at_1.5px_1.5px,rgba(255,255,255,0.15)_0_1.5px,transparent_1.5px_6px)]"
      />

      <div className="px-4 pt-3 pb-2 border-b border-black dark:border-neutral-300">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-black tracking-tight leading-none text-[clamp(14px,2vw,22px)]">
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

      <div className="p-4 grid gap-3">
        <div className="aspect-[16/9] w-full overflow-hidden bg-white dark:bg-neutral-900">
          {p.image ? (
            <img
              src={p.image}
              alt="project preview"
              loading="lazy"
              className="h-full w-full object-cover filter grayscale contrast-200"
            />
          ) : (
            <div className="h-full w-full grid place-items-center">
              <RealQR
                data={p.link || String(p.id || p.title || "")}
                size={96}
              />
              <span className="text-[10px] uppercase">no image</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-3 py-1 border-b border-dashed border-black dark:border-neutral-300 text-[11px] uppercase">
          <span className="font-semibold tracking-wide">Tags</span>
          <span className="font-mono">{p.tags.join(" · ")}</span>
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-3 py-1 border-b border-dashed border-black dark:border-neutral-300 text-[11px] uppercase">
          <span className="font-semibold tracking-wide">Status</span>
          <span className="font-mono">{p.status}</span>
        </div>

        <div className="px-1 text-sm leading-snug font-medium">{p.summary}</div>

        {items.length ? (
          <div>
            <div className="px-1 text-[16px] font-bold border-b border-black dark:border-neutral-300">
              Artifacts
            </div>
            <div className="p-2">
              {items.map((it, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-[auto_1fr_auto] items-baseline gap-3 border-b border-dashed border-black dark:border-neutral-300 text-[12px]"
                >
                  <span className="font-mono">{it.code}</span>
                  <span className="uppercase">{it.name}</span>
                  <span className="font-mono">x{it.qty}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="px-2 py-1 text-[10px] uppercase border border-dashed border-black dark:border-neutral-300">
            No products
          </div>
        )}

        <div>
          <div className="grid grid-cols-[1fr_auto] gap-3 text-[14px]">
            <span className="tracking-wide">Subtotal (Hours)</span>
            <span className="font-mono">
              {p.hours != null ? `${p.hours}h` : "—"}
            </span>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-3 border-t border-dashed border-black dark:border-neutral-300 text-[14px]">
            <span className="tracking-wide font-semibold">
              Read Time (Case)
            </span>
            <span className="font-mono">≈ {readMin} min</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="max-w-[220px]">
            <Barcode value={`${p.id}-${p.year}`} height={36} />
          </div>
          <a
            href={p.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 border border-transparent hover:border-black dark:hover:border-neutral-300 transition-colors"
          >
            Case Study →
          </a>
        </div>

        <div className="border-t border-dashed border-black dark:border-neutral-300" />
        {/* <div className="flex flex-col">
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
        </div> */}
        <p className="text-[10px] uppercase tracking-wide">
          No returns · Keep for your records · Printed{" "}
          {new Date().toISOString().slice(0, 10)}
        </p>
      </div>
    </motion.article>
  );
}
