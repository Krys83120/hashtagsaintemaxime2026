"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface CategoryCardProps {
  name: string;
  count: number;
  color: string;
  slug: string;
}

export default function CategoryCard({ name, count, color, slug }: CategoryCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group bg-white rounded-2xl border border-sm-lightgray overflow-hidden shadow-sm hover:shadow-lg hover:shadow-sm-cyan/10 transition-shadow cursor-pointer"
    >
      <Link href={`/boutique/`} className="block p-6 text-center">
        <div className={`h-2 w-full rounded-full ${color} mb-6`} />
        <h3 className="text-xl font-bold text-sm-dark mb-2 group-hover:text-sm-cyan transition-colors">
          {name}
        </h3>
        <p className="text-sm-gray text-sm mb-4">{count} produits</p>
        <span className="inline-flex items-center gap-1 text-sm font-semibold text-white bg-sm-cyan px-5 py-2.5 rounded-full group-hover:bg-sm-deep transition-colors">
          Explorer
          <ArrowRight className="w-4 h-4" />
        </span>
      </Link>
    </motion.div>
  );
}
