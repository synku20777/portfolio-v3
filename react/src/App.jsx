import React, { useState, useEffect, useMemo, useCallback } from "react";
import SmoothScroll from "@/components/layout/scroll";
import Header from "@/components/layout/header";
import Hero from "@/components/hero";
import FilterBar from "@/components/filter-bar";
import ProjectCard from "@/components/project-card";
import Footer from "@/components/layout/footer";
import About from "@/components/about";
import { DEMO, ALL_TAGS } from "@/assets/data/projects";

export default function App() {
  const [theme, setTheme] = useState("light");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      const inferredTheme = matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      setTheme(saved === "dark" ? "dark" : inferredTheme);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch {}
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  const flipTheme = useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    if (document.startViewTransition) {
      document.startViewTransition(() => setTheme(next));
    } else {
      // Fallback for browsers without View Transitions (e.g., Firefox)
      setTheme(next);
      document.documentElement.classList.add("theme-anim");
      setTimeout(() => {
        document.documentElement.classList.remove("theme-anim");
      }, 300); // Match transition-duration in CSS
    }
  }, [theme]);
  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch {}
    const root = document.getElementById("theme-root");
    if (!root) return;
    root.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const [q, setQ] = useState("");
  const [selected, setSelected] = useState([]);
  const projects = useMemo(
    () =>
      DEMO.filter(
        (p) =>
          (q
            ? (p.title + p.summary + p.tags.join(" "))
                .toLowerCase()
                .includes(q.toLowerCase())
            : true) &&
          (selected.length ? selected.every((t) => p.tags.includes(t)) : true)
      ),
    [q, selected]
  );
  const toggleTag = (t) =>
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  return (
    <div
      id="theme-root"
      className="theme-scope min-w-screen bg-white text-black dark:bg-neutral-950 dark:text-neutral-100"
    >
      <div className="relative z-10">
        <Header theme={theme} onToggleTheme={flipTheme} />
        <SmoothScroll>
          <Hero />
          <FilterBar
            q={q}
            setQ={setQ}
            allTags={ALL_TAGS}
            selected={selected}
            toggleTag={toggleTag}
            clear={() => setSelected([])}
          />
          <section className="mx-auto max-w-6xl px-4 pb-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <ProjectCard key={p.id} p={p} />
              ))}
            </div>
          </section>
          {/* About section stays here (can split further if you want) */}
          <About />
          <Footer />
          <a
            href="#work"
            className="sr-only focus:not-sr-only fixed top-2 left-2 bg-white dark:bg-neutral-900 border border-black dark:border-neutral-300 px-3 py-2 text-[12px]"
          >
            Skip to work
          </a>
        </SmoothScroll>
      </div>
    </div>
  );
}
