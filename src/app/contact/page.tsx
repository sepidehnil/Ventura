"use client";

import { FormEvent, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ContentHero from "@/components/layout/ContentHero";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import PageTransition from "@/components/motion/PageTransition";
import ScrollReveal from "@/components/motion/ScrollReveal";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
        }),
      });

      const payload = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!res.ok) {
        setError(payload?.error || "Could not send your message. Try again.");
        return;
      }

      setSent(true);
      form.reset();
    } catch {
      setError("Could not send your message. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <PageTransition>
        <ContentHero
          eyebrow="Get in touch"
          title="Contact"
          description="Questions about an order, product fit, or shipping? Send a message and we’ll help you get trail-ready."
        />

        <Container className="section-padding">
          <div className="grid gap-10 lg:grid-cols-5 lg:gap-14">
            <ScrollReveal className="space-y-6 lg:col-span-2">
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: "hello@ventura.gear",
                },
                {
                  icon: Phone,
                  label: "Phone",
                  value: "+1 (555) 014-2280",
                },
                {
                  icon: MapPin,
                  label: "Studio",
                  value: "Portland, OR — Outdoor District",
                },
              ].map((item) => (
                <div key={item.label} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage-dark">
                    <item.icon size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-stone">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-medium text-charcoal">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </ScrollReveal>

            <ScrollReveal delay={0.08} className="lg:col-span-3">
              {sent ? (
                <div className="rounded-card border border-sand bg-white p-8 shadow-card">
                  <h2 className="font-heading text-2xl font-semibold text-charcoal">
                    Message received
                  </h2>
                  <p className="mt-3 text-sm text-stone">
                    Thanks for reaching out. Our team typically replies within
                    one business day — we&apos;ll get back to you soon.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-card border border-sand bg-white p-6 shadow-card md:p-8"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="name"
                        className="mb-2 block text-xs font-semibold uppercase tracking-widest text-charcoal"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        required
                        disabled={loading}
                        className="min-h-[48px] w-full rounded-xl border border-sand bg-cream px-4 text-sm focus:border-sage focus:outline-none disabled:opacity-60"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="mb-2 block text-xs font-semibold uppercase tracking-widest text-charcoal"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        disabled={loading}
                        className="min-h-[48px] w-full rounded-xl border border-sand bg-cream px-4 text-sm focus:border-sage focus:outline-none disabled:opacity-60"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label
                      htmlFor="message"
                      className="mb-2 block text-xs font-semibold uppercase tracking-widest text-charcoal"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      disabled={loading}
                      className="w-full rounded-xl border border-sand bg-cream px-4 py-3 text-sm focus:border-sage focus:outline-none disabled:opacity-60"
                    />
                  </div>
                  {error && (
                    <p className="mt-4 text-sm text-red-600" role="alert">
                      {error}
                    </p>
                  )}
                  <Button type="submit" className="mt-6" disabled={loading}>
                    {loading ? "Sending…" : "Send message"}
                  </Button>
                </form>
              )}
            </ScrollReveal>
          </div>
        </Container>
      </PageTransition>
    </MainLayout>
  );
}
