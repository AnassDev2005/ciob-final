import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, ChefHat, Tags, ArrowRight, Mail } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const [counts, setCounts] = useState({ products: 0, recipes: 0, categories: 0, contacts: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("recipes").select("*", { count: "exact", head: true }),
      supabase.from("categories").select("*", { count: "exact", head: true }),
      supabase.from("contacts").select("*", { count: "exact", head: true }).eq("status", "unread"),
    ]).then(([p, r, c, m]) => {
      setCounts({ 
        products: p.count ?? 0, 
        recipes: r.count ?? 0, 
        categories: c.count ?? 0,
        contacts: m.count ?? 0
      });
    });
  }, []);

  const cards = [
    {
      label: "Produits",
      count: counts.products,
      icon: Package,
      to: "/dashboard/products",
      color: "bg-navy",
    },
    {
      label: "Recettes",
      count: counts.recipes,
      icon: ChefHat,
      to: "/dashboard/recipes",
      color: "bg-red-brand",
    },
    {
      label: "Catégories",
      count: counts.categories,
      icon: Tags,
      to: "/dashboard/categories",
      color: "bg-navy-light",
    },
    {
      label: "Messages non lus",
      count: counts.contacts,
      icon: Mail,
      to: "/dashboard/contacts",
      color: "bg-red-600",
    },
  ] as const;

  return (
    <div>
      <h1 className="font-heading text-4xl text-navy">Vue d'ensemble</h1>
      <p className="mt-1 text-muted-foreground">
        Gérez le catalogue, les recettes et les messages clients.
      </p>

      <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.to}
              className="group bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div
                className={`${c.color} w-12 h-12 rounded-lg flex items-center justify-center text-white`}
              >
                <Icon size={24} />
              </div>
              <div className="mt-4 text-3xl font-heading text-navy">{c.count}</div>
              <div className="text-sm text-muted-foreground">{c.label}</div>
              <div className="mt-4 flex items-center gap-1 text-sm font-medium text-red-brand group-hover:gap-2 transition-all">
                Gérer <ArrowRight size={14} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
