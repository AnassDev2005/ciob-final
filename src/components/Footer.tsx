import { MapPin, Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import ciobLogo from "@/assets/Logo/logo ciob.jpg";

export default function Footer() {
  return (
    <footer className="bg-navy text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
          <div>
            <img src={ciobLogo} alt="Ciob" className="h-6 w-auto" />
            <p className="mt-3 text-sm text-primary-foreground/60 leading-relaxed">
              L'excellence de la cuisson industrielle au service du Maroc. Côté Maroc, fabrique des
              ustensiles de cuisine haut de gamme depuis 1991.
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
                +212 535 729 168
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
  );
}
