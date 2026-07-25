import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import Container from "@/components/ui/Container";
import PageTransition from "@/components/motion/PageTransition";
import ScrollReveal from "@/components/motion/ScrollReveal";

export const metadata = {
  title: "About — Ventura",
  description:
    "Ventura outfits outdoor trips with trail-ready camping gear from trusted brands.",
};

const values = [
  {
    title: "Trail-tested picks",
    text: "Gear chosen for weather resistance, packability, and real outdoor use — not shelf appeal alone.",
  },
  {
    title: "Honest shopping",
    text: "Clear pricing, free shipping over $150, and product details that help you decide with confidence.",
  },
  {
    title: "Calm by design",
    text: "A quiet storefront for finding the right pack, tent, or camp essential without the noise.",
  },
];

export default function AboutPage() {
  return (
    <MainLayout>
      <PageTransition>
        {/* Brand hero — trail packs, not the landing campsite */}
        <section className="relative overflow-hidden bg-[#F7FAF7] pb-12 pt-28 md:pb-16 md:pt-32">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(111,149,116,0.14),_transparent_55%)]"
            aria-hidden
          />
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.2]"
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
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <ScrollReveal>
                <p className="font-brand text-sm uppercase tracking-[0.28em] text-sage-dark">
                  Ventura
                </p>
                <h1 className="mt-4 max-w-lg font-heading text-4xl font-semibold leading-[1.1] tracking-[-0.02em] text-charcoal sm:text-5xl md:text-6xl">
                  Built for the trail
                </h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-stone md:text-base">
                  Outdoor gear for people who pack light, hike far, and trust
                  equipment that earns its place in the pack.
                </p>
                <Link
                  href="/products"
                  className="mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-full bg-charcoal px-7 py-3 text-sm font-semibold text-cream transition-transform hover:scale-[1.03] hover:bg-sage-dark"
                >
                  Explore the gear
                  <ArrowRight size={16} />
                </Link>
              </ScrollReveal>

              <ScrollReveal delay={0.1} direction="right">
                <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-card bg-sage-soft/35 lg:max-w-none">
                  <Image
                    src="/images/categories/backpacks.webp"
                    alt="Ventura hiking backpacks staged for the trail"
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 480px"
                    className="object-cover object-center p-6 md:p-8"
                  />
                </div>
              </ScrollReveal>
            </div>
          </Container>
        </section>

        {/* Story */}
        <section className="section-padding bg-cream">
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <ScrollReveal>
                <p className="section-eyebrow">Our story</p>
                <h2 className="mt-3 font-heading text-3xl font-semibold text-charcoal md:text-4xl">
                  Shopping should feel like dawn at camp
                </h2>
                <div className="mt-6 space-y-4 text-sm leading-relaxed text-stone md:text-base">
                  <p>
                    We started Ventura with a simple idea: outdoor shopping
                    should feel as calm and clear as a quiet campsite at dawn.
                    No clutter, no gimmicks — just carefully chosen packs,
                    tents, lighting, and camp essentials.
                  </p>
                  <p>
                    Every product in our catalog is selected for durability,
                    comfort, and real trail use. Whether you&apos;re planning a
                    weekend escape or a multi-day trek, we help you pack with
                    confidence.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="right" delay={0.1}>
                <div className="relative aspect-square overflow-hidden rounded-card bg-sage-soft/40 md:aspect-[5/6]">
                  <Image
                    src="/images/categories/lighting.webp"
                    alt="Ventura camp lantern and headlamp ready for dusk"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center p-4 md:p-6"
                  />
                </div>
              </ScrollReveal>
            </div>
          </Container>
        </section>

        {/* Values — one job, no card chrome */}
        <section className="border-y border-sand bg-white py-16 md:py-24">
          <Container>
            <ScrollReveal className="mx-auto max-w-2xl text-center">
              <p className="section-eyebrow">What we stand for</p>
              <h2 className="mt-3 font-heading text-3xl font-semibold text-charcoal md:text-4xl">
                Gear you can trust on the path ahead
              </h2>
            </ScrollReveal>

            <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
              {values.map((item, i) => (
                <ScrollReveal key={item.title} delay={i * 0.08}>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sage">
                    0{i + 1}
                  </p>
                  <h3 className="mt-3 font-heading text-xl font-semibold text-charcoal">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone">
                    {item.text}
                  </p>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </section>

        {/* Closing band with gear visual */}
        <section className="relative overflow-hidden bg-sage py-20 md:py-28">
          <div
            className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-accent/15 blur-3xl"
            aria-hidden
          />
          <Container className="relative z-10">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              <ScrollReveal>
                <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-card bg-cream ring-1 ring-white/15 lg:mx-0">
                  <Image
                    src="/images/categories/tents.webp"
                    alt="Ventura trail tents ready for camp"
                    fill
                    sizes="(max-width: 1024px) 90vw, 420px"
                    className="object-contain object-center p-8"
                  />
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.1}>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage-light">
                  Ready when you are
                </p>
                <h2 className="mt-3 font-heading text-3xl font-semibold text-cream md:text-4xl">
                  Pack for the trip — we have the gear
                </h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/80">
                  Browse trail-ready backpacks, tents, lighting, and camp
                  essentials from brands we trust outdoors.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/products"
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-cream px-7 py-3 text-sm font-semibold text-sage-dark transition-transform hover:scale-[1.03]"
                  >
                    Shop all gear
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex min-h-[48px] items-center gap-2 rounded-full border border-cream/35 px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
                  >
                    Contact us
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </Container>
        </section>
      </PageTransition>
    </MainLayout>
  );
}
