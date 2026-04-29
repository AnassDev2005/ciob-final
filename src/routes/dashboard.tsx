import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  LayoutDashboard,
  Package,
  ChefHat,
  Tags,
  Users,
  LogOut,
  Loader2,
  ExternalLink,
  Mail,
  Settings,
  User as UserIcon,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Tableau de bord — TITANIC Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardLayout,
});

const navItems: ReadonlyArray<{
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}> = [
  { to: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/hero", label: "Hero", icon: ExternalLink },
  { to: "/dashboard/products", label: "Produits", icon: Package },
  { to: "/dashboard/recipes", label: "Recettes", icon: ChefHat },
  { to: "/dashboard/categories", label: "Catégories", icon: Tags },
  { to: "/dashboard/contacts", label: "Messages", icon: Mail },
  { to: "/dashboard/users", label: "Utilisateurs", icon: Users },
  { to: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

function DashboardLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" });
    }

    if (user) {
      fetchProfile();
    }

    const handleProfileUpdate = () => {
      if (user) fetchProfile();
    };

    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, [loading, user, navigate]);

  async function fetchProfile() {
    if (!user?.id) return;
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();
    if (data) setProfile(data);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-card rounded-xl border border-border p-8 shadow">
          <h1 className="font-heading text-3xl text-navy">Accès refusé</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Votre compte n'a pas les droits administrateur. Contactez un administrateur pour obtenir
            l'accès.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Link to="/" className="px-4 py-2 rounded-md border border-border text-sm">
              Accueil
            </Link>
            <button
              onClick={signOut}
              className="px-4 py-2 rounded-md bg-red-brand text-red-brand-foreground text-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">
      <aside className="lg:w-64 bg-navy text-white lg:min-h-screen lg:sticky lg:top-0">
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="font-heading text-3xl tracking-wider">
            TITANIC
          </Link>
          <div className="text-xs text-white/60 uppercase tracking-wider mt-1">Admin</div>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to as "/dashboard"}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 mt-auto border-t border-white/10 lg:absolute lg:bottom-0 lg:w-64">
          <div className="text-xs text-white/50 mb-2">Connecté en tant que</div>
          <Link 
            to="/profile" 
            className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition-colors group mb-3"
          >
            <Avatar className="h-8 w-8 border border-white/20">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-white/10 text-white">
                <UserIcon size={16} />
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {profile?.display_name || user.email?.split("@")[0]}
              </p>
              <p className="text-[10px] text-white/50 truncate flex items-center gap-1">
                Mon Profil <ExternalLink size={8} />
              </p>
            </div>
          </Link>

          <a
            href="/"
            className="flex items-center gap-2 text-xs text-white/70 hover:text-white mb-3 px-2"
          >
            <ExternalLink size={12} /> Voir le site
          </a>
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-red-brand text-red-brand-foreground px-3 py-2 text-sm font-medium hover:bg-red-brand/90 transition-colors"
          >
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-8 lg:p-12">
        <Outlet />
      </main>
    </div>
  );
}
