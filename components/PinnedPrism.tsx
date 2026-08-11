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
  // Live contact anchors (even-metric space). These track the ACTUAL visible
  // prism every frame: at the Hero beat they sit on the logo.svg prism (measured
  // from the DOM), and interpolate onto the procedural pyramid's SDF face as the
  // logo dissolves — so the beam always terminates ON the glass, never floating.
  uniform vec2  uInHit;      // where the incoming beam meets the prism's left face
  uniform vec2  uExit;       // where the outgoing beam(s) leave the prism base
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
    vec2 inHit  = uInHit;                       // contact tracks the real prism
    vec2 E      = uExit;                         // base tracks the real prism
    vec2 inFrom = inHit + vec2(-0.34, 0.045);    // incoming beam origin (upper-left)
    vec2 F      = vec2( 0.00, -0.40);            // focal point (bottom)

    // Transparent base: nothing is drawn where nothing belongs, so each page
    // section's real background shows straight through the canvas (no panel box).
    // Colour is accumulated additively; alpha (coverage) is the max reached by
    // any element, so empty space stays fully transparent.
    vec3 col = vec3(0.0);
    float a  = 0.0;

    // Pyramid body. During the Hero beat the logo.svg overlay IS the visible
    // prism, so the procedural pyramid is hidden and only reveals as the logo
    // dissolves (progress 0.10→0.28) — a clean hand-off, never two prisms at once.
    float pyReveal = smoothstep(0.10, 0.28, p);
    float dTri = sdTriangle(m, apex, baseL, baseR);
    float fill = smoothstep(0.005, -0.005, dTri);
    // A translucent glass body: reads as a dark facet on light sections and a
    // subtly lifted facet on the navy Hero — legible against either background.
    vec3 body = mix(NAVY * 1.05, NAVY9, smoothstep(0.09, 0.30, m.y));
    float bodyA = fill * 0.82 * pyReveal;
    col = mix(col, body, bodyA);
    a = max(a, bodyA);
    // Teal edge glow on the faces (kept high-contrast so it pops on white too).
    float edge = smoothstep(0.018, 0.0, abs(dTri)) * pyReveal;
    col += ACCENT * edge * 1.05;
    a = max(a, edge * 0.9);
    // Inner refraction highlight near the core.
    float inner = smoothstep(0.11, 0.0, length(m - vec2(0.0, 0.17))) * fill * pyReveal;
    col += mix(ACCENT, vec3(1.0), 0.45) * inner * 0.5;
    a = max(a, inner * 0.5);

    // Incoming white beam into the prism (fades once the story moves on).
    float inVis = 1.0 - 0.5 * smoothstep(0.20, 0.55, p);
    float seg   = smoothstep(0.012, 0.0, sdSeg(m, inFrom, inHit)) * inVis;
    col += vec3(1.0) * seg;
    a = max(a, seg);
    // Bright entry spark exactly where it meets the face.
    float spark = smoothstep(0.05, 0.0, length(m - inHit)) * inVis;
    col += vec3(1.0) * spark * 0.85;
    a = max(a, spark * 0.9);

    // Outgoing strands. Width sharpens toward focus; brightness lifts.
    float beamW = mix(0.020, 0.007, focus);
    float glow  = 1.0 + 1.1 * focus;
    vec3 cols[3];
    cols[0] = vec3(1.00, 0.30, 0.42); // warm
    cols[1] = vec3(0.28, 0.92, 0.50); // green
    cols[2] = vec3(0.24, 0.62, 1.00); // blue
    for (int i = 0; i < 3; i++) {
      float fi = float(i) - 1.0;                    // -1, 0, 1
      vec2 target = vec2(fi * 0.17 * spread, -0.42);
      target = mix(target, F, focus);               // reconverge to the point
      float d = sdSeg(m, E, target);
      float b = smoothstep(beamW, 0.0, d);
      // Subtle travelling shimmer along each strand.
      b *= 0.85 + 0.15 * sin(uTime * 2.0 + fi * 2.0 - m.y * 6.0);
      col += cols[i] * b * glow;
      a = max(a, b * 0.95);
    }

    // Focal burst at the convergence point (Case Studies "result").
    float dF = length(m - F);
    float burst = smoothstep(0.16, 0.0, dF) * focus;
    col += mix(ACCENT, vec3(1.0), 0.5) * burst * 1.6;
    col += vec3(1.0) * smoothstep(0.045, 0.0, dF) * focus;
    a = max(a, burst);

    // ---- Alpha: feather only at the panel edges so beams that run off the
    // layer fade out instead of hard-cutting; interior transparency is content
    // driven, so there is no rectangular fill anywhere.
    float aX = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.90, vUv.x);
    float aY = smoothstep(0.0, 0.06, vUv.y) * smoothstep(1.0, 0.94, vUv.y);
    a *= aX * aY;

    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
  }
`;

// Soft, transparent-EDGED fallback shown ONLY if WebGL init throws. It fades to
// fully transparent before the panel edge, so even the fallback never draws a
// hard-edged rectangle/seam against the page (unlike a solid fill would). When
// WebGL succeeds the container stays fully transparent — the canvas is an
// overlay over each section's real background, not a panel sitting on top of it.
const SOFT_FALLBACK =
  "radial-gradient(70% 55% at 50% 24%, rgba(46,196,182,0.20), rgba(13,47,74,0.10) 45%, rgba(13,47,74,0) 72%)";

// Prism contact points as fractions of the logo.svg viewBox (512), used to place
// the beam anchors on the drawn glass regardless of the logo's rendered size:
//   incoming contact ≈ mid of the left face, exit ≈ the bottom-front vertex.
const LOGO_CONTACT: [number, number] = [150 / 512, 150 / 512];
const LOGO_EXIT: [number, number] = [202 / 512, 428 / 512];
// The procedural pyramid's equivalents in even-metric space: a point on the
// apex→baseL left face, and just under the base centre (matches the shader).
const PROC_CONTACT: [number, number] = [-0.068, 0.216];
const PROC_EXIT: [number, number] = [0.0, 0.075];

// GLSL-matching smoothstep for the JS-side anchor interpolation.
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1);
  return t * t * (3 - 2 * t);
};

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
            // Straight (un-premultiplied) alpha so the shader's `vec4(col, a)`
            // composites as a normal over-blend on top of the page: where a=0
            // the section background shows through untouched (no panel box).
            premultipliedAlpha: false,
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
              uInHit: { value: PROC_CONTACT.slice() },
              uExit: { value: PROC_EXIT.slice() },
            },
          });
          const mesh = new Mesh(gl, { geometry, program });

          // Live contact anchors in even-metric space. Measured from the DOM so
          // the incoming beam lands ON the logo prism during the Hero beat (the
          // logo is a fixed-px overlay, so its position can only be known at
          // runtime), then interpolate onto the procedural pyramid as it reveals.
          let logoContactM: [number, number] = PROC_CONTACT.slice() as [number, number];
          let logoExitM: [number, number] = PROC_EXIT.slice() as [number, number];
          const measureLogo = (w: number, h: number) => {
            const img = logo?.querySelector("img");
            if (!img || w < 1 || h < 1) return;
            const hb = host.getBoundingClientRect();
            const ib = img.getBoundingClientRect();
            const asp = w / h;
            const toM = (fx: number, fy: number): [number, number] => {
              const uvx = (ib.left - hb.left + fx * ib.width) / hb.width;
              const uvyTop = (ib.top - hb.top + fy * ib.height) / hb.height;
              return [(uvx - 0.5) * asp, 0.5 - uvyTop];
            };
            logoContactM = toM(LOGO_CONTACT[0], LOGO_CONTACT[1]);
            logoExitM = toM(LOGO_EXIT[0], LOGO_EXIT[1]);
          };

          const resize = () => {
            const w = host.clientWidth || 1;
            const h = host.clientHeight || 1;
            renderer!.setSize(w, h);
            program.uniforms.uResolution.value = [w, h];
            measureLogo(w, h);
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
            // Slide the beam anchors from the logo prism onto the procedural
            // pyramid in lock-step with `pyReveal` (same smoothstep band), so the
            // contact point always sits on whichever prism is currently visible.
            const t = smoothstep(0.1, 0.28, progress.v);
            const inHit = program.uniforms.uInHit.value as number[];
            const exit = program.uniforms.uExit.value as number[];
            inHit[0] = logoContactM[0] + (PROC_CONTACT[0] - logoContactM[0]) * t;
            inHit[1] = logoContactM[1] + (PROC_CONTACT[1] - logoContactM[1]) * t;
            exit[0] = logoExitM[0] + (PROC_EXIT[0] - logoExitM[0]) * t;
            exit[1] = logoExitM[1] + (PROC_EXIT[1] - logoExitM[1]) * t;
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
            container.style.background = "transparent";
            if (logo) logo.style.opacity = "";
          };
        } catch (err) {
          // WebGL failure → show the soft, transparent-edged fallback glow (no
          // hard rectangle) plus the logo overlay, so the layer is never blank.
          if (process.env.NODE_ENV !== "production") {
            console.warn("PinnedPrism init failed, using gradient fallback:", err);
          }
          container.style.background = SOFT_FALLBACK;
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
      style={{ background: "transparent" }}
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
