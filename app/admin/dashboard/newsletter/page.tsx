"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Mail, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
  active: boolean;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });

    setSubscribers((data || []).map((s: any) => ({
      id: s.id, email: s.email, subscribedAt: s.subscribed_at, active: s.active,
    })));
    setLoading(false);
  };

  const exportCsv = () => {
    const rows = ["email,date_inscription", ...subscribers.map((s) => `${s.email},${new Date(s.subscribedAt).toLocaleDateString("fr-FR")}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abonnes-newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-sm-dark flex items-center gap-2">
              <Mail className="w-7 h-7 text-sm-cyan" /> Newsletter
            </h1>
            <p className="text-sm-gray">{subscribers.length} abonnés</p>
          </div>
          <button onClick={exportCsv} disabled={subscribers.length === 0}
            className="flex items-center gap-2 bg-sm-cyan text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-sm-deep transition-colors disabled:opacity-60">
            <Download className="w-4 h-4" /> Exporter en CSV
          </button>
        </div>

        {loading && <div className="bg-white rounded-2xl p-12 text-center border border-sm-lightgray text-sm-gray">Chargement...</div>}

        <div className="bg-white rounded-2xl border border-sm-lightgray overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-sm-cream border-b border-sm-lightgray text-sm-gray text-xs uppercase tracking-wider">
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Inscrit le</th>
                  <th className="text-left py-3 px-4">Statut</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-sm-lightgray/50 hover:bg-sm-cream/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-sm-dark">{s.email}</td>
                    <td className="py-3 px-4 text-sm-gray">{new Date(s.subscribedAt).toLocaleDateString("fr-FR")}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                        {s.active ? "Actif" : "Désinscrit"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && subscribers.length === 0 && (
            <div className="p-12 text-center text-sm-gray">Aucun abonné pour l'instant.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
