import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Product data for the slider
import p1 from "@/assets/products/_MG_7231.jpg";
import p2 from "@/assets/products/_MG_7301.jpg";
import p3 from "@/assets/products/_MG_7354.jpg";
import iconAutocuiseur from "@/assets/products/1.png";
import iconPoele from "@/assets/products/2.png";
import iconMarmite from "@/assets/products/3.png";

const HERO_PRODUCTS = [
  {
    image: p1,
    icon: iconAutocuiseur,
    title: "Faitout Alu Anses Bak",
    desc: "A classic aluminum cooking pot equipped with heat-resistant Bakelite handles",
  },
  {
    image: p2,
    icon: iconPoele,
    title: "Bouilloire Alu",
    desc: "A traditional aluminum stovetop kettle featuring a decorative embossed \"grid\" pattern on the lower half.",
  },
  {
    image: p3,
    icon: iconMarmite,
    title: "Friteuse Conic Alu",
    desc: "A specialized deep-frying pan with a conical shape. It comes with a removable wire mesh strainer",
  },
];

export default function HeroSection() {
  const [catalogueUrl, setCatalogueUrl] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  useEffect(() => {
    async function fetchCatalogue() {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "catalogue_url")
        .single();
      
      if (data) {
        setCatalogueUrl(data.value);
      }
    }
    fetchCatalogue();
  }, []);

  return (
    <section className="relative bg-background overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 lg:py-20 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block rounded bg-red-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-brand mb-4 animate-in fade-in slide-in-from-left duration-700">
              Industrie Marocaine Premium
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl leading-[0.95] text-navy animate-in fade-in slide-in-from-left duration-700 delay-150">
              Articles ménagers fabriqués au Maroc
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-left duration-700 delay-300">
              L'excellence de la cuisson industrielle et domestique depuis plus de 30 ans. Maîtrise
              parfaite de l'aluminium, de l'inox et des revêtements antiadhésifs.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 animate-in fade-in slide-in-from-left duration-700 delay-500">
              <a
                href="#catalogue"
                className="inline-flex items-center justify-center rounded-md bg-navy px-8 py-4 text-sm font-semibold text-primary-foreground hover:bg-navy-light transition-all hover:scale-105 active:scale-95"
              >
                Voir nos produits
              </a>
              <a
                href={catalogueUrl ? `${catalogueUrl}?download=` : "#catalogue"}
                download={catalogueUrl ? "Catalogue_TITANIC.pdf" : undefined}
                target={catalogueUrl ? "_blank" : undefined}
                rel={catalogueUrl ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-navy px-8 py-4 text-sm font-semibold text-navy hover:bg-navy hover:text-primary-foreground transition-all hover:scale-105 active:scale-95"
              >
                <Download size={16} />
                Catalogue
              </a>
            </div>
          </div>

          <div className="relative">
            {/* Main Carousel */}
            <div className="overflow-hidden rounded-3xl shadow-2xl border border-border bg-surface" ref={emblaRef}>
              <div className="flex">
                {HERO_PRODUCTS.map((product, idx) => (
                  <div key={idx} className="flex-[0_0_100%] min-w-0 relative h-[400px] lg:h-[550px]">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/20 to-transparent" />
                  </div>
                ))}
              </div>
            </div>

            {/* Info Badge - Animated */}
            <div className="absolute -bottom-6 -left-6 right-6 lg:right-auto lg:w-80 animate-in fade-in zoom-in duration-500 delay-700">
              <div className="bg-card rounded-2xl p-5 shadow-xl border border-border flex items-center gap-5 backdrop-blur-sm bg-card/95">
                <div className="relative h-16 w-16 shrink-0 bg-surface rounded-xl p-2 flex items-center justify-center border border-border shadow-inner">
                  {HERO_PRODUCTS.map((product, idx) => (
                    <img
                      key={idx}
                      src={product.icon}
                      alt=""
                      className={`absolute inset-2 w-12 h-12 object-contain transition-all duration-500 ${
                        selectedIndex === idx ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-12"
                      }`}
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="h-14 flex flex-col justify-center overflow-hidden">
                    {HERO_PRODUCTS.map((product, idx) => (
                      <div
                        key={idx}
                        className={`transition-all duration-500 transform ${
                          selectedIndex === idx 
                            ? "translate-y-0 opacity-100 relative" 
                            : "translate-y-4 opacity-0 absolute"
                        }`}
                      >
                        <p className="font-bold text-navy truncate">{product.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {product.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="absolute top-6 right-6 flex gap-2">
              {HERO_PRODUCTS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => emblaApi?.scrollTo(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    selectedIndex === idx ? "bg-red-brand w-8" : "bg-white/50 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
