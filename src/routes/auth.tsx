import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, ArrowLeft, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Authentification — TITANIC" },
      { name: "description", content: "Connectez-vous ou créez un compte sur TITANIC." },
    ],
  }),
  component: AuthPage,
});

const authSchema = z.object({
  email: z.string().trim().email({ message: "Email invalide" }).max(255),
  password: z
    .string()
    .min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" })
    .max(100),
  displayName: z.string().trim().min(2, { message: "Le nom est trop court" }).max(100).optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.confirmPassword !== undefined && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    honeypot: "", // Bot protection
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (isAdmin) {
        navigate({ to: "/dashboard" });
      } else {
        navigate({ to: "/" });
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Honeypot check
    if (form.honeypot) {
      console.log("Bot detected");
      return;
    }
    
    const validationData = {
      ...form,
      displayName: mode === "register" ? form.displayName : undefined,
      confirmPassword: mode === "register" ? form.confirmPassword : undefined,
    };
    
    const parsed = authSchema.safeParse(validationData);
    
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ 
          email: form.email, 
          password: form.password 
        });
        
        if (error) throw error;
        
        // Immediate check for admin role for better UX
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .eq("role", "admin")
          .maybeSingle();
        
        toast.success("Connexion réussie");
        
        if (roleData) {
          navigate({ to: "/dashboard" });
        } else {
          navigate({ to: "/" });
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { display_name: form.displayName },
          },
        });
        
        if (error) throw error;
        
        toast.success("Compte créé avec succès !");
        setMode("login");
        setForm(prev => ({ ...prev, password: "", confirmPassword: "" }));
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      let message = "Une erreur est survenue lors de l'authentification.";
      
      if (err.message === "Invalid login credentials") {
        message = "Email ou mot de passe incorrect.";
      } else if (err.message.includes("rate limit")) {
        message = "Trop de tentatives. Veuillez réessayer plus tard.";
      } else if (err.message.includes("User already registered")) {
        message = "Cet email est déjà utilisé.";
      } else {
        message = err.message;
      }
      
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 sm:px-8 lg:px-12 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-between items-center">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-navy px-0">
            <Link to="/">
              <ArrowLeft size={16} className="mr-2" />
              Retour à l'accueil
            </Link>
          </Button>
          
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-white/50 px-3 py-1 rounded-full border border-border">
            <ShieldCheck size={14} className="text-green-600" />
            Sécurisé par Supabase
          </div>
        </div>

        <Link
          to="/"
          className="block text-center font-heading text-4xl tracking-wider text-navy mb-8"
        >
          TITANIC
        </Link>
        
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-navy/5 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-40 h-40 rounded-full bg-red-brand/5 blur-3xl" />

          <div className="relative">
            <h1 className="font-heading text-3xl text-navy">
              {mode === "login" ? "Connexion" : "Création de compte"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login"
                ? "Accédez à votre espace pour gérer votre catalogue."
                : "Rejoignez la communauté TITANIC."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {/* Honeypot field - hidden from users */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="honeypot"
                  value={form.honeypot}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {mode === "register" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy ml-1">
                    Nom complet
                  </label>
                  <input
                    name="displayName"
                    type="text"
                    required
                    value={form.displayName}
                    onChange={handleChange}
                    placeholder="Jean Dupont"
                    className={`w-full rounded-lg border ${errors.displayName ? 'border-red-500' : 'border-input'} bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all`}
                  />
                  {errors.displayName && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.displayName}</p>}
                </div>
              )}
              
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy ml-1">
                  Adresse Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="exemple@domaine.com"
                  className={`w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-input'} bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all`}
                />
                {errors.email && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.email}</p>}
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-navy ml-1">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full rounded-lg border ${errors.password ? 'border-red-500' : 'border-input'} bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all`}
                    style={{ paddingLeft: '1rem', paddingRight: '3rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.password}</p>}
              </div>

              {mode === "register" && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-navy ml-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-input'} bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 transition-all`}
                  />
                  {errors.confirmPassword && <p className="text-[10px] text-red-500 mt-1 ml-1">{errors.confirmPassword}</p>}
                </div>
              )}

              {mode === "login" && (
                <div className="text-right">
                  <button type="button" className="text-xs font-medium text-navy hover:underline">
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 inline-flex items-center justify-center rounded-lg bg-red-brand px-5 py-3 text-sm font-bold text-red-brand-foreground hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  mode === "login" ? "Se connecter" : "Créer mon compte"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-center text-sm text-muted-foreground">
                {mode === "login" ? (
                  <>
                    Nouveau chez TITANIC ?{" "}
                    <button
                      onClick={() => {
                        setMode("register");
                        setErrors({});
                      }}
                      className="text-navy font-bold hover:underline"
                    >
                      Créez un compte
                    </button>
                  </>
                ) : (
                  <>
                    Déjà un compte ?{" "}
                    <button
                      onClick={() => {
                        setMode("login");
                        setErrors({});
                      }}
                      className="text-navy font-bold hover:underline"
                    >
                      Connectez-vous
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center space-y-2">
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
          </p>
          <div className="flex justify-center gap-4 text-[10px] font-medium text-navy/40 uppercase tracking-widest">
            <span>© 2026 TITANIC MAROC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
