"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Search, Filter, Eye, Package, Truck, CheckCircle, Clock, XCircle, Download } from "lucide-react";

interface Order {
  id: string;
  customer: string;
  email: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
  shippingAddress: string;
  trackingNumber?: string;
  notes?: string;
}

const defaultOrders: Order[] = [
  {
    id: "ORD-2026-001", customer: "Marie Dupont", email: "marie@email.com",
    items: [{ name: "T-Shirt #SAINTEMAXIME", qty: 2, price: 25 }],
    total: 50, status: "delivered", date: "2026-07-15",
    shippingAddress: "12 Rue de la Plage, 83120 Sainte-Maxime", trackingNumber: "TRK123456",
  },
  {
    id: "ORD-2026-002", customer: "Thomas Martin", email: "thomas@email.com",
    items: [{ name: "Casquette Trucker", qty: 1, price: 20 }, { name: "Mug Blanc", qty: 1, price: 15 }],
    total: 35, status: "shipped", date: "2026-07-18",
    shippingAddress: "45 Avenue du Golfe, 83120 Sainte-Maxime", trackingNumber: "TRK789012",
  },
  {
    id: "ORD-2026-003", customer: "Sophie R", email: "sophie@email.com",
    items: [{ name: "Serviette de Plage", qty: 1, price: 35 }],
    total: 35, status: "processing", date: "2026-07-20",
    shippingAddress: "8 Boulevard des Pins, 83120 Sainte-Maxime",
  },
  {
    id: "ORD-2026-004", customer: "Paul D", email: "paul@email.com",
    items: [{ name: "Coque Téléphone", qty: 1, price: 22 }],
    total: 22, status: "pending", date: "2026-07-21",
    shippingAddress: "3 Place du Marché, 83120 Sainte-Maxime",
  },
  {
    id: "ORD-2026-005", customer: "Julie M", email: "julie@email.com",
    items: [{ name: "Bouteille Sport", qty: 1, price: 27 }],
    total: 27, status: "cancelled", date: "2026-07-10",
    shippingAddress: "22 Route de la Corniche, 83120 Sainte-Maxime",
    notes: "Client a annulé — changement d'avis",
  },
];

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  processing: { label: "En préparation", color: "bg-blue-100 text-blue-700", icon: Package },
  shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<Order[]>(defaultOrders);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewingOrder, setViewingOrder] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sm_admin_orders");
    if (saved) {
      try { setOrders(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const saveOrders = () => {
    localStorage.setItem("sm_admin_orders", JSON.stringify(orders));
  };

  const filtered = orders.filter((o) => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    saveOrders();
  };

  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === "pending" || o.status === "processing").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header + stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sm-dark">🛒 Commandes</h1>
            <p className="text-sm-gray">{orders.length} commandes · {pendingCount} en cours · {revenue.toFixed(2)}€ de CA</p>
          </div>
          <button className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-sm-deep transition-colors">
            <Download className="w-4 h-4" /> Exporter CSV
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => {
            const count = orders.filter((o) => o.status === s).length;
            const cfg = statusConfig[s];
            return (
              <div key={s} className="bg-white rounded-2xl p-4 border border-sm-lightgray text-center">
                <p className="text-2xl font-bold text-sm-dark">{count}</p>
                <p className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${cfg.color}`}>{cfg.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sm-gray" />
            <input type="text" placeholder="Rechercher par N° ou client..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-sm-lightgray focus:border-sm-cyan outline-none text-sm bg-white">
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="processing">En préparation</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
          </select>
        </div>

        {/* Orders list */}
        <div className="space-y-3">
          {filtered.map((order) => {
            const cfg = statusConfig[order.status];
            const Icon = cfg.icon;
            const isOpen = viewingOrder === order.id;
            return (
              <div key={order.id} className={`bg-white rounded-2xl border transition-all ${isOpen ? "border-sm-cyan shadow-md" : "border-sm-lightgray shadow-sm"}`}>
                <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setViewingOrder(isOpen ? null : order.id)}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cfg.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm-dark">{order.id}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-sm-gray">{order.customer} · {order.items.length} article(s) · {order.total.toFixed(2)}€ · {order.date}</p>
                  </div>
                  <Eye className="w-4 h-4 text-sm-gray" />
                </div>

                {isOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                    <div className="px-4 pb-4 pt-0 border-t border-sm-lightgray/50 space-y-4">
                      {/* Items */}
                      <div className="pt-4">
                        <p className="text-xs font-bold text-sm-gray uppercase tracking-wider mb-2">Articles</p>
                        <div className="space-y-2">
                          {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center bg-sm-cream rounded-xl px-4 py-2">
                              <span className="text-sm">{item.name} × {item.qty}</span>
                              <span className="text-sm font-medium">{(item.qty * item.price).toFixed(2)}€</span>
                            </div>
                          ))}
                          <div className="flex justify-between items-center px-4 pt-2">
                            <span className="font-bold text-sm-dark">Total</span>
                            <span className="font-bold text-sm-cyan text-lg">{order.total.toFixed(2)}€</span>
                          </div>
                        </div>
                      </div>

                      {/* Shipping */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold text-sm-gray uppercase tracking-wider mb-1">Adresse de livraison</p>
                          <p className="text-sm text-sm-dark bg-sm-cream rounded-xl px-4 py-3">{order.shippingAddress}</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-sm-gray uppercase tracking-wider mb-1">Contact</p>
                          <p className="text-sm text-sm-dark bg-sm-cream rounded-xl px-4 py-3">{order.customer}<br/>{order.email}</p>
                        </div>
                      </div>

                      {order.trackingNumber && (
                        <div>
                          <p className="text-xs font-bold text-sm-gray uppercase tracking-wider mb-1">Numéro de suivi</p>
                          <p className="text-sm font-mono bg-sm-cream rounded-xl px-4 py-2">{order.trackingNumber}</p>
                        </div>
                      )}

                      {order.notes && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                          📝 {order.notes}
                        </div>
                      )}

                      {/* Status actions */}
                      <div>
                        <p className="text-xs font-bold text-sm-gray uppercase tracking-wider mb-2">Changer le statut</p>
                        <div className="flex flex-wrap gap-2">
                          {(["pending", "processing", "shipped", "delivered", "cancelled"] as const).map((s) => (
                            <button key={s} onClick={() => updateStatus(order.id, s)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                order.status === s
                                  ? `${statusConfig[s].color} ring-2 ring-offset-1 ring-sm-cyan`
                                  : "bg-white border border-sm-lightgray text-sm-gray hover:border-sm-cyan"
                              }`}>
                              {statusConfig[s].label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray">
            <Package className="w-12 h-12 text-sm-gray mx-auto mb-3" />
            <p className="text-sm-gray">Aucune commande trouvée.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
