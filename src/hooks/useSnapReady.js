import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Disable browser scroll restoration so each navigation lands at the top of the
// hero, then enable scroll-snap on the next frame to avoid the initial jump
// that mandatory snap causes during layout. Ports the boot logic from
// common.js, re-primed per route for the SPA.
export function useSnapReady() {
    const { pathname } = useLocation();
    useEffect(() => {
        if ("scrollRestoration" in history) {
            history.scrollRestoration = "manual";
        }
        const root = document.documentElement;
        root.classList.remove("snap-ready");
        window.scrollTo(0, 0);
        const id = requestAnimationFrame(() => {
            root.classList.add("snap-ready");
        });
        return () => cancelAnimationFrame(id);
    }, [pathname]);
}
