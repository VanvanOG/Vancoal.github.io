import { publicPath } from "./publicPath";
import { introResources } from "./sequenceResources";
export interface BootPreloadItem {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  status: "pending" | "active" | "complete";
}
export interface BootPreloadState {
  isDone: boolean;
  items: BootPreloadItem[];
  progress: number;
  error: string | null;
}
type Resource = { kind: "image" | "video"; src: string };
const image = (src: string): Resource => ({
  kind: "image",
  src: publicPath(src),
});
const video = (src: string): Resource => ({
  kind: "video",
  src: publicPath("/media/project-videos/" + src + ".mp4"),
});
const definitions = [
  {
    id: "homepage",
    title: "Homepage Base",
    subtitle: "正在加载首页基础",
    resources: [
      "loading-loop-matched.gif",
      "complete-icon.svg",
      "pending-icon-v3.svg",
    ].map((n) => image("/media/loading/" + n)),
  },
  {
    id: "hero",
    title: "Hero Visual",
    subtitle: "正在同步首页视觉",
    resources: ["001", "025", "049", "074", "098"].map((n) =>
      image("/media/hero-frames/hero-frame-" + n + ".jpg"),
    ),
  },
  {
    id: "transition",
    title: "Project Transition",
    subtitle: "正在准备项目过渡",
    resources: [] as Resource[],
  },
  {
    id: "mars-era",
    title: "Mars Era",
    subtitle: "正在预热火星纪元 PVP 活动",
    resources: [image("/media/mars-era/完整界面图.png"), video("mars-era")],
  },
  {
    id: "ai-dialogue",
    title: "AI Dialogue",
    subtitle: "正在预热 AI 对话",
    resources: ["基础界面", "图片重新设计-4", "图片重新设计-6"]
      .map((n) =>
        image(
          "/media/ai-dialogue-20260907/assets/" +
            encodeURIComponent(n) +
            ".png",
        ),
      )
      .concat(video("ai-dialogue-2")),
  },
  {
    id: "ai-commission",
    title: "AI Commission",
    subtitle: "正在预热 AI 委托",
    resources: [
      image("/media/ai-commission/06.webp"),
      image("/media/ai-commission/18.webp"),
      video("ai-commission-v1"),
    ],
  },
  {
    id: "ava-league",
    title: "AVA League",
    subtitle: "正在预热数据埋点",
    resources: [image("/media/ava-league/main.webp"), video("ava-league-v1")],
  },
];
const resources = new Map<string, Promise<void>>();
const posters = new Map<string, string>();
export const getPreloadedVideoPoster = (src: string) => posters.get(src);
const listeners = new Set<(state: BootPreloadState) => void>();
let state: BootPreloadState = {
  isDone: false,
  error: null,
  progress: 0,
  items: definitions.map(({ id, title, subtitle }) => ({
    id,
    title,
    subtitle,
    progress: 0,
    status: "pending",
  })),
};
let running: Promise<void> | null = null;
export const getBootPreloadState = (): BootPreloadState => ({
  ...state,
  items: state.items.map((i) => ({ ...i })),
});
const emit = () => listeners.forEach((fn) => fn(getBootPreloadState()));
const update = (
  id: string,
  progress: number,
  status: BootPreloadItem["status"],
) => {
  state.items = state.items.map((i) =>
    i.id === id ? { ...i, progress, status } : i,
  );
  state.progress = Math.floor(
    (state.items.reduce((sum, i) => sum + i.progress, 0) / state.items.length) *
      100,
  );
  emit();
};
function load(resource: Resource) {
  const key = resource.kind + ":" + resource.src;
  if (resources.has(key)) return resources.get(key)!;
  const promise = new Promise<void>((resolve, reject) => {
    let settled = false;
    const media =
      resource.kind === "image" ? new Image() : document.createElement("video");
    const finish = (error?: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      media.onload = null;
      media.onerror = null;
      if (media instanceof HTMLVideoElement) {
        media.onloadeddata = null;
        media.removeAttribute("src");
        media.load();
      }
      error ? reject(error) : resolve();
    };
    const timer = window.setTimeout(
      () => finish(new Error("Resource timed out: " + resource.src)),
      60000,
    );
    media.onerror = () => finish(new Error("Resource failed: " + resource.src));
    if (media instanceof HTMLImageElement) {
      media.decoding = "async";
      media.onload = () => {
        void media.decode().then(() => finish(), finish);
      };
      media.src = resource.src;
    } else {
      media.muted = true;
      media.playsInline = true;
      media.preload = "auto";
      media.onloadeddata = () => {
        try {
          if (media.readyState < 2 || !media.videoWidth)
            throw new Error("Video frame unavailable");
          const canvas = document.createElement("canvas");
          canvas.width = media.videoWidth;
          canvas.height = media.videoHeight;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas unavailable");
          ctx.drawImage(media, 0, 0);
          posters.set(resource.src, canvas.toDataURL("image/jpeg", 0.82));
          finish();
        } catch (error) {
          finish(error);
        }
      };
      media.src = resource.src;
      media.load();
    }
  }).catch((error) => {
    resources.delete(key);
    throw error;
  });
  resources.set(key, promise);
  return promise;
}
export const subscribeBootPreload = (fn: (state: BootPreloadState) => void) => {
  listeners.add(fn);
  fn(getBootPreloadState());
  return () => {
    listeners.delete(fn);
  };
};
export function startBootPreload() {
  if (running) return running;
  if (state.isDone) return Promise.resolve();
  state.error = null;
  emit();
  running = (async () => {
    for (const item of definitions) {
      if (state.items.find((i) => i.id === item.id)?.status === "complete")
        continue;
      const startedAt = performance.now();
      update(item.id, 0, "active");
      if (item.id === "transition") {
        await introResources.preload((p) => update(item.id, p * 0.9, "active"));
        await introResources.prepare(0, "forward");
      } else {
        let completed = 0;
        const errors: unknown[] = [];
        for (const resource of item.resources) {
          try {
            await load(resource);
            completed++;
            update(
              item.id,
              (completed / item.resources.length) * 0.98,
              "active",
            );
          } catch (error) {
            errors.push(error);
          }
        }
        if (errors.length) throw errors[0];
      }
      const remaining = Math.max(
        (item.id === "hero" ? 280 : 260) - (performance.now() - startedAt),
        0,
      );
      if (remaining)
        await new Promise((resolve) => window.setTimeout(resolve, remaining));
      update(item.id, 1, "complete");
    }
    state.isDone = true;
    state.progress = 100;
    emit();
  })()
    .catch((error) => {
      state.error = error instanceof Error ? error.message : "加载失败，请重试";
      emit();
    })
    .finally(() => {
      running = null;
    });
  return running;
}
