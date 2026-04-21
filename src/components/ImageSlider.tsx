import { useState } from "react";
import { ChevronLeft, ChevronRight, Package, ChefHat, ZoomIn, X } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "./ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ImageSliderProps {
  images: string[];
  alt: string;
  badge?: string | null;
  fallbackIcon?: "product" | "recipe";
}

export function ImageSlider({
  images = [],
  alt,
  badge,
  fallbackIcon = "product",
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const safeImages = images && images.length > 0 ? images : [];

  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % safeImages.length);
  };

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  if (safeImages.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-surface border border-border flex items-center justify-center p-8 lg:p-12 overflow-hidden shadow-sm">
        {fallbackIcon === "product" ? (
          <Package size={120} className="text-muted-foreground opacity-20" />
        ) : (
          <ChefHat size={120} className="text-muted-foreground opacity-20" />
        )}
      </div>
    );
  }

  return (
    <div className="relative group">
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogTrigger asChild>
          <div 
            className="aspect-square rounded-2xl bg-surface border border-border flex items-center justify-center p-8 lg:p-12 overflow-hidden shadow-sm relative cursor-zoom-in"
            onClick={() => setIsZoomOpen(true)}
          >
            <img
              src={safeImages[currentIndex]}
              alt={`${alt} - Image ${currentIndex + 1}`}
              className="max-h-full w-auto object-contain transition-transform duration-700 group-hover:scale-105"
            />
            
            <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm text-navy">
              <ZoomIn size={20} />
            </div>

            {badge && (
              <Badge className="absolute top-6 left-6 bg-red-brand text-white hover:bg-red-brand px-3 py-1">
                {badge}
              </Badge>
            )}

            {safeImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-navy p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 z-10"
                  aria-label="Image précédente"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-navy p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 z-10"
                  aria-label="Image suivante"
                >
                  <ChevronRight size={24} />
                </button>
                
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {safeImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${
                        idx === currentIndex ? "bg-red-brand w-4" : "bg-navy/20"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogTrigger>
        
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/90 border-none flex items-center justify-center overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>{alt}</DialogTitle>
          </VisuallyHidden>
          
          <div className="relative w-full h-full flex items-center justify-center p-4 lg:p-12">
            <img
              src={safeImages[currentIndex]}
              alt={alt}
              className="max-w-full max-h-[85vh] object-contain select-none"
            />
            
            {safeImages.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 lg:p-4 rounded-full transition-all"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={next}
                  className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 lg:p-4 rounded-full transition-all"
                >
                  <ChevronRight size={32} />
                </button>
                
                <div className="absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                  {safeImages.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        idx === currentIndex ? "bg-red-brand scale-125" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            
            <p className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
              Image {currentIndex + 1} sur {safeImages.length}
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      {safeImages.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex ? "border-red-brand" : "border-transparent opacity-60"
              }`}
            >
              <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
