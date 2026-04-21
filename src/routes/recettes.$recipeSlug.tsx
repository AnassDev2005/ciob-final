import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChefHat,
  Clock,
  Flame,
  Users,
  Loader2,
  ChevronRight,
  Info,
  UtensilsCrossed,
  ArrowRight,
  Printer,
  Share2,
  Package,
  CheckCircle2,
  Clock3,
  Users2,
  Zap,
  Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageSlider } from "@/components/ImageSlider";

export const Route = createFileRoute("/recettes/$recipeSlug")({
  component: RecipeDetailPage,
});

type Recipe = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  image_url: string | null;
  images: string[] | null;
  duration_minutes: number | null;
  servings: number | null;
  product_ref: string | null;
  ingredients: string[] | null;
  steps: string[] | null;
  category: { name: string } | null;
  product: { id: string; name: string; image_url: string | null; ref: string } | null;
};

function RecipeDetailPage() {
  const { recipeSlug } = Route.useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [relatedRecipes, setRelatedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipeAndRelated = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("recipes")
        .select("*, category:categories(name), product:products!recipes_product_ref_fkey(id, name, image_url, ref)")
        .eq("slug", recipeSlug)
        .single();

      if (error) {
        console.error("Error fetching recipe:", error);
        setError("Recette introuvable");
        setLoading(false);
        return;
      }

      const recipeData = data as unknown as Recipe;
      setRecipe(recipeData);

      // Fetch related recipes
      if (recipeData.category_id) {
        const { data: related } = await supabase
          .from("recipes")
          .select("*, category:categories(name)")
          .eq("category_id", recipeData.category_id)
          .neq("id", recipeData.id)
          .limit(3);

        if (related) {
          setRelatedRecipes(related as unknown as Recipe[]);
        }
      }

      setLoading(false);
    };

    fetchRecipeAndRelated();
  }, [recipeSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-navy mb-4" size={48} />
          <p className="text-muted-foreground animate-pulse">Chargement de la recette...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-32 text-center">
          <Info className="mx-auto text-muted-foreground mb-4" size={64} />
          <h1 className="text-3xl font-heading text-navy">Oups !</h1>
          <p className="mt-2 text-muted-foreground">{error || "Recette introuvable"}</p>
          <Button asChild className="mt-8 bg-navy hover:bg-navy/90">
            <Link to="/recettes">Retour aux recettes</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

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

      {/* Breadcrumbs */}
      <div className="bg-surface border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-4">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider">
            <Link to="/" className="text-muted-foreground hover:text-navy transition-colors">
              Accueil
            </Link>
            <ChevronRight size={12} className="text-muted-foreground" />
            <Link to="/recettes" className="text-muted-foreground hover:text-navy transition-colors">
              Recettes
            </Link>
            <ChevronRight size={12} className="text-muted-foreground" />
            <span className="text-navy font-semibold">{recipe.title}</span>
          </nav>
        </div>
      </div>

      <article>
        {/* Header Section */}
        <section className="bg-navy py-12 lg:py-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-brand/10 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full -ml-32 -mb-32 blur-2xl" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <Badge className="mb-6 bg-red-brand text-white border-none px-4 py-1 text-[10px] uppercase tracking-widest font-black">
                  {recipe.category?.name || "Tradition"}
                </Badge>
                <h1 className="text-4xl lg:text-7xl font-heading text-white leading-[0.95] tracking-tight">
                  {recipe.title}
                </h1>
                
                <div className="mt-10 flex flex-wrap gap-8 text-white/90">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm">
                      <Clock3 size={20} className="text-red-brand" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-50">Préparation</p>
                      <p className="font-bold text-lg">{formatTime(recipe.duration_minutes)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm">
                      <Users2 size={20} className="text-red-brand" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-50">Convives</p>
                      <p className="font-bold text-lg">{recipe.servings || "—"} personnes</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm">
                      <Flame size={20} className="text-red-brand" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] font-black opacity-50">Niveau</p>
                      <p className="font-bold text-lg">{getLevel(recipe.duration_minutes)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="order-1 lg:order-2">
                <ImageSlider
                  images={recipe.images || (recipe.image_url ? [recipe.image_url] : [])}
                  alt={recipe.title}
                  fallbackIcon="recipe"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-24 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
              
              {/* Left Column: Ingredients & Tools */}
              <div className="lg:col-span-4">
                <div className="sticky top-24 space-y-10">
                  {/* Ingredients */}
                  <div className="rounded-3xl border border-border bg-card p-10 shadow-2xl shadow-navy/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-brand/5 rounded-full -mr-16 -mt-16" />
                    
                    <h3 className="flex items-center gap-4 text-2xl font-heading text-navy mb-8 relative z-10">
                      <UtensilsCrossed size={24} className="text-red-brand" />
                      Ingrédients
                    </h3>
                    <ul className="space-y-5 relative z-10">
                      {recipe.ingredients?.map((ingredient, idx) => (
                        <li key={idx} className="flex items-center gap-4 group cursor-pointer">
                          <div className="w-6 h-6 rounded-lg border-2 border-red-brand/20 flex items-center justify-center group-hover:border-red-brand transition-all bg-white">
                            <div className="w-3 h-3 rounded bg-red-brand scale-0 group-hover:scale-100 transition-transform" />
                          </div>
                          <span className="text-navy/70 text-base font-medium leading-relaxed group-hover:text-navy transition-colors">{ingredient}</span>
                        </li>
                      )) || <li className="text-muted-foreground italic">Liste indisponible</li>}
                    </ul>
                  </div>

                  {/* Tool info */}
                  {recipe.product && (
                    <div className="rounded-3xl bg-navy p-10 text-primary-foreground shadow-2xl shadow-navy/20 relative overflow-hidden group">
                      <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mb-24 transition-transform duration-1000 group-hover:scale-150" />
                      
                      <p className="text-[10px] uppercase tracking-[0.3em] font-black text-red-brand mb-8">L'ustensile idéal</p>
                      
                      <div className="flex items-center gap-5 mb-10 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-md relative z-10">
                        <div className="w-20 h-20 rounded-xl bg-white p-3 shrink-0 flex items-center justify-center shadow-2xl">
                          {recipe.product.image_url ? (
                            <img
                              src={recipe.product.image_url}
                              alt={recipe.product.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          ) : (
                            <Package size={32} className="text-navy opacity-20" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-lg font-bold leading-tight tracking-tight">{recipe.product.name}</h4>
                          <p className="text-[10px] text-white/40 font-mono mt-1 uppercase tracking-widest">Réf: {recipe.product.ref}</p>
                        </div>
                      </div>

                      <p className="text-sm text-primary-foreground/60 mb-10 leading-relaxed italic relative z-10">
                        "Une conception robuste pour une cuisson homogène et des saveurs préservées."
                      </p>
                      
                      <Link
                        to="/produits/$productId"
                        params={{ productId: recipe.product.id }}
                        className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl bg-red-brand text-white font-black text-xs uppercase tracking-widest hover:bg-white hover:text-navy transition-all shadow-xl shadow-red-brand/20 relative z-10"
                      >
                        Découvrir le produit <ArrowRight size={18} />
                      </Link>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl border-border gap-2 font-bold text-navy hover:bg-navy hover:text-white transition-all">
                      <Printer size={18} /> Imprimer
                    </Button>
                    <Button variant="outline" className="flex-1 h-14 rounded-2xl border-border gap-2 font-bold text-navy hover:bg-navy hover:text-white transition-all">
                      <Share2 size={18} /> Partager
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right Column: Steps */}
              <div className="lg:col-span-8">
                <div className="prose prose-slate max-w-none mb-20">
                  <h2 className="text-3xl font-heading text-navy flex items-center gap-4 mb-8">
                    <Info size={28} className="text-red-brand" />
                    À propos de ce plat
                  </h2>
                  <p className="text-2xl text-muted-foreground leading-relaxed italic border-l-8 border-red-brand/10 pl-10 font-serif">
                    {recipe.description || "Une recette traditionnelle revisitée pour une expérience culinaire exceptionnelle."}
                  </p>
                </div>

                <div className="space-y-16">
                  <h2 className="text-4xl font-heading text-navy flex items-center gap-5 mb-12">
                    <div className="w-16 h-16 rounded-3xl bg-red-brand flex items-center justify-center text-white shadow-2xl shadow-red-brand/40">
                      <ChefHat size={32} />
                    </div>
                    Préparation
                  </h2>
                  
                  <div className="space-y-16">
                    {recipe.steps?.map((step, idx) => (
                      <div key={idx} className="flex gap-10 relative group">
                        <div className="relative shrink-0">
                          <div className="flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-surface border-2 border-navy/5 text-3xl font-heading text-navy shadow-sm group-hover:border-red-brand group-hover:bg-red-brand group-hover:text-white transition-all duration-500 relative z-10">
                            {idx + 1}
                          </div>
                          {idx !== (recipe.steps?.length || 0) - 1 && (
                            <div className="absolute top-20 bottom-[-64px] left-1/2 w-1 bg-gradient-to-b from-navy/5 via-navy/5 to-transparent -translate-x-1/2" />
                          )}
                        </div>
                        <div className="pt-4">
                          <p className="text-navy/80 text-xl leading-relaxed font-medium group-hover:text-navy transition-colors">
                            {step}
                          </p>
                        </div>
                      </div>
                    )) || <p className="text-muted-foreground italic text-lg">Étapes non renseignées</p>}
                  </div>
                </div>

                {/* Chef Tip */}
                <div className="mt-28 p-12 rounded-[3rem] bg-surface border-4 border-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 text-red-brand/10 group-hover:rotate-12 transition-transform duration-500">
                    <Star size={120} fill="currentColor" />
                  </div>
                  
                  <div className="relative z-10">
                    <p className="font-heading text-navy text-2xl mb-6 flex items-center gap-4">
                      <Star size={28} className="text-red-brand fill-red-brand" />
                      L'astuce du Chef Titanic
                    </p>
                    <p className="text-navy/70 italic text-xl leading-relaxed max-w-2xl font-serif">
                      "Pour un résultat optimal, laissez reposer votre plat quelques minutes avant de servir. Les saveurs auront le temps de s'équilibrer parfaitement."
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </article>

      {/* Related Recipes */}
      {relatedRecipes.length > 0 && (
        <section className="py-24 bg-surface border-t border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-brand/20 to-transparent" />
          
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-heading text-navy">Recettes similaires</h2>
              <div className="h-1.5 w-24 bg-red-brand mx-auto mt-6 rounded-full" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {relatedRecipes.map((r) => (
                <Link
                  key={r.id}
                  to="/recettes/$recipeSlug"
                  params={{ recipeSlug: r.slug }}
                  className="group bg-card rounded-[2rem] overflow-hidden border border-border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    {r.image_url ? (
                      <img
                        src={r.image_url}
                        alt={r.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-navy/5 flex items-center justify-center">
                        <ChefHat size={64} className="text-navy/10" />
                      </div>
                    )}
                    <Badge className="absolute top-6 left-6 bg-white/90 backdrop-blur-md text-navy border-none px-4 py-1 text-[10px] uppercase font-black">
                      {r.category?.name || "Recette"}
                    </Badge>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-heading text-navy group-hover:text-red-brand transition-colors leading-tight">
                      {r.title}
                    </h3>
                    <div className="mt-6 flex items-center gap-6 text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-red-brand" />
                        {r.duration_minutes ? `${r.duration_minutes} min` : "—"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-red-brand" />
                        {r.servings || "—"} pers.
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
