"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Renderer, Program, Mesh, Triangle } from "ogl";

// Register plugins client-side only (same client-only guarding convention as
// Hero / HowItWorks / the OGL components). registerPlugin is idempotent.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Continuous pinned prism visual spanning Hero → "Who we are" → Services →
 * Case Studies (the `#pinned-range` wrapper in app/page.tsx).
 *
 * WHY THIS OWNS THE VISUAL (vs. running alongside PrismWebGL):
 * To guarantee EXACTLY ONE WebGL context on the page at any scroll position,
 * this component is the sole canvas for the pinned range. It only initializes
 * on desktop + motion-allowed (via gsap.matchMedia), which is precisely the
 * mode where Hero hides its own glass panel (`motion-safe:lg:invisible`). In
 * every other mode (reduced-motion, or <1024px) this component initializes
 * nothing and the original PrismWebGL hero panel remains the only context.
 * The two never run together.
 *
 * SSR-SAFETY (this project has shipped two production-only hydration bugs):
 * the fixed layer is always in the DOM; whether it's shown is decided purely
 * by CSS media queries (`hidden lg:block motion-reduce:lg:hidden`) — never by
 * JS state — so server and client markup match. The CSS fallback gradient +
 * logo overlay render even if WebGL init throws, so the layer is never blank.
 * The complementary hero-panel hide uses the same pure-CSS variants, so the
 * two are exact complements with no hydration flip.
 *
 * MOTIF EVOLUTION (driven by a single normalized progress 0→1, scrubbed):
 *   whole beam  →  split into 3 colored strands  →  refocused point of light.
 * Progress bands are tuned to the section proportions, not hard section edges.
 */

const vertex = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uProgress;   // 0..1 across the whole pinned range
  uniform vec2  uResolution;
  varying vec2 vUv;

  // Brand palette.
  const vec3 NAVY   = vec3(0.051, 0.184, 0.290); // #0D2F4A
  const vec3 NAVY9  = vec3(0.024, 0.094, 0.149); // deep navy
  const vec3 ACCENT = vec3(0.180, 0.769, 0.714); // #2EC4B6

  // iq's exact-distance triangle SDF (negative inside).
  float sdTriangle(vec2 p, vec2 p0, vec2 p1, vec2 p2){
    vec2 e0=p1-p0, e1=p2-p1, e2=p0-p2;
    vec2 v0=p-p0, v1=p-p1, v2=p-p2;
    vec2 pq0=v0-e0*clamp(dot(v0,e0)/dot(e0,e0),0.0,1.0);
    vec2 pq1=v1-e1*clamp(dot(v1,e1)/dot(e1,e1),0.0,1.0);
    vec2 pq2=v2-e2*clamp(dot(v2,e2)/dot(e2,e2),0.0,1.0);
    float s=sign(e0.x*e2.y-e0.y*e2.x);
    vec2 d=min(min(vec2(dot(pq0,pq0), s*(v0.x*e0.y-v0.y*e0.x)),
                   vec2(dot(pq1,pq1), s*(v1.x*e1.y-v1.y*e1.x))),
                   vec2(dot(pq2,pq2), s*(v2.x*e2.y-v2.y*e2.x)));
    return -sqrt(d.x)*sign(d.y);
  }

  // Distance to segment a→b.
  float sdSeg(vec2 p, vec2 a, vec2 b){
    vec2 pa=p-a, ba=b-a;
    float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
    return length(pa-ba*h);
  }

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    // Even-metric space: centered, x scaled by aspect so shapes/beam widths are
    // visually uniform in this tall portrait layer.
    vec2 m = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);

    // Gentle idle bob of the whole motif.
    m.y -= 0.012 * sin(uTime * 0.6);

    float p = uProgress;

    // ---- State drivers -----------------------------------------------------
    // spread: 0 (Hero, single beam) → rises through Services → back to 0 in
    // Case Studies (reconverge).  focus: 0 until Case Studies → 1 (sharp point).
    float spread = smoothstep(0.22, 0.44, p) * (1.0 - smoothstep(0.60, 0.82, p));
    float focus  = smoothstep(0.64, 0.98, p);

    // ---- Geometry (even-metric space) -------------------------------------
    vec2 apex  = vec2( 0.00,  0.30);
    vec2 baseL = vec2(-0.17,  0.09);
    vec2 baseR = vec2( 0.17,  0.09);
    vec2 inFrom = vec2(-0.42, 0.24);     // incoming white beam origin (left)
    vec2 inHit  = vec2(-0.055, 0.19);    // entry on the left face
    vec2 E      = vec2( 0.00,  0.07);    // emergence point (base of pyramid)
    vec2 F      = vec2( 0.00, -0.40);    // focal point (bottom)

    vec3 col = mix(NAVY * 0.85, NAVY9, smoothstep(0.0, 1.0, vUv.y));

    // Pyramid body. During the Hero beat the logo.svg overlay IS the visible
    // prism, so the procedural pyramid is hidden and only reveals as the logo
    // dissolves (progress 0.10→0.28) — a clean hand-off, never two prisms at once.
    float pyReveal = smoothstep(0.10, 0.28, p);
    float dTri = sdTriangle(m, apex, baseL, baseR);
    float fill = smoothstep(0.005, -0.005, dTri);
    vec3 body = mix(NAVY * 1.35, NAVY9 * 1.1, smoothstep(0.09, 0.30, m.y));
    col = mix(col, body, fill * 0.95 * pyReveal);
    // Teal edge glow on the faces.
    col += ACCENT * smoothstep(0.018, 0.0, abs(dTri)) * 0.55 * pyReveal;

    // Incoming white beam into the prism (fades once the story moves on).
    float inVis = 1.0 - 0.55 * smoothstep(0.20, 0.55, p);
    col += vec3(1.0) * smoothstep(0.012, 0.0, sdSeg(m, inFrom, inHit)) * 0.9 * inVis;
    // Bright entry spark where it meets the face.
    col += vec3(1.0) * smoothstep(0.05, 0.0, length(m - inHit)) * 0.6 * inVis;

    // Outgoing strands. Width sharpens toward focus; brightness lifts.
    float beamW = mix(0.020, 0.007, focus);
    float glow  = 1.0 + 1.1 * focus;
    vec3 cols[3];
    cols[0] = vec3(1.00, 0.35, 0.45); // warm
    cols[1] = vec3(0.42, 0.95, 0.55); // green
    cols[2] = vec3(0.30, 0.66, 1.00); // blue
    for (int i = 0; i < 3; i++) {
      float fi = float(i) - 1.0;                    // -1, 0, 1
      vec2 target = vec2(fi * 0.17 * spread, -0.42);
      target = mix(target, F, focus);               // reconverge to the point
      float d = sdSeg(m, E, target);
      float b = smoothstep(beamW, 0.0, d);
      // Subtle travelling shimmer along each strand.
      b *= 0.85 + 0.15 * sin(uTime * 2.0 + fi * 2.0 - m.y * 6.0);
      col += cols[i] * b * glow;
    }

    // Focal burst at the convergence point (Case Studies "result").
    float dF = length(m - F);
    col += mix(ACCENT, vec3(1.0), 0.5) * smoothstep(0.16, 0.0, dF) * focus * 1.6;
    col += vec3(1.0) * smoothstep(0.045, 0.0, dF) * focus;

    // ---- Alpha: feather the panel edges so it melts into the sections ------
    float aX   = smoothstep(0.0, 0.20, vUv.x);            // fade in from left
    float aY   = smoothstep(0.0, 0.10, vUv.y) * smoothstep(1.0, 0.90, vUv.y);
    float alpha = aX * aY * 0.97;

    gl_FragColor = vec4(col, alpha);
  }
`;

// Same static brand gradient PrismWebGL uses — base layer + no-WebGL fallback.
const FALLBACK_GRADIENT =
  "linear-gradient(180deg, #0a2438 0%, #061826 100%), radial-gradient(120% 60% at 50% 30%, rgba(46,196,182,0.28), rgba(13,47,74,0) 60%)";

export function PinnedPrism() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const host = canvasHostRef.current;
    const logo = logoRef.current;
    if (!container || !host) return;

    // gsap.matchMedia gates the ENTIRE feature (canvas + scrub) to desktop +
    // motion-allowed, and auto-reverts on teardown / when the query stops
    // matching (e.g. resize to mobile) — which loses the WebGL context. This is
    // exactly the mode where the Hero hides its own PrismWebGL panel, so there
    // is only ever one context. It mirrors the media query on the layer itself
    // (`hidden lg:block motion-reduce:lg:hidden`).
    const mm = gsap.matchMedia();

    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        const range = document.getElementById("pinned-range");
        if (!range) return;

        let raf = 0;
        let running = false;
        let last = 0;
        const progress = { v: 0 };
        let renderer: Renderer | undefined;
        let gl: Renderer["gl"] | undefined;
        let canvas: HTMLCanvasElement | undefined;
        let observer: IntersectionObserver | undefined;
        let resizeObserver: ResizeObserver | undefined;

        try {
          renderer = new Renderer({
            alpha: true,
            antialias: false,
            dpr: Math.min(window.devicePixelRatio || 1, 2), // cap DPR at 2
          });
          gl = renderer.gl;
          gl.clearColor(0, 0, 0, 0);

          canvas = gl.canvas as HTMLCanvasElement;
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          canvas.style.display = "block";
          host.appendChild(canvas);

          const geometry = new Triangle(gl);
          const program = new Program(gl, {
            vertex,
            fragment,
            uniforms: {
              uTime: { value: 0 },
              uProgress: { value: 0 },
              uResolution: { value: [1, 1] },
            },
          });
          const mesh = new Mesh(gl, { geometry, program });

          const resize = () => {
            const w = host.clientWidth || 1;
            const h = host.clientHeight || 1;
            renderer!.setSize(w, h);
            program.uniforms.uResolution.value = [w, h];
          };
          resize();
          resizeObserver = new ResizeObserver(resize);
          resizeObserver.observe(host);

          const loop = (now: number) => {
            raf = requestAnimationFrame(loop);
            const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
            last = now;
            program.uniforms.uTime.value += dt;
            program.uniforms.uProgress.value = progress.v;
            renderer!.render({ scene: mesh });
          };
          const start = () => {
            if (running) return;
            running = true;
            last = 0;
            raf = requestAnimationFrame(loop);
          };
          const stop = () => {
            running = false;
            if (raf) cancelAnimationFrame(raf);
            raf = 0;
          };

          // Pause the loop when the whole pinned range is scrolled out of view.
          observer = new IntersectionObserver(
            ([entry]) => (entry.isIntersecting ? start() : stop()),
            { threshold: 0 },
          );
          observer.observe(range);

          // ---- The single continuous scrub -------------------------------
          const st = ScrollTrigger.create({
            trigger: range,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            onUpdate: (self) => {
              progress.v = self.progress;
              // Dissolve the logo/wordmark as the beam splits (Hero → Services).
              if (logo) {
                logo.style.opacity = String(
                  1 - gsap.utils.clamp(0, 1, (self.progress - 0.14) / 0.14),
                );
              }
              // Release cleanly: fade the whole layer out over the last few
              // percent so it never lingers into Stats / How It Works' pin.
              container.style.opacity = String(
                1 - gsap.utils.clamp(0, 1, (self.progress - 0.93) / 0.07),
              );
            },
          });

          return () => {
            stop();
            st.kill();
            observer?.disconnect();
            resizeObserver?.disconnect();
            gl?.getExtension("WEBGL_lose_context")?.loseContext();
            if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
            // Reset inline styles matchMedia can't revert (we set them directly).
            container.style.opacity = "";
            if (logo) logo.style.opacity = "";
          };
        } catch (err) {
          // WebGL failure → the CSS gradient + logo overlay already show, so the
          // layer is never blank. Tear down whatever was created.
          if (process.env.NODE_ENV !== "production") {
            console.warn("PinnedPrism init failed, using gradient fallback:", err);
          }
          if (raf) cancelAnimationFrame(raf);
          observer?.disconnect();
          resizeObserver?.disconnect();
          gl?.getExtension("WEBGL_lose_context")?.loseContext();
          if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
        }
      },
    );

    return () => mm.revert();
  }, []);

  // Fixed right-side layer. Shown only on desktop + motion (pure CSS): on
  // reduced-motion or <1024px it is display:none and nothing initializes, so
  // the Hero's own PrismWebGL panel stays the only WebGL context.
  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 right-0 z-20 hidden w-[42vw] overflow-hidden lg:block motion-reduce:lg:hidden"
      style={{ background: FALLBACK_GRADIENT }}
    >
      <div ref={canvasHostRef} className="absolute inset-0" />
      {/* Logo + wordmark composited over the Hero beat, dissolved as it splits. */}
      <div
        ref={logoRef}
        className="absolute inset-x-0 top-[16%] flex flex-col items-center gap-4"
      >
        <Image
          src="/logo.svg"
          alt=""
          width={220}
          height={220}
          className="h-auto w-40 drop-shadow-[0_12px_40px_rgba(46,196,182,0.35)]"
          priority
        />
        <p className="text-2xl font-bold tracking-tight text-white">
          HML <span className="text-accent">Prism</span>
        </p>
      </div>
    </div>
  );
}
