import React from "react";
import { Sun, Moon } from "lucide-react";

export default function Header({ theme, onToggleTheme }) {
  return (
    <header
      id="site-header"
      className="sticky top-0 z-40 border-b border-black dark:border-neutral-300 bg-white/95 dark:bg-neutral-950/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-950/70"
    >
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
            className="px-2 py-1 border border-black dark:border-neutral-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Work
          </a>
          <a
            href="#about"
            className="px-2 py-1 border border-black dark:border-neutral-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            About
          </a>
          <a
            href="#contact"
            className="px-2 py-1 border border-black dark:border-neutral-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            Contact
          </a>
        </nav>
        <button
          onClick={onToggleTheme}
          className="px-2 py-1 border border-black dark:border-neutral-300 uppercase text-[11px] inline-flex items-center gap-2"
          aria-label="Toggle theme"
          type="button"
        >
          {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  );
}
