import { motion } from 'framer-motion';
import { useMovieStore } from '@/store/movieStore';
import MovieCard from '@/components/MovieCard';
import PageTransition from '@/components/PageTransition';

export default function FavoritesPage() {
  const { favorites } = useMovieStore();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pt-24">
        <div className="container mx-auto px-6 py-8">
          <motion.h1
            className="text-3xl font-bold text-white mb-8"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            My Favorites
          </motion.h1>

          {favorites.length === 0 ? (
            <p className="text-muted-foreground text-center py-20">
              No favorites yet. Add some movies!
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favorites.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
