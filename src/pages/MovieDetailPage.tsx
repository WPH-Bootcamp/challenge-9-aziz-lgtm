import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Calendar, Play, Heart, Star, Video, Bot } from 'lucide-react';
import { movieService } from '@/services/movieService';
import { useMovieStore } from '@/store/movieStore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { getImageUrl } from '@/lib/utils';

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

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
  const firstGenre = movie.genres?.[0]?.name ?? '—';
  const ageLimit = movie.adult ? 18 : 13;

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-background">
        <Navbar onSearch={() => {}} />

        {/* Backdrop */}
        {backdrop && (
          <motion.div
            style={{
              position: 'absolute',
              height: '810px',
              left: '0px',
              top: '0px',
              width: '100%',
              borderRadius: '0px',
              backgroundImage: `url(${backdrop})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
          </motion.div>
        )}

        <div className="md:mx-17.5 lg:mx-11xl px-4 pb-8" style={{ paddingTop: '840px' }}>

          {/* Poster + Info */}
          <div className="flex flex-col md:flex-row gap-8 -mt-100 relative z-10">

            {/* Poster */}
            {poster && (
              <motion.img
                src={poster}
                alt={movie.title}
                className="w-48 md:w-56 rounded-2xl shadow-2xl self-start shrink-0"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              />
            )}

            {/* Info */}
            <motion.div
              className="flex-1 flex flex-col gap-4"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              {/* Title */}
              <h1 className="text-display-sm font-bold text-foreground">{movie.title}</h1>

              {/* Date */}
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Calendar size={14} />
                <span>{formatDate(movie.release_date)}</span>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3">
                {trailer ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm px-5 py-2 rounded-full transition-colors"
                  >
                    Watch Trailer
                    <Play size={14} fill="currentColor" />
                  </a>
                ) : (
                  <span className="flex items-center gap-2 bg-primary/40 text-primary-foreground font-semibold text-sm px-5 py-2 rounded-full">
                    Watch Trailer
                    <Play size={14} fill="currentColor" />
                  </span>
                )}
                <button
                  onClick={() => favorited ? removeFromFavorites(movie.id) : addToFavorites(movie)}
                  className="p-2 rounded-full border border-white/20 hover:border-primary hover:text-primary transition-colors text-foreground"
                  aria-label={favorited ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`}
                  aria-pressed={favorited}
                >
                  <Heart size={16} fill={favorited ? 'currentColor' : 'none'} className={favorited ? 'text-primary' : ''} />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center p-5 gap-2 h-36.5 bg-black border border-gray-800 rounded-2xl grow self-stretch">
                  <Star size={20} className="text-yellow-400" fill="currentColor" />
                  <p className="text-muted-foreground text-xs">Rating</p>
                  <p className="text-foreground font-bold text-sm">{movie.vote_average.toFixed(1)}/10</p>
                </div>
                <div className="flex flex-col items-center p-5 gap-2 h-36.5 bg-black border border-gray-800 rounded-2xl grow self-stretch">
                  <Video size={20} className="text-foreground" />
                  <p className="text-muted-foreground text-xs">Genre</p>
                  <p className="text-foreground font-bold text-sm truncate w-full text-center">{firstGenre}</p>
                </div>
                <div className="flex flex-col items-center p-5 gap-2 h-36.5 bg-black border border-gray-800 rounded-2xl grow self-stretch">
                  <Bot size={20} className="text-foreground" />
                  <p className="text-muted-foreground text-xs">Age Limit</p>
                  <p className="text-foreground font-bold text-sm">{ageLimit}</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Overview */}
          <motion.section
            className="mt-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-display-xs font-bold mb-3">Overview</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{movie.overview}</p>
          </motion.section>

          {/* Cast & Crew */}
          {topCast.length > 0 && (
            <motion.section
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <h2 className="text-display-xs font-bold mb-4">Cast &amp; Crew</h2>
              <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                {topCast.slice(0, 6).map((member) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <img
                      src={getImageUrl(member.profile_path, 'w185') ?? 'https://placehold.co/185x278?text=?'}
                      alt={member.name}
                      className="w-16 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{member.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{member.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}
