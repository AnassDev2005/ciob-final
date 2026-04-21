import { useEffect, useState } from "react";
import heroProduct from "@/assets/hero-product.jpg";
import autocuiseur from "@/assets/autocuiseur.png";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function HeroSection() {
  const [catalogueUrl, setCatalogueUrl] = useState<string | null>(null);

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
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block rounded bg-red-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-brand mb-4">
              Industrie Marocaine Premium
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl leading-[0.95] text-navy">
              Articles ménagers fabriqués au Maroc
            </h1>
            <p className="mt-6 max-w-lg text-base text-muted-foreground leading-relaxed">
              L'excellence de la cuisson industrielle et domestique depuis plus de 30 ans. Maîtrise
              parfaite de l'aluminium, de l'inox et des revêtements antiadhésifs haute performance.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#catalogue"
                className="inline-flex items-center justify-center rounded-md bg-navy px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-navy-light transition-colors"
              >
                Voir nos produits
              </a>
              <a
                href={catalogueUrl ? `${catalogueUrl}?download=` : "#catalogue"}
                download={catalogueUrl ? "Catalogue_TITANIC.pdf" : undefined}
                target={catalogueUrl ? "_blank" : undefined}
                rel={catalogueUrl ? "noopener noreferrer" : undefined}
                className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-navy px-6 py-3 text-sm font-semibold text-navy hover:bg-navy hover:text-primary-foreground transition-colors"
              >
                <Download size={16} />
                Télécharger le catalogue
              </a>
            </div>
          </div>

          <div className="relative flex flex-col gap-4">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src={heroProduct}
                alt="Autocuiseur Excellence TITANIC"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-md border border-border">
              <img
                src={autocuiseur}
                alt="Gamme Granite"
                width={64}
                height={64}
                loading="lazy"
                className="h-16 w-16 rounded-lg object-contain bg-surface"
              />
              <div>
                <p className="font-semibold text-sm text-foreground">Gamme Granite</p>
                <p className="text-xs text-muted-foreground">
                  Technologie Antiadhésive à 2 couches
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
