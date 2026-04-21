import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsBar from "@/components/StatsBar";
import SpecialtiesSection from "@/components/SpecialtiesSection";
import CatalogueSection from "@/components/CatalogueSection";
import QualityContactSection from "@/components/QualityContactSection";
import Footer from "@/components/Footer";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsBar />
      <SpecialtiesSection />
      <CatalogueSection />
      <QualityContactSection />
      <Footer />
    </div>
  );
}
