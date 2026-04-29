import { ShieldCheck, Award, Handshake, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import isoLogo from "@/assets/Logo/cer/Certification_ISO-9001-2015.jpg";
import marjaneLogo from "@/assets/Logo/cer/Marjane Logo-vector.ma.svg-vector.ma.png";
import marjaneMarketLogo from "@/assets/Logo/cer/Marjane Market Logo-vector.ma.svg-vector.ma (1).png";
import atacadaoLogo from "@/assets/Logo/cer/atacadao.png";

const qualities = [
  {
    icon: ShieldCheck,
    title: "Certification ISO 9001",
    desc: "Garantie de processus industriels maîtrisés.",
  },
  {
    icon: Award,
    title: "Membre CGEM & CFCIM",
    desc: "Acteur engagé du tissu économique marocain.",
  },
  {
    icon: Handshake,
    title: "Partenaire Retail",
    desc: "Présent chez Marjane, Carrefour et Aswaq Assalam.",
  },
];

const CERTIFICATES = [
  { src: isoLogo, alt: "ISO 9001 Certification" },
  { src: marjaneLogo, alt: "Marjane Logo" },
  { src: marjaneMarketLogo, alt: "Marjane Market Logo" },
  { src: atacadaoLogo, alt: "Atacadao Logo" },
  // Repeat to ensure smooth looping if needed, but Embla loop handles it
];

export default function QualityContactSection() {
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [emblaRef] = useEmblaCarousel({ loop: true, align: "center", dragFree: true }, [
    Autoplay({ delay: 2000, stopOnInteraction: false, playOnInit: true }),
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("contacts").insert({
      full_name: fullName,
      company: company,
      email: email,
      message: message,
      subject: "Demande de devis (Accueil)",
    });

    setSubmitting(false);

    if (error) {
      toast.error("Erreur lors de l'envoi : " + error.message);
      return;
    }

    toast.success("Votre demande a été envoyée avec succès !");
    setFullName("");
    setCompany("");
    setEmail("");
    setMessage("");
  };

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Quality */}
          <div className="flex flex-col justify-between bg-navy rounded-2xl p-8 lg:p-10 text-primary-foreground">
            <div>
              <h2 className="font-heading text-3xl lg:text-4xl">Engagement Qualité & Partenariats</h2>
              <div className="mt-8 space-y-6">
                {qualities.map((q) => (
                  <div key={q.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                      <q.icon size={20} />
                    </div>
                    <div>
                      <p className="font-semibold">{q.title}</p>
                      <p className="text-sm text-primary-foreground/70">{q.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Logos Ticker */}
            <div className="mt-12 pt-8 border-t border-white/5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/30 mb-8">Accréditations & Distribution</p>
              
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex items-center">
                  {CERTIFICATES.map((cert, idx) => (
                    <div key={idx} className="flex-[0_0_50%] sm:flex-[0_0_33.33%] min-w-0 px-4">
                      <div className="h-24 flex items-center justify-center bg-white/5 rounded-xl p-4">
                        <img 
                          src={cert.src} 
                          alt={cert.alt} 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                  ))}
                  {/* Duplicate for smoother loop on small sets if needed, but Embla is fine */}
                  {CERTIFICATES.map((cert, idx) => (
                    <div key={`dup-${idx}`} className="flex-[0_0_50%] sm:flex-[0_0_33.33%] min-w-0 px-4">
                      <div className="h-24 flex items-center justify-center bg-white/5 rounded-xl p-4">
                        <img 
                          src={cert.src} 
                          alt={cert.alt} 
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card rounded-2xl p-8 lg:p-10 border border-border shadow-sm">
            <h2 className="font-heading text-3xl lg:text-4xl text-navy">Demander un devis</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Nos experts vous répondent sous 24h pour vos besoins pro ou particuliers.
            </p>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-foreground">Nom Complet</label>
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Votre nom"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground">
                    Entreprise (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nom société"
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground">Message & Produits</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez vos besoins..."
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy/20 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-red-brand py-3 text-sm font-semibold text-red-brand-foreground hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Envoi en cours...
                  </>
                ) : (
                  "Envoyer ma demande"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
