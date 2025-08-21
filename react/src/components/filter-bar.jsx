import React from "react";
import { Filter, X } from "lucide-react";

export default function FilterBar({
  q,
  setQ,
  allTags,
  selected,
  toggleTag,
  clear,
}) {
  return (
    <section
      id="work"
      className="scroll-mt-16 md:scroll-mt-20 mx-auto mt-45 max-w-6xl px-4 pb-3"
    >
      <div className="flex flex-wrap items-center gap-3 py-3 z-10">
        <label className="flex items-center gap-2 bg-white dark:bg-neutral-900 border border-black dark:border-neutral-300 h-10 px-3">
          <Filter size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects…"
            className="outline-none placeholder-black/40 dark:placeholder-white/40 bg-transparent text-sm"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={`inline-flex items-center h-10 px-3 text-[11px] uppercase border border-black dark:border-neutral-300 ${
                selected.includes(t)
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-white dark:bg-neutral-900"
              }`}
            >
              {t}
            </button>
          ))}
          {selected.length > 0 && (
            <button
              onClick={clear}
              className="inline-flex items-center h-10 px-3 text-[11px] uppercase border border-dashed border-black dark:border-neutral-300"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
