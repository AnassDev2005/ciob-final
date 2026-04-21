import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Users, Shield, ShieldAlert, Mail, Calendar, Search, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/dashboard/users")({
  component: UsersAdmin,
});

type UserData = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  joined_at: string | null;
  is_admin: boolean | null;
};

function UsersAdmin() {
  const { user: currentUser } = useAuth();
  const [items, setItems] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  
  // Filters
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_users")
      .select("*")
      .order("joined_at", { ascending: false });
    
    if (error) {
      toast.error(error.message);
    } else {
      setItems(data as UserData[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredItems = items.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch = (item.display_name?.toLowerCase().includes(term) ?? false) ||
      (item.email?.toLowerCase().includes(term) ?? false);
    
    const matchesRole = roleFilter === "all" || 
      (roleFilter === "admin" ? item.is_admin : !item.is_admin);

    return matchesSearch && matchesRole;
  });

  const toggleAdmin = async (targetUserId: string, currentIsAdmin: boolean) => {
    if (targetUserId === currentUser?.id) {
      toast.error("Vous ne pouvez pas retirer vos propres droits administrateur.");
      return;
    }

    const action = currentIsAdmin ? "retirer" : "donner";
    if (!confirm(`Voulez-vous vraiment ${action} les droits administrateur à cet utilisateur ?`)) {
      return;
    }

    setToggling(targetUserId);
    try {
      const { error } = await supabase.rpc("toggle_admin_role", {
        target_user_id: targetUserId,
      });

      if (error) throw error;
      
      toast.success(currentIsAdmin ? "Droits retirés" : "Droits accordés");
      load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      toast.error(msg);
    } finally {
      setToggling(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-4xl text-navy">Utilisateurs</h1>
          <p className="mt-1 text-muted-foreground">{items.length} utilisateur(s) inscrit(s)</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-card pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
        </div>
        <div className="relative w-full sm:w-56">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full rounded-md border border-input bg-card pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 appearance-none"
          >
            <option value="all">Tous les rôles</option>
            <option value="admin">Administrateurs</option>
            <option value="user">Utilisateurs</option>
          </select>
        </div>
      </div>

      <div className="mt-6 bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-navy" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Users className="mx-auto mb-3 opacity-40" size={32} />
            Aucun utilisateur trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">Utilisateur</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Rôle</th>
                  <th className="px-6 py-4 font-semibold">Inscription</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold overflow-hidden">
                          {item.avatar_url ? (
                            <img src={item.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span>{(item.display_name || item.email || "?")[0].toUpperCase()}</span>
                          )}
                        </div>
                        <div className="font-medium text-foreground">
                          {item.display_name || "—"}
                          {item.id === currentUser?.id && (
                            <span className="ml-2 text-[10px] bg-navy/10 text-navy px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Vous
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="opacity-50" />
                        {item.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {item.is_admin ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <Shield size={12} /> Administrateur
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          Utilisateur
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="opacity-50" />
                        {item.joined_at ? new Date(item.joined_at).toLocaleDateString() : "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.id !== currentUser?.id && (
                        <button
                          onClick={() => toggleAdmin(item.id!, !!item.is_admin)}
                          disabled={toggling === item.id}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                            item.is_admin
                              ? "bg-red-brand/10 text-red-brand hover:bg-red-brand/20"
                              : "bg-navy text-white hover:opacity-90"
                          } disabled:opacity-50`}
                        >
                          {toggling === item.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : item.is_admin ? (
                            <>
                              <ShieldAlert size={14} /> Retirer Admin
                            </>
                          ) : (
                            <>
                              <Shield size={14} /> Nommer Admin
                            </>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
