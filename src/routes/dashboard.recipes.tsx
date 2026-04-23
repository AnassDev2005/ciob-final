import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, ChefHat, Search, Filter } from "lucide-react";
import { z } from "zod";
import { ImageUpload } from "@/components/ImageUpload";
import { MultiImageUpload } from "@/components/MultiImageUpload";

export const Route = createFileRoute("/dashboard/recipes")({
  component: RecipesAdmin,
});

type Recipe = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  image_url: string | null;
  images: string[] | null;
  ingredients: string[] | null;
  steps: string[] | null;
  duration_minutes: number | null;
  servings: number | null;
  product_ref: string | null;
  youtube_url: string | null;
};

type Category = { id: string; name: string };
type Product = { id: string; name: string; ref: string };

const schema = z.object({
  title: z.string().trim().min(1, "Titre requis").max(150),
  slug: z
    .string()
    .trim()
    .min(1, "Slug requis")
    .max(150)
    .regex(/^[a-z0-9-]+$/, "minuscules, chiffres, tirets uniquement"),
  description: z.string().trim().max(1000).optional(),
  image_url: z.string().trim().max(500).optional().or(z.literal("")),
  images: z.array(z.string()).optional().nullable(),
  product_ref: z.string().trim().max(50).optional().nullable(),
  youtube_url: z.string().trim().max(500).optional().nullable().or(z.literal("")),
});

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  category_id: "",
  image_url: "",
  images: [] as string[],
  ingredients: "",
  steps: "",
  duration_minutes: "",
  servings: "",
  product_ref: "",
  youtube_url: "",
};

function RecipesAdmin() {
  const [items, setItems] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  
  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    const [{ data: recs, error }, { data: cats }, { data: prods }] = await Promise.all([
      supabase.from("recipes").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name").eq("type", "recipe"),
      supabase.from("products").select("id, name, ref").order("name"),
    ]);
    if (error) toast.error(error.message);
    else setItems(recs as Recipe[]);
    setCategories((cats ?? []) as Category[]);
    setProducts((prods ?? []) as Product[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(search.toLowerCase()) || 
      item.slug.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (r: Recipe) => {
    setEditing(r);
    setForm({
      title: r.title,
      slug: r.slug,
      description: r.description ?? "",
      category_id: r.category_id ?? "",
      image_url: r.image_url ?? "",
      images: r.images ?? [],
      ingredients: (r.ingredients ?? []).join("\n"),
      steps: (r.steps ?? []).join("\n"),
      duration_minutes: r.duration_minutes?.toString() ?? "",
      servings: r.servings?.toString() ?? "",
      product_ref: r.product_ref ?? "",
      youtube_url: r.youtube_url ?? "",
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
    const ingredients = form.ingredients
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const steps = form.steps
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      category_id: form.category_id || null,
      image_url: form.images.length > 0 ? form.images[0] : (parsed.data.image_url || null),
      images: form.images,
      ingredients: ingredients.length ? ingredients : null,
      steps: steps.length ? steps : null,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      servings: form.servings ? Number(form.servings) : null,
      product_ref: form.product_ref || null,
      youtube_url: parsed.data.youtube_url || null,
    };
    const { error } = editing
      ? await supabase.from("recipes").update(payload).eq("id", editing.id)
      : await supabase.from("recipes").insert(payload);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Recette modifiée" : "Recette créée");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette recette ?")) return;
    const { error } = await supabase.from("recipes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Supprimée");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-4xl text-navy">Recettes</h1>
          <p className="mt-1 text-muted-foreground">{items.length} recette(s)</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-md bg-red-brand px-4 py-2 text-sm font-semibold text-red-brand-foreground hover:opacity-90"
        >
          <Plus size={16} /> Nouvelle recette
        </button>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Rechercher par titre ou slug..."
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

      <div className="mt-6 bg-card border border-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-navy" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <ChefHat className="mx-auto mb-3 opacity-40" size={32} />
            Aucune recette trouvée.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Titre</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Durée</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      {r.image_url ? (
                        <img
                          src={r.image_url}
                          alt={r.title}
                          className="h-10 w-10 object-cover rounded"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-surface flex items-center justify-center text-muted-foreground">
                          <ChefHat size={16} />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{r.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {categories.find(c => c.id === r.category_id)?.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {r.duration_minutes ? `${r.duration_minutes} min` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-2 hover:bg-surface rounded text-navy"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => remove(r.id)}
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
                {editing ? "Modifier la recette" : "Nouvelle recette"}
              </h2>
              <button onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Titre</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })}
                  placeholder="tagine-poulet"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
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
              <div>
                <label className="text-sm font-medium">Produit associé</label>
                <select
                  value={form.product_ref}
                  onChange={(e) => setForm({ ...form, product_ref: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">— Aucun —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.ref}>
                      {p.name} ({p.ref})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Durée (minutes)</label>
                <input
                  type="number"
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Personnes</label>
                <input
                  type="number"
                  value={form.servings}
                  onChange={(e) => setForm({ ...form, servings: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Lien Vidéo YouTube</label>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={form.youtube_url}
                  onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Images de la recette</label>
                <div className="mt-1">
                  <MultiImageUpload
                    id="recipe-images-upload"
                    value={form.images}
                    onChange={(urls) => setForm({ ...form, images: urls })}
                  />
                </div>
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
              <div>
                <label className="text-sm font-medium">Ingrédients (un par ligne)</label>
                <textarea
                  value={form.ingredients}
                  onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
                  rows={5}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Étapes (une par ligne)</label>
                <textarea
                  value={form.steps}
                  onChange={(e) => setForm({ ...form, steps: e.target.value })}
                  rows={5}
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
