import { Hero } from "@/components/home/Hero";
import { QuickAccessCards } from "@/components/home/QuickAccessCards";
import { FeaturedNews } from "@/components/home/FeaturedNews";

export default function Home() {
  return (
    <>
      <Hero />
      <QuickAccessCards />
      <FeaturedNews />
    </>
  );
}
