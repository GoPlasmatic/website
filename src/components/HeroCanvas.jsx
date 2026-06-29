import { useScene } from "../hooks/useScene.js";
import { initHomeScene } from "../three/home-scene.js";

// Hero neon-ribbon background for the home page. The scene sizes itself from
// the canvas's parent (.hero), so this must render inside the hero section.
export default function HeroCanvas() {
    const ref = useScene((canvas) => initHomeScene(canvas));
    return <canvas id="hero-bg" className="hero-bg" ref={ref} aria-hidden="true" />;
}
