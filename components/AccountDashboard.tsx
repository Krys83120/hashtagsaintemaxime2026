"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, MapPin, Lock, Package, LogOut, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

interface Order {
  id: string;
  order_number: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: string;
  created_at: string;
}

interface AccountDashboardProps {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  address: { line1?: string; postalCode?: string; city?: string };
  orders: Order[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "En attente de paiement", color: "bg-yellow-100 text-yellow-700" },
  paid: { label: "Payée", color: "bg-blue-100 text-blue-700" },
  processing: { label: "En préparation", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-700" },
  refunded: { label: "Remboursée", color: "bg-gray-100 text-gray-700" },
};

export default function AccountDashboard({ email, fullName, phone, address, orders }: AccountDashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"profil" | "adresse" | "securite" | "commandes">("profil");
  const supabase = createClient();

  // Profil
  const [name, setName] = useState(fullName);
  const [phoneNumber, setPhoneNumber] = useState(phone);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  // Adresse
  const [addr, setAddr] = useState({ line1: address.line1 || "", postalCode: address.postalCode || "", city: address.city || "" });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressMsg, setAddressMsg] = useState("");

  // Email
  const [newEmail, setNewEmail] = useState(email);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");

  // Mot de passe
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg("");
    const { error } = await supabase.auth.updateUser({ data: { full_name: name, phone: phoneNumber } });
    setSavingProfile(false);
    setProfileMsg(error ? "Erreur : " + error.message : "✅ Profil mis à jour.");
  };

  const saveAddress = async () => {
    setSavingAddress(true);
    setAddressMsg("");
    const { error } = await supabase.auth.updateUser({ data: { address: addr } });
    setSavingAddress(false);
    setAddressMsg(error ? "Erreur : " + error.message : "✅ Adresse mise à jour.");
  };

  const saveEmail = async () => {
    setSavingEmail(true);
    setEmailMsg("");
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setSavingEmail(false);
    setEmailMsg(error ? "Erreur : " + error.message : "✅ Un email de confirmation a été envoyé à ta nouvelle adresse.");
  };

  const savePassword = async () => {
    setPasswordMsg("");
    if (newPassword.length < 8) {
      setPasswordMsg("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      setPasswordMsg("Erreur : " + error.message);
    } else {
      setPasswordMsg("✅ Mot de passe modifié.");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const tabs = [
    { id: "profil" as const, label: "Profil", icon: User },
    { id: "adresse" as const, label: "Adresse", icon: MapPin },
    { id: "securite" as const, label: "Sécurité", icon: Lock },
    { id: "commandes" as const, label: "Mes commandes", icon: Package },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-sm-dark">Mon compte</h1>
          <p className="text-sm-gray">{email}</p>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-sm-gray hover:text-sm-coral transition-colors text-sm font-medium">
          <LogOut className="w-4 h-4" /> Déconnexion
        </button>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? "bg-sm-cyan text-white" : "bg-white border border-sm-lightgray text-sm-gray hover:border-sm-cyan"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "profil" && (
        <div className="bg-white rounded-2xl border border-sm-lightgray p-6 space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Nom complet</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Téléphone</label>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none" />
          </div>
          {profileMsg && <p className="text-sm">{profileMsg}</p>}
          <button onClick={saveProfile} disabled={savingProfile}
            className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-sm-deep transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" /> {savingProfile ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      )}

      {tab === "adresse" && (
        <div className="bg-white rounded-2xl border border-sm-lightgray p-6 space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-sm-dark mb-1">Adresse</label>
            <input type="text" value={addr.line1} onChange={(e) => setAddr((p) => ({ ...p, line1: e.target.value }))}
              placeholder="N° et nom de rue"
              className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-sm-dark mb-1">Code postal</label>
              <input type="text" value={addr.postalCode} onChange={(e) => setAddr((p) => ({ ...p, postalCode: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-sm-dark mb-1">Ville</label>
              <input type="text" value={addr.city} onChange={(e) => setAddr((p) => ({ ...p, city: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none" />
            </div>
          </div>
          {addressMsg && <p className="text-sm">{addressMsg}</p>}
          <button onClick={saveAddress} disabled={savingAddress}
            className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-sm-deep transition-colors disabled:opacity-60">
            <Save className="w-4 h-4" /> {savingAddress ? "Sauvegarde..." : "Sauvegarder"}
          </button>
          <p className="text-xs text-sm-gray">Cette adresse pourra pré-remplir tes futures commandes.</p>
        </div>
      )}

      {tab === "securite" && (
        <div className="space-y-6 max-w-md">
          <div className="bg-white rounded-2xl border border-sm-lightgray p-6 space-y-4">
            <h3 className="font-semibold text-sm-dark">Adresse email</h3>
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none" />
            {emailMsg && <p className="text-sm">{emailMsg}</p>}
            <button onClick={saveEmail} disabled={savingEmail || newEmail === email}
              className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-sm-deep transition-colors disabled:opacity-60">
              <Save className="w-4 h-4" /> {savingEmail ? "Envoi..." : "Changer d'email"}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-sm-lightgray p-6 space-y-4">
            <h3 className="font-semibold text-sm-dark">Mot de passe</h3>
            <div>
              <label className="block text-sm font-medium text-sm-dark mb-1">Nouveau mot de passe</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-sm-dark mb-1">Confirmer le mot de passe</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none" />
            </div>
            {passwordMsg && <p className="text-sm">{passwordMsg}</p>}
            <button onClick={savePassword} disabled={savingPassword}
              className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-sm-deep transition-colors disabled:opacity-60">
              <Save className="w-4 h-4" /> {savingPassword ? "Sauvegarde..." : "Changer le mot de passe"}
            </button>
          </div>
        </div>
      )}

      {tab === "commandes" && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-sm-lightgray p-12 text-center text-sm-gray">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
              Tu n'as pas encore passé de commande.
            </div>
          ) : (
            orders.map((order) => {
              const cfg = statusLabels[order.status] || { label: order.status, color: "bg-gray-100 text-gray-700" };
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-sm-lightgray p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm-dark">{order.order_number}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <p className="text-xs text-sm-gray mb-3">{new Date(order.created_at).toLocaleDateString("fr-FR")}</p>
                  <div className="space-y-1 mb-3">
                    {(order.items || []).map((item, i) => (
                      <p key={i} className="text-sm text-sm-dark">
                        {item.name} × {item.qty}
                      </p>
                    ))}
                  </div>
                  <p className="font-bold text-sm-cyan text-right">{formatPrice(order.total)}</p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
