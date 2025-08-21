import React, { useState } from "react";
/* eslint-disable react/prop-types */

function NoImage({ size = 108 }) {
  return (
    <div
      className="grid place-items-center border border-black dark:border-neutral-300 text-[10px] uppercase text-center select-none"
      style={{ width: size, height: size }}
      aria-label="No image"
    >
      No image
    </div>
  );
}

export default function RealQR({ data, size = 108 }) {
  const [ok, setOk] = useState(true);
  if (!data) return <NoImage size={size} />;
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=svg&data=${encodeURIComponent(
    data
  )}`;
  return ok ? (
    <img
      src={src}
      width={size}
      height={size}
      alt="QR"
      onError={() => setOk(false)}
      className="block select-none qr-auto-invert"
      loading="lazy"
    />
  ) : (
    <NoImage size={size} />
  );
}
