"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Search, Mail, Trash2, UserPlus, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface AdminAccount {
  id: string;
  email: string;
  fullName: string | null;
  role: "superadmin" | "admin" | "editor";
  active: boolean;
  createdAt: string;
}

interface Customer {
  name: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: string;
}

export default function AdminUtilisateursPage() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: "", password: "", fullName: "", role: "editor" as "admin" | "editor" | "superadmin" });
  const supabase = createClient();

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);

    const { data: adminRows, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: true });

    if (adminError) {
      setError("Erreur de chargement des admins : " + adminError.message);
    } else {
      setAdmins((adminRows || []).map((r: any) => ({
        id: r.id, email: r.email, fullName: r.full_name, role: r.role, active: r.active, createdAt: r.created_at,
      })));
    }

    const { data: orderRows } = await supabase.from("orders").select("customer_name, customer_email, total, created_at");
    const byEmail: Record<string, Customer> = {};
    (orderRows || []).forEach((o: any) => {
      if (!byEmail[o.customer_email]) {
        byEmail[o.customer_email] = { name: o.customer_name, email: o.customer_email, ordersCount: 0, totalSpent: 0, lastOrderAt: o.created_at };
      }
      byEmail[o.customer_email].ordersCount += 1;
      byEmail[o.customer_email].totalSpent += Number(o.total);
      if (o.created_at > byEmail[o.customer_email].lastOrderAt) byEmail[o.customer_email].lastOrderAt = o.created_at;
    });
    setCustomers(Object.values(byEmail));

    setLoading(false);
  };

  const filteredAdmins = admins.filter((a) =>
    a.email.toLowerCase().includes(search.toLowerCase()) || (a.fullName || "").toLowerCase().includes(search.toLowerCase())
  );
  const filteredCustomers = customers.filter((c) =>
    c.email.toLowerCase().includes(search.toLowerCase()) || c.name.toLowerCase().includes(search.toLowerCase())
  );

  const createAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password) return;
    setCreating(true);
    setError("");

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAdmin),
    });
    const result = await res.json();

    setCreating(false);

    if (!res.ok) {
      setError(result.error || "Erreur lors de la création.");
      return;
    }

    setNewAdmin({ email: "", password: "", fullName: "", role: "editor" });
    setShowAdd(false);
    loadAll();
  };

  const deleteAdmin = async (id: string) => {
    if (!confirm("Supprimer ce compte admin ? Il perdra tout accès immédiatement.")) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || "Erreur lors de la suppression.");
      return;
    }
    loadAll();
  };

  const toggleActive = async (a: AdminAccount) => {
    const { error: updateError } = await supabase.from("admin_users").update({ active: !a.active }).eq("id", a.id);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    loadAll();
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      superadmin: "bg-purple-100 text-purple-700",
      admin: "bg-blue-100 text-blue-700",
      editor: "bg-sm-cream text-sm-dark",
    };
    return styles[role] || "bg-gray-100 text-gray-700";
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sm-dark">👥 Utilisateurs</h1>
            <p className="text-sm-gray">{admins.length} comptes admin · {customers.length} clients ayant commandé</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-sm-deep transition-colors">
            <UserPlus className="w-4 h-4" /> Ajouter un admin
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">⚠️ {error}</div>
        )}

        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="bg-white rounded-2xl p-6 border border-sm-lightgray space-y-4">
            <h3 className="font-semibold text-sm-dark">Nouveau compte admin</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <input type="text" placeholder="Nom complet" value={newAdmin.fullName}
                onChange={(e) => setNewAdmin((p) => ({ ...p, fullName: e.target.value }))}
                className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
              <input type="email" placeholder="Email" value={newAdmin.email}
                onChange={(e) => setNewAdmin((p) => ({ ...p, email: e.target.value }))}
                className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
              <input type="password" placeholder="Mot de passe (8+ caractères)" value={newAdmin.password}
                onChange={(e) => setNewAdmin((p) => ({ ...p, password: e.target.value }))}
                className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
              <select value={newAdmin.role}
                onChange={(e) => setNewAdmin((p) => ({ ...p, role: e.target.value as any }))}
                className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm bg-white">
                <option value="editor">Éditeur</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={createAdmin} disabled={creating}
                className="bg-green-500 text-white font-semibold px-6 py-2 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-60">
                {creating ? "Création..." : "Créer"}
              </button>
              <button onClick={() => setShowAdd(false)}
                className="bg-sm-lightgray text-sm-dark font-semibold px-6 py-2 rounded-xl hover:bg-sm-gray/20 transition-colors">
                Annuler
              </button>
            </div>
          </motion.div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sm-gray" />
          <input type="text" placeholder="Rechercher..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
        </div>

        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray text-sm-gray">
            Chargement...
          </div>
        )}

        {/* Comptes admin */}
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-sm-dark mb-3">
            <ShieldCheck className="w-5 h-5 text-sm-cyan" /> Comptes admin
          </h2>
          <div className="bg-white rounded-2xl border border-sm-lightgray overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sm-cream border-b border-sm-lightgray text-sm-gray text-xs uppercase tracking-wider">
                    <th className="text-left py-3 px-4">Utilisateur</th>
                    <th className="text-left py-3 px-4">Rôle</th>
                    <th className="text-left py-3 px-4">Inscription</th>
                    <th className="text-left py-3 px-4">Statut</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((a) => (
                    <tr key={a.id} className="border-b border-sm-lightgray/50 hover:bg-sm-cream/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-sm-cyan/10 flex items-center justify-center text-sm-cyan font-bold text-sm">
                            {(a.fullName || a.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm-dark">{a.fullName || "—"}</p>
                            <p className="text-xs text-sm-gray flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {a.email}{a.id === currentUserId && " (toi)"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${roleBadge(a.role)}`}>{a.role}</span>
                      </td>
                      <td className="py-3 px-4 text-sm-gray">{new Date(a.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => toggleActive(a)}
                          className={`px-2 py-1 rounded-lg text-xs font-bold ${a.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {a.active ? "Actif" : "Inactif"}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        {a.id !== currentUserId && (
                          <button onClick={() => deleteAdmin(a.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loading && filteredAdmins.length === 0 && (
              <div className="p-12 text-center text-sm-gray">Aucun compte admin trouvé.</div>
            )}
          </div>
        </div>

        {/* Clients (calculés depuis les commandes) */}
        <div>
          <h2 className="text-lg font-bold text-sm-dark mb-1">🛍️ Clients</h2>
          <p className="text-xs text-sm-gray mb-3">Calculé automatiquement à partir des commandes (pas de comptes clients sur le site pour l'instant).</p>
          <div className="bg-white rounded-2xl border border-sm-lightgray overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-sm-cream border-b border-sm-lightgray text-sm-gray text-xs uppercase tracking-wider">
                    <th className="text-left py-3 px-4">Client</th>
                    <th className="text-left py-3 px-4">Commandes</th>
                    <th className="text-left py-3 px-4">Dépensé</th>
                    <th className="text-left py-3 px-4">Dernière commande</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((c) => (
                    <tr key={c.email} className="border-b border-sm-lightgray/50 hover:bg-sm-cream/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-medium text-sm-dark">{c.name}</p>
                        <p className="text-xs text-sm-gray flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</p>
                      </td>
                      <td className="py-3 px-4 text-sm-gray">{c.ordersCount}</td>
                      <td className="py-3 px-4 font-medium">{c.totalSpent.toFixed(2)}€</td>
                      <td className="py-3 px-4 text-sm-gray">{new Date(c.lastOrderAt).toLocaleDateString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!loading && filteredCustomers.length === 0 && (
              <div className="p-12 text-center text-sm-gray">Aucun client pour l'instant — les commandes n'ont pas encore été branchées à un système de paiement.</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
