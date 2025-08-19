import React from "react";
import RealQR from "@/components/visuals/qr-gen";

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100dvh-var(--header-h))] mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-[1fr_auto] gap-8 items-start">
      <div className="grid gap-4">
        <div>
          <h2 className="font-black text-[clamp(24px,6vw,72px)] leading-[0.95] tracking-tight">
            Making the complex simple.
            <br />
            And having fun doing it.
          </h2>
          <p className="mt-3 max-w-[60ch] text-[15px] md:text-base font-medium">
            Designing and building user-centric products.
            <br />
            Simplifying complex systems into intuitive, engaging experiences.
          </p>
        </div>
      </div>
      <div className="flex z-10 flex-col items-center gap-3">
        <RealQR data="mailto:nestor.kulik@gmail.com" />
        <p className="text-[10px] uppercase">scan to contact · fallback safe</p>
      </div>

      {/* bottom-right tags + meta */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2">
        <div className="flex flex-wrap items-center justify-end gap-2 text-[10px] uppercase">
          <span className="px-2 py-1 border border-black dark:border-neutral-300">
            User research & usability
          </span>
          <span className="px-2 py-1 border border-black dark:border-neutral-300">
            Design systems
          </span>
          <span className="px-2 py-1 border border-black dark:border-neutral-300">
            Front-end development
          </span>
          <span className="px-2 py-1 border border-black dark:border-neutral-300">
            Service design
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
          <div className="border border-black dark:border-neutral-300 p-2">
            <p className="text-[9px] uppercase">version</p>
            <p className="font-mono text-sm md:text-base">v1.0.0</p>
          </div>
          <div className="border border-black dark:border-neutral-300 p-2">
            <p className="text-[9px] uppercase">lot</p>
            <p className="font-mono text-sm md:text-base">P0R7F0L1O</p>
          </div>
          <div className="border border-black dark:border-neutral-300 p-2">
            <p className="text-[9px] uppercase">date</p>
            <p className="font-mono text-sm md:text-base">
              {new Date().toISOString().slice(0, 10)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
