import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import movieLogo from '@/assets/hero/movie_logo.png';

const schema = z.object({ query: z.string().min(1) });
type FormValues = z.infer<typeof schema>;

interface Props {
  onSearch: (query: string) => void;
}

export default function Navbar({ onSearch }: Props) {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const onSubmit = (values: FormValues) => {
    onSearch(values.query);
    setMenuOpen(false);
  };

  const handleClear = () => {
    reset();
    onSearch('');
  };

  const navLinkClass = (path: string) =>
    `text-sm transition-colors ${location.pathname === path ? 'text-white font-semibold' : 'text-white/60 hover:text-white'}`;

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
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <img src={movieLogo} alt="Movie" className="h-8 object-contain" />
          </Link>

          {/* Nav links — hidden on mobile */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            <Link to="/" className={navLinkClass('/')} aria-current={location.pathname === '/' ? 'page' : undefined}>Home</Link>
            <Link to="/favorites" className={navLinkClass('/favorites')} aria-current={location.pathname === '/favorites' ? 'page' : undefined}>Favorites</Link>
          </nav>

          {/* Desktop search */}
          <form onSubmit={handleSubmit(onSubmit)} role="search" className="hidden md:flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-white/50" aria-hidden="true" />
            <input
              {...register('query')}
              placeholder="Search Movie"
              aria-label="Search movies"
              className="bg-transparent text-sm text-white placeholder-white/40 outline-none focus-visible:outline-none w-36"
              onKeyDown={(e) => { if (e.key === 'Escape') handleClear(); }}
            />
            <button type="submit" className="sr-only">Search</button>
          </form>

          {/* Mobile controls */}
          <div className="flex md:hidden items-center gap-4">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="text-white/70 hover:text-white focus-visible:outline-2 focus-visible:outline-white rounded"
              aria-label="Open search"
              aria-expanded={menuOpen}
            >
              <Search className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
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

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            className="fixed top-16 left-0 right-0 z-40 md:hidden border-b border-white/10 bg-[#0a0d12]/95 backdrop-blur-[20px]"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
              <Link to="/" className={navLinkClass('/')}>Home</Link>
              <Link to="/favorites" className={navLinkClass('/favorites')}>Favorites</Link>
              <form onSubmit={handleSubmit(onSubmit)} role="search" className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <Search className="w-4 h-4 text-white/50" aria-hidden="true" />
                <input
                  {...register('query')}
                  placeholder="Search Movie"
                  aria-label="Search movies"
                  className="bg-transparent text-sm text-white placeholder-white/40 outline-none w-full"
                  onKeyDown={(e) => { if (e.key === 'Escape') handleClear(); }}
                />
                <button type="submit" className="sr-only">Search</button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
