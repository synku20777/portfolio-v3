import React from "react";
import RealQR from "@/components/visuals/qr-gen";
import MagneticBackground from "@/components/visuals/magneticbg";

export default function Hero() {
  return (
    <section className="relative min-h-[calc(100dvh-var(--header-h))] mx-auto max-w-6xl px-4 py-10 flex flex-col gap-8">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <MagneticBackground cell={44} thickness={1} />
      </div>
      <div id="hero-content" className="flex z-10 gap-4 mt-[5vh]">
        <div>
          <h2 className="font-black text-[clamp(24px,6vw,90px)] leading-[0.95] tracking-tight">
            Making the complex simple. And having fun doing it.
          </h2>
          <p className="mt-3 max-w-[60ch] text-[15px] md:text-base font-medium">
            Designing and building user-centric products.
            <br />
            Simplifying complex systems into intuitive, engaging experiences.
          </p>
        </div>
        <div className="flex z-10 flex-col items-center gap-3">
          <RealQR data="mailto:nestor.kulik@gmail.com" />
          <p className="text-[10px] uppercase">
            scan to contact · fallback safe
          </p>
        </div>
      </div>

      {/* bottom bar: tags + meta */}
      <div className="z-10 mt-auto w-full">
        <div className="border-t border-black dark:border-neutral-300 pt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase">
            <span className="px-2 py-1 border border-black dark:border-neutral-300 bg-white/30 dark:bg-black/30 backdrop-blur-sm">
              User research & usability
            </span>
            <span className="px-2 py-1 border border-black dark:border-neutral-300 bg-white/30 dark:bg-black/30 backdrop-blur-sm">
              Design systems
            </span>
            <span className="px-2 py-1 border border-black dark:border-neutral-300 bg-white/30 dark:bg-black/30 backdrop-blur-sm">
              Front-end development
            </span>
            <span className="px-2 py-1 border border-black dark:border-neutral-300 bg-white/30 dark:bg-black/30 backdrop-blur-sm">
              Service design
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
            <div className="border border-black dark:border-neutral-300 p-2 backdrop-blur-sm">
              <p className="text-[9px] uppercase">version</p>
              <p className="font-mono text-sm md:text-base">v1.0.0</p>
            </div>
            <div className="border border-black dark:border-neutral-300 p-2 backdrop-blur-sm">
              <p className="text-[9px] uppercase">lot</p>
              <p className="font-mono text-sm md:text-base">P0R7F0L1O</p>
            </div>
            <div className="border border-black dark:border-neutral-300 p-2 backdrop-blur-sm">
              <p className="text-[9px] uppercase">date</p>
              <p className="font-mono text-sm md:text-base">
                {new Date().toISOString().slice(0, 10)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
