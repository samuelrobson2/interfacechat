import { cn } from "@/shared/lib/css";
import { Text, textVariants } from "@/shared/ui/kit/text";
import {
  Controls,
  formatTime,
  FullscreenButton,
  Gesture,
  MediaPlayer,
  MediaProvider,
  MuteButton,
  PlayButton,
  Poster,
  SeekButton,
  TimeSlider,
  useMediaState
} from "@vidstack/react";
import {
  ExitFullScreenIcon,
  FullScreenIcon,
  GoBackwards15Icon,
  GoForward15Icon,
  MoreIcon,
  PauseIcon,
  PlayIcon,
  ReplayIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeMuteIcon
} from "./icons";

const controlButtonCn =
  "flex size-12 cursor-pointer items-center justify-center outline-none";

// ========== VideoPlayer ==========

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  subtitle?: string;
  thumbnails?: string;
  className?: string;
  children?: React.ReactNode;
  onMoreClick?: () => void;
}

const VideoPlayer = ({
  src,
  poster,
  title,
  subtitle,
  thumbnails,
  className,
  children,
  onMoreClick,
}: VideoPlayerProps) => (
  <MediaPlayer
    src={src}
    title={title}
    className={cn(
      "group/player relative aspect-video overflow-hidden rounded-[20px] bg-black",
      // vidstack default CSS is not imported — force the <video> to fill its container.
      "[&_video]:w-full [&_video]:h-full [&_video]:object-contain",
      // Remove aspect-ratio constraint and border-radius in fullscreen so the player fills the screen.
      "[&:fullscreen]:aspect-auto [&:fullscreen]:rounded-none",
      "[&:-webkit-full-screen]:aspect-auto [&:-webkit-full-screen]:rounded-none",
      "data-fullscreen:aspect-auto data-fullscreen:rounded-none",
      className,
    )}
    data-slot="video-player"
  >
    <MediaProvider>
      {poster && (
        <Poster
          src={poster}
          alt={title ?? ""}
          // vidstack manages data-visible: hidden before playback starts, block otherwise
          className="absolute inset-0 hidden size-full object-cover data-visible:block"
        />
      )}
    </MediaProvider>
    <Gesture
      action="toggle:paused"
      className="absolute inset-0 z-0 block size-full"
      event="click"
    />
    <Gesture
      action="toggle:fullscreen"
      className="absolute inset-0 z-0 block size-full"
      event="dblpointerup"
    />
    {children ?? (
      <DefaultVideoLayout
        title={title}
        subtitle={subtitle}
        thumbnails={thumbnails}
        onMoreClick={onMoreClick}
      />
    )}
  </MediaPlayer>
);

// ========== DefaultVideoLayout ==========

interface DefaultVideoLayoutProps {
  title?: string;
  subtitle?: string;
  thumbnails?: string;
  onMoreClick?: () => void;
}

const DefaultVideoLayout = ({
  title,
  subtitle,
  thumbnails,
  onMoreClick,
}: DefaultVideoLayoutProps) => (
  <>
    <VideoMainController />
    <VideoControls
      title={title}
      subtitle={subtitle}
      thumbnails={thumbnails}
      onMoreClick={onMoreClick}
    />
  </>
);

// ========== VideoMainController ==========

const VideoMainController = ({ className }: { className?: string }) => {
  const paused = useMediaState("paused");
  const ended = useMediaState("ended");

  return (
    <PlayButton
      className={cn(
        "absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2",
        "size-[96px] items-center justify-center rounded-full outline-none cursor-pointer",
        "bg-black/25 hover:bg-black/40 backdrop-blur-md",
        "border border-stroke-secondary",
        "shadow-[inset_-0.73px_0.73px_0.73px_-1.46px_rgba(255,255,255,0.35)]",
        "transition-all duration-200",
        paused || ended ? "opacity-100" : "pointer-events-none opacity-0",
        className,
      )}
      aria-label={ended ? "Replay" : paused ? "Play" : "Pause"}
    >
      {ended ? (
        <ReplayIcon svgClasses="size-10" />
      ) : (
        <PlayIcon svgClasses="size-10" />
      )}
    </PlayButton>
  );
};

// ========== VideoControls ==========

interface VideoControlsProps {
  title?: string;
  subtitle?: string;
  thumbnails?: string;
  onMoreClick?: () => void;
  className?: string;
}

const VideoControls = ({
  title,
  subtitle,
  thumbnails,
  onMoreClick,
  className,
}: VideoControlsProps) => (
  <Controls.Root
    className={cn(
      // Use !important to override safe-area-inset-* inline styles added by vidstack in fullscreen
      "absolute inset-x-0 bottom-0 z-10 flex flex-col px-[40px]! py-[16px]!",
      "bg-linear-to-b from-[rgba(8, 9, 13, 0)] to-[rgba(8,9,13,0.9)] backdrop-blur-[2px]",
      "pointer-events-none opacity-0 transition-opacity duration-200",
      "data-visible:pointer-events-auto data-visible:opacity-100",
      className,
    )}
  >
    <Controls.Group className="flex items-end justify-between">
      <div className="flex flex-col gap-2">
        {title && (
          <Text
            variant="h3"
            weight="regular"
            color="inverse"
            className="leading-none"
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text variant="body" className="text-gray-2 leading-[19px]">
            {subtitle}
          </Text>
        )}
      </div>
      <VideoTimeDisplay />
    </Controls.Group>

    <Controls.Group className="w-full">
      <VideoProgressBar thumbnails={thumbnails} />
    </Controls.Group>

    <Controls.Group className="flex items-center justify-between">
      <div className="flex gap-2 items-center">
        <VideoPlayButton />
        <SeekButton
          seconds={-15}
          className={controlButtonCn}
          aria-label="Seek backward 15 seconds"
        >
          <GoBackwards15Icon />
        </SeekButton>
        <SeekButton
          seconds={15}
          className={controlButtonCn}
          aria-label="Seek forward 15 seconds"
        >
          <GoForward15Icon />
        </SeekButton>
      </div>
      <div className="flex gap-2 items-center">
        <VideoMuteButton />
        <VideoFullscreenButton />
        {onMoreClick && (
          <button
            type="button"
            onClick={onMoreClick}
            className={controlButtonCn}
            aria-label="More options"
          >
            <MoreIcon />
          </button>
        )}
      </div>
    </Controls.Group>
  </Controls.Root>
);

// ========== VideoTimeDisplay ==========

const VideoTimeDisplay = () => {
  const currentTime = useMediaState("currentTime");
  const duration = useMediaState("duration");

  return (
    <Text variant="body" color="inverse" className="leading-[16px]">
      {formatTime(currentTime)} / {formatTime(duration)}
    </Text>
  );
};

// ========== VideoPlayButton ==========

const VideoPlayButton = () => {
  const paused = useMediaState("paused");

  return (
    <PlayButton
      className={controlButtonCn}
      aria-label={paused ? "Play" : "Pause"}
    >
      {paused ? <PlayIcon /> : <PauseIcon />}
    </PlayButton>
  );
};

// ========== VideoMuteButton ==========

const VideoMuteButton = () => {
  const volume = useMediaState("volume");
  const muted = useMediaState("muted");

  return (
    <MuteButton
      className={controlButtonCn}
      aria-label={muted ? "Unmute" : "Mute"}
    >
      {muted || volume === 0 ? (
        <VolumeMuteIcon />
      ) : volume < 0.5 ? (
        <VolumeLowIcon />
      ) : (
        <VolumeHighIcon />
      )}
    </MuteButton>
  );
};

// ========== VideoFullscreenButton ==========

const VideoFullscreenButton = () => {
  const fullscreen = useMediaState("fullscreen");

  return (
    <FullscreenButton
      className={controlButtonCn}
      aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
    >
      {fullscreen ? <ExitFullScreenIcon /> : <FullScreenIcon />}
    </FullscreenButton>
  );
};

// ========== VideoProgressBar ==========

const VideoProgressBar = ({ thumbnails }: { thumbnails?: string }) => (
  <TimeSlider.Root className="group/slider relative flex py-4 w-full cursor-pointer touch-none select-none items-center outline-none pointer-events-auto aria-hidden:hidden">
    <TimeSlider.Track className="relative z-0 h-[2px] w-full rounded-[20px] bg-white/40">
      <TimeSlider.TrackFill className="absolute h-full w-(--slider-fill) rounded-[20px] bg-icon-inverse will-change-[width]" />
      <TimeSlider.Progress className="absolute h-full w-(--slider-progress) rounded-[20px] bg-white/20 will-change-[width]" />
    </TimeSlider.Track>

    <TimeSlider.Thumb className="absolute left-(--slider-fill) top-1/2 z-20 size-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-icon-inverse opacity-0 transition-opacity group-data-active/slider:opacity-100 will-change-[left]" />

    <TimeSlider.Preview className="pointer-events-none flex flex-col items-center gap-[8px] opacity-0 transition-opacity duration-200 data-visible:opacity-100">
      {thumbnails && (
        <TimeSlider.Thumbnail.Root
          src={thumbnails}
          className="block h-(--thumbnail-height) max-h-[90px] min-h-[68px] w-(--thumbnail-width) min-w-[120px] max-w-[160px] overflow-hidden rounded-[8px] border border-icon-inverse bg-black shadow-[0px_4px_16px_0px_rgba(0,0,0,0.25)]"
        >
          <TimeSlider.Thumbnail.Img className="size-full object-cover" />
        </TimeSlider.Thumbnail.Root>
      )}
      <TimeSlider.Value
        className={cn(
          textVariants({
            variant: "label",
            weight: "regular",
            className: "leading-none",
          }),
          "rounded-[8px] border border-icon-inverse bg-gray-6 px-3 py-2 shadow-[0px_4px_16px_0px_rgba(0,0,0,0.25)]",
        )}
      />
    </TimeSlider.Preview>
  </TimeSlider.Root>
);

export {
  DefaultVideoLayout, VideoControls, VideoFullscreenButton, VideoMainController, VideoMuteButton, VideoPlayButton, VideoPlayer, VideoProgressBar,
  VideoTimeDisplay
};

  export type { DefaultVideoLayoutProps, VideoControlsProps, VideoPlayerProps };

