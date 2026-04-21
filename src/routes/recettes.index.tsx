import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChefHat, Clock, Flame, Sparkles, Users, Utensils, Loader2, ZoomIn, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const recipeSearchSchema = z.object({
  category: z.string().optional(),
});

export const Route = createFileRoute("/recettes/")({
  validateSearch: (search) => recipeSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Recettes — TITANIC" },
      {
        name: "description",
        content:
          "Découvrez nos meilleures recettes marocaines à réaliser avec les ustensiles TITANIC. Tagines, couscous, harira et plus.",
      },
      { property: "og:title", content: "Recettes — TITANIC" },
      {
        property: "og:description",
        content:
          "Tagines, couscous, harira : sublimez votre cuisine with nos recettes traditionnelles and nos ustensiles d'exception.",
      },
    ],
  }),
  component: RecettesPage,
});

type Recipe = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  duration_minutes: number | null;
  servings: number | null;
  product_ref: string | null;
  category: { name: string } | null;
};

function RecettesPage() {
  const { category } = Route.useSearch();
  const [active, setActive] = useState(category || "Tout");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<string[]>(["Tout"]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category) {
      setActive(category);
    }
  }, [category]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("recipes")
        .select("*, category:categories(name)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching recipes:", error);
      } else {
        const fetchedRecipes = data as unknown as Recipe[];
        setRecipes(fetchedRecipes);

        const cats = new Set<string>();
        cats.add("Tout");
        fetchedRecipes.forEach((r) => {
          if (r.category?.name) cats.add(r.category.name);
        });
        setCategories(Array.from(cats));
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const filtered = active === "Tout" ? recipes : recipes.filter((r) => r.category?.name === active);

  const featuredRecipe = recipes.length > 0 ? recipes[0] : null;

  const getLevel = (duration: number | null) => {
    if (!duration) return "Facile";
    if (duration < 45) return "Facile";
    if (duration < 90) return "Intermédiaire";
    return "Avancé";
  };

  const formatTime = (minutes: number | null) => {
    if (!minutes) return "—";
    if (minutes < 60) return `${minutes}min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h${m}` : `${h}h`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-primary-foreground">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: featuredRecipe?.image_url
              ? `url(${featuredRecipe.image_url})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/95 to-navy/50" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-16 lg:py-24">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary-foreground/60">
            <Link to="/" className="hover:text-primary-foreground transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-primary-foreground">Recettes</span>
          </nav>

          <div className="mt-6 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded bg-red-brand px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <ChefHat size={14} /> Cuisine marocaine
            </span>
            <h1 className="font-heading mt-4 text-4xl sm:text-5xl lg:text-6xl leading-[0.95]">
              Saveurs <span className="text-red-brand">authentiques</span>
            </h1>
            <p className="mt-5 text-base text-primary-foreground/70 leading-relaxed max-w-2xl">
              De la tagine mijotée à la harira parfumée, redécouvrez les classiques de la table
              marocaine, sublimés par les ustensiles TITANIC.
            </p>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="sticky top-[60px] z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-4 flex items-center gap-2 overflow-x-auto">
          <Utensils size={16} className="text-navy shrink-0" />
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active === c
                  ? "bg-navy text-primary-foreground"
                  : "bg-card border border-border text-foreground hover:bg-navy/5"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Featured recipe */}
      {featuredRecipe && active === "Tout" && (
        <section className="bg-surface py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-10 items-center bg-card rounded-2xl overflow-hidden border border-border shadow-lg">
              <div className="relative h-72 lg:h-full min-h-[400px]">
                {featuredRecipe.image_url ? (
                  <img
                    src={featuredRecipe.image_url}
                    alt={featuredRecipe.title}
                    loading="lazy"
                    width={800}
                    height={800}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-navy/10 flex items-center justify-center">
                    <ChefHat size={80} className="text-navy opacity-10" />
                  </div>
                )}
                <span className="absolute top-4 left-4 bg-red-brand text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                  Recette à la une
                </span>
              </div>
              <div className="p-8 lg:p-12">
                <p className="text-xs uppercase tracking-wider text-red-brand font-semibold">
                  {featuredRecipe.category?.name || "Tradition"}
                </p>
                <h2 className="mt-2 font-heading text-3xl lg:text-5xl text-navy leading-tight">
                  {featuredRecipe.title}
                </h2>
                <p className="mt-4 text-foreground/80 leading-relaxed">
                  {featuredRecipe.description}
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { icon: Clock, v: formatTime(featuredRecipe.duration_minutes), l: "Temps" },
                    { icon: Users, v: `${featuredRecipe.servings || "—"} pers.`, l: "Convives" },
                    { icon: Flame, v: getLevel(featuredRecipe.duration_minutes), l: "Niveau" },
                  ].map((item) => (
                    <div key={item.l} className="rounded-lg border border-border p-3 text-center">
                      <item.icon size={18} className="mx-auto text-navy" />
                      <p className="mt-1 font-semibold text-sm text-foreground">{item.v}</p>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {item.l}
                      </p>
                    </div>
                  ))}
                </div>

                <Link
                  to="/recettes/$recipeSlug"
                  params={{ recipeSlug: featuredRecipe.slug }}
                  className="mt-7 inline-flex items-center justify-center rounded-md bg-red-brand px-6 py-3 text-sm font-semibold text-red-brand-foreground hover:opacity-90 transition-opacity"
                >
                  Voir la recette complète
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-heading text-3xl lg:text-4xl text-navy">
                {active === "Tout" ? "Toutes nos recettes" : active}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {loading
                  ? "Chargement..."
                  : `${filtered.length} recette${filtered.length > 1 ? "s" : ""} à découvrir`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-navy" size={40} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <p className="font-heading text-2xl text-navy">Aucune recette trouvée</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Revenez bientôt pour de nouvelles saveurs.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((r) => (
                <article
                  key={r.id}
                  className="group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="relative h-56 overflow-hidden cursor-zoom-in">
                        {r.image_url ? (
                          <img
                            src={r.image_url}
                            alt={r.title}
                            loading="lazy"
                            width={800}
                            height={800}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-navy/5 flex items-center justify-center">
                            <ChefHat size={48} className="text-navy opacity-10" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="bg-white/90 p-2 rounded-full text-navy shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            <ZoomIn size={20} />
                          </div>
                        </div>
                        <span className="absolute bottom-3 right-3 bg-white/95 text-navy text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded">
                          {r.category?.name || "Tradition"}
                        </span>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/90 border-none flex items-center justify-center overflow-hidden">
                      <VisuallyHidden>
                        <DialogTitle>{r.title}</DialogTitle>
                      </VisuallyHidden>
                      <img
                        src={r.image_url || ""}
                        alt={r.title}
                        className="max-w-full max-h-[90vh] object-contain"
                      />
                    </DialogContent>
                  </Dialog>

                  <div className="p-5">
                    <h3 className="font-semibold text-foreground text-lg leading-snug">
                      {r.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {r.description}
                    </p>

                    <div className="mt-4 flex items-center gap-4 text-xs text-foreground/80">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={13} className="text-navy" /> {formatTime(r.duration_minutes)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users size={13} className="text-navy" /> {r.servings || "—"} pers.
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Flame size={13} className="text-navy" /> {getLevel(r.duration_minutes)}
                      </span>
                    </div>

                    <div className="mt-4 border-t border-border pt-3 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        <span className="font-semibold text-navy">Outil :</span>{" "}
                        {r.product_ref || "TITANIC"}
                      </span>
                      <Link
                        to="/recettes/$recipeSlug"
                        params={{ recipeSlug: r.slug }}
                        className="text-sm font-semibold text-red-brand hover:underline"
                      >
                        Lire →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <div className="relative overflow-hidden rounded-2xl bg-navy px-8 py-12 lg:p-14">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-red-brand/20 blur-3xl" />
            <div className="relative grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded bg-red-brand px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  <Sparkles size={14} /> Newsletter
                </span>
                <h3 className="mt-4 font-heading text-2xl lg:text-3xl text-primary-foreground leading-tight">
                  Recevez nos recettes chaque semaine
                </h3>
                <p className="mt-4 text-primary-foreground/70 max-w-lg">
                  Inspirations culinaires, astuces de chef et offres exclusives sur nos ustensiles,
                  directement dans votre boîte mail.
                </p>
              </div>
              <form className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                <input
                  type="email"
                  placeholder="votre@email.com"
                  className="flex-1 rounded-md bg-white/10 border border-white/20 px-4 py-3 text-sm text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-red-brand"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-red-brand px-6 py-3 text-sm font-semibold text-red-brand-foreground hover:opacity-90 transition-opacity"
                >
                  S'inscrire
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
