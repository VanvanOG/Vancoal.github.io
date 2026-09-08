import { publicPath } from "./publicPath";
export type SequenceDirection = "forward" | "reverse";
/** Compressed resources belong to the session; decoded windows belong to the player. */
class IntroResources {
  private blobs = new Map<number, Blob>();
  private bitmaps = new Map<number, ImageBitmap>();
  private downloads: Promise<void> | null = null;
  private decoding: Promise<void> | null = null;
  private wanted = new Set<number>();
  private pinned = -1;
  private generation = 0;
  get blobCount() {
    return this.blobs.size;
  }
  get decodedCount() {
    return this.bitmaps.size;
  }
  get(frame: number) {
    return this.bitmaps.get(frame);
  }
  pin(frame: number) {
    this.pinned = frame;
    this.evict();
  }
  private evict() {
    for (const [frame, bitmap] of this.bitmaps) {
      if (!this.wanted.has(frame) && frame !== this.pinned) {
        bitmap.close();
        this.bitmaps.delete(frame);
      }
    }
  }
  preload(onProgress: (value: number) => void = () => {}) {
    if (this.downloads) return this.downloads;
    this.downloads = (async () => {
      let cursor = 0;
      const errors: unknown[] = [];
      await Promise.all(
        Array.from({ length: 6 }, async () => {
          while (cursor < 301) {
            const frame = cursor++;
            if (!this.blobs.has(frame)) {
              const controller = new AbortController();
              const timer = window.setTimeout(() => controller.abort(), 60000);
              try {
                const response = await fetch(
                  publicPath(
                    `/media/project-intro-frames/project-intro-${String(frame).padStart(3, "0")}.webp`,
                  ),
                  { signal: controller.signal },
                );
                if (!response.ok)
                  throw new Error(
                    `Transition frame ${frame}: HTTP ${response.status}`,
                  );
                this.blobs.set(frame, await response.blob());
              } catch (error) {
                errors.push(error);
              } finally {
                window.clearTimeout(timer);
              }
            }
            onProgress(this.blobs.size / 301);
          }
        }),
      );
      if (errors.length)
        throw new Error(
          `${errors.length} transition frame(s) failed. Please retry.`,
        );
    })().finally(() => {
      this.downloads = null;
    });
    return this.downloads;
  }
  prepare(frame: number, direction: SequenceDirection): Promise<void> {
    const step = direction === "forward" ? 1 : -1;
    this.wanted = new Set(
      Array.from({ length: 40 }, (_, i) => frame + i * step).filter(
        (i) => i >= 0 && i < 301,
      ),
    );
    this.evict();
    if (this.decoding) return this.decoding;
    const generation = this.generation;
    const decodingFrames = new Set<number>();
    const errors: unknown[] = [];
    const worker = async () => {
      while (generation === this.generation) {
        const next = [...this.wanted].find(
          (i) => !this.bitmaps.has(i) && !decodingFrames.has(i),
        );
        if (next === undefined) return;
        decodingFrames.add(next);
        const blob = this.blobs.get(next);
        if (!blob)
          throw new Error(
            `Transition frame ${next} is not downloaded. Please retry.`,
          );
        let bitmap: ImageBitmap;
        try {
          bitmap = await createImageBitmap(blob);
        } catch (error) {
          this.blobs.delete(next);
          throw error;
        }
        if (generation !== this.generation || !this.wanted.has(next))
          bitmap.close();
        else this.bitmaps.set(next, bitmap);
        this.evict();
      }
    };
    // Four browser decode jobs keep pace with the faster first beat. Each frame is
    // reserved once; stale direction/unmount results close before entering cache.
    this.decoding = Promise.all(
      Array.from({ length: 4 }, () =>
        worker().catch((error) => {
          errors.push(error);
        }),
      ),
    )
      .then(() => {
        if (errors.length) throw errors[0];
      })
      .finally(() => {
        this.decoding = null;
      });
    return this.decoding;
  }
  releaseDecoded() {
    this.generation++;
    this.wanted.clear();
    this.pinned = -1;
    this.evict();
  }
}
export const introResources = new IntroResources();
