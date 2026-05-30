import { useQuery } from '@tanstack/react-query';
import { movieService } from '@/services/movieService';

export const usePopularMovies = (page = 1) =>
  useQuery({
    queryKey: ['movies', 'popular', page],
    queryFn: () => movieService.getPopularMovies(page),
  });

export const useNowPlayingMovies = (page = 1) =>
  useQuery({
    queryKey: ['movies', 'now_playing', page],
    queryFn: () => movieService.getNowPlayingMovies(page),
  });

export const useSearchMovies = (query: string, page = 1) =>
  useQuery({
    queryKey: ['movies', 'search', query, page],
    queryFn: () => movieService.searchMovies(query, page),
    enabled: !!query,
  });

export const useMovieDetails = (id: number) =>
  useQuery({
    queryKey: ['movie', id],
    queryFn: () => movieService.getMovieDetails(id),
    enabled: !!id,
  });

export const useMovieCredits = (id: number) =>
  useQuery({
    queryKey: ['movie', id, 'credits'],
    queryFn: () => movieService.getMovieCredits(id),
    enabled: !!id,
  });

export const useMovieVideos = (id: number) =>
  useQuery({
    queryKey: ['movie', id, 'videos'],
    queryFn: () => movieService.getMovieVideos(id),
    enabled: !!id,
  });

export const useSimilarMovies = (id: number) =>
  useQuery({
    queryKey: ['movie', id, 'similar'],
    queryFn: () => movieService.getSimilarMovies(id),
    enabled: !!id,
  });
