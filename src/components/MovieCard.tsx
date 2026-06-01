import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Star, Heart, HeartOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getImageUrl } from '@/lib/utils';
import type { Movie } from '@/types/movie';
import { useMovieStore } from '@/store/movieStore';

interface Props {
  movie: Movie;
  rank?: number;
}

export default function MovieCard({ movie, rank }: Props) {
  const poster = getImageUrl(movie.poster_path, 'w342');
  const { isFavorite, addToFavorites, removeFromFavorites } = useMovieStore();
  const favorited = isFavorite(movie.id);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    function close() { setMenu(null); }
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setMenu(null); }
    window.addEventListener('click', close);
    window.addEventListener('contextmenu', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('contextmenu', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    const MENU_W = 192;
    const MENU_H = 88;
    const x = e.clientX + MENU_W > window.innerWidth ? e.clientX - MENU_W : e.clientX;
    const y = e.clientY + MENU_H > window.innerHeight ? e.clientY - MENU_H : e.clientY;
    setMenu({ x, y });
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        whileHover={{ scale: 1.04 }}
        onContextMenu={handleContextMenu}
      >
        <Link to={`/movie/${movie.id}`} className="block focus-visible:outline-2 focus-visible:outline-white focus-visible:rounded-xl" aria-label={`View details for ${movie.title}`}>
          <div className="overflow-hidden rounded-xl bg-card shadow-sm relative">
            {rank !== undefined && (
              <span aria-hidden="true" className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
                {rank}
              </span>
            )}
            <img
              src={poster ?? 'https://placehold.co/342x513?text=No+Image'}
              alt={movie.title}
              className="w-full aspect-2/3 object-cover"
            />
          </div>
          <div className="pt-2 space-y-1 px-0.5">
            <p className="text-sm font-medium text-white truncate">{movie.title}</p>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-white/70">{movie.vote_average.toFixed(1)}/10</span>
            </div>
          </div>
        </Link>
      </motion.div>

      {menu && createPortal(
        <div
          ref={menuRef}
          style={{ top: menu.y, left: menu.x }}
          className="fixed z-9999 min-w-48 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.preventDefault()}
        >
          <p className="truncate border-b border-white/10 px-4 py-2 text-xs text-white/40">{movie.title}</p>
          {favorited ? (
            <button
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-white/5"
              onClick={() => { removeFromFavorites(movie.id); setMenu(null); }}
            >
              <HeartOff size={14} />
              Remove from Favorites
            </button>
          ) : (
            <button
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-white transition-colors hover:bg-white/5"
              onClick={() => { addToFavorites(movie); setMenu(null); }}
            >
              <Heart size={14} />
              Add to Favorites
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
