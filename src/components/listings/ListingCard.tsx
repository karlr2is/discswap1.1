import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { MapPin, DollarSign, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type ListingCardProps = {
  listing: {
    id: string;
    title: string;
    price: number | null;
    condition_score: number | null;
    location: string | null;
    images: string[];
    listing_type: 'for_sale' | 'wanted';
  };
  onClick: () => void;
};

export function ListingCard({ listing, onClick }: ListingCardProps) {
  const { user } = useAuth();
  const cardRef = useRef<HTMLButtonElement>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Track this card's position relative to the viewport
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });

  // Map scroll progress to a small vertical shift on the image
  // As the card enters from below (0) and exits the top (1), the image drifts -30px → +30px
  const imageY = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
    fetchFavoriteCount();
  }, [user, listing.id]);

  const checkFavoriteStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listing.id)
      .maybeSingle();

    setIsFavorited(!!data);
  };

  const fetchFavoriteCount = async () => {
    const { count } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listing.id);

    setFavoriteCount(count || 0);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    if (isFavorited) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listing.id);
      setIsFavorited(false);
      setFavoriteCount((prev) => Math.max(0, prev - 1));
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, listing_id: listing.id });
      setIsFavorited(true);
      setFavoriteCount((prev) => prev + 1);
    }
  };

  const getConditionColor = (score: number | null) => {
    if (!score) return 'bg-slate-700 text-slate-300';
    if (score >= 9) return 'bg-emerald-900/80 text-emerald-300';
    if (score >= 7) return 'bg-blue-900/80 text-blue-300';
    if (score >= 5) return 'bg-amber-900/80 text-amber-300';
    return 'bg-orange-900/80 text-orange-300';
  };

  const imageUrl =
    listing.images && listing.images.length > 0
      ? listing.images[0]
      : 'https://images.pexels.com/photos/7045818/pexels-photo-7045818.jpeg?auto=compress&cs=tinysrgb&w=400';

  return (
    <button
      ref={cardRef}
      onClick={onClick}
      className="bg-slate-800 rounded-xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-blue-950/30 transition-shadow duration-300 text-left w-full border border-slate-700/50 hover:border-slate-600/70"
    >
      {/* Image container */}
      <div className="relative aspect-square bg-slate-700 flex items-center justify-center">
        <motion.img
          src={imageUrl}
          alt={listing.title}
          style={{ y: imageY }}
          className="w-full h-full object-contain"
        />
        {listing.listing_type === 'wanted' && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
            WANTED
          </div>
        )}
        {listing.condition_score && (
          <div
            className={`absolute top-2 right-2 ${getConditionColor(listing.condition_score)} text-xs font-medium px-2 py-1 rounded backdrop-blur-sm`}
          >
            {listing.condition_score}/10
          </div>
        )}
        {user && (
          <button
            onClick={handleToggleFavorite}
            className="absolute bottom-2 right-2 p-2 bg-slate-900/70 hover:bg-slate-900/90 rounded-full backdrop-blur-sm transition-colors"
          >
            <Heart
              className={`w-5 h-5 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`}
            />
          </button>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-slate-100 mb-1 line-clamp-2">{listing.title}</h3>

        {listing.price !== null && (
          <div className="flex items-center gap-1 text-lg font-bold text-slate-100 mb-1">
            <DollarSign className="w-4 h-4" />
            {listing.price.toFixed(2)}
          </div>
        )}

        {listing.location && (
          <div className="flex items-center gap-1 text-sm text-slate-400">
            <MapPin className="w-4 h-4" />
            {listing.location}
          </div>
        )}

        {favoriteCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <Heart className="w-3 h-3" />
            {favoriteCount}
          </div>
        )}
      </div>
    </button>
  );
}
