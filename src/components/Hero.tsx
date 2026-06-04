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
      <div className="md:hidden">
        {/* Hero image — 1:1 square with bottom fade */}
        <div className="relative w-full aspect-square">
          <img
            src={backdrop ?? undefined}
            alt={movie.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-b from-transparent to-black" />
        </div>

        {/* Content — pulled up to straddle hero bottom edge */}
        <motion.div
          className="relative z-10 -mt-45 flex flex-col gap-6 px-4 pb-6"
          {...contentMotion}
        >
          <h1 className="font-bold font-poppins text-2xl leading-9 text-gray-25">
            {movie.title}
          </h1>
          <p className="font-poppins font-normal text-sm leading-7 text-gray-400">
            {movie.overview}
          </p>
          <div className="flex flex-col gap-3">
            <Button
              className="w-full bg-primary hover:bg-primary/70 hover:scale-101 text-white rounded-full gap-2 cursor-pointer"
              onClick={() => navigate(`/movie/${movie.id}`)}
            >
              Watch Trailer
              <img src={playVector} alt="" className="w-4 h-4" />
            </Button>
            <Button
              className="w-full rounded-full text-white bg-transparent hover:bg-gray-400/10 hover:scale-101 border border-gray-800 cursor-pointer"
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
        <div className="relative z-10 md:mx-17.5 lg:mx-11xl px-6 pb-20">
          <motion.div className="md:w-158.75 md:h-36 lg:w-158.75 lg:h-66.5 xl:w-158.75 xl:h-66.5 space-y-4" {...contentMotion}>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
              {movie.title}
            </h1>
            <p className="w-full text-white/70 text-sm leading-relaxed sm:line-clamp-3">
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
