import { GoldButton } from "@/components/ui/GoldButton";

export default function NotFound() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        background: "var(--color-bg-base)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--text-sm)",
          color: "var(--color-accent-gold)",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: "16px",
        }}
      >
        404
      </p>
      <h1
        style={{
          fontSize: "clamp(1.75rem, 5vw, 3rem)",
          fontWeight: 700,
          marginBottom: "16px",
          color: "var(--color-text-primary)",
        }}
      >
        Page Not Found
      </h1>
      <p
        style={{
          fontSize: "var(--text-base)",
          color: "var(--color-text-secondary)",
          maxWidth: "420px",
          lineHeight: "var(--leading-relaxed)",
          marginBottom: "36px",
        }}
      >
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <GoldButton variant="primary" href="/" showArrow>
        Back to Home
      </GoldButton>
    </section>
  );
}
