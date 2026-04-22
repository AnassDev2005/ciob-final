import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, Tags } from "lucide-react";
import { z } from "zod";
import { PaginationComponent } from "@/components/PaginationComponent";

export const Route = createFileRoute("/dashboard/categories")({
  component: CategoriesAdmin,
});

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: "product" | "recipe";
};

const schema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(50),
  slug: z.string().trim().min(1, "Slug requis").max(50),
  description: z.string().trim().max(500).optional(),
  type: z.enum(["product", "recipe"]),
});

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  type: "product" as const,
};

function CategoriesAdmin() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("type", { ascending: true })
      .order("name", { ascending: true });
    if (error) toast.error(error.message);
    else setItems(data as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description ?? "",
      type: c.type,
    });
    setOpen(true);
  };

  const save = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Données invalides");
      return;
    }
    setSaving(true);
    const payload = parsed.data;
    const { error } = editing
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Catégorie modifiée" : "Catégorie créée");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette catégorie ?")) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Supprimée");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-4xl text-navy">Catégories</h1>
          <p className="mt-1 text-muted-foreground">Gérez les types de produits et recettes</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-md bg-red-brand px-4 py-2 text-sm font-semibold text-red-brand-foreground hover:opacity-90"
        >
          <Plus size={16} /> Nouvelle catégorie
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-navy" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Tags className="mx-auto mb-3 opacity-40" size={32} />
            Aucune catégorie définie.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ${
                          c.type === 'product' ? 'bg-navy/10 text-navy' : 'bg-red-brand/10 text-red-brand'
                        }`}>
                          {c.type === 'product' ? 'Produit' : 'Recette'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{c.slug}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-2 hover:bg-surface rounded text-navy"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => remove(c.id)}
                            className="p-2 hover:bg-surface rounded text-red-brand"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-card rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl text-navy">
                {editing ? "Modifier la catégorie" : "Nouvelle catégorie"}
              </h2>
              <button onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="product">Produits</option>
                  <option value="recipe">Recettes</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Nom</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Autocuiseurs"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="autocuiseurs"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-md border border-border text-sm"
              >
                Annuler
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 rounded-md bg-red-brand text-red-brand-foreground text-sm font-semibold inline-flex items-center gap-2"
              >
                {saving && <Loader2 className="animate-spin" size={14} />}
                {editing ? "Enregistrer" : "Créer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
