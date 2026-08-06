"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { Renderer, Program, Mesh, Triangle } from "ogl";

/**
 * Single restrained WebGL accent for the hero prism panel: a slow, simplex-noise
 * driven gradient in the brand palette. Deliberately GPU-cheap — no pointer
 * fluid simulation, capped DPR, paused when off-screen.
 *
 * Fallbacks: if the user prefers reduced motion, or WebGL init throws, we render
 * a static CSS gradient instead of a blank area.
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

// Ashima 2D simplex noise (public domain) + a small domain warp for a fluid feel.
const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColorA; // deep navy
  uniform vec3 uColorB; // accent teal
  varying vec2 vUv;

  vec3 mod289(vec3 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x){ return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x){ return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
           + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    // Keep the noise isotropic regardless of panel aspect ratio.
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 uv = vUv;
    uv.x *= aspect;

    float t = uTime * 0.12;
    // Two octaves + light domain warp -> gentle flowing bands.
    float n = snoise(uv * 1.8 + vec2(t, t * 0.6));
    n += 0.5 * snoise(uv * 3.6 - vec2(t * 0.5, t * 0.8));
    n = n * 0.5 + 0.5;

    vec3 col = mix(uColorA, uColorB, smoothstep(0.25, 0.85, n));
    // A brighter teal highlight where the noise peaks, for a little life.
    col += uColorB * smoothstep(0.75, 1.0, n) * 0.35;

    // Soft radial vignette so the effect melts into the panel edges.
    float d = distance(vUv, vec2(0.5));
    float alpha = smoothstep(0.85, 0.25, d) * 0.9;

    gl_FragColor = vec4(col, alpha);
  }
`;

interface PrismWebGLProps {
  className?: string;
}

// Brand palette as normalized RGB.
const NAVY: [number, number, number] = [13 / 255, 47 / 255, 74 / 255];
const ACCENT: [number, number, number] = [46 / 255, 196 / 255, 182 / 255];

// Static brand gradient used as the panel's base layer and as the no-WebGL fallback.
const FALLBACK_GRADIENT =
  "radial-gradient(120% 90% at 30% 25%, rgba(46,196,182,0.38), rgba(13,47,74,0) 60%), linear-gradient(140deg, rgba(46,196,182,0.18), rgba(13,47,74,0))";

export function PrismWebGL({ className }: PrismWebGLProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const container = containerRef.current;
    if (!container) return;

    let raf = 0;
    let running = false;
    let last = 0;
    let renderer: Renderer | undefined;
    let observer: IntersectionObserver | undefined;
    let resizeObserver: ResizeObserver | undefined;
    // OGL's context is a WebGL2 context augmented with a few extra fields.
    let gl: Renderer["gl"] | undefined;

    try {
      renderer = new Renderer({
        alpha: true,
        antialias: false,
        // Cap devicePixelRatio at 2 to control GPU/memory cost on hi-DPI screens.
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      });
      gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      const canvas = gl.canvas as HTMLCanvasElement;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      container.appendChild(canvas);

      const geometry = new Triangle(gl);
      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: [1, 1] },
          uColorA: { value: NAVY },
          uColorB: { value: ACCENT },
        },
      });
      const mesh = new Mesh(gl, { geometry, program });

      const resize = () => {
        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;
        renderer!.setSize(w, h);
        program.uniforms.uResolution.value = [w, h];
      };
      resize();
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);

      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        // Normalize by real elapsed seconds so speed is identical at 60/120Hz.
        // Clamp to avoid a huge jump after the tab was backgrounded.
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        program.uniforms.uTime.value += dt;
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

      // Pause the render loop whenever the panel is scrolled out of view.
      observer = new IntersectionObserver(
        ([entry]) => (entry.isIntersecting ? start() : stop()),
        { threshold: 0 },
      );
      observer.observe(container);

      return () => {
        stop();
        observer?.disconnect();
        resizeObserver?.disconnect();
        // Release the WebGL context and detach the canvas on unmount.
        gl?.getExtension("WEBGL_lose_context")?.loseContext();
        if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      };
    } catch (err) {
      // Any WebGL failure -> the static gradient below already shows through,
      // so just tear down whatever was created and leave the canvas off.
      if (process.env.NODE_ENV !== "production") {
        console.warn("PrismWebGL init failed, using gradient fallback:", err);
      }
      if (raf) cancelAnimationFrame(raf);
      observer?.disconnect();
      resizeObserver?.disconnect();
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    }
  }, [reduced]);

  // The static brand gradient is ALWAYS the base layer, applied via inline style
  // so it renders identically on the server and client (no hydration flip). When
  // WebGL is available it appends a canvas on top; the canvas has an alpha
  // vignette so the gradient still reads at the edges. Reduced-motion users and
  // any WebGL failure simply keep this gradient with no canvas over it — never a
  // blank area.
  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={className}
      style={{ background: FALLBACK_GRADIENT }}
    />
  );
}
