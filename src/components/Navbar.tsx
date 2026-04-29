import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, LogIn, LayoutDashboard, LogOut, User as UserIcon, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import titanicLogo from "@/assets/Logo/titanic.png";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navLinks = [
  { label: "Accueil", to: "/" },
  { label: "L'entreprise", to: "/entreprise" },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { categories: productCategories } = useCategories("product");
  const { categories: recipeCategories } = useCategories("recipe");
  const [profile, setProfile] = useState<{ display_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }

    const handleProfileUpdate = () => {
      if (user) fetchProfile();
    };

    window.addEventListener("profile-updated", handleProfileUpdate);
    return () => window.removeEventListener("profile-updated", handleProfileUpdate);
  }, [user]);

  async function fetchProfile() {
    if (!user?.id) return;
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();
    if (data) setProfile(data);
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border print:hidden">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3 lg:px-8">
        <Link to="/" className="flex items-center">
          <img src={titanicLogo} alt="Titanic" className="h-12 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.label}>
                  <Link
                    to={link.to}
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground/80 hover:text-navy transition-colors"
                  >
                    {link.label}
                  </Link>
                </NavigationMenuItem>
              ))}

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-transparent data-[state=open]:bg-transparent text-foreground/80 hover:text-navy font-medium text-sm">
                  Nos produits
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li className="md:col-span-2">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/produits"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-navy/50 to-navy p-6 no-underline outline-none focus:shadow-md"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium text-white">
                            Tous nos produits
                          </div>
                          <p className="text-sm leading-tight text-white/80">
                            Découvrez l'intégralité de notre catalogue d'ustensiles de cuisine.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    {productCategories.map((category) => (
                      <li key={category.id}>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/produits"
                            search={{ category: category.name }}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{category.name}</div>
                            {category.description && (
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {category.description}
                              </p>
                            )}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent hover:bg-transparent data-[state=open]:bg-transparent text-foreground/80 hover:text-navy font-medium text-sm">
                  Recettes
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li className="md:col-span-2">
                      <NavigationMenuLink asChild>
                        <Link
                          to="/recettes"
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-red-brand/50 to-red-brand p-6 no-underline outline-none focus:shadow-md"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium text-white">
                            Toutes nos recettes
                          </div>
                          <p className="text-sm leading-tight text-white/80">
                            Inspirez-vous avec nos délicieuses recettes traditionnelles.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    {recipeCategories.map((category) => (
                      <li key={category.id}>
                        <NavigationMenuLink asChild>
                          <Link
                            to="/recettes"
                            search={{ category: category.name }}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{category.name}</div>
                            {category.description && (
                              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                {category.description}
                              </p>
                            )}
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link
                  to="/contact"
                  className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-foreground/80 hover:text-navy transition-colors"
                >
                  Contact
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/contact"
            className="hidden lg:inline-flex items-center justify-center rounded-md bg-red-brand px-5 py-2.5 text-sm font-semibold text-red-brand-foreground hover:opacity-90 transition-opacity"
          >
            Demander un devis
          </Link>
          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 outline-none">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={profile?.avatar_url || ""} />
                      <AvatarFallback className="bg-navy/5 text-navy">
                        <UserIcon size={16} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-semibold text-foreground leading-none">
                        {profile?.display_name || user.email?.split("@")[0]}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                      <UserIcon size={16} /> Profil
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                        <LayoutDashboard size={16} /> Tableau de bord
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="flex items-center gap-2 cursor-pointer text-red-brand focus:text-red-brand"
                  >
                    <LogOut size={16} /> Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link
              to="/auth"
              className="hidden md:inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-navy transition-colors"
            >
              <LogIn size={16} /> Connexion
            </Link>
          )}
          

          <button
            className="md:hidden text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4">
          <Link
            to="/"
            className="block py-2 text-sm font-medium text-foreground/80"
            onClick={() => setOpen(false)}
          >
            Accueil
          </Link>
          <Link
            to="/entreprise"
            className="block py-2 text-sm font-medium text-foreground/80"
            onClick={() => setOpen(false)}
          >
            L'entreprise
          </Link>
          
          <div className="py-2">
            <p className="text-sm font-semibold text-navy mb-1 uppercase tracking-wider text-[10px]">Produits</p>
            <Link
              to="/produits"
              className="block py-1.5 text-sm font-medium text-foreground/80 ml-2"
              onClick={() => setOpen(false)}
            >
              Tous les produits
            </Link>
            {productCategories.map(cat => (
              <Link
                key={cat.id}
                to="/produits"
                search={{ category: cat.name }}
                className="block py-1.5 text-sm text-muted-foreground ml-4"
                onClick={() => setOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="py-2">
            <p className="text-sm font-semibold text-navy mb-1 uppercase tracking-wider text-[10px]">Recettes</p>
            <Link
              to="/recettes"
              className="block py-1.5 text-sm font-medium text-foreground/80 ml-2"
              onClick={() => setOpen(false)}
            >
              Toutes les recettes
            </Link>
            {recipeCategories.map(cat => (
              <Link
                key={cat.id}
                to="/recettes"
                search={{ category: cat.name }}
                className="block py-1.5 text-sm text-muted-foreground ml-4"
                onClick={() => setOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <Link
            to="/contact"
            className="block py-2 text-sm font-medium text-foreground/80"
            onClick={() => setOpen(false)}
          >
            Contact
          </Link>
          
          {user ? (
            <div className="mt-2 space-y-2">
              {isAdmin && (
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block w-full rounded-md bg-navy px-5 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Tableau de bord
                </Link>
              )}
              <button
                onClick={() => {
                  signOut();
                  setOpen(false);
                }}
                className="flex items-center gap-2 w-full py-2 text-sm font-medium text-foreground/80 hover:text-red-brand transition-colors"
              >
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              onClick={() => setOpen(false)}
              className="mt-2 block py-2 text-sm font-medium text-foreground/80"
            >
              Connexion
            </Link>
          )}

          <Link
            to="/contact"
            className="mt-2 block w-full rounded-md bg-red-brand px-5 py-2.5 text-center text-sm font-semibold text-red-brand-foreground"
          >
            Demander un devis
          </Link>
        </div>
      )}
    </header>
  );
}
