import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { movieService } from '@/services/movieService';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import MovieCard from '@/components/MovieCard';
import MovieCardSkeleton from '@/components/MovieCardSkeleton';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { Button } from '@/components/ui/button';

const SKELETON_COUNT = 5;

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [newReleasePage, setNewReleasePage] = useState(1);

  const { data: nowPlaying, isLoading: loadingNowPlaying } = useQuery({
    queryKey: ['movies', 'now_playing'],
    queryFn: () => movieService.getNowPlayingMovies(),
    enabled: !searchQuery,
  });

  const { data: newRelease, isLoading: loadingNewRelease } = useQuery({
    queryKey: ['movies', 'upcoming', newReleasePage],
    queryFn: () => movieService.getUpcomingMovies(newReleasePage),
    enabled: !searchQuery,
  });

  const { data: prevNewRelease } = useQuery({
    queryKey: ['movies', 'upcoming', newReleasePage - 1],
    queryFn: () => movieService.getUpcomingMovies(newReleasePage - 1),
    enabled: !searchQuery && newReleasePage > 1,
  });

  const { data: searchResults, isLoading: loadingSearch } = useQuery({
    queryKey: ['movies', 'search', searchQuery],
    queryFn: () => movieService.searchMovies(searchQuery),
    enabled: !!searchQuery,
  });

  const heroMovie = nowPlaying?.results[0];

  // Accumulate new release movies across pages
  const prevMovies = prevNewRelease?.results ?? [];
  const currentMovies = newRelease?.results ?? [];
  const allNewReleaseMovies = newReleasePage > 1
    ? [...prevMovies, ...currentMovies]
    : currentMovies;

  const hasMore = newRelease ? newReleasePage < newRelease.total_pages : false;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar onSearch={setSearchQuery} />

        {/* Hero */}
        {!searchQuery && heroMovie && <Hero movie={heroMovie} />}

        <main className="container mx-auto px-6 py-10 space-y-14">

          {/* Search Results */}
          {searchQuery && (
            <section className="pt-24">
              <h2 className="text-xl font-bold text-white mb-6">
                Results for &quot;{searchQuery}&quot;
              </h2>
              {loadingSearch ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => <MovieCardSkeleton key={i} />)}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {searchResults?.results.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                  {searchResults?.results.length === 0 && (
                    <p className="text-muted-foreground">No movies found.</p>
                  )}
                </>
              )}
            </section>
          )}

          {!searchQuery && (
            <>
              {/* Trending Now — horizontal scroll with rank badges */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">Trending Now</h2>
                  <ChevronRight className="w-5 h-5 text-white/40" />
                </div>

                {loadingNowPlaying ? (
                  <div className="flex gap-4">
                    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                      <div key={i} className="shrink-0 w-44"><MovieCardSkeleton /></div>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {nowPlaying?.results.map((movie, index) => (
                      <motion.div
                        key={movie.id}
                        className="shrink-0 w-44"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <MovieCard movie={movie} rank={index + 1} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>

              {/* New Release — 5-column grid with Load More */}
              <section>
                <h2 className="text-xl font-bold text-white mb-6">New Release</h2>

                {loadingNewRelease && newReleasePage === 1 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 10 }).map((_, i) => <MovieCardSkeleton key={i} />)}
                  </div>
                ) : (
                  <>
                    <motion.div
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                      initial="hidden"
                      animate="show"
                      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
                    >
                      {allNewReleaseMovies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                      ))}
                    </motion.div>

                    {hasMore && (
                      <div className="flex justify-center mt-8">
                        <Button
                          variant="outline"
                          className="rounded-full px-8 border-white/20 text-white hover:bg-white/10"
                          onClick={() => setNewReleasePage((p) => p + 1)}
                          disabled={loadingNewRelease}
                        >
                          {loadingNewRelease ? 'Loading...' : 'Load More'}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </section>
            </>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
