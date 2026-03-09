export function normalizeYouTubeUrl(videoUrl: string): string {
  try {
    const url = new URL(videoUrl);

    if (url.hostname === "youtu.be") {
      const videoId = url.pathname.replace(/^\//, "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl;
    }

    if (
      url.hostname.includes("youtube.com") ||
      url.hostname.includes("youtube-nocookie.com")
    ) {
      if (url.pathname === "/watch") {
        const videoId = url.searchParams.get("v");
        return videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl;
      }

      if (url.pathname.startsWith("/embed/")) {
        return videoUrl;
      }

      if (url.pathname.startsWith("/shorts/")) {
        const videoId = url.pathname.split("/").at(-1);
        return videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl;
      }
    }

    return videoUrl;
  } catch {
    return videoUrl;
  }
}
