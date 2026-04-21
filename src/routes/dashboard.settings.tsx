import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/FileUpload";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [catalogueUrl, setCatalogueUrl] = useState<string>("");

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "catalogue_url")
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          setCatalogueUrl(data.value || "");
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast.error("Erreur lors du chargement des paramètres");
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "catalogue_url", value: catalogueUrl, updated_at: new Date().toISOString() });

      if (error) throw error;
      toast.success("Paramètres enregistrés avec succès");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erreur lors de l'enregistrement des paramètres");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-navy" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl text-navy">Paramètres du site</h1>
          <p className="text-muted-foreground">Gérez les fichiers globaux et configurations du site.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-navy hover:bg-navy-light">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Enregistrer les modifications
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-navy/5 text-navy">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="font-heading text-xl text-navy">Catalogue PDF</h2>
              <p className="text-sm text-muted-foreground">Ce fichier sera disponible au téléchargement pour les clients.</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Fichier du catalogue</label>
            <FileUpload 
              value={catalogueUrl} 
              onChange={setCatalogueUrl} 
              bucket="catalogues"
              accept="application/pdf"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
