"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search as SearchIcon, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface SearchResult {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results || []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const goToProduct = (slug: string) => {
    onClose();
    router.push(`/produit/${slug}/`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      onClose();
      router.push(`/boutique/?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-[90] bg-white shadow-xl"
          >
            <div className="max-w-2xl mx-auto px-4 py-6">
              <form onSubmit={handleSubmit} className="flex items-center gap-3">
                <SearchIcon className="w-5 h-5 text-sm-gray flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="flex-1 text-lg outline-none text-sm-dark placeholder:text-sm-gray"
                />
                <button type="button" onClick={onClose} className="p-2 hover:bg-sm-cream rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </form>

              {query.trim().length >= 2 && (
                <div className="mt-4 max-h-96 overflow-y-auto">
                  {loading && <p className="text-sm text-sm-gray px-2 py-3">Recherche...</p>}
                  {!loading && results.length === 0 && (
                    <p className="text-sm text-sm-gray px-2 py-3">Aucun produit trouvé pour "{query}".</p>
                  )}
                  {results.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => goToProduct(r.slug)}
                      className="w-full flex items-center gap-3 px-2 py-3 hover:bg-sm-cream rounded-xl transition-colors text-left"
                    >
                      <div className="w-12 h-12 rounded-lg bg-sm-cream overflow-hidden flex-shrink-0">
                        {r.image && <img src={r.image} alt={r.name} className="w-full h-full object-contain" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-sm-dark truncate">{r.name}</p>
                        <p className="text-sm text-sm-cyan font-bold">{formatPrice(r.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
