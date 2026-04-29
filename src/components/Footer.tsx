import { MapPin, Phone, Facebook, Instagram, Youtube, MessageCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import ciobLogo from "@/assets/Logo/logo ciob.jpg";

export default function Footer() {
  return (
    <>
      <section className="bg-surface py-12 border-t border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-heading text-2xl text-navy">Restons Connectés</h3>
              <p className="text-muted-foreground mt-1">Suivez nos actualités et découvrez nos nouveaux produits sur les réseaux sociaux.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <a 
                href="https://www.facebook.com/TitanicProductionMaroc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2"
              >
                <div className="h-14 w-14 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center text-[#1877F2] group-hover:bg-[#1877F2] group-hover:text-white transition-all duration-300">
                  <Facebook size={28} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-navy transition-colors">Facebook</span>
              </a>
              <a 
                href="https://www.instagram.com/titanic_maroc?igsh=MXNmb2hzYXM0bnU0Zg==" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2"
              >
                <div className="h-14 w-14 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center text-[#E4405F] group-hover:bg-gradient-to-tr group-hover:from-[#f9ce34] group-hover:via-[#ee2a7b] group-hover:to-[#6228d7] group-hover:text-white transition-all duration-300">
                  <Instagram size={28} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-navy transition-colors">Instagram</span>
              </a>
              <a 
                href="https://www.youtube.com/@titanicmaroc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2"
              >
                <div className="h-14 w-14 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center text-[#FF0000] group-hover:bg-[#FF0000] group-hover:text-white transition-all duration-300">
                  <Youtube size={28} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-navy transition-colors">YouTube</span>
              </a>
              <a 
                href="https://wa.me/212661654148" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-2"
              >
                <div className="h-14 w-14 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all duration-300">
                  <MessageCircle size={28} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-navy transition-colors">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-navy text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <img src={ciobLogo} alt="Ciob" className="h-6 w-auto" />
              <p className="mt-3 text-sm text-primary-foreground/60 leading-relaxed">
                L'excellence de la cuisson industrielle au service du Maroc. Côté Maroc, fabrique des
                ustensiles de cuisine haut de gamme depuis 1996.
              </p>
            </div>

            <div>
              <p className="font-semibold text-sm uppercase tracking-wider mb-4">Navigation</p>
              <ul className="space-y-2 text-sm text-primary-foreground/60">
                <li>
                  <Link to="/" className="hover:text-primary-foreground transition-colors">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link to="/entreprise" className="hover:text-primary-foreground transition-colors">
                    L'entreprise
                  </Link>
                </li>
                <li>
                  <Link to="/produits" className="hover:text-primary-foreground transition-colors">
                    Nos produits
                  </Link>
                </li>
                <li>
                  <Link to="/recettes" className="hover:text-primary-foreground transition-colors">
                    Recettes
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-sm uppercase tracking-wider mb-4">Support</p>
              <ul className="space-y-2 text-sm text-primary-foreground/60">
                <li>
                  <Link to="/contact" className="hover:text-primary-foreground transition-colors">
                    Maintenance
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary-foreground transition-colors">
                    Réclamations
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary-foreground transition-colors">
                    Service Client
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary-foreground transition-colors">
                    Mentions Légales
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-sm uppercase tracking-wider mb-4">Contact</p>
              <ul className="space-y-3 text-sm text-primary-foreground/60">
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 shrink-0" />
                  Fes, Maroc — Zone industrielle
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={16} className="shrink-0" />
                  +212 661 411 025
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-primary-foreground/40">
            <p>© 2026 TITANIC — Leader de la Cuisson Industrielle</p>
            <div className="flex gap-4">
              <Link to="/contact" className="hover:text-primary-foreground transition-colors">
                Confidentialité
              </Link>
              <Link to="/contact" className="hover:text-primary-foreground transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
