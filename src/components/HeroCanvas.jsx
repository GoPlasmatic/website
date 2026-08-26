import { useScene } from "../hooks/useScene.js";

// Hero neon-ribbon background for the home page. The scene sizes itself from
// the canvas's parent (.hero), so this must render inside the hero section.
//
// The scene module is imported dynamically so three.js lands in its own chunk
// instead of the entry bundle. It is decorative and effect-driven, so deferring
// it costs nothing visible while keeping ~600 kB of WebGL off the critical path
// — including on /privacy, /terms and /404, which never mount a scene at all.
export default function HeroCanvas() {
    const ref = useScene(async (canvas) => {
        const { initHomeScene } = await import("../three/home-scene.js");
        return initHomeScene(canvas);
    });
    return <canvas id="hero-bg" className="hero-bg" ref={ref} aria-hidden="true" />;
}
