import { useScene } from "../hooks/useScene.js";

// Fixed full-screen neural-system background for the Orion page. Reads the
// page's snap sections (by class) for the scroll-driven camera and fades the
// hero text via the passed ref.
//
// Dynamically imported to keep three.js out of the entry bundle; see
// HeroCanvas. useScene already awaits an async init and disposes correctly if
// the component unmounts before the chunk resolves.
export default function OrionCanvas({ heroTextRef }) {
    const ref = useScene(async (canvas) => {
        const { initOrionScene } = await import("../three/orion-scene.js");
        return initOrionScene(canvas, {
            binUrl: "/nervous-system.bin",
            heroText: heroTextRef?.current,
        });
    });
    return <canvas id="bg" ref={ref} aria-hidden="true" />;
}
