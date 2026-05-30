import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';
import type { Movie } from '@/types/movie';

interface Props {
  movie: Movie;
  rank?: number;
}

export default function MovieCard({ movie, rank }: Props) {
  const poster = getImageUrl(movie.poster_path, 'w342');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      whileHover={{ scale: 1.04 }}
    >
      <Link to={`/movie/${movie.id}`} className="block focus-visible:outline-2 focus-visible:outline-white focus-visible:rounded-xl" aria-label={`View details for ${movie.title}`}>
        <div className="overflow-hidden rounded-xl bg-card shadow-sm relative">
          {rank !== undefined && (
            <span aria-hidden="true" className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
              {rank}
            </span>
          )}
          <img
            src={poster ?? 'https://placehold.co/342x513?text=No+Image'}
            alt={movie.title}
            className="w-full aspect-2/3 object-cover"
          />
        </div>
        <div className="pt-2 space-y-1 px-0.5">
          <p className="text-sm font-medium text-white truncate">{movie.title}</p>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-white/70">{movie.vote_average.toFixed(1)}/10</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
