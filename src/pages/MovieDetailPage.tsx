import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { movieService } from '@/services/movieService';
import { useMovieStore } from '@/store/movieStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MovieCard from '@/components/MovieCard';
import Navbar from '@/components/Navbar';
import PageTransition from '@/components/PageTransition';
import { getImageUrl, formatRuntime } from '@/lib/utils';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);

  const { addToFavorites, removeFromFavorites, isFavorite } = useMovieStore();

  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => movieService.getMovieDetails(movieId),
  });

  const { data: credits } = useQuery({
    queryKey: ['movie', movieId, 'credits'],
    queryFn: () => movieService.getMovieCredits(movieId),
  });

  const { data: videos } = useQuery({
    queryKey: ['movie', movieId, 'videos'],
    queryFn: () => movieService.getMovieVideos(movieId),
  });

  const { data: similar } = useQuery({
    queryKey: ['movie', movieId, 'similar'],
    queryFn: () => movieService.getSimilarMovies(movieId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Movie not found.</p>
        <Link to="/" className="text-primary underline text-sm">← Back to Home</Link>
      </div>
    );
  }

  const favorited = isFavorite(movie.id);
  const trailer = videos?.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
  const topCast = credits?.cast.slice(0, 8) ?? [];
  const backdrop = getImageUrl(movie.backdrop_path, 'w1280');
  const poster = getImageUrl(movie.poster_path, 'w342');

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar onSearch={() => {}} />
        {/* Backdrop */}
        {backdrop && (
          <motion.div
            className="h-64 md:h-96 lg:h-112 xl:h-128 bg-cover bg-center relative"
            style={{ backgroundImage: `url(${backdrop})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-black/50" />
          </motion.div>
        )}

        <div className="container mx-auto px-4 pt-24 pb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-6 text-white/70 hover:text-white">
              ← Back to Home
            </Button>
          </Link>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster */}
            {poster && (
              <motion.img
                src={poster}
                alt={movie.title}
                className="w-48 rounded-lg shadow-lg self-start"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              />
            )}

            {/* Info */}
            <motion.div
              className="flex-1 space-y-4"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <h1 className="text-3xl font-bold">{movie.title}</h1>

              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="secondary">⭐ {movie.vote_average.toFixed(1)}</Badge>
                <span className="text-sm text-muted-foreground">
                  {movie.release_date?.slice(0, 4)}
                </span>
                {movie.runtime && (
                  <span className="text-sm text-muted-foreground">
                    · {formatRuntime(movie.runtime)}
                  </span>
                )}
              </div>

              {movie.genres && (
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((g) => (
                    <Badge key={g.id} variant="outline">{g.name}</Badge>
                  ))}
                </div>
              )}

              <p className="text-muted-foreground leading-relaxed">{movie.overview}</p>

              <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} className="inline-block">
                <Button
                  onClick={() => favorited ? removeFromFavorites(movie.id) : addToFavorites(movie)}
                  variant={favorited ? 'destructive' : 'default'}
                  aria-pressed={favorited}
                  aria-label={favorited ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
                >
                  {favorited ? '♥ Remove from Favorites' : '♡ Add to Favorites'}
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Trailer */}
          {trailer && (
            <motion.section
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-4">Trailer</h2>
              <div className="aspect-video max-w-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title="Trailer"
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                />
              </div>
            </motion.section>
          )}

          {/* Cast */}
          {topCast.length > 0 && (
            <motion.section
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <h2 className="text-xl font-semibold mb-4">Cast</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
                {topCast.map((member) => (
                  <div key={member.id} className="text-center">
                    <img
                      src={getImageUrl(member.profile_path, 'w185') ?? 'https://placehold.co/185x278?text=No+Photo'}
                      alt={member.name}
                      className="w-full rounded-lg object-cover aspect-2/3"
                    />
                    <p className="text-xs font-medium mt-1 truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.character}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Similar Movies */}
          {similar && similar.results.length > 0 && (
            <motion.section
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold mb-4">Similar Movies</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {similar.results.slice(0, 10).map((m) => (
                  <MovieCard key={m.id} movie={m} />
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
