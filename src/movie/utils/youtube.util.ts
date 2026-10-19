const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/**
 * Convierte una URL de YouTube (watch, youtu.be, shorts o embed) en la URL
 * embebible `https://www.youtube.com/embed/<id>`, para que el tráiler se
 * reproduzca sin salir de la plataforma (RN-016).
 * Devuelve null si la URL no es de YouTube o no tiene un id válido.
 */
export function toYoutubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = parsed.pathname.split("/")[1] ?? null;
  } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (parsed.pathname === "/watch") {
      id = parsed.searchParams.get("v");
    } else {
      const [, kind, videoId] = parsed.pathname.split("/");
      if (kind === "embed" || kind === "shorts") id = videoId ?? null;
    }
  }

  return id && YOUTUBE_ID.test(id)
    ? `https://www.youtube.com/embed/${id}`
    : null;
}
