import React, { useState } from "react";

// visual-only QR fallback
export function FauxQR({ seed = "PORTFOLIO-QR", size = 108, modules = 21 }) {
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
  const cell = size / modules,
    boxes = [];
  const add = (x, y) => boxes.push({ x, y, s: 7 });
  add(0, 0);
  add(modules - 7, 0);
  add(0, modules - 7);
  const cells = [];
  for (let y = 0; y < modules; y++) {
    for (let x = 0; x < modules; x++) {
      const inF = boxes.some(
        (b) => x >= b.x && x < b.x + b.s && y >= b.y && y < b.y + b.s
      );
      let on = false;
      if (inF) {
        const ring = Math.min(x, y, modules - 1 - x, modules - 1 - y);
        on = ring % 2 === 0;
      } else {
        on = rng() > 0.58;
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

export default function RealQR({ data, size = 108 }) {
  const [ok, setOk] = useState(true);
  if (!data) return <FauxQR seed="" size={size} />;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
    data
  )}`;
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
