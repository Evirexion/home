import { Hero } from "@/components/home/Hero";
import { QuickAccessCards } from "@/components/home/QuickAccessCards";
import { StatsStrip } from "@/components/home/StatsStrip";
import { FeaturedNews } from "@/components/home/FeaturedNews";
import { Manifesto } from "@/components/home/Manifesto";

export default function Home() {
  return (
    <>
      <Hero />
      <QuickAccessCards />
      <StatsStrip />
      <Manifesto />
      <FeaturedNews />
    </>
  );
}
