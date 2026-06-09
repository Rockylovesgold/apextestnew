"use client";

import Image from "next/image";
import { Twitter, Facebook, Instagram, Send } from "lucide-react";

function TikTokIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}
import { SectionHeading } from "@/components/ui/SectionHeading";

const team = [
  {
    name: "Anthony",
    role: "Founder & Lead Trader",
    image: "/team/shabbaranks_2.png",
    description:
      "Anthony is the founder and lead analyst of AIOV Capital. With over eight years of experience across cryptocurrency and gold (XAU/USD) markets, he has developed a deep, systematic understanding of price action, market structure, and risk-managed trade execution. Beginning in crypto in 2016, he expanded into forex in 2020 before identifying gold as the most consistent and tradeable market — a conviction that became the foundation of everything AIOV Capital stands for. Operating between the UK and Dubai, Anthony built the community from the ground up — starting as a private Telegram group and growing it into a global operation of 5,000+ members. He personally oversees the daily signal desk, delivering 8–10 structured trade ideas every day with a reported 86% win rate. His mission is straightforward: remove the barriers to financial markets and give everyday people access to the same opportunities as professionals.",
    socials: {
      twitter: "https://x.com/shabbaranks333?s=21",
    },
  },
  {
    name: "Kyle",
    role: "Founding Member",
    image: "/team/dinny_2.png",
    description:
      "A 27-year-old entrepreneur with a strong focus on building and scaling modern businesses in the digital space. With a background in marketing and web development, he specialises in creating systems that drive growth, increase visibility, and generate consistent results. He has successfully developed and managed multiple businesses across online and service-based industries, combining practical execution with a deep understanding of digital platforms. Alongside this, he has been actively developing his trading strategy over the past two years — further sharpening his analytical thinking, discipline, and risk management skills as part of his long-term business direction.",
    socials: {},
  },
  {
    name: "Andrew Shim",
    role: "Senior Trader & Mentor",
    image: "/team/andrew_shim_2.png",
    description:
      "A multi-disciplined professional with a diverse background across performance, elite sport, and financial markets. He began his career in the entertainment industry at 14 as a professional actor, developing strong communication skills, discipline, and adaptability. He went on to compete professionally in MMA from 27 to 31, alongside amateur boxing from 29 to 32, and raced motorbikes professionally from 25 to 33 — environments that forged the mental resilience he now applies to trading. In 2016, he transitioned into financial markets, specialising in cryptocurrency before expanding into forex in 2020 and focusing on gold (XAU) from 2022 to the present.",
    socials: {},
  },
  {
    name: "Jade Comery",
    role: "Affiliate & Gold Trader",
    image: "/team/jade_comery_2.png",
    description:
      "With a strong foundation in the aesthetics industry, Jade has built her career around precision, trust, and delivering results that genuinely improve confidence and wellbeing. As a specialist injector, body contouring practitioner, and founder of The 3D Clinic, she has spent years refining her expertise and training others within the field. Over time, her professional journey evolved beyond aesthetics — the discipline, risk management, and strategic thinking required in a results-driven clinical environment proved highly transferable to gold trading. She approaches the markets with the same structure and consistency that defined her clinical career, and is a dedicated mother of three.",
    socials: {},
  },
  {
    name: "Kristopher Collins",
    role: "Affiliate",
    image: "/team/kristopher_collins_2.png",
    description:
      "Known to many as Collo, Kristopher is a self-employed professional specialising in fencing and decking, and a proud father of four. Introduced to gold trading through a trusted contact, he quickly recognised its potential as a scalable secondary income stream that fits around an already full working and family life. Alongside his partner Jade, he has successfully integrated trading into their daily routine — proving that building an additional income does not require overhauling everything you already do. Now an affiliate, Kristopher is committed to opening that same door for others looking to grow alongside their existing career.",
    socials: {},
  },
  {
    name: "Hannah Harvey",
    role: "Affiliate & Gold Trader",
    image: "/team/hannah_harvey_2.png",
    description:
      "A dedicated wife, mother of three, and gold trader with a background in dog breeding and accounting administration. In November 2025, Hannah and her husband began trading gold while running their own businesses — and the results have made a genuine, lasting difference to their household income. Motivated by her own experience and a drive to help others achieve the same, becoming an affiliate was an easy decision. Her approach is straightforward: if it has helped her family, it can help others — and she is committed to supporting as many people as possible to access this opportunity.",
    socials: {},
  },
  {
    name: "Kelsey",
    role: "Lead Affiliate & Gold Trader",
    image: "/team/kelsey_2.png",
    description:
      "A 36-year-old dedicated mum of two and active gold trader with a strong focus on building multiple, sustainable income streams. Passionate about developing financial independence while maintaining a balanced family life, she leads by example through consistency, discipline, and a strong work ethic. Through gold trading she has developed a deep understanding of the markets — applying strategy, patience, and continuous learning to navigate a fast-paced environment. As a lead affiliate within the AIOV Capital community, she works closely with individuals looking to learn new skills, improve their mindset, and generate additional income, offering guidance and real, practical insight at every stage of the journey.",
    socials: {},
  },
  {
    name: "Jono",
    role: "Affiliate & Gold Trader",
    image: "/team/jono_2.png",
    description:
      "Jono runs a successful Fire and Security business that continues to go from strength to strength. Introduced to gold trading by a close friend, it quickly became a game changer — generating consistent daily profits through structured signals, a solid understanding of market movement, and disciplined risk management. Gold has become a serious second income stream that he has fully committed to. Now he passes that knowledge on to family and friends, helping them understand the process, stay disciplined, and take advantage of the same opportunities.",
    socials: {},
  },
  {
    name: "Keeva",
    role: "Affiliate & Gold Trader",
    image: "/team/keeva_2.png",
    description:
      "A hardworking, grounded individual with a strong background as a professional ground worker, where discipline, resilience, and consistency have always been part of his daily life. Alongside his trade, he spent the last seven years building his knowledge and experience in the stock market, developing a sharp eye for opportunities and a steady approach to risk. Recently, he made the shift into trading gold — an opportunity that came through a trusted friend. In just three months, that move has proven life changing, opening doors he hadn't imagined possible. Through focus, adaptability, and commitment, he has been able to step away from full-time work and pursue trading as a primary path. Driven by growth, both personally and financially, he is always looking to evolve, learn, and make the most of the opportunities in front of him.",
    socials: {},
  },
  {
    name: "Yvonne Olphert",
    role: "Affiliate & Gold Trader",
    image: "/team/yvonne_2.jpg",
    description:
      "Mum of two and full-time pub & restaurant manager with a passion for personal growth and building new opportunities. Alongside her career, she is a TikTok creator and part-time gold trader, currently developing her skills within the financial markets. Dedicated to learning, growing, and helping others explore trading as a potential additional income stream — focused on creating a better future for her family while supporting others on their journey.",
    socials: {},
  },
  {
    name: "Callum",
    role: "Affiliate & Gold Trader",
    image: "/team/callum_2.jpg",
    description:
      "At AIOV Capital, Callum plays a key role in helping individuals understand and navigate the gold and financial markets with confidence. His career began in customer facing and operational roles, where he developed a strong foundation in communication, negotiation, and understanding how businesses operate at a ground level. He later transitioned into the energy sector, advising companies on procurement strategies, cost reduction, and the integration of renewable solutions. Alongside his work in energy, Callum has expanded into trading and international business, with a growing focus on global markets and cross border opportunities. His approach centres around risk management, strategic thinking, and building scalable income streams. Through AIOV Capital, Callum is committed to providing clear, practical guidance to traders at all levels, helping them develop the skills, mindset, and structure needed to succeed in today's markets.",
    socials: {},
  },
];

const socialIcons: Record<string, React.ElementType> = {
  twitter: Twitter,
  tiktok: TikTokIcon,
  facebook: Facebook,
  telegram: Send,
};

const socialLabels: Record<string, string> = {
  twitter: "Twitter / X",
  tiktok: "TikTok",
  facebook: "Facebook",
  telegram: "Telegram",
};

export default function TeamPage() {
  return (
    <>
      {/* Hero */}
      <section className="section-padding" style={{ paddingTop: "8rem", paddingBottom: "4rem" }}>
        <div className="container-max">
          <SectionHeading
            eyebrow="The Team"
            title="The People Behind AIOV Capital"
            subtitle="Traders, entrepreneurs, and affiliates — united by a focus on gold and consistent results"
          />
        </div>
      </section>

      {/* Team Grid */}
      <section className="section-padding" style={{ paddingTop: 0 }}>
        <div className="container-max">
          <div
            className="reveal-group"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: "var(--space-6)",
            }}
          >
            {team.map((member) => (
              <div
                key={member.name}
                className="card reveal"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px",
                  padding: "clamp(16px, 4vw, 32px) clamp(14px, 4vw, 24px)",
                  textAlign: "center",
                }}
              >
                {/* Gold-framed Avatar */}
                <div
                  style={{
                    width: "clamp(120px, 35vw, 160px)",
                    height: "clamp(120px, 35vw, 160px)",
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="160px"
                  />
                </div>

                {/* Info */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
                  <h3 style={{ fontSize: "var(--text-xl)", marginBottom: "4px" }}>
                    {member.name}
                  </h3>
                  <p
                    style={{
                      color: "var(--color-accent-gold)",
                      fontSize: "var(--text-xs)",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      marginBottom: "16px",
                    }}
                  >
                    {member.role}
                  </p>
                  <p
                    style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--color-text-secondary)",
                      lineHeight: "var(--leading-relaxed)",
                      margin: 0,
                      textAlign: "left",
                    }}
                  >
                    {member.description}
                  </p>

                  {/* Social Links */}
                  {Object.keys(member.socials).length > 0 && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "20px" }}>
                      {Object.entries(member.socials).map(([platform, url]) => {
                        const Icon = socialIcons[platform];
                        if (!Icon || !url) return null;
                        return (
                          <a
                            key={platform}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={socialLabels[platform]}
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              border: "1px solid rgba(54,128,255,0.3)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "var(--color-accent-gold)",
                              textDecoration: "none",
                              transition: "all 0.15s ease",
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(54,128,255,0.1)";
                              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(54,128,255,0.6)";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(54,128,255,0.3)";
                            }}
                          >
                            <Icon size={14} />
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Follow Banner */}
      <section className="section-padding" style={{ background: "var(--color-bg-surface)" }}>
        <div className="container-max">
          <div
            className="card reveal"
            style={{ textAlign: "center", padding: "clamp(24px, 5vw, 48px) clamp(16px, 4vw, 32px)" }}
          >
            <p
              style={{
                color: "var(--color-accent-gold)",
                fontSize: "var(--text-xs)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: "12px",
              }}
            >
              Follow AIOV Capital
            </p>
            <h2 style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", marginBottom: "8px" }}>
              Stay Connected
            </h2>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-secondary)",
                maxWidth: "480px",
                margin: "0 auto 28px",
                lineHeight: "var(--leading-relaxed)",
              }}
            >
              Follow us on social media for live trade ideas, market updates, and community highlights.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              {[
                { icon: Twitter, href: "https://x.com/shabbaranks333?s=21", label: "Twitter / X" },
                { icon: Instagram, href: "https://www.instagram.com/apexgoldtrading?igsh=MWd6NGh3bXh2YTRsMQ%3D%3D&utm_source=qr", label: "Instagram" },
                { icon: TikTokIcon, href: "https://www.tiktok.com/@apexgoldtrading?_r=1&_t=ZN-954UJPWkRlO", label: "TikTok" },
                { icon: Facebook, href: "https://www.facebook.com/share/1L46q81nFJ/?mibextid=wwXIfr", label: "Facebook" },
                { icon: Send, href: "https://t.me/charist12", label: "Telegram" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    height: "44px",
                    padding: "0 20px",
                    borderRadius: "9999px",
                    border: "1px solid rgba(54,128,255,0.3)",
                    color: "var(--color-text-secondary)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 500,
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(54,128,255,0.6)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-accent-gold)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(54,128,255,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(54,128,255,0.3)";
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-secondary)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }}
                >
                  <Icon size={15} />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="section-padding reveal"
        style={{ textAlign: "center" }}
      >
        <div className="container-max">
          <p
            style={{
              color: "var(--color-accent-gold)",
              fontSize: "var(--text-xs)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: "16px",
            }}
          >
            Join the Community
          </p>
          <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", marginBottom: "16px" }}>
            Trade Alongside the Team
          </h2>
          <p
            style={{
              fontSize: "var(--text-base)",
              color: "var(--color-text-secondary)",
              maxWidth: "520px",
              margin: "0 auto 32px",
              lineHeight: "var(--leading-relaxed)",
            }}
          >
            Get real-time signals, live analysis, and direct access to the traders behind AIOV Capital.
          </p>
          <a
            href="https://t.me/charist12"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: "48px",
              padding: "0 28px",
              borderRadius: "9999px",
              background: "var(--color-accent-gold)",
              color: "var(--color-text-inverse)",
              fontWeight: 600,
              fontSize: "var(--text-sm)",
              letterSpacing: "0.01em",
              textDecoration: "none",
            }}
          >
            Join Free Telegram Group
          </a>
        </div>
      </section>
    </>
  );
}
