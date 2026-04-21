import { Award, ShieldCheck, Layers, Users } from "lucide-react";

const stats = [
  { icon: Award, value: "+30 ans", label: "D'EXPERTISE" },
  { icon: Layers, value: "3 Familles", label: "DE PRODUITS" },
  { icon: Users, value: "Membre", label: "CGEM & CFCIM" },
];

export default function StatsBar() {
  return (
    <section className="bg-surface border-y border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mx-auto max-w-3xl">
          {stats.map((s) => (
            <div
              key={s.value}
              className="flex items-center gap-4 bg-card rounded-xl p-5 shadow-sm border border-border"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <s.icon size={24} />
              </div>
              <div>
                <p className="font-heading text-2xl text-navy">{s.value}</p>
                <p className="text-xs font-medium tracking-wide text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
