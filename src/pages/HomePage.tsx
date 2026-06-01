import { useState, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Movie } from '@/types/movie';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { movieService } from '@/services/movieService';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import MovieCard from '@/components/MovieCard';
import MovieCardSkeleton from '@/components/MovieCardSkeleton';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import FilterBar, { type SortOption } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';

const SKELETON_COUNT = 5;

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingIndex, setTrendingIndex] = useState(0);
  const [newReleasePage, setNewReleasePage] = useState(1);
  const [allNewReleaseMovies, setAllNewReleaseMovies] = useState<Movie[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [activeGenre, setActiveGenre] = useState<number | null>(null);

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

  // Reset to page 1's results instead of appending when newReleasePage resets to 1
  // (e.g. after a sort/filter change), otherwise stale movies from the old query accumulate.
  useEffect(() => {
    if (!newRelease?.results) return;
    setAllNewReleaseMovies((prev) =>
      newReleasePage === 1 ? newRelease.results : [...prev, ...newRelease.results]
    );
  }, [newRelease, newReleasePage]);

  const { data: searchResults, isLoading: loadingSearch } = useQuery({
    queryKey: ['movies', 'search', searchQuery],
    queryFn: () => movieService.searchMovies(searchQuery),
    enabled: !!searchQuery,
  });

  const filteredNewRelease = useMemo(() => {
    const base = activeGenre ? allNewReleaseMovies.filter(m => m.genre_ids.includes(activeGenre)) : allNewReleaseMovies;
    return [...base].sort((a, b) => {
      if (sortBy === 'rating') return b.vote_average - a.vote_average;
      if (sortBy === 'date')   return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      if (sortBy === 'title')  return a.title.localeCompare(b.title);
      return b.popularity - a.popularity;
    });
  }, [allNewReleaseMovies, sortBy, activeGenre]);

  const filteredSearchResults = useMemo(() => {
    const base = activeGenre ? (searchResults?.results ?? []).filter(m => m.genre_ids.includes(activeGenre)) : (searchResults?.results ?? []);
    return [...base].sort((a, b) => {
      if (sortBy === 'rating') return b.vote_average - a.vote_average;
      if (sortBy === 'date')   return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
      if (sortBy === 'title')  return a.title.localeCompare(b.title);
      return b.popularity - a.popularity;
    });
  }, [searchResults, sortBy, activeGenre]);

  const heroMovie = nowPlaying?.results[0];

  const hasMore = newRelease ? newReleasePage < newRelease.total_pages : false;

  // drag-to-scroll for trending row (small screens)
  const trendingScrollRef = useRef<HTMLDivElement>(null);
  const trendingDragging = useRef(false);
  const trendingStartX = useRef(0);
  const trendingScrollLeft = useRef(0);
  const trendingMoved = useRef(false);

  function onTrendingMouseDown(e: React.MouseEvent) {
    trendingDragging.current = true;
    trendingMoved.current = false;
    trendingStartX.current = e.clientX;
    trendingScrollLeft.current = trendingScrollRef.current?.scrollLeft ?? 0;
    if (trendingScrollRef.current) trendingScrollRef.current.style.cursor = 'grabbing';
  }
  function onTrendingMouseMove(e: React.MouseEvent) {
    if (!trendingDragging.current || !trendingScrollRef.current) return;
    const dx = e.clientX - trendingStartX.current;
    if (Math.abs(dx) > 4) trendingMoved.current = true;
    trendingScrollRef.current.scrollLeft = trendingScrollLeft.current - dx;
  }
  function onTrendingMouseUp() {
    trendingDragging.current = false;
    if (trendingScrollRef.current) trendingScrollRef.current.style.cursor = 'grab';
  }
  function onTrendingClickCapture(e: React.MouseEvent) {
    if (trendingMoved.current) e.stopPropagation();
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground">
        <Navbar onSearch={setSearchQuery} />

        {/* Hero */}
        {!searchQuery && heroMovie && <Hero movie={heroMovie} />}

        <main className="container mx-auto px-6 py-10 space-y-14">

          {/* Filter / Sort bar — shown for both search and browse */}
          <div className={searchQuery ? 'pt-24' : ''}>
            <FilterBar
              sortBy={sortBy}
              onSortChange={setSortBy}
              activeGenre={activeGenre}
              onGenreChange={setActiveGenre}
            />
          </div>

          {/* Search Results */}
          {searchQuery && (
            <section>
              <h2 className="text-xl font-bold text-white mb-6">
                Results for &quot;{searchQuery}&quot;
              </h2>
              {loadingSearch ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => <MovieCardSkeleton key={i} />)}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                    {filteredSearchResults.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                  {filteredSearchResults.length === 0 && (
                    <p className="text-muted-foreground">No movies found.</p>
                  )}
                </>
              )}
            </section>
          )}

          {!searchQuery && (
            <>
              {/* Trending Now — carousel with edge-overlaid buttons and fade */}
              {(() => {
                const CARDS_PER_PAGE = 5;
                const trendingMovies = nowPlaying?.results ?? [];
                const visibleTrending = trendingMovies.slice(trendingIndex, trendingIndex + CARDS_PER_PAGE);
                const canPrev = trendingIndex > 0;
                const canNext = trendingIndex + CARDS_PER_PAGE < trendingMovies.length;
                return (
                  <section>
                    <h2 className="text-xl font-bold text-white mb-6">Trending Now</h2>

                    {loadingNowPlaying ? (
                      <div className="flex gap-4 overflow-x-auto scrollbar-hide lg:grid lg:grid-cols-5 lg:overflow-visible">
                        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                          <div key={i} className="w-[calc(50vw-2rem)] sm:w-40 shrink-0 lg:w-auto lg:shrink">
                            <MovieCardSkeleton />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="relative py-4">
                        {/* Left fade + prev button */}
                        {canPrev && (
                          <>
                            <div className="absolute -left-4 -top-4 -bottom-4 w-40 bg-linear-to-r from-background/90 from-20% to-transparent z-30 pointer-events-none" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute left-3 top-1/2 -translate-y-1/2 z-40 h-10 w-10 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/80 hover:scale-110 transition-transform"
                              onClick={() => setTrendingIndex(i => Math.max(0, i - CARDS_PER_PAGE))}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </Button>
                          </>
                        )}

                        {/* Cards — single flex row at all breakpoints, 5-col grid on lg+ */}
                        <div
                          ref={trendingScrollRef}
                          className="flex gap-4 overflow-x-auto scrollbar-hide select-none cursor-grab py-3 lg:grid lg:grid-cols-5 lg:overflow-visible lg:py-0 lg:cursor-default"
                          onMouseDown={onTrendingMouseDown}
                          onMouseMove={onTrendingMouseMove}
                          onMouseUp={onTrendingMouseUp}
                          onMouseLeave={onTrendingMouseUp}
                          onClickCapture={onTrendingClickCapture}
                        >
                          {visibleTrending.map((movie, index) => (
                            <motion.div
                              key={movie.id}
                              className="w-[calc(50vw-2rem)] sm:w-40 shrink-0 lg:w-auto"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.04 }}
                            >
                              <MovieCard movie={movie} rank={trendingIndex + index + 1} />
                            </motion.div>
                          ))}
                          <span className="shrink-0 w-8 lg:hidden" aria-hidden />
                        </div>

                        {/* Right fade + next button */}
                        {canNext && (
                          <>
                            <div className="absolute -right-4 -top-4 -bottom-4 w-40 bg-linear-to-l from-background/90 from-20% to-transparent z-30 pointer-events-none" />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-3 top-1/2 -translate-y-1/2 z-40 h-10 w-10 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/80 hover:scale-110 transition-transform"
                              onClick={() => setTrendingIndex(i => Math.min(trendingMovies.length - CARDS_PER_PAGE, i + CARDS_PER_PAGE))}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </section>
                );
              })()}

              {/* New Release — 5-column grid with Load More */}
              <section>
                <h2 className="text-xl font-bold text-white mb-6">New Release</h2>

                {loadingNewRelease && newReleasePage === 1 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                    {Array.from({ length: 10 }).map((_, i) => <MovieCardSkeleton key={i} />)}
                  </div>
                ) : (
                  <>
                    <div className="relative w-full z-0" >
                      <motion.div
                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4"
                        initial="hidden"
                        animate="show"
                        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
                      >
                        {filteredNewRelease.map((movie) => (
                          <MovieCard key={movie.id} movie={movie} />
                        ))}
                      </motion.div>

                      {hasMore && (
                        <div className="absolute -bottom-6 -left-6 -right-6 h-96 bg-linear-to-t from-background/90 from-20% to-transparent pointer-events-none z-30" />
                      )}
                    </div>

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
