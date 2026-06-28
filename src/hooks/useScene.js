import { useEffect, useRef } from "react";

// Owns a <canvas> ref, runs a scene initializer (sync or async) that returns a
// dispose() teardown, and tears the scene down on unmount. If the async init
// resolves after the component already unmounted, the teardown still runs.
export function useScene(init, deps = []) {
    const ref = useRef(null);
    useEffect(() => {
        let dispose;
        let cancelled = false;
        Promise.resolve(init(ref.current)).then((d) => {
            if (cancelled) d?.();
            else dispose = d;
        });
        return () => {
            cancelled = true;
            dispose?.();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    return ref;
}
