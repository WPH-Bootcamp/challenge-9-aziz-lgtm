import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMovieStore } from '@/store/movieStore';
import MovieCard from '@/components/MovieCard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import dataEmpty from '@/assets/vector_clip/data_empty.png';

export default function FavoritesPage() {
  const { favorites } = useMovieStore();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar onSearch={() => {}} />
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
                className="mt-2 rounded-full bg-primary px-8 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
              >
                Explore Movie
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {favorites.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}
