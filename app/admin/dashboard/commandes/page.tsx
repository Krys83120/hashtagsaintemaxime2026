"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { motion } from "framer-motion";
import { Search, Filter, Eye, Package, Truck, CheckCircle, Clock, XCircle, Download, Trash2, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Order {
  id: string; // UUID Supabase
  orderNumber: string;
  customer: string;
  email: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  date: string;
  shippingAddress: string;
  trackingNumber?: string;
  carrier?: string;
  notes?: string;
}

function fromDbRow(row: any): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customer: row.customer_name,
    email: row.customer_email,
    items: row.items || [],
    total: Number(row.total),
    status: row.status,
    date: row.created_at,
    shippingAddress: row.customer_address?.formatted || "",
    trackingNumber: row.tracking_number || undefined,
    carrier: row.carrier || undefined,
    notes: row.notes || undefined,
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  paid: { label: "Payée", color: "bg-blue-100 text-blue-700", icon: Package },
  processing: { label: "En préparation", color: "bg-blue-100 text-blue-700", icon: Package },
  shipped: { label: "Expédiée", color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered: { label: "Livrée", color: "bg-green-100 text-green-700", icon: CheckCircle },
  cancelled: { label: "Annulée", color: "bg-red-100 text-red-700", icon: XCircle },
  refunded: { label: "Remboursée", color: "bg-gray-100 text-gray-700", icon: XCircle },
};

export default function AdminCommandesPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewingOrder, setViewingOrder] = useState<string | null>(null);
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, { number: string; carrier: string }>>({});
  const [sendingShipEmail, setSendingShipEmail] = useState<string | null>(null);
  const [sendingReviewRequest, setSendingReviewRequest] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError("Erreur de chargement : " + loadError.message);
    } else {
      setOrders((data || []).map(fromDbRow));
    }
    setLoading(false);
  };

  const filtered = orders.filter((o) => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: id, status }),
    });
    if (!res.ok) {
      const result = await res.json();
      setError("Erreur de mise à jour : " + (result.error || ""));
      loadOrders();
    }
  };

  const markShippedWithTracking = async (order: Order) => {
    const draft = trackingDrafts[order.id] || { number: order.trackingNumber || "", carrier: order.carrier || "Colissimo" };
    if (!draft.number.trim()) {
      setError("Merci de renseigner un numéro de suivi.");
      return;
    }
    setSendingShipEmail(order.id);
    setError("");

    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id, status: "shipped", trackingNumber: draft.number.trim(), carrier: draft.carrier.trim() }),
    });
    const result = await res.json();
    setSendingShipEmail(null);

    if (!res.ok) {
      setError(result.error || "Erreur lors de l'expédition.");
      return;
    }
    loadOrders();
  };

  const sendReviewRequest = async (order: Order) => {
    setSendingReviewRequest(order.id);
    setError("");

    const res = await fetch("/api/admin/orders/send-review-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    const result = await res.json();
    setSendingReviewRequest(null);

    if (!res.ok) {
      setError(result.error || "Erreur lors de l'envoi de la demande d'avis.");
      return;
    }
    if (result.alreadyReviewed) {
      alert("✅ Ce client a déjà évalué tous les articles de cette commande — rien à demander de plus !");
      return;
    }
    alert(`✅ Demande d'avis envoyée pour ${result.itemsSent} article(s) sur ${result.totalItems}.`);
  };

  const deleteOrder = async (order: Order) => {
    if (!confirm(`Supprimer définitivement la commande ${order.orderNumber} ?`)) return;
    const res = await fetch("/api/admin/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.id }),
    });
    const result = await res.json();
    if (!res.ok) {
      setError(result.error || "Erreur lors de la suppression.");
      return;
    }
    setOrders((prev) => prev.filter((o) => o.id !== order.id));
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

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">⚠️ {error}</div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray text-sm-gray">
            Chargement des commandes...
          </div>
        )}

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
                      <span className="font-semibold text-sm-dark">{order.orderNumber}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                    </div>
                    <p className="text-xs text-sm-gray">{order.customer} · {order.items.length} article(s) · {order.total.toFixed(2)}€ · {new Date(order.date).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <Eye className="w-4 h-4 text-sm-gray" />
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteOrder(order); }}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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

                      <div className="p-4 bg-sm-cream rounded-xl space-y-3">
                        <p className="text-xs font-bold text-sm-gray uppercase tracking-wider">Expédition & suivi</p>
                        {order.trackingNumber && (
                          <p className="text-sm text-sm-dark">
                            Déjà renseigné : <span className="font-mono font-medium">{order.trackingNumber}</span>
                            {order.carrier && ` (${order.carrier})`}
                          </p>
                        )}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            placeholder="Numéro de suivi"
                            defaultValue={order.trackingNumber || ""}
                            onChange={(e) =>
                              setTrackingDrafts((prev) => ({
                                ...prev,
                                [order.id]: { number: e.target.value, carrier: prev[order.id]?.carrier ?? order.carrier ?? "Colissimo" },
                              }))
                            }
                            className="flex-1 px-3 py-2 rounded-lg border border-sm-lightgray focus:border-sm-cyan outline-none text-sm"
                          />
                          <select
                            defaultValue={order.carrier || "Colissimo"}
                            onChange={(e) =>
                              setTrackingDrafts((prev) => ({
                                ...prev,
                                [order.id]: { number: prev[order.id]?.number ?? order.trackingNumber ?? "", carrier: e.target.value },
                              }))
                            }
                            className="px-3 py-2 rounded-lg border border-sm-lightgray focus:border-sm-cyan outline-none text-sm bg-white"
                          >
                            <option value="Colissimo">Colissimo</option>
                            <option value="Chronopost">Chronopost</option>
                            <option value="Mondial Relay">Mondial Relay</option>
                            <option value="UPS">UPS</option>
                            <option value="DHL">DHL</option>
                          </select>
                          <button
                            onClick={() => markShippedWithTracking(order)}
                            disabled={sendingShipEmail === order.id}
                            className="flex items-center justify-center gap-2 bg-sm-cyan text-white font-semibold px-4 py-2 rounded-lg hover:bg-sm-deep transition-colors text-sm disabled:opacity-60 whitespace-nowrap"
                          >
                            <Send className="w-4 h-4" />
                            {sendingShipEmail === order.id ? "Envoi..." : "Expédier + email"}
                          </button>
                        </div>
                        <p className="text-xs text-sm-gray">
                          Enregistre le numéro, passe la commande en "Expédiée" et envoie un email au client avec un lien de suivi.
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-sm-lightgray/50">
                        <button
                          onClick={() => sendReviewRequest(order)}
                          disabled={sendingReviewRequest === order.id}
                          className="flex items-center gap-2 bg-yellow-400 text-sm-dark font-semibold px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors text-sm disabled:opacity-60"
                        >
                          ⭐ {sendingReviewRequest === order.id ? "Envoi..." : "Demander un avis"}
                        </button>
                        <p className="text-xs text-sm-gray mt-1">
                          Envoie un rappel amical pour évaluer les produits — n'envoie que pour les articles pas encore évalués par ce client (si son compte est connu).
                        </p>
                      </div>

                      {order.notes && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
                          📝 {order.notes}
                        </div>
                      )}

                      {/* Status actions */}
                      <div>
                        <p className="text-xs font-bold text-sm-gray uppercase tracking-wider mb-2">Changer le statut</p>
                        <div className="flex flex-wrap gap-2">
                          {(["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"] as const).map((s) => (
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

        {!loading && filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray">
            <Package className="w-12 h-12 text-sm-gray mx-auto mb-3" />
            <p className="text-sm-gray">Aucune commande trouvée.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
