"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { testimonials } from "@/lib/mockData";

export function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const maxIndex = testimonials.length - 1;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isPaused, goToNext]);

  return (
    <section className="section-padding">
      <div className="container-max">
        <SectionHeading
          eyebrow="Testimonials"
          title="Community perspective"
          subtitle="What members value about the environment"
        />

        {/* Desktop: 3-col grid; Mobile: carousel */}
        <div className="hidden md:grid grid-cols-3 gap-6 reveal-group">
          {testimonials.slice(0, 3).map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div
          className="md:hidden relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden">
            <div
              style={{
                display: "flex",
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: "transform 400ms cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full shrink-0 px-1">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={goToPrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-bg-tertiary border border-white/10 flex items-center justify-center z-10 text-gold"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-bg-tertiary border border-white/10 flex items-center justify-center z-10 text-gold"
            aria-label="Next testimonial"
          >
            <ChevronRight size={18} />
          </button>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentIndex ? "bg-gold" : "bg-white/25"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: typeof testimonials[0] }) {
  return (
    <GlassCard className="reveal relative flex flex-col gap-4 h-full">
      {/* Decorative quote mark */}
      <span
        aria-hidden
        className="absolute top-1 right-3 text-[72px] leading-none text-gold/15 pointer-events-none select-none"
      >
        &ldquo;
      </span>

      {/* Quote */}
      <p className="text-base text-text-secondary leading-relaxed flex-1">
        &ldquo;{testimonial.text}&rdquo;
      </p>

      {/* Stars */}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < testimonial.rating ? "text-gold fill-gold" : "text-white/20"}
          />
        ))}
      </div>

      {/* Attribution */}
      <div className="flex items-center gap-2.5 mt-1">
        <div className="w-9 h-9 rounded-full bg-bg-tertiary border border-white/10 flex items-center justify-center text-sm font-semibold text-gold shrink-0">
          {testimonial.name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-text-primary leading-tight">{testimonial.name}</p>
          <p className="text-xs text-text-tertiary leading-tight">
            Member since {testimonial.memberSince}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
