import React, { useMemo } from "react";

export default function Barcode({
  value = "PORTFOLIO-2025",
  height = 48,
  density = 3,
}) {
  const bars = useMemo(() => {
    const codes = Array.from(value).map((c) => c.charCodeAt(0));
    const arr = [];
    let toggle = true;
    for (let i = 0; i < codes.length; i++) {
      arr.push({ w: (codes[i] % 5) + 1, black: toggle });
      toggle = !toggle;
    }
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
  const width = bars.reduce((a, b) => a + b.w, 0) * density;
  let x = 0;
  return (
    <svg
      className="qr-auto-invert"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      aria-label={`barcode ${value}`}
    >
      {bars.map((b) => {
        const currX = x;
        const rect = (
          <rect
            key={currX}
            x={currX}
            y={0}
            width={b.w * density}
            height={height}
            className={b.black ? "color-black" : "fill-white"}
          />
        );
        x += b.w * density;
        return rect;
      })}
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
