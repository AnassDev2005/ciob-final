import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  User, 
  Shield, 
  ShieldOff, 
  Search, 
  Loader2, 
  Calendar,
  Mail,
  MoreVertical
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaginationComponent } from "@/components/PaginationComponent";

export const Route = createFileRoute("/dashboard/users")({
  component: UsersAdmin,
});

type AdminUser = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  joined_at: string | null;
};

function UsersAdmin() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("joined_at", { ascending: false });
    
    if (error) toast.error(error.message);
    else setItems((data || []) as AdminUser[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleAdmin = async (userId: string) => {
    try {
      const { error } = await supabase.rpc("toggle_admin_role", {
        target_user_id: userId
      });
      
      if (error) throw error;
      
      toast.success("Rôle mis à jour");
      load();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour");
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const nameMatch = item.display_name?.toLowerCase().includes(search.toLowerCase());
      const emailMatch = item.email?.toLowerCase().includes(search.toLowerCase());
      return nameMatch || emailMatch;
    });
  }, [items, search]);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl text-navy">Utilisateurs</h1>
          <p className="mt-1 text-muted-foreground">Gérez les accès et les rôles</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-input bg-card pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-navy" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <User className="mx-auto mb-3 opacity-40" size={32} />
            Aucun utilisateur trouvé.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Utilisateur</th>
                    <th className="px-4 py-3">Rôle</th>
                    <th className="px-4 py-3">Date d'inscription</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-surface/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            <AvatarImage src={item.avatar_url || ""} />
                            <AvatarFallback className="bg-navy/5 text-navy font-bold">
                              {item.display_name?.[0] || item.email?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-navy">{item.display_name || "Sans nom"}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Mail size={10} />
                              {item.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.is_admin ? 'bg-navy text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {item.is_admin ? <Shield size={10} /> : null}
                          {item.is_admin ? 'Admin' : 'Utilisateur'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {item.joined_at ? new Date(item.joined_at).toLocaleDateString('fr-FR') : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => toggleAdmin(item.id)}
                              className="text-xs font-medium cursor-pointer"
                            >
                              {item.is_admin ? (
                                <span className="flex items-center gap-2 text-red-500">
                                  <ShieldOff size={14} /> Retirer l'accès Admin
                                </span>
                              ) : (
                                <span className="flex items-center gap-2 text-navy">
                                  <Shield size={14} /> Donner l'accès Admin
                                </span>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-border bg-surface/30">
              <PaginationComponent 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
