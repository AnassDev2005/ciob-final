import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "./ui/button";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  id?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket = "images",
  id = "image-upload",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];
      const maxSize = 4 * 1024 * 1024; // 4MB

      if (file.size > maxSize) {
        toast.error("L'image est trop volumineuse. La taille maximale est de 4 Mo.");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        // Specifically check for bucket not found
        const errorMessage = uploadError.message.toLowerCase();
        if (
          errorMessage.includes("bucket not found") ||
          errorMessage.includes("does not exist")
        ) {
          toast.error(
            `Le dossier de stockage "${bucket}" n'existe pas dans Supabase. Veuillez le créer.`,
          );
        } else {
          toast.error(`Erreur de téléchargement: ${uploadError.message}`);
        }
        throw uploadError;
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onChange(data.publicUrl);
      toast.success("Image téléchargée avec succès");
    } catch (error) {
      console.error("Upload error details:", error);
    } finally {
      setUploading(false);
      // Reset input value so same file can be selected again if cleared
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-4">
        {value ? (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border bg-surface flex items-center justify-center">
            <img
              src={value}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                // If the URL is invalid or 404, show something else
                (e.target as HTMLImageElement).src = "https://placehold.co/80x80?text=Error";
              }}
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute -top-1 -right-1 bg-red-brand text-white rounded-full p-1 shadow-md hover:opacity-90 z-10"
              title="Supprimer l'image"
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
            accept="image/*"
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
                  "Choisir une image locale"
                )}
              </span>
            </Button>
          </label>
          <p className="mt-1 text-[10px] text-muted-foreground">PNG, JPG ou WebP. Max 4Mo.</p>
        </div>
      </div>
    </div>
  );
}
