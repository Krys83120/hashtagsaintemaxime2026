import { Star } from "lucide-react";
import { getMergedGoogleReviews } from "@/lib/google-reviews";

export default async function GoogleReviewsSection() {
  const reviews = await getMergedGoogleReviews();

  if (reviews.length === 0) return null;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-sm-dark mb-2">Ce qu'on dit de nous sur Google</h2>
        <div className="flex items-center justify-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-sm-lightgray"}`} />
            ))}
          </div>
          <span className="text-sm-gray text-sm">{avgRating.toFixed(1)}/5 · {reviews.length} avis</span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {reviews.slice(0, 6).map((review) => (
          <div key={review.id} className="bg-white rounded-2xl border border-sm-lightgray p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              {review.authorPhoto ? (
                <img src={review.authorPhoto} alt={review.author} className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-sm-cyan/10 flex items-center justify-center text-sm-cyan font-bold">
                  {review.author.charAt(0)}
                </div>
              )}
              <div>
                <p className="font-medium text-sm-dark text-sm">{review.author}</p>
                <p className="text-xs text-sm-gray">{review.relativeTime} · {review.source}</p>
              </div>
            </div>
            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-sm-lightgray"}`} />
              ))}
            </div>
            <p className="text-sm text-sm-dark leading-relaxed line-clamp-4">{review.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
