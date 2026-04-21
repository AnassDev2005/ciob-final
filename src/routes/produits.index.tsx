import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  Filter,
  Search,
  Sparkles,
  Loader2,
  Package,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import heroProduct from "@/assets/hero-product.jpg";
import { z } from "zod";

const productSearchSchema = z.object({
  category: z.string().optional(),
});

export const Route = createFileRoute("/produits/")({
  validateSearch: (search) => productSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Nos Produits — TITANIC" },
      {
        name: "description",
        content:
          "Découvrez la gamme complète TITANIC : autocuiseurs, poêles antiadhésives, marmites aluminium et inox pour particuliers et professionnels.",
      },
      { property: "og:title", content: "Nos Produits — TITANIC" },
      {
        property: "og:description",
        content:
          "Catalogue complet des ustensiles de cuisine TITANIC fabriqués au Maroc. Aluminium, inox, antiadhésif & gamme pro.",
      },
    ],
  }),
  component: ProduitsPage,
});

type Product = {
  id: string;
  name: string;
  ref: string;
  description: string | null;
  diametre: string | null;
  badge: string | null;
  image_url: string | null;
  features: string[] | null;
  category: { name: string } | null;
};

type CategoryCount = { key: string; count: number };

function ProduitsPage() {
  const { category } = Route.useSearch();
  const [active, setActive] = useState(category || "Tout");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [catalogueUrl, setCatalogueUrl] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setActive(category);
    }
  }, [category]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(name)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        const fetchedProducts = data as unknown as Product[];
        setProducts(fetchedProducts);

        // Calculate categories count
        const counts: Record<string, number> = { Tout: fetchedProducts.length };
        fetchedProducts.forEach((p) => {
          const catName = p.category?.name || "Autre";
          counts[catName] = (counts[catName] || 0) + 1;
        });

        setCategories(Object.entries(counts).map(([key, count]) => ({ key, count })));
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

  const filtered = products
    .filter((p) => (active === "Tout" ? true : (p.category?.name || "Autre") === active))
    .filter((p) =>
      query.trim() === ""
        ? true
        : (p.name + (p.description || "") + p.ref).toLowerCase().includes(query.toLowerCase()),
    );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Page hero */}
      <section className="relative overflow-hidden bg-navy text-primary-foreground">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url(${heroProduct})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-navy/70" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-16 lg:py-24">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary-foreground/60">
            <Link to="/" className="hover:text-primary-foreground transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-primary-foreground">Nos produits</span>
          </nav>

          <div className="mt-6 grid lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-8">
              <span className="inline-flex items-center gap-2 rounded bg-red-brand px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                <Sparkles size={14} /> Catalogue 2024
              </span>
              <h1 className="font-heading mt-4 text-4xl sm:text-5xl lg:text-6xl leading-[0.95]">
                Nos produits <span className="text-red-brand">d'exception</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base text-primary-foreground/70 leading-relaxed">
                Une gamme pensée pour la performance, la durabilité et la sécurité. De l'autocuiseur
                familial à la marmite pro de 100L, chaque pièce est fabriquée au Maroc avec les
                meilleurs matériaux.
              </p>
            </div>

            <div className="lg:col-span-4 grid grid-cols-3 gap-3">
              {[
                { v: "+50", l: "Références" },
                { v: "5", l: "Gammes" },
                { v: "10 ans", l: "Garantie" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-xl border border-white/15 bg-white/5 backdrop-blur px-4 py-5 text-center"
                >
                  <p className="font-heading text-3xl text-red-brand">{s.v}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-primary-foreground/70">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="sticky top-[60px] z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-4 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <Filter size={16} className="text-navy shrink-0" />
            {categories.map((c) => (
              <button
                key={c.key}
                onClick={() => setActive(c.key)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  active === c.key
                    ? "bg-navy text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:bg-navy/5"
                }`}
              >
                {c.key}
                <span
                  className={`ml-2 text-[10px] ${active === c.key ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                >
                  {c.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un produit, une réf..."
              className="w-full rounded-md border border-border bg-card pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30"
            />
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 lg:py-16 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-3xl lg:text-4xl text-navy">
                {active === "Tout" ? "Toute la gamme" : `Gamme ${active}`}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {loading
                  ? "Chargement..."
                  : `${filtered.length} produit${filtered.length > 1 ? "s" : ""} disponible${filtered.length > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-navy" size={40} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <p className="font-heading text-2xl text-navy">Aucun produit trouvé</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Essayez une autre catégorie ou modifiez votre recherche.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((p) => (
                <article
                  key={p.id}
                  className="group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className="relative bg-surface p-6 flex items-center justify-center h-60 overflow-hidden">
                    {p.badge && (
                      <span
                        className={`absolute top-4 left-4 bg-navy text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded`}
                      >
                        {p.badge}
                      </span>
                    )}
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        loading="lazy"
                        width={240}
                        height={240}
                        className="h-44 w-auto object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-44 w-44 rounded bg-white flex items-center justify-center text-muted-foreground">
                        <Package size={48} className="opacity-20" />
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <p className="text-[11px] uppercase tracking-wider text-red-brand font-semibold">
                      {p.category?.name || "Autre"}
                    </p>
                    <h3 className="mt-1 font-semibold text-foreground text-lg">{p.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {p.description}
                    </p>

                    <ul className="mt-4 space-y-1.5 h-20 overflow-hidden">
                      {(p.features || []).slice(0, 3).map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs text-foreground/80">
                          <Check size={14} className="text-navy shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-navy">Réf: {p.ref}</span>
                        {p.diametre && (
                          <span className="text-[10px] text-muted-foreground">{p.diametre}</span>
                        )}
                      </div>
                      <Link
                        to="/produits/$productId"
                        params={{ productId: p.id }}
                        className="inline-flex items-center gap-1 text-sm font-semibold text-red-brand hover:gap-2 transition-all"
                      >
                        Voir fiche <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-background py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <div className="relative overflow-hidden rounded-2xl bg-navy px-8 py-12 lg:p-14">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-red-brand/20 blur-3xl" />
            <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-navy-light/40 blur-3xl" />

            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-heading text-3xl lg:text-5xl text-primary-foreground leading-tight">
                  Vous êtes professionnel ?
                </h3>
                <p className="mt-4 text-primary-foreground/70 max-w-lg">
                  Demandez notre catalogue complet avec tarifs revendeurs et conditions spéciales
                  pour les hôtels, restaurants et collectivités.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                {catalogueUrl ? (
                  <a
                    href={`${catalogueUrl}?download=`}
                    download="Catalogue_TITANIC.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-red-brand px-6 py-3 text-sm font-semibold text-red-brand-foreground hover:opacity-90 transition-opacity"
                  >
                    <Download size={16} /> Catalogue PDF
                  </a>
                ) : (
                  <div className="inline-flex items-center justify-center gap-2 rounded-md bg-red-brand/50 px-6 py-3 text-sm font-semibold text-red-brand-foreground cursor-not-allowed">
                    <Download size={16} /> Catalogue Bientôt
                  </div>
                )}
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-md border-2 border-white/30 px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-white/10 transition-colors"
                >
                  Demander un devis
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
