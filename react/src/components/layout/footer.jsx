import React from "react";
import { Mail } from "lucide-react";
import Barcode from "@/components/visuals/Barcode";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-black dark:border-neutral-300 bg-white/80 dark:bg-neutral-900/80"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-[1fr_auto] gap-6 items-start">
        <div>
          <h3 className="font-black uppercase text-2xl">Contact</h3>
          <p className="mt-2 text-sm max-w-prose">
            Available for select collaborations. Quote number on correspondence
            for faster routing.
          </p>
          <div className="mt-4 grid sm:grid-cols-3 gap-3 text-[12px]">
            <div className="border border-black dark:border-neutral-300 p-3">
              <p className="uppercase">Primary</p>
              <a
                className="font-mono flex items-center gap-2 mt-1 hover:underline"
                href="mailto:nestor.kulik@gmail.com"
              >
                <Mail size={16} /> nestor.kulik@gmail.com
              </a>
            </div>
            <div className="border border-black dark:border-neutral-300 p-3">
              <p className="uppercase">Website</p>
              <a
                className="font-mono hover:underline"
                href="https://nestux.site"
                target="_blank"
                rel="noreferrer"
              >
                nestux.site
              </a>
            </div>
            <div className="border border-black dark:border-neutral-300 p-3">
              <p className="uppercase">Quote</p>
              <p className="font-mono">RFQ-{new Date().getFullYear()}-001</p>
            </div>
          </div>
        </div>
        <div className="w-32 self-center md:self-start">
          <Barcode value="MADE-IN-WEB/CE" height={80} />
          <p className="text-[10px] text-center mt-1">Europe (GMT+3)</p>
        </div>
      </div>
      <div className="border-t border-black dark:border-neutral-300 py-4 text-center text-[14px]">
        © {new Date().getFullYear()} neStudio · All rights reserved
      </div>
    </footer>
  );
}
