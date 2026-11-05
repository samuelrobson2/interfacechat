import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useChatLabStore } from "./chat-lab-store";

const ICON_API = "/api/chat-lab-icon";
// The rail shows icons at 24px; 96px keeps them crisp on dense screens and
// small enough (a few KB each) to keep in localStorage.
const ICON_PIXELS = 96;
/** Bump when the icon prompt's look changes, so cached icons regenerate. */
const ICON_STYLE = "glass-2";

type ChatLabIcon = { title: string; src: string; style?: string };

type ChatLabIconsState = {
  icons: Record<string, ChatLabIcon>;
  setIcon: (id: string, icon: ChatLabIcon) => void;
};

const useChatLabIcons = create<ChatLabIconsState>()(
  persist(
    (set) => ({
      icons: {},
      setIcon: (id, icon) =>
        set((state) => {
          const sessions = useChatLabStore.getState().sessions;
          const kept = Object.fromEntries(
            Object.entries(state.icons).filter(
              ([key]) => key.startsWith("activity-") || key in sessions,
            ),
          );
          return { icons: { ...kept, [id]: icon } };
        }),
    }),
    { name: "chat-lab-icons" },
  ),
);

const downscale = (src: string) =>
  new Promise<string>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = ICON_PIXELS;
      canvas.height = ICON_PIXELS;
      const context = canvas.getContext("2d");
      if (!context) return reject(new Error("Canvas unavailable"));
      context.drawImage(image, 0, 0, ICON_PIXELS, ICON_PIXELS);
      resolve(canvas.toDataURL("image/webp", 0.9));
    };
    image.onerror = () => reject(new Error("Icon failed to load"));
    image.src = src;
  });

const fetchIcon = async (title: string) => {
  const response = await fetch(ICON_API, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) throw new Error(`Icon failed (${response.status})`);
  const { image }: { image: string } = await response.json();
  return downscale(image);
};

/**
 * A 3D icon for the thread, generated once from its title and cached. Pass
 * `ready: false` while the title is still settling to avoid a wasted image.
 */
export function useChatLabIcon(id: string, title: string, ready = true) {
  const cached = useChatLabIcons((state) => state.icons[id]);
  const setIcon = useChatLabIcons((state) => state.setIcon);
  const isFresh = cached?.title === title && cached.style === ICON_STYLE;

  const { isError } = useQuery({
    queryKey: ["chat-lab", "icon", id, title, ICON_STYLE],
    queryFn: async () => {
      const src = await fetchIcon(title);
      setIcon(id, { title, src, style: ICON_STYLE });
      return src;
    },
    enabled: ready && !isFresh && !!title,
    staleTime: Infinity,
    retry: 1,
  });

  return { src: cached?.src, isError };
}
