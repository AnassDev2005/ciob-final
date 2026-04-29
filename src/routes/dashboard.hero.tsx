import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Loader2, Image as ImageIcon } from "lucide-react";
import { z } from "zod";
import { ImageUpload } from "@/components/ImageUpload";

export const Route = createFileRoute("/dashboard/hero")({
  component: HeroAdmin,
});

type HeroSlide = {
  id: string;
  image_url: string;
  icon_url: string | null;
  title: string;
  description: string | null;
  order_index: number;
};

const schema = z.object({
  image_url: z.string().trim().min(1, "Image de fond requise"),
  icon_url: z.string().trim().optional().nullable(),
  title: z.string().trim().min(1, "Titre requis").max(100),
  description: z.string().trim().max(500).optional().nullable(),
  order_index: z.number().int().default(0),
});

const emptyForm = {
  image_url: "",
  icon_url: "",
  title: "",
  description: "",
  order_index: 0,
};

function HeroAdmin() {
  const [items, setItems] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("hero_slides")
      .select("*")
      .order("order_index", { ascending: true });
    
    if (error) toast.error(error.message);
    else setItems(data as HeroSlide[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm, order_index: items.length });
    setOpen(true);
  };

  const openEdit = (h: HeroSlide) => {
    setEditing(h);
    setForm({
      image_url: h.image_url,
      icon_url: h.icon_url ?? "",
      title: h.title,
      description: h.description ?? "",
      order_index: h.order_index,
    });
    setOpen(true);
  };

  const save = async () => {
    const parsed = schema.safeParse({ ...form, order_index: Number(form.order_index) });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Données invalides");
      return;
    }
    setSaving(true);
    
    const payload = {
      image_url: parsed.data.image_url,
      icon_url: parsed.data.icon_url || null,
      title: parsed.data.title,
      description: parsed.data.description || null,
      order_index: parsed.data.order_index,
    };

    const { error } = editing
      ? await supabase.from("hero_slides").update(payload).eq("id", editing.id)
      : await supabase.from("hero_slides").insert(payload);
    
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Slide modifié" : "Slide créé");
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce slide ?")) return;
    const { error } = await supabase.from("hero_slides").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Supprimé");
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-heading text-4xl text-navy">Slides Hero</h1>
          <p className="mt-1 text-muted-foreground">{items.length} slide(s) actif(s) sur l'accueil</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-md bg-red-brand px-4 py-2 text-sm font-semibold text-red-brand-foreground hover:opacity-90"
        >
          <Plus size={16} /> Nouveau slide
        </button>
      </div>

      <div className="mt-8 grid gap-6">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="animate-spin text-navy" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-xl">
            <ImageIcon className="mx-auto mb-3 opacity-40" size={32} />
            Aucun slide configuré. Le site utilisera les slides par défaut.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((h) => (
              <div key={h.id} className="bg-card border border-border rounded-xl overflow-hidden shadow-sm group">
                <div className="aspect-video relative overflow-hidden bg-surface">
                  <img src={h.image_url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(h)} className="p-2 bg-white rounded-lg text-navy shadow-lg">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => remove(h.id)} className="p-2 bg-white rounded-lg text-red-brand shadow-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {h.icon_url && (
                    <div className="absolute bottom-2 left-2 h-10 w-10 bg-white rounded-lg p-1.5 shadow-lg border border-border">
                      <img src={h.icon_url} alt="" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-navy truncate">{h.title}</h3>
                    <span className="text-[10px] font-mono bg-navy/5 text-navy px-1.5 py-0.5 rounded">
                      #{h.order_index}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{h.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-card rounded-xl shadow-xl max-w-xl w-full p-6 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl text-navy">
                {editing ? "Modifier le slide" : "Nouveau slide"}
              </h2>
              <button onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Titre</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ex: Faitout Alu Anses Bak"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  placeholder="Petite description du produit..."
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Ordre d'affichage</label>
                  <input
                    type="number"
                    value={form.order_index}
                    onChange={(e) => setForm({ ...form, order_index: parseInt(e.target.value) || 0 })}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium block mb-2">Image de fond</label>
                  <ImageUpload
                    id="hero-bg-upload"
                    value={form.image_url}
                    onChange={(url) => setForm({ ...form, image_url: url })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-2">Icône produit (Optionnel)</label>
                  <ImageUpload
                    id="hero-icon-upload"
                    value={form.icon_url}
                    onChange={(url) => setForm({ ...form, icon_url: url })}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-2">
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
