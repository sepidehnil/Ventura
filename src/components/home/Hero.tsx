"use client";

import ProductImage from "@/components/ui/ProductImage";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Package, Award } from "lucide-react";
import Container from "@/components/ui/Container";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#F7FAF7] pb-8 pt-28 md:pb-12 md:pt-32">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.22]"
        viewBox="0 0 1200 800"
        fill="none"
        aria-hidden
      >
        <path
          d="M-40 200 C 200 90, 360 300, 560 240 S 860 100, 1180 260"
          stroke="#6F9574"
          strokeWidth="2"
          strokeDasharray="8 10"
        />
        <path
          d="M-20 460 C 220 380, 420 540, 680 470 S 980 360, 1280 500"
          stroke="#A9C5AD"
          strokeWidth="2"
          strokeDasharray="6 12"
        />
      </svg>

      <Container className="relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading text-4xl font-semibold leading-[1.12] tracking-[-0.02em] text-charcoal sm:text-5xl md:text-6xl"
          >
            Pack for the trip —
            <br />
            <span className="text-sage-dark">we have the gear</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mt-7"
          >
            <Link
              href="/products"
              className="btn-primary inline-flex min-h-[48px] items-center gap-2 bg-charcoal px-8 py-3 text-sm text-cream hover:bg-sage-dark"
            >
              Shop Now
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>

        {/* Campsite sits directly on the page — no white card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-6 max-w-4xl md:mt-8"
        >
          <div className="relative mx-auto aspect-[16/10] w-full max-w-3xl">
            <ProductImage
              src="/images/hero-campsite.webp"
              alt="Campsite with green tent, pine trees, backpacks and boots"
              fill
              className="object-contain object-center"
              priority
              sizes="(max-width: 768px) 100vw, 900px"
            />
          </div>

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
            className="absolute left-0 top-[20%] z-10 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-semibold text-charcoal shadow-card sm:left-4 sm:rounded-full sm:px-4 sm:text-sm"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-soft text-sage-dark">
              <Award size={14} />
            </span>
            <span>
              <span className="text-sage-dark">12</span> curated products
            </span>
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="absolute bottom-[16%] right-0 z-10 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-semibold text-charcoal shadow-card sm:right-4 sm:rounded-full sm:px-4 sm:text-sm"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Package size={14} />
            </span>
            <span>
              <span className="text-accent">8</span> outdoor brands
            </span>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
