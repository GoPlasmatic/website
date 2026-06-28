import { useEffect, useRef } from "react";
import { initSectionGraphic, resolveConfig } from "../three/section-graphic.js";

// Renders the literal <section-graphic> custom-element tag (so the existing
// `section-graphic`, `section-graphic[position="background"]`, and
// `:has(> section-graphic[position="background"])` CSS keeps matching) and runs
// the Three.js engine once. The engine appends its own <canvas> and text-overlay
// layer into this host; React never re-renders those.
export default function SectionGraphic(props) {
    const hostRef = useRef(null);
    useEffect(() => {
        const dispose = initSectionGraphic(hostRef.current, resolveConfig(props));
        return dispose;
        // Built once per mount; each instance's props are static.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return <section-graphic position={props.position ?? "inline"} ref={hostRef} />;
}
