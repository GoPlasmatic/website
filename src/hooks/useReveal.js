import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Reveal-on-scroll: fade/slide elements in once they enter the viewport. Ports
// the IntersectionObserver from common.js. Re-runs per route so freshly mounted
// sections get observed. Playwright's freeze step force-adds `.visible` to the
// same selectors, so keep the class list identical.
export function useReveal() {
    const { pathname } = useLocation();
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting)
                        entry.target.classList.add("visible");
                }
            },
            { threshold: 0.1 },
        );
        document
            .querySelectorAll(
                ".reveal, .reveal-left, .reveal-right, .reveal-blur",
            )
            .forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, [pathname]);
}
