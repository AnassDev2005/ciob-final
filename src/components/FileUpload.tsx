import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { Button } from "./ui/button";

interface FileUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  id?: string;
  accept?: string;
}

export function FileUpload({
  value,
  onChange,
  bucket = "catalogues",
  id = "file-upload",
  accept = "application/pdf",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        toast.error(`Erreur de téléchargement: ${uploadError.message}`);
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onChange(data.publicUrl);
      toast.success("Fichier téléchargé avec succès");
    } catch (error) {
      console.error("Upload error details:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border bg-surface flex items-center justify-center">
            <FileText size={40} className="text-navy" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-1 -right-1 bg-red-brand text-white rounded-full p-1 shadow-md hover:opacity-90 z-10"
              title="Supprimer le fichier"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground bg-surface">
            <Upload size={20} />
          </div>
        )}
        <div className="flex-1">
          <input
            type="file"
            accept={accept}
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            id={id}
          />
          <label htmlFor={id}>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              className="cursor-pointer"
              asChild
            >
              <span>
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Téléchargement...
                  </>
                ) : (
                  "Choisir un fichier"
                )}
              </span>
            </Button>
          </label>
          <p className="mt-1 text-[10px] text-muted-foreground">PDF. Max 10Mo.</p>
          {value && (
            <div className="mt-2 truncate max-w-xs text-[10px] text-navy font-medium">
              URL: {value}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
