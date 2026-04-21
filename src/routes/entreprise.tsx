import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Factory, Globe, Heart, Sparkles, Target, Users, Wrench } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import factoryImg from "@/assets/factory.jpg";

export const Route = createFileRoute("/entreprise")({
  head: () => ({
    meta: [
      { title: "L'Entreprise — TITANIC" },
      {
        name: "description",
        content:
          "Découvrez TITANIC, leader marocain de la cuisson industrielle depuis 1991. Notre histoire, nos valeurs et notre savoir-faire.",
      },
      { property: "og:title", content: "L'Entreprise — TITANIC" },
      {
        property: "og:description",
        content:
          "Plus de 30 ans d'expertise dans la fabrication d'ustensiles de cuisine haut de gamme au Maroc.",
      },
    ],
  }),
  component: EntreprisePage,
});

const timeline = [
  {
    year: "1991",
    title: "Fondation",
    desc: "Création de TITANIC à Casablanca avec une vision : démocratiser la cuisson de qualité au Maroc.",
  },
  {
    year: "2002",
    title: "Expansion industrielle",
    desc: "Ouverture d'une nouvelle unité de production de 5000m² équipée des dernières technologies.",
  },
  {
    year: "2010",
    title: "Certification ISO 9001",
    desc: "Reconnaissance internationale de notre système de management de la qualité.",
  },
  {
    year: "2018",
    title: "Innovation Granite",
    desc: "Lancement de notre gamme antiadhésive sans PFOA, fierté de la R&D marocaine.",
  },
  {
    year: "2024",
    title: "Leader régional",
    desc: "Plus de 50 références distribuées dans 12 pays d'Afrique et du Moyen-Orient.",
  },
];

const values = [
  { icon: Award, title: "Qualité", desc: "Chaque produit subit 27 contrôles avant expédition." },
  { icon: Heart, title: "Passion", desc: "Le savoir-faire artisanal au cœur de l'industrie." },
  { icon: Globe, title: "Made in Maroc", desc: "100% fabriqué localement, fierté nationale." },
  { icon: Target, title: "Innovation", desc: "R&D continue pour des cuissons plus saines." },
];

const stats = [
  { v: "30+", l: "Années d'expertise" },
  { v: "5000m²", l: "Site de production" },
  { v: "150+", l: "Collaborateurs" },
  { v: "12", l: "Pays distribués" },
];

function EntreprisePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-primary-foreground">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${factoryImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/95 to-navy/60" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-16 lg:py-24">
          <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary-foreground/60">
            <Link to="/" className="hover:text-primary-foreground transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <span className="text-primary-foreground">L'entreprise</span>
          </nav>

          <div className="mt-6 max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded bg-red-brand px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={14} /> Depuis 1991
            </span>
            <h1 className="font-heading mt-4 text-4xl sm:text-5xl lg:text-6xl leading-[0.95]">
              Notre <span className="text-red-brand">savoir-faire</span>,<br />
              votre confiance
            </h1>
            <p className="mt-5 text-base text-primary-foreground/70 leading-relaxed max-w-2xl">
              Depuis plus de trois décennies, TITANIC façonne l'excellence culinaire marocaine. De
              l'autocuiseur familial aux marmites industrielles, nous équipons les cuisines du
              Royaume et au-delà.
            </p>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-heading text-4xl lg:text-5xl text-navy">{s.v}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-red-brand font-semibold">
              Notre mission
            </p>
            <h2 className="font-heading mt-3 text-4xl lg:text-5xl text-navy leading-tight">
              Sublimer chaque cuisson, du foyer au restaurant
            </h2>
            <p className="mt-5 text-foreground/80 leading-relaxed">
              Chez TITANIC, nous croyons qu'un bon repas commence par un bon ustensile. Notre
              mission est de fournir aux familles marocaines comme aux professionnels les outils les
              plus performants, sûrs et durables.
            </p>
            <p className="mt-4 text-foreground/80 leading-relaxed">
              Chaque pièce qui sort de notre atelier porte la signature d'une exigence : celle d'une
              marque qui ne transige jamais sur la qualité.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { icon: Factory, label: "Production locale" },
                { icon: Wrench, label: "SAV à vie" },
                { icon: Users, label: "Équipe d'experts" },
                { icon: Award, label: "ISO 9001:2015" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <item.icon size={20} className="text-red-brand shrink-0" />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-red-brand/20 blur-3xl" />
            <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-full bg-navy/20 blur-3xl" />
            <img
              src={factoryImg}
              alt="Atelier de production TITANIC"
              loading="lazy"
              width={1600}
              height={1024}
              className="relative rounded-2xl shadow-2xl border border-border w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-wider text-red-brand font-semibold">
              Nos valeurs
            </p>
            <h2 className="font-heading mt-3 text-4xl lg:text-5xl text-navy">
              Ce qui nous fait avancer
            </h2>
          </div>

          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="group bg-card border border-border rounded-xl p-6 hover:border-red-brand hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-navy text-primary-foreground flex items-center justify-center group-hover:bg-red-brand transition-colors">
                  <v.icon size={22} />
                </div>
                <h3 className="mt-5 font-heading text-2xl text-navy">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="mx-auto max-w-5xl px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-xs uppercase tracking-wider text-red-brand font-semibold">
              Notre histoire
            </p>
            <h2 className="font-heading mt-3 text-4xl lg:text-5xl text-navy">
              Plus de 30 ans d'aventure
            </h2>
          </div>

          <div className="mt-14 relative">
            <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-px bg-border lg:-translate-x-1/2" />

            <div className="space-y-10">
              {timeline.map((item, idx) => (
                <div
                  key={item.year}
                  className={`relative grid lg:grid-cols-2 gap-6 ${idx % 2 === 0 ? "" : "lg:[&>*:first-child]:order-2"}`}
                >
                  <div
                    className={`pl-12 lg:pl-0 ${idx % 2 === 0 ? "lg:pr-12 lg:text-right" : "lg:pl-12"}`}
                  >
                    <span className="font-heading text-4xl text-red-brand">{item.year}</span>
                    <h3 className="mt-1 font-semibold text-xl text-navy">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                  <div className="hidden lg:block" />
                  <div className="absolute left-4 lg:left-1/2 top-2 w-3 h-3 rounded-full bg-red-brand ring-4 ring-background lg:-translate-x-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
          <div className="relative overflow-hidden rounded-2xl bg-navy px-8 py-12 lg:p-14 text-center">
            <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-red-brand/20 blur-3xl" />
            <div className="relative">
              <h3 className="font-heading text-3xl lg:text-5xl text-primary-foreground leading-tight">
                Visitez notre usine
              </h3>
              <p className="mt-4 text-primary-foreground/70 max-w-xl mx-auto">
                Nous ouvrons régulièrement nos portes aux professionnels et partenaires.
                Contactez-nous pour planifier votre visite.
              </p>
              <Link
                to="/contact"
                className="mt-6 inline-flex items-center justify-center rounded-md bg-red-brand px-6 py-3 text-sm font-semibold text-red-brand-foreground hover:opacity-90 transition-opacity"
              >
                Prendre rendez-vous
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
