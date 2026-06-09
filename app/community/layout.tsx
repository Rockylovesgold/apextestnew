import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community & Membership | AIOV Capital",
  description:
    "What members get: market insights, trade ideas, education, and a high-trust trading community.",
};

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
