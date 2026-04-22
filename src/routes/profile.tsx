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
  Shield, 
  Calendar,
  Settings,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      toast.success("Profil mis à jour");
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
      toast.success("Lien de confirmation envoyé");
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
      if (file.size > 2 * 1024 * 1024) throw new Error("Image trop lourde (max 2 Mo)");

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
      toast.success("Photo mise à jour");
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
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />
      
      <main className="flex-1 py-10 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-slate-100 text-slate-600 text-2xl">
                    {displayName ? displayName[0].toUpperCase() : user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 p-2 bg-white text-slate-600 rounded-full shadow-md border cursor-pointer hover:bg-slate-50 transition-colors"
                  title="Changer de photo"
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  <input type="file" id="avatar-upload" accept="image/*" onChange={uploadAvatar} disabled={uploading} className="hidden" />
                </label>
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {displayName || "Utilisateur"}
                </h1>
                <div className="flex flex-wrap gap-2 items-center text-slate-500">
                  <span className="text-sm">{user?.email}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300 hidden md:block" />
                  <div className="flex gap-2">
                    {isAdmin && (
                      <Badge variant="secondary" className="bg-navy/5 text-navy border-navy/10 gap-1 px-2 py-0">
                        <Shield size={10} /> Administrateur
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-emerald-600 border-emerald-100 bg-emerald-50/50 gap-1 px-2 py-0">
                      Compte actif
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {isAdmin && (
                <Button variant="outline" size="sm" className="gap-2" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-2" onClick={() => signOut()}>
                <LogOut size={16} /> Déconnexion
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar info */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-sm font-semibold uppercase tracking-wider text-slate-400">À propos</CardTitle>
                </CardHeader>
                <CardContent className="px-0 space-y-4">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Calendar size={18} className="text-slate-400" />
                    <div className="text-sm">
                      <p className="font-medium">Membre depuis</p>
                      <p className="text-slate-500">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : "—"}
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-slate-100" />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500">Rôles et permissions</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm py-1">
                        <span className="text-slate-600">Accès catalogue</span>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200">Public</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm py-1">
                        <span className="text-slate-600">Accès recettes</span>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-400 border-slate-200">Public</Badge>
                      </div>
                      {isAdmin && (
                        <div className="flex items-center justify-between text-sm py-1">
                          <span className="text-slate-600">Gestion site</span>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold text-navy border-navy/20">Full Access</Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main forms */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg">Informations du profil</CardTitle>
                  <CardDescription>Ces informations seront visibles par les autres membres.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nom d'affichage</Label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input
                        id="displayName"
                        className="pl-10 h-10"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Votre nom ou pseudo"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 border-t px-6 py-3 flex justify-end">
                  <Button onClick={handleUpdateProfile} disabled={updating} size="sm">
                    {updating && <Loader2 size={14} className="mr-2 animate-spin" />}
                    Enregistrer les modifications
                  </Button>
                </CardFooter>
              </Card>

              <Card className="shadow-sm border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg text-slate-900">Sécurité du compte</CardTitle>
                  <CardDescription>Gérez vos identifiants de connexion.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse e-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <Input
                        id="email"
                        type="email"
                        className="pl-10 h-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    {email !== user?.email && (
                      <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 rounded-md text-xs border border-blue-100 mt-2">
                        <Info size={14} className="mt-0.5 shrink-0" />
                        <p>Une confirmation sera envoyée à votre nouvelle adresse pour valider le changement.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 border-t px-6 py-3 flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={handleUpdateEmail} 
                    disabled={updating || email === user?.email}
                    size="sm"
                  >
                    {updating && <Loader2 size={14} className="mr-2 animate-spin" />}
                    Mettre à jour l'e-mail
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
