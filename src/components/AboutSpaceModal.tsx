"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AboutSpaceModalProps {
  onClose: () => void;
  title?: string;
  description?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AboutSpaceModal({
  onClose,
  title = "About this space",
  description,
}: AboutSpaceModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const content = description ?? `Modern, elegant studio in the heart of Kilimani with stunning city views. Enjoy an infinity pool, gym, kids' play area, pool table lounge, and on-site minimart. The studio features a comfy king bed, high-speed Wi-Fi, a gas stove, coffee machine, washer/dryer, and toiletries. Ideal for travelers, digital nomads, or anyone looking to relax. Steps from malls, restaurants, and a 24/7 liquor store. Clean, cozy, and perfectly located.

The space
About this space

Welcome to this modern and elegantly designed studio in the upscale Alba Gardens, Kilimani. Enjoy breathtaking city views, a comfortable king-size bed, and high-speed internet in a clean, cozy, and private layout — perfect for travelers, digital nomads, or couples. The unit comes fully equipped with a gas stove, coffee machine, washer/dryer, and toiletries. Guests also enjoy access to luxury amenities like an infinity pool, gym, pool table lounge, kids' play area, rock climbing wall, and on-site minimart. Whether you're working or unwinding, this space offers everything you need for a seamless and relaxing stay.

The Neighborhood

Located in the heart of Kilimani, one of Nairobi's most vibrant and accessible neighborhoods, you'll be just steps away from popular spots like Yaya Centre, Adlife Plaza, Junction Mall, and countless cafes, restaurants, and shops.

A 24/7 liquor store, grocery stores, and public transport options are all nearby, making it easy to explore the city or run quick errands. Safe, central, and convenient, this is the perfect base for experiencing Nairobi.

Guest Access

Guests will have full private access to the studio and all building amenities, including:

Infinity swimming pool

Fully equipped gym

Pool table lounge

Kids' play area & rock climbing wall

On-site minimart

24/7 security and concierge

During your stay

I'm available around the clock via the app for any questions or assistance. I typically respond within minutes.

Other things to note

Please note that the building has strict no-party and no-smoking policies in all units and common areas. Quiet hours are from 10pm to 7am.`;

  // Split into paragraphs, detect section headers (short lines without punctuation at end)
  const paragraphs = content.split("\n").filter(line => line.trim() !== "");

  const isHeader = (line: string) => {
    const trimmed = line.trim();
    return (
      trimmed.length < 60 &&
      !trimmed.endsWith(".") &&
      !trimmed.endsWith(",") &&
      !trimmed.endsWith(":") &&
      !trimmed.startsWith("•") &&
      !trimmed.startsWith("-") &&
      paragraphs.indexOf(line) !== 0 // not the first line
    );
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] flex items-center justify-end"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      {/* Sliding panel — right side like the screenshot */}
      <div
        ref={ref}
        className="bg-white h-full w-full max-w-xl overflow-hidden flex flex-col relative"
        style={{ animation: "slideIn .25s cubic-bezier(.16,1,.3,1) both" }}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 left-5 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} className="text-gray-700" />
        </button>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-7 pt-16 pb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">{title}</h2>

          <div className="space-y-3">
            {paragraphs.map((para, i) => {
              const trimmed = para.trim();
              const header = isHeader(trimmed);

              return (
                <p
                  key={i}
                  className={
                    header
                      ? "text-sm font-semibold text-gray-900 pt-2"
                      : "text-sm text-gray-700 leading-relaxed"
                  }
                >
                  {trimmed}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
