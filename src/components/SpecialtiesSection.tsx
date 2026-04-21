import { Flame, ShieldCheck, Droplets, ChefHat } from "lucide-react";

const specialties = [
  {
    icon: Flame,
    title: "Aluminium",
    desc: "Performance thermique exceptionnelle et légèreté pour une cuisine quotidienne efficace.",
    color: "text-red-brand",
  },
  {
    icon: ShieldCheck,
    title: "Antiadhésif",
    desc: "Revêtements Granite et Téflon haute durabilité pour une cuisson saine sans ajout de graisse.",
    color: "text-navy",
  },
  {
    icon: Droplets,
    title: "Inox",
    desc: "Acier Inoxydable 18/10 pour une durabilité illimitée et une hygiène irréprochable.",
    color: "text-red-brand",
  },
];

export default function SpecialtiesSection() {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 text-center">
        <h2 className="font-heading text-4xl lg:text-5xl text-navy">
          Nos Spécialités Industrielles
        </h2>
        <p className="mt-3 max-w-xl mx-auto text-muted-foreground">
          Une gamme complète répondant aux exigences des particuliers comme des professionnels de la
          gastronomie.
        </p>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto">
          {specialties.map((s) => (
            <div
              key={s.title}
              className="group bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all text-left"
            >
              <div className={`mb-4 ${s.color}`}>
                <s.icon size={32} />
              </div>
              <h3 className="font-heading text-xl text-navy">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              <div className="mt-4 h-1 w-8 rounded bg-red-brand group-hover:w-12 transition-all" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
