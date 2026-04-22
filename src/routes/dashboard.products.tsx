import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, Package, Search, Filter } from "lucide-react";
import { z } from "zod";
import { ImageUpload } from "@/components/ImageUpload";
import { MultiImageUpload } from "@/components/MultiImageUpload";
import { PaginationComponent } from "@/components/PaginationComponent";

export const Route = createFileRoute("/dashboard/products")({
  component: ProductsAdmin,
});

type Product = {
  id: string;
  name: string;
  ref: string;
  description: string | null;
  diametre: string | null;
  category_id: string | null;
  badge: string | null;
  image_url: string | null;
  images: string[] | null;
  features: string[] | null;
};

type Category = { id: string; name: string };

const schema = z.object({
  name: z.string().trim().min(1, "Nom requis").max(150),
  ref: z.string().trim().min(1, "Référence requise").max(50),
  description: z.string().trim().max(1000).optional(),
  diametre: z.string().trim().max(100).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  badge: z.string().trim().max(30).optional().nullable(),
  image_url: z.string().trim().max(500).optional().or(z.literal("")),
  images: z.array(z.string()).optional().nullable(),
  features: z.string().optional(),
});

const emptyForm = {
  name: "",
  ref: "",
  description: "",
  diametre: "",
  category_id: "",
  badge: "",
  image_url: "",
  images: [] as string[],
  features: "",
};

function ProductsAdmin() {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  
  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const load = async () => {
    setLoading(true);
    const [{ data: prods, error: pErr }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name").eq("type", "product"),
    ]);
    if (pErr) toast.error(pErr.message);
    else setItems(prods as Product[]);
    setCategories((cats ?? []) as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = 
        item.name.toLowerCase().includes(search.toLowerCase()) || 
        item.ref.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || item.category_id === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, categoryFilter]);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      ref: p.ref,
      description: p.description ?? "",
      diametre: p.diametre ?? "",
      category_id: p.category_id ?? "",
      badge: p.badge ?? "",
      image_url: p.image_url ?? "",
      images: p.images ?? [],
      features: (p.features ?? []).join("\n"),
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
    const features = form.features
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      name: parsed.data.name,
      ref: parsed.data.ref,
      description: parsed.data.description || null,
      diametre: parsed.data.diametre || null,
      category_id: form.category_id || null,
      badge: parsed.data.badge || null,
      image_url: form.images.length > 0 ? form.images[0] : (parsed.data.image_url || null),
      images: form.images,
      features: features.length ? features : null,
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Produit modifié" : "Produit créé");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Supprimé");
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-4xl text-navy">Produits</h1>
          <p className="mt-1 text-muted-foreground">{items.length} produit(s) au catalogue</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-md bg-red-brand px-4 py-2 text-sm font-semibold text-red-brand-foreground hover:opacity-90"
        >
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Rechercher par nom ou référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-card pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
        </div>
        <div className="relative w-full sm:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-md border border-input bg-card pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 appearance-none"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-navy" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Package className="mx-auto mb-3 opacity-40" size={32} />
            Aucun produit trouvé.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Image</th>
                    <th className="px-4 py-3">Nom</th>
                    <th className="px-4 py-3">Réf</th>
                    <th className="px-4 py-3">Taille</th>
                    <th className="px-4 py-3">Catégorie</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="h-10 w-10 object-contain rounded bg-surface"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-surface flex items-center justify-center text-muted-foreground">
                            <Package size={16} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {p.name}
                        {p.badge && (
                          <span className="ml-2 text-[10px] uppercase bg-navy text-white px-1.5 py-0.5 rounded">
                            {p.badge}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.ref}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{p.diametre || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {categories.find(c => c.id === p.category_id)?.name || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 hover:bg-surface rounded text-navy"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => remove(p.id)}
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
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-card rounded-xl shadow-xl max-w-2xl w-full p-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl text-navy">
                {editing ? "Modifier le produit" : "Nouveau produit"}
              </h2>
              <button onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Nom</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Référence</label>
                <input
                  value={form.ref}
                  onChange={(e) => setForm({ ...form, ref: e.target.value })}
                  placeholder="AT-2024"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Dimensions / Capacité</label>
                <input
                  value={form.diametre}
                  onChange={(e) => setForm({ ...form, diametre: e.target.value })}
                  placeholder="24 - 50 cm / 2L - 4L"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Aucune —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Images du produit</label>
                <div className="mt-1">
                  <MultiImageUpload
                    id="product-images-upload"
                    value={form.images}
                    onChange={(urls) => setForm({ ...form, images: urls })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Badge</label>
                <input
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  placeholder="BEST-SELLER"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Caractéristiques (une par ligne)</label>
                <textarea
                  value={form.features}
                  onChange={(e) => setForm({ ...form, features: e.target.value })}
                  rows={4}
                  placeholder="Acier 18/10&#10;Compatible induction"
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
