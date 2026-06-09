"use client";

import { useState } from "react";
import { Clock, BookOpen } from "lucide-react";
import { GoldButton } from "@/components/ui/GoldButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { courses, type Course } from "@/lib/mockData";

const filterTabs = ["All Courses", "Beginner", "Intermediate", "Advanced"] as const;

type FilterTab = (typeof filterTabs)[number];

const difficultyStyles: Record<Course["difficulty"], { color: string; bg: string }> = {
  beginner: { color: "var(--color-positive)", bg: "rgba(34,197,94,0.08)" },
  intermediate: { color: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  advanced: { color: "var(--color-negative)", bg: "rgba(239,68,68,0.08)" },
};

const books = [
  {
    title: "Trading in the Zone",
    author: "Mark Douglas",
    description:
      "A deep exploration of trading psychology that helps traders develop the mindset and discipline required for consistent success in the markets.",
  },
  {
    title: "Technical Analysis of the Financial Markets",
    author: "John Murphy",
    description:
      "A comprehensive guide to charting techniques and technical indicators, widely regarded as the definitive reference for market analysis.",
  },
  {
    title: "The Intelligent Investor",
    author: "Benjamin Graham",
    description:
      "Foundational investment principles centered on value investing, risk management, and maintaining emotional discipline through market cycles.",
  },
];

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("All Courses");

  const filteredCourses =
    activeTab === "All Courses"
      ? courses
      : courses.filter(
          (c) => c.difficulty === activeTab.toLowerCase()
        );

  return (
    <>
      {/* Hero */}
      <section className="section-padding" style={{ paddingTop: "8rem", paddingBottom: "4rem" }}>
        <div className="container-max">
          <SectionHeading
            eyebrow="Education"
            title="Trading Academy"
            subtitle="Master the art and science of gold trading"
          />
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="section-padding" style={{ paddingTop: 0 }}>
        <div className="container-max">
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px", marginBottom: "48px" }}>
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 24px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  border: activeTab === tab ? "1px solid transparent" : "1px solid var(--color-border-subtle)",
                  background: activeTab === tab ? "var(--color-accent-gold)" : "transparent",
                  color: activeTab === tab ? "var(--color-bg-base)" : "var(--color-text-secondary)",
                  cursor: "pointer",
                  transition: "all var(--transition-base)",
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Course Grid */}
          <div
            className="reveal-group"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-3)" }}
          >
            {filteredCourses.map((course, index) => {
              const diff = difficultyStyles[course.difficulty];
              return (
                <div
                  key={course.id}
                  className="card reveal"
                  style={{ position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}
                >
                  {/* Course Number Watermark */}
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "100px",
                      position: "absolute",
                      top: "8px",
                      right: "16px",
                      opacity: 0.03,
                      color: "var(--color-accent-gold)",
                      lineHeight: 1,
                      userSelect: "none",
                      pointerEvents: "none",
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Difficulty Tag */}
                  <span
                    style={{
                      display: "inline-block",
                      alignSelf: "flex-start",
                      textTransform: "uppercase",
                      fontSize: "var(--text-xs)",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      borderRadius: "var(--radius-pill)",
                      padding: "4px 12px",
                      color: diff.color,
                      background: diff.bg,
                      marginBottom: "16px",
                    }}
                  >
                    {course.difficulty}
                  </span>

                  <h3 style={{ marginBottom: "8px" }}>{course.title}</h3>

                  <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", flex: 1, margin: 0 }}>
                    {course.description}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
                        <Clock size={14} />
                        {course.duration}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
                        <BookOpen size={14} />
                        {course.lessons} Lessons
                      </span>
                    </div>
                    <div>
                      {course.available ? (
                        <GoldButton variant="ghost" size="sm">
                          Start Learning →
                        </GoldButton>
                      ) : (
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-muted)", fontStyle: "italic" }}>
                          Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recommended Reading */}
      <section className="section-padding">
        <div className="container-max">
          <SectionHeading eyebrow="Library" title="Recommended Reading" />
          <div
            className="reveal-group"
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--space-3)" }}
          >
            {books.map((book) => (
              <div key={book.title} className="card reveal" style={{ display: "flex", flexDirection: "column" }}>
                <h3 style={{ marginBottom: "6px" }}>{book.title}</h3>
                <p style={{ color: "var(--color-accent-gold)", fontSize: "var(--text-sm)", marginBottom: "12px" }}>
                  by {book.author}
                </p>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)", flex: 1, margin: 0 }}>
                  {book.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
