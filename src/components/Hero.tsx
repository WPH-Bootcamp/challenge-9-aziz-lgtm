import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getImageUrl } from '@/lib/utils';
import type { Movie } from '@/types/movie';
import playVector from '@/assets/hero/play_vector.png';

interface Props {
  movie: Movie;
}

export default function Hero({ movie }: Props) {
  const navigate = useNavigate();
  const backdrop = getImageUrl(movie.backdrop_path, 'original');

  const contentMotion = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay: 0.2 },
  };

  return (
    <>
      {/* ── Mobile layout ── */}
      <div className="md:hidden relative w-full h-[533px]">
        {/* Rectangle 1 — fade gradient from transparent to black */}
        <div className="absolute w-[392.5px] h-55.25 left-1/2 -translate-x-1/2 bottom-0 bg-linear-to-b from-transparent to-black" />
        {/* Backdrop image fills container */}
        <img
          src={backdrop ?? undefined}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
</div>

<div >
        {/* Content overlay — top: 223px, centered, width: 361px */}
        <motion.div
          className="absolute flex flex-col items-start gap-6 top-55.75 left-1/2 -translate-x-1/2 w-90.25 h-77.5"
          {...contentMotion}
        >
          <h1 className="font-bold self-stretch font-poppins text-2xl leading-9 text-[#FDFDFD]">
            {movie.title}
          </h1>
          <p className="h-35 font-poppins font-normal text-sm leading-7 text-[#A4A7AE] flex-none self-stretch">
            {movie.overview}
          </p>
          <div className="flex flex-col gap-3 self-stretch">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white rounded-full gap-2"
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              Watch Trailer
              <img src={playVector} alt="" className="w-4 h-4" />
            </Button>
            <Button
              className="w-full rounded-full text-white bg-black hover:bg-black/80 border-0"
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              See Detail
            </Button>
          </div>
        </motion.div>
      </div>

      {/* ── Desktop layout ── */}
      <div
        className="hidden md:flex relative w-full h-[85vh] bg-cover bg-center items-end"
        style={{ backgroundImage: `url(${backdrop})` }}
      >
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 pb-20">
          <motion.div className="max-w-xl space-y-4" {...contentMotion}>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
              {movie.title}
            </h1>
            <p className="text-white/70 text-sm leading-relaxed sm:line-clamp-3">
              {movie.overview}
            </p>
            <div className="flex gap-4 pt-2">
              <Button
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-6 gap-2"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                Watch Trailer
                <img src={playVector} alt="" className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-6 border-white/40 text-white bg-transparent hover:bg-white/10"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                See Detail
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
