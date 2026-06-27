# Loading and Preload Design

This document records the loading strategy for the portfolio. The current implementation connects the startup loading screen to a lightweight real preload manager.

## Goal

Show the homepage quickly for users on slow networks while quietly preparing enough project content to reduce the delay when they enter a case study.

The loading screen must not wait for every image and video in the site. It should only cover the initial boot moment and a small warmup set.

## Resource Tiers

### Critical

Resources required to make the homepage feel ready:

- Homepage shell and navigation.
- Hero first usable frames.
- Project carousel video metadata or first decoded frame.
- One key detail-page asset for each project.

### Warmup

Small project preview payload loaded during the initial loading screen:

- First 2-4 important evidence images per project.
- Lightweight poster or metadata for important videos.
- No full detail-page video downloads.

### Idle

Remaining project content loaded after the homepage is already interactive:

- Remaining evidence images.
- Lower-priority screenshots and long case-study assets.
- Video metadata only unless the user enters the relevant project or approaches that section.

## Video Policy

Homepage boot must not force full download of large project videos. Later implementation should use hidden `video` elements with `preload="metadata"` or poster/first-frame warmup only.

Full video loading should happen when:

- The user enters the related project page.
- The user approaches a video section.
- The user explicitly opens a demo or video-heavy interaction.

## Priority Boosts

User behavior should raise priority:

- Reaching the project carousel boosts all project detail first-screen assets.
- Hovering or focusing a project boosts that project first.
- Clicking a project should let the route transition cover any remaining wait.

## Preload Manager Interface

The preload manager currently exposes:

```ts
startBootPreload(): Promise<void>
startIdlePreload(): void
subscribeBootPreload(listener): () => void
forceCompleteBootPreload(): void
```

Recommended concurrency:

- Images: 2-3 concurrent requests.
- Video metadata: 1 concurrent request.

Failures should be non-blocking. A failed warmup asset should be skipped and retried only when the actual component needs it.

## Current Implementation

The current `StartupLoadingOverlay` is resource-driven:

- It subscribes to `preloadManager` boot state.
- Each loading item completes only after its warmup resources finish or time out.
- The large percent display is derived from item progress.
- The startup overlay waits at most 30 seconds in normal motion mode.
- If the 30 second fallback is reached, all items are visually completed to 100% before exit.
- After the startup overlay exits, remaining case-study images continue loading through idle preload.
- Large videos are warmed with `metadata` only during startup, not full downloads.
