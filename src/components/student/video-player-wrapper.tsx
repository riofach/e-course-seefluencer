import { normalizeYouTubeUrl } from "./video-player-wrapper.helpers";

type VideoPlayerWrapperProps = {
  videoUrl: string;
  title: string;
};

export function VideoPlayerWrapper({
  videoUrl,
  title,
}: VideoPlayerWrapperProps) {
  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="relative aspect-video w-full">
        <iframe
          src={normalizeYouTubeUrl(videoUrl)}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
