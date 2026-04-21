import { useEffect, useState } from "react";
import { ArrowRight, Loader2, Package, Download } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

type Product = {
  id: string;
  name: string;
  ref: string;
  description: string | null;
  diametre: string | null;
  badge: string | null;
  image_url: string | null;
  category: { name: string } | null;
};

export default function CatalogueSection() {
  const [active, setActive] = useState("Tout");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["Tout"]);
  const [loading, setLoading] = useState(true);
  const [catalogueUrl, setCatalogueUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch products and categories
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*, category:categories(name)")
        .order("created_at", { ascending: false });

      if (productsError) {
        console.error("Error fetching products for catalogue:", productsError);
      } else {
        const fetchedProducts = productsData as unknown as Product[];
        setProducts(fetchedProducts);

        const cats = new Set<string>();
        cats.add("Tout");
        fetchedProducts.forEach((p) => {
          if (p.category?.name) cats.add(p.category.name);
        });
        setCategories(Array.from(cats));
      }

      // Fetch catalogue URL
      const { data: settingsData } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "catalogue_url")
        .single();
      
      if (settingsData) {
        setCatalogueUrl(settingsData.value);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const filtered =
    active === "Tout" ? products : products.filter((p) => p.category?.name === active);

  return (
    <section id="catalogue" className="py-16 lg:py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-heading text-3xl lg:text-4xl text-navy">Catalogue TITANIC</h2>
            <p className="mt-2 text-muted-foreground">
              Explorez nos best-sellers et innovations récentes.
            </p>
          </div>
          {catalogueUrl && (
            <a
              href={`${catalogueUrl}?download=`}
              download="Catalogue_TITANIC.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-navy px-6 py-3 text-sm font-semibold text-white hover:bg-navy-light transition-colors"
            >
              <Download size={18} /> Télécharger le catalogue complet (PDF)
            </a>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                active === c
                  ? "bg-navy text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-navy/5"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-navy" size={40} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-heading text-xl text-navy">Aucun produit dans cette catégorie</p>
          </div>
        ) : (
          <div className="mt-10 relative px-4 lg:px-12">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 3000,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {filtered.map((p) => (
                  <CarouselItem key={p.id} className="pl-4 sm:basis-1/2 lg:basis-1/3">
                    <div className="group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all h-full flex flex-col">
                      <div className="relative bg-surface p-6 flex items-center justify-center h-56 shrink-0">
                        {p.badge && (
                          <span className="absolute top-4 left-4 bg-navy text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                            {p.badge}
                          </span>
                        )}
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            loading="lazy"
                            width={200}
                            height={200}
                            className="h-40 w-auto object-contain group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="h-40 w-40 rounded bg-white flex items-center justify-center text-muted-foreground">
                            <Package size={40} className="opacity-10" />
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground">{p.name}</h3>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2 flex-grow">
                          {p.description}
                        </p>
                        <div className="mt-4 flex items-center justify-between pt-4 border-t border-border">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-navy">Réf: {p.ref}</span>
                            {p.diametre && (
                              <span className="text-[10px] text-muted-foreground">{p.diametre}</span>
                            )}
                          </div>
                          <Link
                            to="/produits/$productId"
                            params={{ productId: p.id }}
                            className="inline-flex items-center gap-1 text-sm font-medium text-red-brand hover:underline"
                          >
                            Voir fiche <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden lg:block">
                <CarouselPrevious className="-left-10" />
                <CarouselNext className="-right-10" />
              </div>
            </Carousel>
          </div>
        )}
      </div>
    </section>
  );
}
