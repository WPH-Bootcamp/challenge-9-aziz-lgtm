import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import movieLogo from '@/assets/hero/movie_logo.png';
import { useMovieStore } from '@/store/movieStore';

const schema = z.object({ query: z.string().min(1, 'Enter a movie title') });
type FormValues = z.infer<typeof schema>;

export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const favCount = useMovieStore(s => s.favorites.length);
  const setSearchQuery = useMovieStore(s => s.setSearchQuery);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const { ref: queryRef, ...queryRest } = register('query');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const id = setTimeout(() => { setMenuOpen(false); setSearchOpen(false); }, 0);
    return () => clearTimeout(id);
  }, [location.pathname]);

  useEffect(() => {
    const handler = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setMenuOpen(false);
        setSearchOpen(true);
        setTimeout(() => mobileSearchInputRef.current?.focus(), 250);
      } else {
        desktopInputRef.current?.focus();
      }
    };
    window.addEventListener('focus-search', handler);
    return () => window.removeEventListener('focus-search', handler);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  const onSubmit = (values: FormValues) => {
    setSearchQuery(values.query);
    setMenuOpen(false);
    setSearchOpen(false);
  };

  const handleClear = () => {
    reset();
    setSearchQuery('');
  };

  const navLinkClass = (path: string) =>
    `text-sm transition-colors ${location.pathname === path ? 'text-white font-semibold' : 'text-white/60 hover:text-white'}`;

  const goHome = () => {
    reset();
    setSearchQuery('');
    setMenuOpen(false);
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
        animate={{
          backgroundColor: scrolled ? 'rgba(10,13,18,0.6)' : 'rgba(0,0,0,0)',
          backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="md:mx-17.5 lg:mx-11xl px-6 py-4 flex items-center justify-between">
          {/* Logo + Nav links */}
          <div className="flex flex-row md:items-center md:gap-20 md:w-102.5 md:h-11.5">
            <Link to="/" onClick={goHome}>
              <img src={movieLogo} alt="Movie" className="h-8 object-contain" />
            </Link>

            <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
              <Link to="/" onClick={goHome} className={navLinkClass('/')} aria-current={location.pathname === '/' ? 'page' : undefined}>Home</Link>
              <Link to="/favorites" className={`${navLinkClass('/favorites')} flex items-center gap-1.5`} aria-current={location.pathname === '/favorites' ? 'page' : undefined}>
                Favorites
                {favCount > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none">
                    {favCount > 99 ? '99+' : favCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* Desktop search */}
          <div className="hidden md:flex flex-col items-end gap-1">
            <form onSubmit={handleSubmit(onSubmit)} role="search" className={`flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 focus-within:ring-1 focus-within:ring-red-400 transition-shadow ${errors.query ? 'ring-1 ring-red-500' : ''}`}>
              <button type="submit" aria-label="Search" className="text-white/50 hover:text-white/80 transition-colors">
                <Search className="w-4 h-4" aria-hidden="true" />
              </button>
              <input
                {...queryRest}
                ref={(el) => { queryRef(el); desktopInputRef.current = el; }}
                placeholder="Search Movie"
                aria-label="Search movies"
                aria-invalid={!!errors.query}
                aria-describedby={errors.query ? 'navbar-search-error' : undefined}
                className="bg-transparent text-sm text-white placeholder-white/40 outline-none focus-visible:outline-none w-36"
                onKeyDown={(e) => { if (e.key === 'Escape') handleClear(); }}
              />
            </form>
            {errors.query && (
              <p id="navbar-search-error" role="alert" className="text-xs text-red-400 px-2">
                {errors.query.message}
              </p>
            )}
          </div>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-4">
            <button
              type="button"
              onClick={() => { setSearchOpen((prev) => !prev); setMenuOpen(false); }}
              className="text-white/70 hover:text-white focus-visible:outline-2 focus-visible:outline-white rounded"
              aria-label="Toggle search"
              aria-expanded={searchOpen}
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => { setMenuOpen((prev) => !prev); setSearchOpen(false); }}
              className="text-white/70 hover:text-white focus-visible:outline-2 focus-visible:outline-white rounded"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
            >
              {menuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

      </motion.header>

      {/* Mobile full-screen search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-50 md:hidden bg-[#0a0d12] flex flex-col"
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              role="search"
              className="flex items-center gap-3 px-4 py-4 border-b border-white/10"
            >
              <button
                type="button"
                onClick={() => { setSearchOpen(false); handleClear(); }}
                className="text-white/70 hover:text-white shrink-0"
                aria-label="Back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
              </button>
              <div className={`flex-1 flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 focus-within:ring-1 focus-within:ring-red-400 transition-shadow ${errors.query ? 'ring-1 ring-red-500' : ''}`}>
                <Search className="w-4 h-4 text-white/50 shrink-0" aria-hidden="true" />
                <input
                  {...queryRest}
                  ref={(el) => { queryRef(el); mobileSearchInputRef.current = el; }}
                  placeholder="Search Movie"
                  aria-label="Search movies"
                  aria-invalid={!!errors.query}
                  className="bg-transparent text-sm text-white placeholder-white/40 outline-none w-full"
                  onKeyDown={(e) => { if (e.key === 'Escape') { handleClear(); setSearchOpen(false); } }}
                />
              </div>
            </form>
            {errors.query && (
              <p role="alert" className="text-xs text-red-400 px-6 pt-2">
                {errors.query.message}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile full-screen nav menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-50 md:hidden bg-[#0a0d12] flex flex-col"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {/* Menu header — mirrors the navbar */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
              <Link to="/" onClick={goHome}>
                <img src={movieLogo} alt="Movie" className="h-8 object-contain" />
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="text-white/70 hover:text-white focus-visible:outline-2 focus-visible:outline-white rounded"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col px-6 pt-6 gap-6" aria-label="Mobile navigation">
              <Link to="/" onClick={goHome} className={`text-base ${location.pathname === '/' ? 'text-white font-semibold' : 'text-white/70 hover:text-white'} transition-colors`} aria-current={location.pathname === '/' ? 'page' : undefined}>
                Home
              </Link>
              <Link
                to="/favorites"
                onClick={() => setMenuOpen(false)}
                className={`text-base flex items-center gap-2 ${location.pathname === '/favorites' ? 'text-white font-semibold' : 'text-white/70 hover:text-white'} transition-colors`}
                aria-current={location.pathname === '/favorites' ? 'page' : undefined}
              >
                Favorites
                {favCount > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold leading-none">
                    {favCount > 99 ? '99+' : favCount}
                  </span>
                )}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
