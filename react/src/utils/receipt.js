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

export const estimateReadMinutes = (text, wpm = 220) => {
  const words = (text || "").trim().split(/ +/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wpm));
};

const hashStr = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};
const productCode = (name, seed) => {
  const abbr = name
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(" ")
    .map((w) => (w[0] || "").toUpperCase())
    .join("")
    .slice(0, 4)
    .padEnd(3, "X");
  const num = (hashStr(name + ":" + seed) % 1000).toString().padStart(3, "0");
  return `SKU-${abbr}-${num}`;
};

export const mapServiceName = (s) => SERVICE_ALIAS[s] || s;
export const deriveProducts = (p) => {
  const base = p?.services?.length ? p.services : p?.tags || [];
  return base.map((s, i) => {
    const name = mapServiceName(s);
    return { name, code: productCode(name, `${p.id}-${i}`), qty: 1 };
  });
};
