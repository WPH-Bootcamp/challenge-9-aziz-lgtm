import movieLogo from '@/assets/hero/movie_logo.png';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16 py-6">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <img src={movieLogo} alt="Movie" className="h-7 object-contain" />
        <p className="text-xs text-white/40">Copyright ©2025 Movie Explorer</p>
      </div>
    </footer>
  );
}
