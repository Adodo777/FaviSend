import Hero from "./Hero";
import Features from "./Features";
import Explore from "./Explore";
import Stats from "./Stats";
import CTA from "./CTA";

export default function Home() {
  return (
    <div className="pt-16">
      <Hero />
      <Features />
      <Explore />
      <Stats />
      <CTA />
    </div>
  );
}
