import { Facebook, Instagram, ThumbsUp } from "lucide-react";

interface SocialCountersProps {
  facebookCount?: number;
  instagramCount?: number;
  facebookUrl?: string;
  instagramUrl?: string;
}

function DigitBadges({ count, colorClass }: { count: number; colorClass: string }) {
  const digits = String(count).padStart(6, "0").split("");
  return (
    <div className="flex gap-1">
      {digits.map((d, i) => (
        <span
          key={i}
          className={`w-8 h-9 sm:w-9 sm:h-10 rounded-lg flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm ${colorClass}`}
        >
          {d}
        </span>
      ))}
    </div>
  );
}

export default function SocialCounters({
  facebookCount,
  instagramCount,
  facebookUrl = "https://www.facebook.com/hashtagsaintemaxime/",
  instagramUrl = "https://www.instagram.com/hashtag_saintemaxime/",
}: SocialCountersProps) {
  if (!facebookCount && !instagramCount) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 py-10 px-4 bg-white">
      {!!facebookCount && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex rounded-lg overflow-hidden shadow-sm">
            <span className="w-9 h-9 sm:w-10 sm:h-10 bg-[#1877F2] flex items-center justify-center flex-shrink-0">
              <Facebook className="w-5 h-5 text-white" fill="white" />
            </span>
            <DigitBadges count={facebookCount} colorClass="bg-[#1877F2]" />
          </div>
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#1877F2] text-white font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity text-sm"
          >
            <ThumbsUp className="w-4 h-4" fill="white" /> Suivre la page
          </a>
        </div>
      )}

      {!!instagramCount && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex rounded-lg overflow-hidden shadow-sm">
            <span className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center flex-shrink-0">
              <Instagram className="w-5 h-5 text-white" />
            </span>
            <DigitBadges count={instagramCount} colorClass="bg-gradient-to-br from-[#DD2A7B] to-[#8134AF]" />
          </div>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity text-sm"
          >
            <Instagram className="w-4 h-4" /> Follow me Instagram
          </a>
        </div>
      )}
    </div>
  );
}
