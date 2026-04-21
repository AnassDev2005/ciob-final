import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X, Plus } from "lucide-react";
import { Button } from "./ui/button";

interface MultiImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  bucket?: string;
  id?: string;
}

export function MultiImageUpload({
  value = [],
  onChange,
  bucket = "images",
  id = "multi-image-upload",
}: MultiImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const files = Array.from(e.target.files);
      const maxSize = 4 * 1024 * 1024; // 4MB
      const newUrls: string[] = [...value];

      for (const file of files) {
        if (file.size > maxSize) {
          toast.error(`L'image "${file.name}" est trop volumineuse. Max 4 Mo.`);
          continue;
        }

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
          continue;
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
      }

      onChange(newUrls);
      toast.success(`${files.length} image(s) ajoutée(s)`);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-surface flex items-center justify-center group">
            <img
              src={url}
              alt={`Preview ${index}`}
              className="max-w-full max-h-full object-contain"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-1 right-1 bg-red-brand text-white rounded-full p-1 shadow-md hover:opacity-90 opacity-0 group-hover:opacity-100 transition-opacity z-10"
              title="Supprimer l'image"
            >
              <X size={12} />
            </button>
            {index === 0 && (
              <span className="absolute bottom-0 left-0 right-0 bg-navy/80 text-white text-[8px] py-0.5 text-center font-bold uppercase">
                Principale
              </span>
            )}
          </div>
        ))}
        
        <label
          htmlFor={id}
          className={`aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground bg-surface hover:bg-surface/80 cursor-pointer transition-colors ${
            uploading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <Plus size={24} />
              <span className="mt-1 text-[10px] font-medium uppercase">Ajouter</span>
            </>
          )}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            id={id}
          />
        </label>
      </div>
      <p className="text-[10px] text-muted-foreground italic">
        La première image sera l'image principale. Max 4 Mo par image.
      </p>
    </div>
  );
}
