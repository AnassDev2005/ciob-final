import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  ArrowLeft,
  Check,
  Download,
  Package,
  Shield,
  Star,
  Truck,
  Loader2,
  ChevronRight,
  Info,
  ChefHat,
  Zap,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageSlider } from "@/components/ImageSlider";
import { PaginationComponent } from "@/components/PaginationComponent";

export const Route = createFileRoute("/produits/$productId")({
  component: ProductDetailPage,
});

type Product = {
  id: string;
  name: string;
  ref: string;
  description: string | null;
  diametre: string | null;
  badge: string | null;
  category_id: string | null;
  image_url: string | null;
  images: string[] | null;
  features: string[] | null;
  category: { name: string; description: string | null } | null;
};

type Recipe = {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
  duration_minutes: number | null;
  servings: number | null;
  category: { name: string } | null;
};

function ProductDetailPage() {
  const { productId } = Route.useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [relatedRecipes, setRelatedRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination for related products
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchProductAndData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*, category:categories(name, description)")
        .eq("id", productId)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        setError("Produit introuvable");
        setLoading(false);
        return;
      }
      
      const productData = data as unknown as Product;
      setProduct(productData);

      // Parallel fetch for related products and recipes
      // Note: we fetch more related products now to allow pagination
      const [relatedProdsRes, recipesRes] = await Promise.all([
        productData.category_id 
          ? supabase
              .from("products")
              .select("*, category:categories(name)")
              .eq("category_id", productData.category_id)
              .neq("id", productId)
          : Promise.resolve({ data: [] }),
        supabase
          .from("recipes")
          .select("*, category:categories(name)")
          .eq("product_ref", productData.ref)
          .limit(3)
      ]);

      if (relatedProdsRes.data) {
        setRelatedProducts(relatedProdsRes.data as unknown as Product[]);
      }
      
      if (recipesRes.data) {
        setRelatedRecipes(recipesRes.data as unknown as Recipe[]);
      }
      
      setLoading(false);
    };

    fetchProductAndData();
  }, [productId]);

  const totalPages = Math.ceil(relatedProducts.length / itemsPerPage);
  const paginatedRelated = relatedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="animate-spin text-navy mb-4" size={48} />
          <p className="text-muted-foreground animate-pulse">Chargement du produit...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-32 text-center">
          <Info className="mx-auto text-muted-foreground mb-4" size={64} />
          <h1 className="text-3xl font-heading text-navy">Oups !</h1>
          <p className="mt-2 text-muted-foreground">{error || "Produit introuvable"}</p>
          <Button asChild className="mt-8 bg-navy hover:bg-navy/90">
            <Link to="/produits">Retour au catalogue</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

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
            <Link to="/produits" className="text-muted-foreground hover:text-navy transition-colors">
              Nos produits
            </Link>
            <ChevronRight size={12} className="text-muted-foreground" />
            <span className="text-navy font-semibold">{product.name}</span>
          </nav>
        </div>
      </div>

      <section className="py-12 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Product Images */}
            <div>
              <ImageSlider
                images={product.images || (product.image_url ? [product.image_url] : [])}
                alt={product.name}
                badge={product.badge}
                fallbackIcon="product"
              />
              
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { icon: ShieldCheck, label: "Garantie 10 ans", sub: "Haute Durabilité" },
                  { icon: Star, label: "Qualité Premium", sub: "Aluminium Pur" },
                  { icon: Truck, label: "Livraison", sub: "Partout au Maroc" },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center p-4 rounded-2xl border border-border bg-card text-center shadow-sm">
                    <item.icon size={24} className="text-red-brand mb-2" />
                    <span className="text-[10px] uppercase tracking-widest font-black text-navy">{item.label}</span>
                    <span className="text-[9px] text-muted-foreground mt-1 uppercase font-medium">{item.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="flex flex-col lg:pl-10">
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="outline" className="border-navy/20 text-navy font-semibold uppercase tracking-widest text-[10px] px-3 py-1 bg-navy/5">
                  {product.category?.name || "Ustensile"}
                </Badge>
                {product.badge && (
                  <Badge className="bg-red-brand text-white border-none text-[10px] uppercase tracking-wider font-bold">
                    {product.badge}
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-heading text-navy leading-tight tracking-tight">
                {product.name}
              </h1>
              
              <div className="mt-4 flex items-center gap-4">
                <p className="text-red-brand font-bold tracking-widest text-sm uppercase">
                  Réf: {product.ref}
                </p>
                {product.diametre && (
                  <>
                    <div className="h-4 w-px bg-border" />
                    <p className="text-navy/60 font-medium text-sm flex items-center gap-2">
                      <Package size={16} className="text-red-brand" />
                      {product.diametre}
                    </p>
                  </>
                )}
              </div>

              <div className="mt-10 prose prose-slate max-w-none border-l-4 border-red-brand/20 pl-6 py-2">
                <p className="text-xl text-muted-foreground leading-relaxed italic">
                  {product.description || "L'excellence culinaire au service de votre cuisine."}
                </p>
              </div>

              {product.features && product.features.length > 0 && (
                <div className="mt-12 bg-surface/50 rounded-3xl p-8 border border-border/50 shadow-inner">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-black text-navy/40 mb-8 flex items-center gap-3">
                    <Zap size={16} className="text-red-brand fill-red-brand" /> Points Forts & Caractéristiques
                  </h3>
                  <ul className="grid sm:grid-cols-2 gap-y-8 gap-x-10">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-4">
                        <div className="mt-0.5 rounded-xl bg-white border border-red-brand/10 text-red-brand p-2 shadow-sm">
                          <Check size={14} strokeWidth={4} />
                        </div>
                        <span className="text-navy/80 text-sm font-bold leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-12 flex flex-col sm:flex-row gap-6 items-center">
                <Button size="lg" asChild className="w-full sm:w-auto bg-navy hover:bg-navy/90 text-white px-12 h-16 text-lg font-bold rounded-2xl shadow-xl shadow-navy/20 transition-all hover:-translate-y-1">
                  <Link to="/contact" search={{ ref: product.ref, type: "product" }}>
                    Demander un devis
                  </Link>
                </Button>
                <button className="flex items-center gap-4 text-navy font-black text-xs uppercase tracking-widest hover:text-red-brand transition-colors group">
                  <div className="w-14 h-14 rounded-2xl border border-navy/10 flex items-center justify-center group-hover:border-red-brand/20 group-hover:bg-red-brand/5 transition-all">
                    <Download size={24} />
                  </div>
                  Fiche Technique (PDF)
                </button>
              </div>

              <div className="mt-12 p-8 rounded-3xl bg-navy text-white relative overflow-hidden group shadow-2xl shadow-navy/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150" />
                <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-black mb-4">Engagement Titanic</p>
                <p className="text-lg text-white/90 italic leading-relaxed relative z-10 font-serif">
                  "Tous nos produits sont conçus pour durer. Nous utilisons un aluminium de haute pureté et des revêtements certifiés sans PFOA pour une cuisine saine et savoureuse."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Recipes */}
      {relatedRecipes.length > 0 && (
        <section className="py-20 bg-background border-t border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-heading text-navy">Recettes avec ce produit</h2>
              <div className="h-1 w-20 bg-red-brand mx-auto mt-4" />
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedRecipes.map((r) => (
                <Link
                  key={r.id}
                  to="/recettes/$recipeSlug"
                  params={{ recipeSlug: r.slug }}
                  className="group bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="aspect-video relative overflow-hidden">
                    {r.image_url ? (
                      <img
                        src={r.image_url}
                        alt={r.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-navy/10 flex items-center justify-center">
                        <ChefHat size={48} className="text-navy/20" />
                      </div>
                    )}
                    <Badge className="absolute top-4 left-4 bg-red-brand/90 text-white border-none">
                      {r.category?.name || "Recette"}
                    </Badge>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-heading text-navy group-hover:text-red-brand transition-colors">
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <Button asChild variant="outline" className="border-navy text-navy hover:bg-navy hover:text-white">
                <Link to="/recettes">Voir toutes nos recettes</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Suggested Products */}
      <section className="py-20 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading text-navy">Dans la même collection</h2>
            <div className="h-1 w-20 bg-red-brand mx-auto mt-4" />
          </div>

          {relatedProducts.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedRelated.map((p) => (
                  <Link
                    key={p.id}
                    to="/produits/$productId"
                    params={{ productId: p.id }}
                    className="group bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="aspect-square bg-surface flex items-center justify-center p-6 overflow-hidden">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="h-32 w-auto object-contain transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <Package size={48} className="text-muted-foreground opacity-20" />
                      )}
                    </div>
                    <div className="p-4 border-t border-border">
                      <h3 className="font-semibold text-navy text-sm line-clamp-1 group-hover:text-red-brand transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">
                        Réf: {p.ref}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              
              <PaginationComponent 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="text-center text-muted-foreground italic">
              Plus de produits arrivent bientôt dans cette section.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
