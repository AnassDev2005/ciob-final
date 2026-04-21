import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Loader2, 
  User as UserIcon, 
  Camera, 
  Mail, 
  ArrowLeft, 
  Save, 
  Shield, 
  Clock, 
  Calendar,
  Settings,
  LayoutDashboard,
  LogOut,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, isAdmin, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth" });
      return;
    }

    if (user) {
      fetchProfile();
      setEmail(user.email || "");
    }
  }, [user, authLoading]);

  async function fetchProfile() {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) {
        setDisplayName(data.display_name || "");
        setAvatarUrl(data.avatar_url || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateProfile() {
    if (!user?.id) return;
    try {
      setUpdating(true);
      const { error } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          display_name: displayName,
          avatar_url: avatarUrl,
        });

      if (error) throw error;
      window.dispatchEvent(new Event("profile-updated"));
      toast.success("Profil mis à jour avec succès");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour");
    } finally {
      setUpdating(false);
    }
  }

  async function handleUpdateEmail() {
    try {
      setUpdating(true);
      const { error } = await supabase.auth.updateUser({ email });
      if (error) throw error;
      toast.success("E-mail de confirmation envoyé à votre nouvelle adresse.");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour");
    } finally {
      setUpdating(false);
    }
  }

  async function uploadAvatar(event: any) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) return;

      const file = event.target.files[0];
      if (file.size > 4 * 1024 * 1024) throw new Error("Max 4 Mo.");

      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}/${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const newAvatarUrl = data.publicUrl;
      setAvatarUrl(newAvatarUrl);

      if (user?.id) {
        await supabase.from("profiles").upsert({ id: user.id, avatar_url: newAvatarUrl });
        window.dispatchEvent(new Event("profile-updated"));
      }
      toast.success("Avatar mis à jour");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center bg-surface">
          <Loader2 className="h-10 w-10 animate-spin text-navy" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      
      <main className="flex-1 pb-20">
        {/* Cover Header */}
        <div className="relative h-48 lg:h-64 bg-navy overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8FAFC] to-transparent"></div>
        </div>

        <div className="mx-auto max-w-6xl px-4 -mt-16 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar / Left Column */}
            <aside className="w-full lg:w-80 shrink-0 space-y-6">
              {/* Profile Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60">
                <div className="flex flex-col items-center text-center">
                  <div className="relative group mb-4">
                    <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-slate-100 text-navy text-4xl">
                        {displayName ? displayName[0].toUpperCase() : user?.email?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-1 right-1 p-2.5 bg-red-brand text-white rounded-full shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
                    >
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                      <input type="file" id="avatar-upload" accept="image/*" onChange={uploadAvatar} disabled={uploading} className="hidden" />
                    </label>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-widest font-bold">Max 4 Mo</p>
                  
                  <h2 className="text-xl font-bold text-navy truncate w-full px-2">
                    {displayName || "Utilisateur"}
                  </h2>
                  <p className="text-sm text-slate-500 truncate w-full px-4 mb-4">
                    {user?.email}
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-navy/10 text-navy border border-navy/20">
                        <Shield size={10} /> Admin
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                      Compte Actif
                    </span>
                  </div>

                  <Separator className="mb-6 opacity-60" />

                  <div className="w-full space-y-1">
                    <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:text-navy hover:bg-slate-50 font-medium" asChild>
                      <Link to="/profile">
                        <UserIcon size={18} className="text-slate-400" /> Mon Profil
                      </Link>
                    </Button>
                    {isAdmin && (
                      <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:text-navy hover:bg-slate-50 font-medium" asChild>
                        <Link to="/dashboard">
                          <LayoutDashboard size={18} className="text-slate-400" /> Dashboard
                        </Link>
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 font-medium"
                      onClick={() => signOut()}
                    >
                      <LogOut size={18} className="text-red-400" /> Déconnexion
                    </Button>
                  </div>
                </div>
              </div>

              {/* Account Stats */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/60 hidden lg:block">
                <h3 className="text-sm font-bold text-navy uppercase tracking-widest mb-4">Détails Compte</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Membre depuis</p>
                      <p className="text-sm font-semibold text-navy">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                      <Clock size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Dernière connexion</p>
                      <p className="text-sm font-semibold text-navy">
                        {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('fr-FR') : "Aujourd'hui"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content Column */}
            <div className="flex-1 space-y-6">
              {/* Back Button for Mobile */}
              <div className="lg:hidden flex mb-2">
                <Button variant="ghost" size="sm" className="gap-2 text-slate-500" onClick={() => window.history.back()}>
                  <ArrowLeft size={16} /> Retour
                </Button>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="border-b border-slate-100 px-8 py-6">
                  <h2 className="text-xl font-bold text-navy flex items-center gap-2">
                    <Settings size={20} className="text-slate-400" /> Paramètres du profil
                  </h2>
                  <p className="text-sm text-slate-500">Mettez à jour vos informations publiques</p>
                </div>

                <div className="p-8 space-y-8">
                  {/* Public Profile Form */}
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="displayName" className="text-sm font-bold text-slate-700">Nom d'affichage</Label>
                      <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                          id="displayName"
                          className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Comment souhaitez-vous être appelé ?"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleUpdateProfile}
                      disabled={updating}
                      className="h-12 bg-navy hover:bg-navy-light text-white rounded-xl shadow-md shadow-navy/10 flex items-center gap-2 px-8 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {updating ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                      Enregistrer les modifications
                    </Button>
                  </div>

                  <Separator className="opacity-60" />

                  {/* Account Settings Form */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-navy">Sécurité et Compte</h3>
                      <p className="text-xs text-slate-500">Gérez votre adresse e-mail et vos accès</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-bold text-slate-700">Adresse e-mail</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10 h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-3 mt-2">
                        <Clock size={16} className="text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-[11px] text-amber-800 leading-normal">
                          Note : Le changement d'e-mail nécessite une validation sur votre nouvelle adresse pour être effectif.
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleUpdateEmail}
                      disabled={updating || email === user?.email}
                      className="h-12 border-navy/20 text-navy hover:bg-navy/5 rounded-xl flex items-center gap-2 px-8"
                    >
                      {updating ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                      Mettre à jour l'e-mail
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
