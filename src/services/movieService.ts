import api from '@/lib/axios';
import type { Movie, MovieResponse, VideoResponse, CreditsResponse } from '@/types/movie';

export const movieService = {
  async getPopularMovies(page = 1): Promise<MovieResponse> {
    const { data } = await api.get<MovieResponse>('/movie/popular', { params: { page } });
    return data;
  },

  async getNowPlayingMovies(page = 1): Promise<MovieResponse> {
    const { data } = await api.get<MovieResponse>('/movie/now_playing', { params: { page } });
    return data;
  },

  async getTopRatedMovies(page = 1): Promise<MovieResponse> {
    const { data } = await api.get<MovieResponse>('/movie/top_rated', { params: { page } });
    return data;
  },

  async getMovieDetails(id: number): Promise<Movie> {
    const { data } = await api.get<Movie>(`/movie/${id}`);
    return data;
  },

  async getMovieVideos(id: number): Promise<VideoResponse> {
    const { data } = await api.get<VideoResponse>(`/movie/${id}/videos`);
    return data;
  },

  async getMovieCredits(id: number): Promise<CreditsResponse> {
    const { data } = await api.get<CreditsResponse>(`/movie/${id}/credits`);
    return data;
  },

  async getSimilarMovies(id: number): Promise<MovieResponse> {
    const { data } = await api.get<MovieResponse>(`/movie/${id}/similar`);
    return data;
  },

  async searchMovies(query: string, page = 1): Promise<MovieResponse> {
    const { data } = await api.get<MovieResponse>('/search/movie', { params: { query, page } });
    return data;
  },

  async getUpcomingMovies(page = 1): Promise<MovieResponse> {
    const { data } = await api.get<MovieResponse>('/movie/upcoming', { params: { page } });
    return data;
  },
};
