"use client";

import ProductImage from "@/components/ui/ProductImage";
import Link from "next/link";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import ScrollReveal, { StaggerReveal, StaggerItem } from "@/components/motion/ScrollReveal";
import { useCatalog } from "@/hooks/useCatalog";

export default function Categories() {
  const { categories } = useCatalog();

  return (
    <section className="bg-sage py-10 md:py-14">
      <Container>
        <ScrollReveal className="mb-6 text-center md:mb-8">
          <h2 className="text-xl font-bold text-cream md:text-2xl">
            Product Categories
          </h2>
        </ScrollReveal>

        <StaggerReveal className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
          {categories.map((category) => (
            <StaggerItem key={category.id}>
              <Link href={`/products?category=${category.id}`} className="group block">
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-cream/15 ring-1 ring-white/15 transition-all duration-300 group-hover:bg-cream/25 group-hover:ring-white/30 group-hover:shadow-glow">
                    <ProductImage
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-contain transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 200px"
                    />
                  </div>
                  <h3 className="mt-3 text-sm font-semibold text-cream transition-colors group-hover:text-white md:text-base">
                    {category.name}
                  </h3>
                </motion.div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </Container>
    </section>
  );
}
