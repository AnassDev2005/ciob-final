import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Building2, Clock, Mail, MapPin, MessageCircle, Phone, Send, Sparkles, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): { ref?: string; type?: string } => {
    return {
      ref: typeof search.ref === "string" ? search.ref : undefined,
      type: typeof search.type === "string" ? search.type : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Contact — TITANIC" },
      {
        name: "description",
        content:
          "Contactez TITANIC : devis professionnel, questions sur nos produits, partenariat. Notre équipe vous répond sous 24h.",
      },
      { property: "og:title", content: "Contact — TITANIC" },
      {
        property: "og:description",
        content:
          "Une question, un projet, un devis ? L'équipe TITANIC à Casablanca est à votre écoute.",
      },
    ],
  }),
  component: ContactPage,
});

const subjects = [
  "Demande de devis",
  "Information produit",
  "Partenariat revendeur",
  "SAV / Garantie",
  "Autre",
];

const contactItems = [
  {
    icon: MapPin,
    title: "Adresse",
    lines: ["Lot 113-114 Quartier industriel Ben Souda", "Fes, Maroc"],
  },
  {
    icon: Phone,
    title: "Téléphone",
    lines: ["+212 661 411 025", "Lun-Ven : 8h-17h"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["ciob99@yahoo.fr", "Réponse sous 24h"],
  },
  {
    icon: Clock,
    title: "Horaires",
    lines: ["Lundi - Vendredi : 8h-17h", "Samedi : 9h-13h"],
  },
];

function ContactPage() {
  const { ref, type } = Route.useSearch();
  const [subject, setSubject] = useState(ref ? subjects[0] : subjects[1]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState(
    ref
      ? `Bonjour, je souhaiterais obtenir un devis pour le ${type === "recipe" ? "plat" : "produit"} suivant : ${ref}.`
      : ""
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from("contacts").insert({
      full_name: fullName,
      email,
      phone,
      company,
      subject,
      message,
    });

    setSubmitting(false);

    if (error) {
      toast.error("Erreur lors de l'envoi : " + error.message);
      return;
    }

    setSubmitted(true);
    toast.success("Message envoyé avec succès !");

    // Reset form
    setFullName("");
    setEmail("");
    setPhone("");
    setCompany("");
    setMessage("");

    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-primary-foreground">
        <div className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full bg-red-brand/20 blur-3xl" />
        <div className="absolute -left-32 -bottom-32 w-[400px] h-[400px] rounded-full bg-navy-light/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-16 lg:py-20">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary-foreground/60">
            <Link to="/" className="hover:text-primary-foreground transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-primary-foreground">Contact</span>
          </nav>

          <div className="mt-6 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded bg-red-brand px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <MessageCircle size={14} /> Parlons de votre projet
            </span>
            <h1 className="font-heading mt-4 text-4xl sm:text-5xl lg:text-6xl leading-[0.95]">
              Contactez <span className="text-red-brand">l'équipe</span>
            </h1>
            <p className="mt-5 text-base text-primary-foreground/70 leading-relaxed max-w-2xl">
              Devis, partenariats, conseil technique. Quelle que soit votre demande, nous sommes là
              pour y répondre rapidement et avec précision.
            </p>
          </div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="-mt-10 relative z-10 px-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactItems.map((item) => (
            <div
              key={item.title}
              className="bg-card border border-border rounded-xl p-5 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <div className="w-11 h-11 rounded-lg bg-red-brand/10 text-red-brand flex items-center justify-center">
                <item.icon size={20} />
              </div>
              <p className="mt-4 font-semibold text-navy text-sm uppercase tracking-wider">
                {item.title}
              </p>
              {item.lines.map((line, i) => (
                <p
                  key={i}
                  className={
                    i === 0
                      ? "mt-2 text-sm font-medium text-foreground"
                      : "text-xs text-muted-foreground"
                  }
                >
                  {line}
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 grid lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            <p className="text-xs uppercase tracking-wider text-red-brand font-semibold">
              Formulaire
            </p>
            <h2 className="font-heading mt-2 text-3xl lg:text-5xl text-navy leading-tight">
              Écrivez-nous
            </h2>
            <p className="mt-3 text-foreground/70">
              Remplissez le formulaire ci-dessous, un membre de notre équipe vous recontactera sous
              24 heures ouvrées.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy">
                    Nom complet *
                  </label>
                  <input
                    required
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2 w-full rounded-md border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30"
                    placeholder="Mohammed Alaoui"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy">
                    Société
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-2 w-full rounded-md border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30"
                    placeholder="Restaurant, hôtel..."
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy">
                    Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2 w-full rounded-md border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30"
                    placeholder="vous@email.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 w-full rounded-md border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30"
                    placeholder="+212 6 00 00 00 00"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-navy mb-2 block">
                  Sujet *
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSubject(s)}
                      className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${subject === s
                          ? "bg-navy text-primary-foreground"
                          : "bg-card border border-border text-foreground hover:bg-navy/5"
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-navy">
                  Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-2 w-full rounded-md border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy/30 resize-none"
                  placeholder="Décrivez votre demande..."
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-red-brand px-6 py-3 text-sm font-semibold text-red-brand-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Envoyer le message
                  </>
                )}
              </button>

              {submitted && (
                <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                  ✓ Merci ! Votre message a bien été envoyé. Nous vous répondrons sous 24h.
                </div>
              )}
            </form>
          </div>

          {/* Side panel */}
          <aside className="lg:col-span-2 space-y-5">
            <div className="bg-navy text-primary-foreground rounded-2xl p-7 relative overflow-hidden">
              <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-red-brand/30 blur-3xl" />
              <div className="relative">
                <Sparkles size={20} className="text-red-brand" />
                <h3 className="mt-3 font-heading text-2xl">Pour les pros</h3>
                <p className="mt-2 text-sm text-primary-foreground/70 leading-relaxed">
                  Hôtels, restaurants, collectivités : bénéficiez de tarifs revendeurs, échantillons
                  gratuits et accompagnement dédié.
                </p>
                <div className="mt-5 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-red-brand" /> Catalogue B2B
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-red-brand" /> Tarifs dégressifs
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-red-brand" /> Livraison Maroc
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-border h-72">
              <iframe
                title="Ciob Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3308.153183864693!2d-5.0740911763586105!3d33.98859892108703!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xda02182eedc115f%3A0xc1776effec2047da!2sCiob!5e0!3m2!1sar!2sma!4v1777542904806!5m2!1sar!2sma"
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>

            <a
              href="https://wa.me/212535729168"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 hover:border-red-brand transition-colors group"
            >
              <div>
                <p className="font-semibold text-navy">Réponse instantanée</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Discutez avec nous sur WhatsApp
                </p>
              </div>
              <span className="w-10 h-10 rounded-full bg-red-brand text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle size={18} />
              </span>
            </a>
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
