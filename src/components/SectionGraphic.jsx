import { useEffect, useRef } from "react";

// Renders the literal <section-graphic> custom-element tag (so the existing
// `section-graphic`, `section-graphic[position="background"]`, and
// `:has(> section-graphic[position="background"])` CSS keeps matching) and runs
// the Three.js engine once. The engine appends its own <canvas> and text-overlay
// layer into this host; React never re-renders those.
//
// The engine is imported dynamically so three.js stays out of the entry bundle
// (see HeroCanvas). The engine itself lazy-inits on an IntersectionObserver, so
// the chunk request is the only work added up front.
export default function SectionGraphic(props) {
    const hostRef = useRef(null);
    useEffect(() => {
        let dispose;
        let cancelled = false;
        import("../three/section-graphic.js").then(
            ({ initSectionGraphic, resolveConfig }) => {
                if (cancelled) return;
                dispose = initSectionGraphic(hostRef.current, resolveConfig(props));
            },
        );
        return () => {
            cancelled = true;
            dispose?.();
        };
        // Built once per mount; each instance's props are static.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return <section-graphic position={props.position ?? "inline"} ref={hostRef} />;
}
