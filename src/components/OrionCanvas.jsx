import { useScene } from "../hooks/useScene.js";
import { initOrionScene } from "../three/orion-scene.js";

// Fixed full-screen neural-system background for the Orion page. Reads the
// page's snap sections (by class) for the scroll-driven camera and fades the
// hero text via the passed ref.
export default function OrionCanvas({ heroTextRef }) {
    const ref = useScene((canvas) =>
        initOrionScene(canvas, {
            binUrl: "/nervous-system.bin",
            heroText: heroTextRef?.current,
        }),
    );
    return <canvas id="bg" ref={ref} />;
}
