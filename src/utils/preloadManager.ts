import { projects } from "../data/projects";
import { publicPath } from "./publicPath";

type ResourceKind = "image" | "video";
type ItemStatus = "pending" | "active" | "complete";

interface PreloadResource {
  kind: ResourceKind;
  src: string;
  timeoutMs?: number;
}

export interface BootPreloadItem {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  status: ItemStatus;
}

export interface BootPreloadState {
  isDone: boolean;
  items: BootPreloadItem[];
  progress: number;
}

interface BootPreloadDefinition {
  id: string;
  title: string;
  subtitle: string;
  minDurationMs?: number;
  resources: PreloadResource[];
}

const image = (path: string, timeoutMs = 7000): PreloadResource => ({
  kind: "image",
  src: path.startsWith("/") ? publicPath(path) : path,
  timeoutMs,
});

const videoMetadata = (path: string, timeoutMs = 1200): PreloadResource => ({
  kind: "video",
  src: path.startsWith("/") ? publicPath(path) : path,
  timeoutMs,
});

const encodedAsset = (folder: string, fileName: string) => `/media/${folder}/${encodeURIComponent(fileName)}`;
const encodedPng = (folder: string, name: string) => encodedAsset(folder, `${name}.png`);

const BOOT_PRELOAD_DEFINITIONS: BootPreloadDefinition[] = [
  {
    id: "homepage",
    title: "Homepage Base",
    subtitle: "正在加载首页基础",
    minDurationMs: 260,
    resources: [
      image("/media/loading/loading-loop-matched.gif"),
      image("/media/loading/complete-icon.svg"),
      image("/media/loading/pending-icon-v3.svg"),
    ],
  },
  {
    id: "hero",
    title: "Hero Visual",
    subtitle: "正在同步首页视觉",
    minDurationMs: 280,
    resources: [
      image("/media/hero-frames/hero-frame-001.jpg"),
      image("/media/hero-frames/hero-frame-025.jpg"),
      image("/media/hero-frames/hero-frame-049.jpg"),
      image("/media/hero-frames/hero-frame-074.jpg"),
      image("/media/hero-frames/hero-frame-098.jpg"),
    ],
  },
  {
    id: "mars-era",
    title: "Mars Era",
    subtitle: "正在预热火星纪元",
    minDurationMs: 260,
    resources: [
      image("/media/project-cards/mars-era-card.png"),
      image(encodedPng("mars-era", "完整界面图")),
      image(encodedPng("mars-era", "战斗失败-补偿奖励")),
      videoMetadata("/media/project-videos/mars-era.mp4"),
    ],
  },
  {
    id: "ai-dialogue",
    title: "AI Dialogue",
    subtitle: "正在预热 AI 对话",
    minDurationMs: 260,
    resources: [
      image("/media/project-cards/ai-dialogue-card.png"),
      image(encodedPng("habitat-ai-dialogue", "基础界面")),
      image(encodedPng("habitat-ai-dialogue", "试装清单界面")),
      videoMetadata("/media/project-videos/ai-dialogue-2.mp4"),
    ],
  },
  {
    id: "ai-design-lab",
    title: "AI Design Lab",
    subtitle: "正在预热 AI LAB",
    minDurationMs: 260,
    resources: [
      image("/media/project-cards/ai-lab-card.png"),
      image(encodedPng("ai-design-lab", "画格子")),
      image(encodedPng("ai-design-lab", "标注插件")),
      image(encodedPng("ai-design-lab", "交互原则SKILL")),
      videoMetadata("/media/project-videos/ai-lab.mp4"),
    ],
  },
  {
    id: "case-files",
    title: "Case Files",
    subtitle: "正在整理案例文件",
    minDurationMs: 300,
    resources: [
      image(encodedPng("mars-era", "局内技能界面")),
      image(encodedPng("habitat-ai-dialogue", "设计中界面表现")),
      videoMetadata(encodedAsset("ai-design-lab", "标注插件演示视频.mp4")),
    ],
  },
];

const createInitialState = (): BootPreloadState => ({
  isDone: false,
  items: BOOT_PRELOAD_DEFINITIONS.map((item) => ({
    id: item.id,
    progress: 0,
    status: "pending",
    subtitle: item.subtitle,
    title: item.title,
  })),
  progress: 0,
});

const resourceCache = new Map<string, Promise<void>>();
const listeners = new Set<(state: BootPreloadState) => void>();

let bootState = createInitialState();
let bootPromise: Promise<void> | null = null;
let idleStarted = false;

const delay = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const emit = () => {
  const snapshot = getBootPreloadState();
  listeners.forEach((listener) => listener(snapshot));
};

const setItemState = (id: string, patch: Partial<BootPreloadItem>) => {
  bootState = {
    ...bootState,
    items: bootState.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
  };
  recalculateProgress();
  emit();
};

const recalculateProgress = () => {
  const total = bootState.items.length || 1;
  const progress = bootState.items.reduce((sum, item) => sum + item.progress, 0) / total;

  bootState = {
    ...bootState,
    progress: Math.round(Math.min(progress * 100, 100)),
  };
};

const loadWithTimeout = (resource: PreloadResource, loader: (finish: () => void) => void) =>
  new Promise<void>((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timer);
      resolve();
    };
    const timer = window.setTimeout(finish, resource.timeoutMs ?? 6000);

    loader(finish);
  });

const loadImageResource = (resource: PreloadResource) =>
  loadWithTimeout(resource, (finish) => {
    const img = new Image();

    img.decoding = "async";
    img.onload = () => {
      if (img.decode) {
        img.decode().catch(() => undefined).finally(finish);
        return;
      }

      finish();
    };
    img.onerror = finish;
    img.src = resource.src;
  });

const loadVideoMetadataResource = (resource: PreloadResource) =>
  loadWithTimeout(resource, (finish) => {
    const video = document.createElement("video");

    video.muted = true;
    video.playsInline = true;
    video.preload = "metadata";

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) {
        return;
      }

      cleaned = true;
      video.removeEventListener("loadedmetadata", cleanup);
      video.removeEventListener("loadeddata", cleanup);
      video.removeEventListener("error", cleanup);
      finish();
      video.removeAttribute("src");
      video.load();
    };
    video.addEventListener("loadedmetadata", cleanup, { once: true });
    video.addEventListener("loadeddata", cleanup, { once: true });
    video.addEventListener("error", cleanup, { once: true });

    video.src = resource.src;
    video.load();
  });

const preloadResource = (resource: PreloadResource) => {
  const cacheKey = `${resource.kind}:${resource.src}`;
  const cached = resourceCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const promise =
    resource.kind === "video" ? loadVideoMetadataResource(resource) : loadImageResource(resource);

  resourceCache.set(cacheKey, promise);
  return promise;
};

const preloadResourceGroup = async (
  resources: PreloadResource[],
  onProgress: (progress: number) => void,
  concurrency = 2,
) => {
  if (!resources.length) {
    onProgress(1);
    return;
  }

  let completed = 0;
  let cursor = 0;
  const workerCount = Math.min(concurrency, resources.length);

  const runWorker = async () => {
    while (cursor < resources.length) {
      const index = cursor;
      cursor += 1;
      await preloadResource(resources[index]).catch(() => undefined);
      completed += 1;
      onProgress(completed / resources.length);
    }
  };

  await Promise.all(Array.from({ length: workerCount }, runWorker));
};

const runBootPreload = async () => {
  for (const item of BOOT_PRELOAD_DEFINITIONS) {
    const startedAt = performance.now();

    setItemState(item.id, { progress: 0, status: "active" });

    await preloadResourceGroup(item.resources, (progress) => {
      setItemState(item.id, { progress: Math.min(progress, 0.98), status: "active" });
    });

    const remainingMinDuration = Math.max((item.minDurationMs ?? 0) - (performance.now() - startedAt), 0);

    if (remainingMinDuration > 0) {
      await delay(remainingMinDuration);
    }

    setItemState(item.id, { progress: 1, status: "complete" });
  }

  bootState = {
    ...bootState,
    isDone: true,
    progress: 100,
  };
  emit();
  startIdlePreload();
};

const collectProjectMedia = () => {
  const media = new Set<string>();
  const visit = (value: unknown) => {
    if (typeof value === "string") {
      if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(value)) {
        media.add(value);
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    if (value && typeof value === "object") {
      Object.values(value).forEach(visit);
    }
  };

  visit(projects);
  return [...media].map((src) => ({ kind: "image" as const, src, timeoutMs: 7000 }));
};

export const getBootPreloadState = (): BootPreloadState => ({
  ...bootState,
  items: bootState.items.map((item) => ({ ...item })),
});

export const subscribeBootPreload = (listener: (state: BootPreloadState) => void) => {
  listeners.add(listener);
  listener(getBootPreloadState());

  return () => {
    listeners.delete(listener);
  };
};

export const startBootPreload = () => {
  if (!bootPromise) {
    bootPromise = runBootPreload();
  }

  return bootPromise;
};

export const forceCompleteBootPreload = () => {
  if (bootState.isDone) {
    return;
  }

  bootState = {
    isDone: true,
    items: bootState.items.map((item) => ({
      ...item,
      progress: 1,
      status: "complete",
    })),
    progress: 100,
  };
  emit();
  startIdlePreload();
};

export const startIdlePreload = () => {
  if (idleStarted || typeof window === "undefined") {
    return;
  }

  idleStarted = true;

  const run = () => {
    const idleResources = collectProjectMedia();
    void preloadResourceGroup(idleResources, () => undefined, 2);
  };

  const browserWindow = window as typeof window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  };

  if (browserWindow.requestIdleCallback) {
    browserWindow.requestIdleCallback(run, { timeout: 2500 });
    return;
  }

  window.setTimeout(run, 1200);
};
