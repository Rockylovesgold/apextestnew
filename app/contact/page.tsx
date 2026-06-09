"use client";

import { useState } from "react";
import { Mail, Send, Phone, Clock, MapPin, ChevronDown } from "lucide-react";
import { GoldButton } from "@/components/ui/GoldButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PageAccents } from "@/components/layout/PageAccents";
import { faqItems } from "@/lib/mockData";

const contactDetails = [
  { icon: Mail, label: "hello@aiovcapital.com", href: "mailto:hello@aiovcapital.com" },
  { icon: Send, label: "Join our Telegram", href: "https://t.me/charist12" },
  { icon: Phone, label: "WhatsApp Support", href: undefined },
  { icon: Clock, label: "Mon-Fri: 8:00 AM - 10:00 PM GMT", href: undefined },
  { icon: MapPin, label: "London, United Kingdom", href: undefined },
];

const subjectOptions = [
  "General Inquiry",
  "Signal Access",
  "Partnership",
  "Support",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "var(--color-bg-elevated)",
    border: "1px solid var(--color-border-default)",
    borderRadius: "var(--radius-md)",
    outline: "none",
    padding: "12px 16px",
    fontSize: "var(--text-sm)",
    color: "var(--color-text-primary)",
    fontFamily: "inherit",
    transition: "border-color var(--transition-base)",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "var(--text-xs)",
    color: "var(--color-text-secondary)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    marginBottom: "8px",
    display: "block",
    fontWeight: 600,
  };

  return (
    <div style={{ position: "relative" }}>
      <PageAccents />
      {/* Hero */}
      <section className="section-padding" style={{ paddingTop: "8rem", paddingBottom: "4rem", position: "relative", zIndex: 2 }}>
        <div className="container-max">
          <SectionHeading
            eyebrow="Contact"
            title="Get In Touch"
            subtitle="We'd love to hear from you"
          />
        </div>
      </section>

      {/* Two Column Layout */}
      <section className="section-padding" style={{ paddingTop: 0 }}>
        <div className="container-max">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            {/* Left: Contact Form */}
            <div className="card reveal">
              {submitted ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
                  <p style={{ color: "var(--color-positive)", fontSize: "var(--text-lg)", textAlign: "center" }}>
                    Thank you! We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div>
                    <label style={labelStyle}>Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                      onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--color-accent-gold)"; }}
                      onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--color-border-default)"; }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={inputStyle}
                      onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--color-accent-gold)"; }}
                      onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--color-border-default)"; }}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Subject</label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      style={{ ...inputStyle, cursor: "pointer", appearance: "none" as const }}
                      onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--color-accent-gold)"; }}
                      onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--color-border-default)"; }}
                    >
                      <option value="" disabled style={{ background: "var(--color-bg-surface)" }}>
                        Select a subject
                      </option>
                      {subjectOptions.map((option) => (
                        <option key={option} value={option} style={{ background: "var(--color-bg-surface)", color: "var(--color-text-primary)" }}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Message</label>
                    <textarea
                      name="message"
                      placeholder="Tell us how we can help..."
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      style={{ ...inputStyle, resize: "none" }}
                      onFocus={(e) => { (e.target as HTMLElement).style.borderColor = "var(--color-accent-gold)"; }}
                      onBlur={(e) => { (e.target as HTMLElement).style.borderColor = "var(--color-border-default)"; }}
                    />
                  </div>

                  <GoldButton variant="primary" type="submit" className="w-full">
                    Send Message
                  </GoldButton>
                </form>
              )}
            </div>

            {/* Right: Contact Info */}
            <div className="card reveal">
              <h3 style={{ marginBottom: "24px" }}>Contact Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {contactDetails.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Icon size={18} style={{ color: "var(--color-accent-gold)", flexShrink: 0 }} />
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)", textDecoration: "none" }}>
                          {item.label}
                        </a>
                      ) : (
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-primary)" }}>
                          {item.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding">
        <div className="container-max">
          <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" />

          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            {faqItems.map((item, index) => (
              <div
                key={index}
                className="reveal"
                style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px 0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: "16px",
                  }}
                >
                  <span style={{ color: "var(--color-text-primary)", fontWeight: 500, fontSize: "var(--text-base)" }}>
                    {item.question}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      color: "var(--color-accent-gold)",
                      flexShrink: 0,
                      transition: "transform var(--transition-base)",
                      transform: openIndex === index ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>
                <div
                  className="accordion-answer"
                  style={{ maxHeight: openIndex === index ? "400px" : "0" }}
                >
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", paddingBottom: "20px", margin: 0 }}>
                    {item.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
