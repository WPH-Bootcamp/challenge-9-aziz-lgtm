import { useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TMDB_GENRES } from '@/lib/constants';

export type SortOption = 'popularity' | 'rating' | 'date' | 'title';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'popularity', label: 'Popular' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'date',       label: 'Newest' },
  { value: 'title',      label: 'A–Z' },
];

function useDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startScrollLeft = useRef(0);
  const moved = useRef(false);

  function onMouseDown(e: React.MouseEvent) {
    dragging.current = true;
    moved.current = false;
    startX.current = e.clientX;
    startScrollLeft.current = ref.current?.scrollLeft ?? 0;
    if (ref.current) ref.current.style.cursor = 'grabbing';
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current || !ref.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 4) moved.current = true;
    ref.current.scrollLeft = startScrollLeft.current - dx;
  }

  function onMouseUp() {
    dragging.current = false;
    if (ref.current) ref.current.style.cursor = 'grab';
  }

  // suppress click on child elements if the user actually dragged
  function onClickCapture(e: React.MouseEvent) {
    if (moved.current) e.stopPropagation();
  }

  return { ref, onMouseDown, onMouseMove, onMouseUp, onMouseLeave: onMouseUp, onClickCapture };
}

interface Props {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  activeGenre: number | null;
  onGenreChange: (genre: number | null) => void;
}

export default function FilterBar({ sortBy, onSortChange, activeGenre, onGenreChange }: Props) {
  const { ref: sortRef, onMouseDown: sortMouseDown, onMouseMove: sortMouseMove, onMouseUp: sortMouseUp, onMouseLeave: sortMouseLeave, onClickCapture: sortClickCapture } = useDragScroll();
  const { ref: genreRef, onMouseDown: genreMouseDown, onMouseMove: genreMouseMove, onMouseUp: genreMouseUp, onMouseLeave: genreMouseLeave, onClickCapture: genreClickCapture } = useDragScroll();

  return (
    <div className="flex flex-col gap-3">
      {/* SORT row */}
      <div className="relative">
        <div
          ref={sortRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide select-none cursor-grab"
          onMouseDown={sortMouseDown}
          onMouseMove={sortMouseMove}
          onMouseUp={sortMouseUp}
          onMouseLeave={sortMouseLeave}
          onClickCapture={sortClickCapture}
        >
          <span className="text-xs text-white/40 uppercase tracking-wide shrink-0">Sort</span>
          {SORT_OPTIONS.map(({ value, label }) => (
            <Button
              key={value}
              size="sm"
              variant={sortBy === value ? 'default' : 'outline'}
              className={`h-7 px-3 text-xs rounded-full shrink-0 ${sortBy !== value ? 'border-white/20 text-white/60' : ''}`}
              onClick={() => onSortChange(value)}
            >
              {label}
            </Button>
          ))}
          <span className="shrink-0 w-8" aria-hidden />
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-background to-transparent"
        />
      </div>

      {/* GENRE row */}
      <div className="relative">
        <div
          ref={genreRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide select-none cursor-grab"
          onMouseDown={genreMouseDown}
          onMouseMove={genreMouseMove}
          onMouseUp={genreMouseUp}
          onMouseLeave={genreMouseLeave}
          onClickCapture={genreClickCapture}
        >
          <span className="text-xs text-white/40 uppercase tracking-wide shrink-0">Genre</span>
          <Badge
            variant={activeGenre === null ? 'default' : 'outline'}
            className="cursor-pointer shrink-0"
            onClick={() => onGenreChange(null)}
          >
            All
          </Badge>
          {TMDB_GENRES.map(({ id, name }) => (
            <Badge
              key={id}
              variant={activeGenre === id ? 'default' : 'outline'}
              className="cursor-pointer shrink-0 border-white/20 text-white/60 hover:text-white"
              onClick={() => onGenreChange(activeGenre === id ? null : id)}
            >
              {name}
            </Badge>
          ))}
          <span className="shrink-0 w-8" aria-hidden />
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-background to-transparent" />
      </div>
    </div>
  );
}
