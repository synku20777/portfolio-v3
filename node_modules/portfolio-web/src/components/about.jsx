import { Download } from "lucide-react";
import { DEMO, ABOUT } from "@/assets/data/projects";

export default function About() {
  // Map raw services into grouped skills per requested categories
  const CATEGORY_MAP = [
    {
      label: "Design System Package",
      match: ["color palette", "design audit", "typography"],
    },
    {
      label: "Product Design",
      match: [
        "wireframes",
        "interviews",
        "prototype",
        "hi‑fi prototype",
        "hi-fi prototype",
        "information architecture",
        "content structuring",
        "content strcturing",
        "personas",
        "journey mapping",
        "design",
      ],
    },
    {
      label: "Development",
      match: ["site build", "wordpress (yootheme)", "wordpress"],
    },
    { label: "Design System", match: ["design system"] },
    { label: "Accessibility", match: ["accessibility"] },
    { label: "Visual Design", match: ["visual design"] },
  ];
  const norm = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  const toCategory = (service) => {
    const n = norm(service);
    const found = CATEGORY_MAP.find((c) => c.match.some((m) => norm(m) === n));
    return found ? found.label : service;
  };
  const categorySet = new Set();
  (DEMO || []).forEach((proj) => {
    (proj.services || []).forEach((svc) => {
      categorySet.add(toCategory(svc));
    });
  });
  const skills = Array.from(categorySet)
    .map((name) => ({ name }))
    .sort((a, b) => {
      const order = [
        "Design System Package",
        "Product Design",
        "Development",
        "Design System",
        "Accessibility",
        "Visual Design",
      ];
      const ai = order.indexOf(a.name);
      const bi = order.indexOf(b.name);
      const av = ai === -1 ? 999 : ai;
      const bv = bi === -1 ? 999 : bi;
      if (av !== bv) return av - bv;
      return a.name.localeCompare(b.name);
    });
  // Derive experience as Client — Year lines from projects
  const experiences = (DEMO || [])
    .map((x) => ({ label: x.client, period: x.year }))
    .filter((e) => e.label && e.period);

  const { bio, location, email, phone, website, cvUrl } = ABOUT || {};
  return (
    <section
      id="about"
      className="mx-auto max-w-6xl px-4 pb-16 grid lg:grid-cols-3 gap-8 items-stretch"
    >
      <div className="border border-black dark:border-neutral-300 p-5 bg-white dark:bg-neutral-900 flex flex-col justify-between">
        <div className="flex flex-col gap-3">
          <h3 className="font-black uppercase text-2xl">About</h3>
          <p className="max-w-prose">{bio}</p>
        </div>
        <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-[12px]">
          <li className="border border-black dark:border-neutral-300 p-2">
            Location: <b>{location}</b>
          </li>
          <li className="border border-black dark:border-neutral-300 p-2">
            Email:{" "}
            <a href={`mailto:${email}`} className="underline font-mono">
              {email}
            </a>
          </li>
          <li className="border border-black dark:border-neutral-300 p-2">
            Phone:{" "}
            <a
              href={`tel:${String(phone || "").replace(/\s+/g, "")}`}
              className="underline font-mono"
            >
              {phone}
            </a>
          </li>
          <li className="border border-black dark:border-neutral-300 p-2">
            Website:{" "}
            <a
              href={website?.url}
              target="_blank"
              rel="noreferrer"
              className="underline font-mono"
            >
              {website?.label || website?.url}
            </a>
          </li>
        </ul>
      </div>
      <div className="border border-black dark:border-neutral-300 p-5 bg-white dark:bg-neutral-900">
        <h3 className="font-black uppercase text-2xl">Skills</h3>
        <div className="mt-3 grid gap-2 text-[12px]">
          {skills.map((s) => (
            <div
              key={s.name}
              className="border border-black dark:border-neutral-300 p-3"
            >
              <div className="uppercase font-semibold">{s.name}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="border border-black dark:border-neutral-300 p-5 bg-white dark:bg-neutral-900 flex flex-col justify-between">
        <div>
          <h3 className="font-black uppercase text-2xl">Experience</h3>
          <ol className="mt-3 space-y-3 text-[12px]">
            {experiences.map((exp) => (
              <li className="p-3" key={`${exp.label}-${exp.period}`}>
                <div className="flex items-center justify-between">
                  <span>{exp.label}</span>
                  <span className="font-mono">{exp.period}</span>
                </div>
              </li>
            ))}
          </ol>
          <a
            href={cvUrl}
            className="mt-4 inline-flex items-center gap-2 px-3 py-2 border border-black dark:border-neutral-300 uppercase text-[11px] font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
          >
            <Download size={16} /> Download CV
          </a>
        </div>
      </div>
    </section>
  );
}
