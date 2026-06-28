import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

// The "Scroll to explore" badge that floats over the hero and fades once the
// user scrolls past 80px. Injected on every page by common.js in the vanilla
// site; here it lives in the Layout.
export default function ScrollHint() {
    const [hidden, setHidden] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => {
        const onScroll = () => setHidden(window.scrollY > 80);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, [pathname]);

    return (
        <div className={`scroll-hint${hidden ? " hidden" : ""}`} id="scrollHint">
            <span>Scroll to explore</span>
            <div className="arrow"></div>
        </div>
    );
}
