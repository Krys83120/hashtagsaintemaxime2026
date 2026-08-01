"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Search, Mail, Shield, ShieldOff, Trash2, UserPlus } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "customer";
  status: "active" | "inactive";
  joinedAt: string;
  ordersCount: number;
  totalSpent: number;
}

const defaultUsers: User[] = [
  {
    id: "u1", name: "Admin Principal", email: "admin@hashtagsaintemaxime.fr",
    role: "admin", status: "active", joinedAt: "2026-01-15", ordersCount: 0, totalSpent: 0,
  },
  {
    id: "u2", name: "Marie Dupont", email: "marie.dupont@email.com",
    role: "customer", status: "active", joinedAt: "2026-06-10", ordersCount: 3, totalSpent: 89.5,
  },
  {
    id: "u3", name: "Thomas Martin", email: "thomas.m@email.com",
    role: "customer", status: "active", joinedAt: "2026-06-12", ordersCount: 1, totalSpent: 25,
  },
  {
    id: "u4", name: "Sophie R", email: "sophie.r@email.com",
    role: "customer", status: "inactive", joinedAt: "2026-05-20", ordersCount: 0, totalSpent: 0,
  },
];

export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<User[]>(defaultUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "customer" as const });

  useEffect(() => {
    const saved = localStorage.getItem("sm_admin_users");
    if (saved) {
      try { setUsers(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const saveUsers = () => {
    localStorage.setItem("sm_admin_users", JSON.stringify(users));
  };

  const filtered = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !filterRole || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const addUser = () => {
    if (!newUser.name || !newUser.email) return;
    const user: User = {
      id: `u${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "active",
      joinedAt: new Date().toISOString().split("T")[0],
      ordersCount: 0,
      totalSpent: 0,
    };
    setUsers((prev) => [...prev, user]);
    setNewUser({ name: "", email: "", role: "customer" });
    setShowAdd(false);
    saveUsers();
  };

  const toggleStatus = (id: string) => {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u));
    saveUsers();
  };

  const deleteUser = (id: string) => {
    if (confirm("Supprimer cet utilisateur ?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      saveUsers();
    }
  };

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-purple-100 text-purple-700",
      editor: "bg-blue-100 text-blue-700",
      customer: "bg-sm-cream text-sm-dark",
    };
    return styles[role] || "bg-gray-100 text-gray-700";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sm-dark">👥 Utilisateurs</h1>
            <p className="text-sm-gray">{users.length} utilisateurs enregistrés</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-sm-deep transition-colors">
            <UserPlus className="w-4 h-4" /> Ajouter
          </button>
        </div>

        {/* Add user form */}
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            className="bg-white rounded-2xl p-6 border border-sm-lightgray space-y-4">
            <h3 className="font-semibold text-sm-dark">Nouvel utilisateur</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <input type="text" placeholder="Nom" value={newUser.name}
                onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
              <input type="email" placeholder="Email" value={newUser.email}
                onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
              <select value={newUser.role}
                onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value as any }))}
                className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm bg-white">
                <option value="customer">Client</option>
                <option value="editor">Éditeur</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={addUser}
                className="bg-green-500 text-white font-semibold px-6 py-2 rounded-xl hover:bg-green-600 transition-colors">
                Créer
              </button>
              <button onClick={() => setShowAdd(false)}
                className="bg-sm-lightgray text-sm-dark font-semibold px-6 py-2 rounded-xl hover:bg-sm-gray/20 transition-colors">
                Annuler
              </button>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sm-gray" />
            <input type="text" placeholder="Rechercher..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
          </div>
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm bg-white">
            <option value="">Tous les rôles</option>
            <option value="admin">Admin</option>
            <option value="editor">Éditeur</option>
            <option value="customer">Client</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-sm-lightgray overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sm-cream border-b border-sm-lightgray text-sm-gray text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4">Utilisateur</th>
                  <th className="text-left py-3 px-4">Rôle</th>
                  <th className="text-left py-3 px-4">Inscription</th>
                  <th className="text-left py-3 px-4">Commandes</th>
                  <th className="text-left py-3 px-4">Dépensé</th>
                  <th className="text-left py-3 px-4">Statut</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-sm-lightgray/50 hover:bg-sm-cream/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-sm-cyan/10 flex items-center justify-center text-sm-cyan font-bold text-sm">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm-dark">{u.name}</p>
                          <p className="text-xs text-sm-gray flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${roleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm-gray">{u.joinedAt}</td>
                    <td className="py-3 px-4 text-sm-gray">{u.ordersCount}</td>
                    <td className="py-3 px-4 font-medium">{u.totalSpent.toFixed(2)}€</td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleStatus(u.id)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold ${u.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.status === "active" ? "Actif" : "Inactif"}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => deleteUser(u.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-sm-gray">Aucun utilisateur trouvé.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
