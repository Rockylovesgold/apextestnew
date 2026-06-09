"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";
import { GoldButton } from "@/components/ui/GoldButton";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section className="section-padding relative overflow-hidden border-t border-white/10 bg-bg-secondary/70">
      <div
        aria-hidden
        className="absolute -top-16 -right-20 w-80 h-80 rounded-full bg-[radial-gradient(circle,rgba(54,128,255,0.08)_0%,transparent_65%)] pointer-events-none"
      />

      <div className="container-max relative">
        <div className="reveal max-w-2xl mx-auto text-center glass-card-static">
          <span className="label-eyebrow block mb-3">Stay informed</span>
          <h2 className="mb-3">Weekly market intelligence. Free.</h2>
          <p className="text-text-secondary max-w-xl mx-auto mb-6">
            Get our gold market wrap-up every Monday — key levels, macro drivers,
            and the week&apos;s top trade setups. No spam, unsubscribe any time.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-2 px-5 py-4 bg-green-profit/10 border border-green-profit/30 rounded-md text-green-profit">
              <CheckCircle size={18} />
              <span className="text-sm font-medium">
                You&apos;re on the list. Check your inbox for confirmation.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                aria-label="Email address"
                className="flex-1 h-12 px-4 bg-bg-tertiary border border-border-default rounded-md text-text-primary text-sm outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20"
              />
              <GoldButton type="submit" variant="primary" className="sm:min-w-[150px]">
                <Send size={15} />
                Subscribe
              </GoldButton>
            </form>
          )}

          <p className="text-xs text-text-tertiary mt-3">
            Join 5,000+ traders. Weekly. Free. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
