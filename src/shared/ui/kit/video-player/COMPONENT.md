# VideoPlayer

Custom video player built on `@vidstack/react` with fully custom UI controls.

```tsx
import {
  VideoPlayer,
  DefaultVideoLayout,
  VideoMainController,
  VideoControls,
  VideoProgressBar,
  VideoTimeDisplay,
  VideoPlayButton,
  VideoMuteButton,
  VideoFullscreenButton,
} from "@adaptionlabs/ui-kit";
```

## Usage Tree

```
VideoPlayer (root — wraps MediaPlayer + MediaProvider)
├── Poster (optional, shown before playback)
├── Gesture handlers (click to pause, dbl-click fullscreen)
└── DefaultVideoLayout (rendered when no children)
    ├── VideoMainController (center 96px play/replay button)
    └── VideoControls (bottom panel with gradient overlay)
        ├── Info row: title + subtitle | time display
        ├── VideoProgressBar (seekable TimeSlider)
        │   ├── Track + TrackFill + Progress
        │   ├── Thumb (visible on hover)
        │   └── Preview tooltip (time value + optional thumbnail)
        └── Buttons row
            ├── Left: Play/Pause, Seek -15s, Seek +15s
            └── Right: Mute, Fullscreen, More (optional)
```

## VideoPlayer Props

No HTML element extension — accepts only explicitly declared props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | — | Video source URL (mp4, HLS, DASH, etc.) — required |
| `poster` | string | — | Poster image URL |
| `title` | string | — | Title displayed in the controls |
| `subtitle` | string | — | Subtitle displayed below the title |
| `thumbnails` | string | — | VTT URL for thumbnail previews on seek |
| `className` | string | — | Additional classes on the root element |
| `children` | ReactNode | — | Custom layout (bypasses DefaultVideoLayout) |
| `onMoreClick` | `() => void` | — | Callback for the "More" button; hides button if not provided |

## DefaultVideoLayout Props

No HTML element extension — accepts only explicitly declared props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | — | Title text |
| `subtitle` | string | — | Subtitle text |
| `thumbnails` | string | — | VTT URL for thumbnail previews |
| `onMoreClick` | `() => void` | — | "More" button callback |

## VideoControls Props

No HTML element extension — accepts only explicitly declared props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | — | Title text |
| `subtitle` | string | — | Subtitle text |
| `thumbnails` | string | — | VTT URL for thumbnail previews |
| `onMoreClick` | `() => void` | — | "More" button callback |
| `className` | string | — | Additional classes |

## VideoMainController Props

No HTML element extension — accepts only explicitly declared props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | — | Additional classes |

## VideoProgressBar Props

No HTML element extension — accepts only explicitly declared props.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `thumbnails` | string | — | VTT URL for thumbnail previews on seek |

## Icons

All 12 player icons are in `./icons/` and map to vidstack components:

- `PlayButton` (controls bar) — `PlayIcon` / `PauseIcon`
- `MuteButton` — `VolumeHighIcon` / `VolumeLowIcon` / `VolumeMuteIcon`
- `FullscreenButton` — `FullScreenIcon` / `ExitFullScreenIcon`
- `SeekButton seconds={-15}` — `GoBackwards15Icon`
- `SeekButton seconds={15}` — `GoForward15Icon`
- `button` (More) — `MoreIcon`
- Center overlay (`VideoMainController`) — `PlayIcon` / `ReplayIcon`

## Fullscreen Notes

- In fullscreen mode `border-radius` and `aspect-ratio` are removed so the player fills the screen.
- Padding on `VideoControls` uses `!important` to override `env(safe-area-inset-*)` inline styles that vidstack injects in fullscreen.
- The `<video>` element is forced to `width: 100%; height: 100%` via `[&_video]` selector since vidstack default CSS is not imported.

## Examples

```tsx
// Default (all controls out of the box)
<VideoPlayer
  src="/video.mp4"
  poster="/poster.jpg"
  title="Episode 1"
  subtitle="Season 1"
  thumbnails="/thumbnails.vtt"
/>

// With More button
<VideoPlayer
  src="/video.mp4"
  title="My Video"
  onMoreClick={() => openSettings()}
/>

// Custom layout (compose your own controls)
<VideoPlayer src="/video.mp4" poster="/poster.jpg">
  <VideoMainController />
  <VideoControls title="Custom" subtitle="Layout" />
</VideoPlayer>
```
