import { AudioType } from "./entities/showtime.entity.js";

export interface NamedRef {
  id: number;
  name: string;
}

export interface FormatPriceRange {
  format: string;
  minPrice: number;
  maxPrice: number;
}

export interface MovieSummary {
  id: number;
  name: string;
  genres: string[];
  rating: string;
  durationMinutes: number;
  posterUrl: string | null;
  averageRating: number;
}

export interface MovieDetail extends MovieSummary {
  synopsis: string | null;
  director: string | null;
  actors: string[];
  releaseDate: Date | string | null;
  bannerUrl: string | null;
  trailerUrl: string | null;
  /** URL lista para un <iframe>; null si el tráiler no es de YouTube. */
  trailerEmbedUrl: string | null;
  languages: string[];
  formats: string[];
  priceByFormat: FormatPriceRange[];
}

export interface ShowtimeView {
  id: number;
  movieId: number;
  startsAt: Date;
  cinema: NamedRef;
  city: NamedRef;
  room: { id: number; number: number };
  format: string;
  language: string;
  audioType: AudioType;
  price: number;
  soldOut: boolean;
}
