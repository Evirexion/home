import { Hero } from "@/components/home/Hero";
import { MagazineFeature } from "@/components/home/MagazineFeature";
import { QuickAccessCards } from "@/components/home/QuickAccessCards";
import { StatsStrip } from "@/components/home/StatsStrip";
import { FeaturedNews } from "@/components/home/FeaturedNews";
import { Manifesto } from "@/components/home/Manifesto";

export default function Home() {
  return (
    <>
      <Hero />
      <MagazineFeature />
      <QuickAccessCards />
      <StatsStrip />
      <Manifesto />
      <FeaturedNews />
    </>
  );
}
