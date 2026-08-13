"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionVideoProps {
  /** Path under /public, e.g. "/videos/city_looped.mp4". */
  src: string;
  /** Poster/fallback frame, e.g. "/videos/hero-poster.jpg". */
  poster: string;
  /**
   * Overlay tint between the video and the section content, tuned per section so
   * text stays legible against that clip's brightness (e.g. "bg-navy-900/70").
   */
  overlayClassName?: string;
}

/**
 * Looping background video for a section. Sits behind the section's content as a
 * full-cover layer with a per-section overlay tint for text contrast.
 *
 * Same performance/accessibility conventions the WebGL components used here:
 *   - reduced-motion → never loads or plays; the poster image is the whole
 *     visual (no autoplaying video), matching the codebase's useReducedMotion gate.
 *   - IntersectionObserver defers `src` assignment until the section is near the
 *     viewport, so a visitor who never scrolls to a section never downloads its
 *     clip; and pauses the video whenever it scrolls out of view so an offscreen
 *     clip isn't still decoding (same pause-offscreen pattern as PrismWebGL).
 *
 * SSR-safety: the wrapper + <video> (with `poster`) always render identically on
 * server and client; `src` is only ever attached on the client after the
 * observer fires, so there's no hydration mismatch and no blank flash — the
 * poster shows until the clip is loaded (or forever, for reduced-motion).
 */
export function SectionVideo({
  src,
  poster,
  overlayClassName = "bg-navy-900/70",
}: SectionVideoProps) {
  const reduced = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  // Once true, stays true — the clip has been (or is being) fetched.
  const [load, setLoad] = useState(false);

  useEffect(() => {
    // Reduced motion: never load or autoplay — the poster is the static fallback.
    if (reduced) return;
    const el = videoRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoad(true);
          // autoplay may be a no-op until src is attached; the onCanPlay handler
          // below also calls play(), so this covers the already-loaded case.
          el.play?.().catch(() => {
            /* autoplay blocked (e.g. iOS) → poster stays visible */
          });
        } else {
          el.pause?.();
        }
      },
      // Start fetching a little before the section reaches the viewport.
      { rootMargin: "200px 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      <video
        ref={videoRef}
        // src is attached lazily (client-only, once near viewport). Until then the
        // poster is shown and nothing is downloaded.
        src={reduced || !load ? undefined : src}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay
        preload="none"
        onCanPlay={(e) => {
          if (!reduced) e.currentTarget.play().catch(() => {});
        }}
        className="h-full w-full object-cover"
      />
      <div className={cn("absolute inset-0", overlayClassName)} />
    </div>
  );
}
