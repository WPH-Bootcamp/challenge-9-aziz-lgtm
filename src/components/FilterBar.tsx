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

interface Props {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  activeGenre: number | null;
  onGenreChange: (genre: number | null) => void;
}

export default function FilterBar({ sortBy, onSortChange, activeGenre, onGenreChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-white/40 uppercase tracking-wide">Sort</span>
        {SORT_OPTIONS.map(({ value, label }) => (
          <Button
            key={value}
            size="sm"
            variant={sortBy === value ? 'default' : 'outline'}
            className={`h-7 px-3 text-xs rounded-full ${sortBy !== value ? 'border-white/20 text-white/60 hover:bg-white/10' : ''}`}
            onClick={() => onSortChange(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
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
      </div>
    </div>
  );
}
