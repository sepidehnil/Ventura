"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";
import { staggerItem } from "@/lib/animations";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function DealCard() {
  const [remaining, setRemaining] = useState({ h: 12, m: 34, s: 56 });

  useEffect(() => {
    const end = Date.now() + (12 * 3600 + 34 * 60 + 56) * 1000;
    const tick = () => {
      const diff = Math.max(0, end - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.article
      variants={staggerItem}
      className="relative flex h-full min-h-[340px] flex-col justify-between overflow-hidden rounded-card bg-forest-mesh p-6 text-cream shadow-lift md:min-h-full md:p-8"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />

      <div className="relative z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-cream/90 backdrop-blur-sm">
          <Flame size={12} className="text-accent-light" />
          Limited time
        </span>
        <h3 className="mt-5 font-heading text-3xl font-semibold leading-tight md:text-4xl">
          Discounted
          <br />
          Products
        </h3>
        <p className="mt-3 max-w-[14rem] text-sm text-cream/75">
          Trail-ready deals ending soon — grab them before camp packs up.
        </p>
        <div className="mt-7 flex gap-2">
          {[
            { label: "Hrs", value: remaining.h },
            { label: "Min", value: remaining.m },
            { label: "Sec", value: remaining.s },
          ].map((unit) => (
            <div
              key={unit.label}
              className="flex min-w-[3.4rem] flex-col items-center rounded-2xl border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-md"
            >
              <span className="text-xl font-bold tabular-nums tracking-tight">
                {pad(unit.value)}
              </span>
              <span className="text-[10px] uppercase tracking-wide text-cream/65">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Link
        href="/products?deal=1"
        className="relative z-10 mt-8 inline-flex items-center gap-2 self-start rounded-full bg-cream px-5 py-3 text-sm font-semibold text-sage-dark transition-transform hover:scale-[1.03]"
      >
        View deals
        <ArrowRight size={16} />
      </Link>
    </motion.article>
  );
}
