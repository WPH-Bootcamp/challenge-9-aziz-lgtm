import { Link, useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import movieLogo from '@/assets/hero/movie_logo.png';

const schema = z.object({ query: z.string().min(1) });
type FormValues = z.infer<typeof schema>;

interface Props {
  onSearch: (query: string) => void;
}

export default function Navbar({ onSearch }: Props) {
  const location = useLocation();
  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: FormValues) => onSearch(values.query);

  const handleClear = () => {
    reset();
    onSearch('');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <img src={movieLogo} alt="Movie" className="h-8 object-contain" />
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm transition-colors ${
              location.pathname === '/' ? 'text-white font-semibold' : 'text-white/60 hover:text-white'
            }`}
          >
            Home
          </Link>
          <Link
            to="/favorites"
            className={`text-sm transition-colors ${
              location.pathname === '/favorites' ? 'text-white font-semibold' : 'text-white/60 hover:text-white'
            }`}
          >
            Favorites
          </Link>
        </nav>

        {/* Search */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
          <Search className="w-4 h-4 text-white/50" />
          <input
            {...register('query')}
            placeholder="Search Movie"
            className="bg-transparent text-sm text-white placeholder-white/40 outline-none w-36"
            onKeyDown={(e) => { if (e.key === 'Escape') handleClear(); }}
          />
        </form>
      </div>
    </header>
  );
}
