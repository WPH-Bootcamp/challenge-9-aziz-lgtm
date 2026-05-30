import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/utils';
import type { Movie } from '@/types/movie';
import playVector from '@/assets/hero/play_vector.png';

interface Props {
  movie: Movie;
}

export default function Hero({ movie }: Props) {
  const navigate = useNavigate();
  const backdrop = getImageUrl(movie.backdrop_path, 'original');

  return (
    <div
      className="relative w-full h-[85vh] bg-cover bg-center flex items-end"
      style={{ backgroundImage: `url(${backdrop})` }}
    >
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-linear-to-t from-[#0f0f1a] via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 pb-20">
        <motion.div
          className="max-w-xl space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            {movie.title}
          </h1>
          <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
            {movie.overview}
          </p>
          <div className="flex gap-4 pt-2">
            <Button
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 gap-2"
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              Watch Trailer
              <img src={playVector} alt="" className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-6 border-white/40 text-white bg-transparent hover:bg-white/10"
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              See Detail
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
