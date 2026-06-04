import { useState, useMemo, useRef } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Heart, Play } from 'lucide-react';
import { movieService } from '@/services/movieService';
import { getImageUrl } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import { useMovieStore } from '@/store/movieStore';
import Hero from '@/components/Hero';
import MovieCard from '@/components/MovieCard';
import MovieCardSkeleton from '@/components/MovieCardSkeleton';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import FilterBar, { type SortOption } from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import dataIsntFound from '@/assets/vector_clip/data_isnt_found.png';

const SKELETON_COUNT = 6;

export default function HomePage() {
  const { searchQuery, addToFavorites, removeFromFavorites, isFavorite } = useMovieStore();
  const [trendingIndex, setTrendingIndex] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [activeGenre, setActiveGenre] = useState<number | null>(null);

  const { data: nowPlaying, isLoading: loadingNowPlaying } = useQuery({
    queryKey: ['movies', 'now_playing'],
    queryFn: () => movieService.getNowPlayingMovies(),
    enabled: !searchQuery,
  });

  const {
    data: newReleaseData,
    isLoading: loadingNewRelease,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['movies', 'upcoming'],
    queryFn: ({ pageParam }) => movieService.getUpcomingMovies(pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    enabled: !searchQuery,
  });

  const allNewReleaseMovies = useMemo(
    () => newReleaseData?.pages.flatMap((page) => page.results) ?? [],
    [newReleaseData],
  );

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

  const hasMore = hasNextPage ?? false;

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
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
        <Navbar />

        {/* Hero */}
        {!searchQuery && heroMovie && <Hero movie={heroMovie} />}

        <main className="md:mx-17.5 lg:mx-11xl px-6 py-10 space-y-14">

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
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 5 }).map((_, i) => <MovieCardSkeleton key={i} />)}
                </div>
              ) : (
                <>
                  <div className="flex flex-col divide-y divide-white/10">
                    {filteredSearchResults.map((movie, i) => {
                      const poster = getImageUrl(movie.poster_path, 'w342');
                      const favorited = isFavorite(movie.id);
                      return (
                        <motion.div
                          key={movie.id}
                          className="flex flex-col gap-3 py-6 md:grid md:grid-cols-[1fr_auto] md:items-start md:gap-x-5"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: i * 0.04 }}
                        >
                          {/* Poster + Info */}
                          <div className="flex gap-3 items-start flex-1">
                            <img
                              src={poster ?? 'https://placehold.co/342x513?text=No+Image'}
                              alt={movie.title}
                              className="w-26 h-39 md:w-45 md:h-67 object-cover rounded-xl shrink-0"
                            />
                            <div className="flex-1 min-w-0 flex flex-col gap-2">
                              <h3 className="text-white font-bold text-base md:text-lg leading-snug">{movie.title}</h3>
                              <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-white/70">{movie.vote_average.toFixed(1)}/10</span>
                              </div>
                              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">{movie.overview}</p>

                              {/* Desktop: Watch Trailer */}
                              <button className="hidden md:flex mt-2 self-start items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold text-sm p-2 w-50 h-13 rounded-full transition-colors">
                                Watch Trailer
                                <Play size={14} fill="currentColor" />
                              </button>
                            </div>
                          </div>

                          {/* Desktop: Heart — direct sibling so it stays in a fixed column */}
                          <button
                            onClick={() => favorited ? removeFromFavorites(movie.id) : addToFavorites(movie)}
                            className="hidden md:flex shrink-0 w-10 h-10 items-center justify-center rounded-full border border-white/20 hover:border-primary hover:text-primary transition-colors text-foreground"
                            aria-label={favorited ? `Remove from favorites` : `Add to favorites`}
                          >
                            <Heart size={16} fill={favorited ? 'currentColor' : 'none'} className={favorited ? 'text-primary' : ''} />
                          </button>

                          {/* Mobile: Watch Trailer + Heart row */}
                          <div className="flex md:hidden gap-3">
                            <button
                              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold text-sm p-2 h-11 rounded-full transition-colors"
                            >
                              Watch Trailer
                              <Play size={14} fill="currentColor" />
                            </button>
                            <button
                              onClick={() => favorited ? removeFromFavorites(movie.id) : addToFavorites(movie)}
                              className="w-11 h-11 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 hover:border-zinc-500 transition-colors shrink-0"
                              aria-label={favorited ? `Remove from favorites` : `Add to favorites`}
                            >
                              <Heart size={16} fill={favorited ? 'currentColor' : 'none'} className={favorited ? 'text-primary' : 'text-primary'} />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  {filteredSearchResults.length === 0 && (
                    <motion.div
                      className="flex flex-col items-center justify-center py-24 gap-4"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <img src={dataIsntFound} alt="Data not found" className="w-36 h-36 object-contain opacity-80" />
                      <p className="text-white font-semibold text-base">Data Not Found</p>
                      <button
                        type="button"
                        className="text-sm text-primary underline underline-offset-4 hover:text-primary/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-colors"
                        onClick={() => window.dispatchEvent(new Event('focus-search'))}
                      >
                        Try other keywords
                      </button>
                    </motion.div>
                  )}
                </>
              )}
            </section>
          )}

          {!searchQuery && (
            <>
              {/* Trending Now — carousel with edge-overlaid buttons and fade */}
              {(() => {
                const CARDS_PER_PAGE = 6;
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
                        {/* Left fade */}
                        {canPrev && (
                          <div className="absolute -left-4 -top-4 -bottom-4 w-40 bg-linear-to-r from-background/90 from-20% to-transparent z-30 pointer-events-none" />
                        )}

                        {/* Cards — bleed to the right via negative margin; relative wrapper above keeps buttons in viewport */}
                        <div className="md:-mr-17.5 lg:-mr-[calc(20vw-4rem)]">
                          <div
                            ref={trendingScrollRef}
                            className="flex gap-4 overflow-x-auto scrollbar-hide select-none cursor-grab py-3 lg:grid lg:grid-cols-6 lg:overflow-visible lg:py-0 lg:cursor-default"
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
                        </div>

                        {/* Right fade */}
                        {canNext && (
                          <div className="absolute right-0 md:-right-23.5 lg:-right-41 -top-4 -bottom-4 w-40 md:w-56 lg:w-72 bg-linear-to-l from-background/90 from-20% to-transparent z-30 pointer-events-none" />
                        )}

                        {/* Arrow buttons — overlay anchored to poster area only (bottom-16 = py-4 outer + ~48px title) */}
                        <div className="absolute inset-x-0 top-4 bottom-16 pointer-events-none z-40">
                          {canPrev && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="pointer-events-auto absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/80 hover:scale-110 transition-transform"
                              onClick={() => setTrendingIndex(i => Math.max(0, i - CARDS_PER_PAGE))}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </Button>
                          )}
                          {canNext && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="pointer-events-auto absolute right-0 translate-x-5 md:translate-x-15 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/60 border border-white/20 text-white hover:bg-black/80 hover:scale-110 transition-transform"
                              onClick={() => setTrendingIndex(i => Math.min(trendingMovies.length - CARDS_PER_PAGE, i + CARDS_PER_PAGE))}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </section>
                );
              })()}

              {/* New Release — 5-column grid with Load More */}
              <section>
                <h2 className="text-xl font-bold text-white mb-6">New Release</h2>

                {loadingNewRelease ? (
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
                          onClick={() => fetchNextPage()}
                          disabled={isFetchingNextPage}
                        >
                          {isFetchingNextPage ? 'Loading...' : 'Load More'}
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
