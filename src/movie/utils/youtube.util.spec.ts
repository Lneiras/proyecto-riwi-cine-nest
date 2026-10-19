import { describe, it, expect } from "vitest";
import { toYoutubeEmbedUrl } from "./youtube.util.js";

describe("toYoutubeEmbedUrl", () => {
  const embed = "https://www.youtube.com/embed/dQw4w9WgXcQ";

  it.each([
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtube.com/watch?v=dQw4w9WgXcQ&t=10s",
    "https://m.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://youtu.be/dQw4w9WgXcQ",
    "https://www.youtube.com/shorts/dQw4w9WgXcQ",
    "https://www.youtube.com/embed/dQw4w9WgXcQ",
  ])("converts %s", (url) => {
    expect(toYoutubeEmbedUrl(url)).toBe(embed);
  });

  it.each([null, undefined, "", "not a url", "https://vimeo.com/123456", "https://www.youtube.com/watch?v=short"])(
    "returns null for %s",
    (url) => {
      expect(toYoutubeEmbedUrl(url as string | null | undefined)).toBeNull();
    },
  );
});
