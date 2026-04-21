import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Mail, 
  Search, 
  Filter, 
  Loader2, 
  Trash2, 
  Eye, 
  X, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  Building2,
  Phone,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export const Route = createFileRoute("/dashboard/contacts")({
  component: ContactsAdmin,
});

type Contact = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string;
  message: string;
  status: string;
  created_at: string;
};

function ContactsAdmin() {
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Contact | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) toast.error(error.message);
    else setItems(data as Contact[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.full_name.toLowerCase().includes(search.toLowerCase()) || 
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      item.subject.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("contacts")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("Erreur : " + error.message);
    } else {
      setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
      if (selected?.id === id) setSelected({ ...selected, status: newStatus });
      toast.success("Statut mis à jour");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Message supprimé");
    setItems(items.filter(item => item.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const openMessage = async (item: Contact) => {
    setSelected(item);
    if (item.status === "unread") {
      await updateStatus(item.id, "read");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "unread":
        return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-red-200">Non lu</span>;
      case "read":
        return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-200">Lu</span>;
      case "replied":
        return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-green-200">Répondu</span>;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-4xl text-navy">Messages</h1>
          <p className="mt-1 text-muted-foreground">{items.length} message(s) reçu(s)</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom, email, sujet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-card pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
        </div>
        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-md border border-input bg-card pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 appearance-none"
          >
            <option value="all">Tous les messages</option>
            <option value="unread">Non lus</option>
            <option value="read">Lus</option>
            <option value="replied">Répondus</option>
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
            <Mail className="mx-auto mb-3 opacity-40" size={32} />
            Aucun message trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-bold">Statut</th>
                  <th className="px-6 py-4 font-bold">Expéditeur</th>
                  <th className="px-6 py-4 font-bold">Sujet</th>
                  <th className="px-6 py-4 font-bold">Date</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr 
                    key={item.id} 
                    className={`border-b border-border hover:bg-surface/50 transition-colors cursor-pointer ${item.status === 'unread' ? 'font-bold bg-navy/[0.02]' : ''}`}
                    onClick={() => openMessage(item)}
                  >
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-navy">{item.full_name}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">{item.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-[200px] truncate text-muted-foreground">
                      {item.subject}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-normal">
                      {format(new Date(item.created_at), "d MMMM yyyy", { locale: fr })}
                    </td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openMessage(item)}
                          className="p-2 hover:bg-navy/5 rounded-lg text-navy transition-colors"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => remove(item.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-brand transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Message Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-card rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-border flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-navy flex items-center justify-center text-white">
                  <Mail size={24} />
                </div>
                <div>
                  <h2 className="font-heading text-2xl text-navy leading-none">Détails du message</h2>
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusBadge(selected.status)}
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1">
                      <Calendar size={10} /> {format(new Date(selected.created_at), "d MMM yyyy à HH:mm", { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelected(null)}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-surface transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-black text-navy/40">Expéditeur</p>
                  <p className="font-bold text-navy flex items-center gap-2">
                    {selected.full_name}
                  </p>
                  <p className="text-sm text-red-brand">{selected.email}</p>
                </div>
                {selected.company && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-navy/40">Société</p>
                    <p className="font-bold text-navy flex items-center gap-2">
                      <Building2 size={14} className="text-red-brand" /> {selected.company}
                    </p>
                  </div>
                )}
                {selected.phone && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-[0.2em] font-black text-navy/40">Téléphone</p>
                    <p className="font-bold text-navy flex items-center gap-2">
                      <Phone size={14} className="text-red-brand" /> {selected.phone}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-navy/40">Sujet</p>
                <p className="text-lg font-bold text-navy bg-surface p-4 rounded-xl border border-border/50">
                  {selected.subject}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] font-black text-navy/40">Message</p>
                <div className="text-navy/80 bg-surface/30 p-6 rounded-2xl border border-border/50 whitespace-pre-wrap leading-relaxed italic font-serif text-lg">
                  "{selected.message}"
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-border bg-surface/50 flex flex-wrap gap-4 justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(selected.id, "unread")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${selected.status === 'unread' ? 'bg-navy text-white' : 'bg-white border border-border text-navy hover:bg-navy/5'}`}
                >
                  Marquer non lu
                </button>
                <button
                  onClick={() => updateStatus(selected.id, "replied")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${selected.status === 'replied' ? 'bg-green-600 text-white' : 'bg-white border border-border text-green-700 hover:bg-green-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} /> Répondu
                  </div>
                </button>
              </div>
              <button
                onClick={() => remove(selected.id)}
                className="px-6 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-bold uppercase tracking-widest hover:bg-red-brand hover:text-white transition-all border border-red-100"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
