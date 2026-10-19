import { Movie } from "./entities/movie.entity.js";

export interface PriceRange {
  format: string;
  minPrice: number;
  maxPrice: number;
}

// Respuesta de GET /movies/:id (HU-004): la película con sus funciones
// futuras y los resúmenes que necesita la pantalla de detalle.
export interface MovieDetail extends Movie {
  /** URL lista para un <iframe>; null si el tráiler no es de YouTube. */
  trailerEmbedUrl: string | null;
  /** Idiomas de las funciones futuras encontradas. */
  languages: string[];
  /** Formatos (2D, 3D, IMAX...) de las funciones futuras encontradas. */
  formats: string[];
  /** Rango de precio base por formato. */
  priceByFormat: PriceRange[];
}
