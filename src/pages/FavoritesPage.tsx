import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Heart, PlayCircle } from 'lucide-react';
import { useMovieStore } from '@/store/movieStore';
import { getImageUrl } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import dataEmpty from '@/assets/vector_clip/data_empty.png';

export default function FavoritesPage() {
  const { favorites, removeFromFavorites } = useMovieStore();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="md:mx-17.5 lg:mx-11xl px-6 pt-24 pb-8">
          <motion.h1
            className="text-3xl font-bold text-white mb-8"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Favorites
          </motion.h1>

          {favorites.length === 0 ? (
            <motion.div
              className="flex flex-col items-center justify-center py-24 gap-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <img src={dataEmpty} alt="No favorites" className="w-36 h-36 object-contain opacity-80" />
              <p className="text-white font-semibold text-base">Data Empty</p>
              <p className="text-muted-foreground text-sm">You don&apos;t have a favorite movie yet</p>
              <Link
                to="/"
                className="flex flex-row justify-center items-center p-2 gap-2 w-75 h-13 bg-[#961200] hover:bg-[#961200]/90 rounded-full text-sm font-semibold text-white transition-colors"
              >
                Explore Movie
              </Link>
            </motion.div>
          ) : (
            <div className="flex flex-col divide-y divide-white/10">
              {favorites.map((movie, i) => {
                const poster = getImageUrl(movie.poster_path, 'w342');
                return (
                  <motion.div
                    key={movie.id}
                    className="flex items-start gap-5 py-6"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                  >
                    {/* Poster */}
                    <Link to={`/movie/${movie.id}`} className="shrink-0">
                      <img
                        src={poster ?? 'https://placehold.co/342x513?text=No+Image'}
                        alt={movie.title}
                        className="w-45.5 h-67.5 object-cover rounded-xl"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                      <Link to={`/movie/${movie.id}`}>
                        <h3 className="text-white font-bold text-base leading-snug hover:text-primary transition-colors">
                          {movie.title}
                        </h3>
                      </Link>

                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-white/70">{movie.vote_average.toFixed(1)}/10</span>
                      </div>

                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                        {movie.overview}
                      </p>

                      <Link
                        to={`/movie/${movie.id}`}
                        className="mt-2 inline-flex items-center justify-center gap-2 self-start w-50 h-13 bg-[#961200] hover:bg-[#961200]/90 text-white font-semibold text-sm rounded-full transition-colors"
                      >
                        Watch Trailer
                        <PlayCircle size={16} />
                      </Link>
                    </div>

                    {/* Heart / remove button */}
                    <button
                      onClick={() => removeFromFavorites(movie.id)}
                      className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors"
                      aria-label={`Remove ${movie.title} from favorites`}
                    >
                      <Heart size={18} fill="currentColor" className="text-primary" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}
