import { HeroSection } from "@/components/home/HeroSection";
import { TrustBar } from "@/components/home/TrustBar";
import { ImpactStatsBar } from "@/components/home/ImpactStatsBar";
import { TeamSection } from "@/components/home/TeamSection";
import { AboutIntroSection } from "@/components/home/AboutIntroSection";
import { ValueProposition } from "@/components/home/ValueProposition";
import { CommunitySection } from "@/components/home/CommunitySection";
import { SignalPreview } from "@/components/home/SignalPreview";
import { TradingOpportunitiesSection } from "@/components/home/TradingOpportunitiesSection";
import { ExampleTradeSection } from "@/components/home/ExampleTradeSection";
import { RiskManagementSection } from "@/components/home/RiskManagementSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { MT5PlatformSection } from "@/components/home/MT5PlatformSection";
import { MarketOverview } from "@/components/home/MarketOverview";
import { TestimonialCarousel } from "@/components/home/TestimonialCarousel";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { RiskDisclaimerSection } from "@/components/home/RiskDisclaimerSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <TrustBar />
      <ImpactStatsBar />
      <AboutIntroSection />
      <ValueProposition />
      <CommunitySection />
      <SignalPreview />
      <TradingOpportunitiesSection />
      <ExampleTradeSection />
      <RiskManagementSection />
      <HowItWorks />
      <MT5PlatformSection />
      <MarketOverview />
      <TeamSection />
      <TestimonialCarousel />
      <NewsletterSection />
      <FinalCTA />
      <RiskDisclaimerSection />
    </>
  );
}
