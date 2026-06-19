"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { Review } from "@/lib/products";

interface ReviewsProps {
  reviews: Review[];
}

export default function Reviews({ reviews }: ReviewsProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-sm-gray">
        <p>Soyez le premier à laisser un avis !</p>
      </div>
    );
  }

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${star <= Math.round(average) ? "fill-yellow-400 text-yellow-400" : "text-sm-lightgray"}`}
            />
          ))}
        </div>
        <span className="font-bold text-sm-dark">{average.toFixed(1)}</span>
        <span className="text-sm-gray text-sm">({reviews.length} avis)</span>
      </div>

      <div className="space-y-4">
        {reviews.map((review, idx) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="bg-sm-cream p-4 rounded-xl border border-sm-lightgray"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sm-cyan/20 flex items-center justify-center text-sm-cyan font-bold text-sm">
                  {review.author.charAt(0)}
                </div>
                <span className="font-semibold text-sm-dark text-sm">{review.author}</span>
              </div>
              <span className="text-sm-gray text-xs">{review.date}</span>
            </div>
            <div className="flex gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${star <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-sm-lightgray"}`}
                />
              ))}
            </div>
            <p className="text-sm-dark text-sm leading-relaxed">{review.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
