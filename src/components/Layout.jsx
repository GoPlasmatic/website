import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import SiteNav from "./SiteNav.jsx";
import SiteFooter from "./SiteFooter.jsx";
import ScrollHint from "./ScrollHint.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { useReveal } from "../hooks/useReveal.js";
import { useSnapReady } from "../hooks/useSnapReady.js";

// Shared chrome the vanilla site injected via common.js: fixed nav, the page
// body, the scroll-hint badge, and the footer (which the Orion scene's final
// camera keyframe queries as `footer.footer`).
export default function Layout() {
    const { pathname } = useLocation();
    const mainRef = useRef(null);
    const firstRender = useRef(true);
    useSnapReady();
    useReveal();

    // Move focus to the main landmark on route change so keyboard / screen-
    // reader users land on the new page's content. Skip the initial mount so we
    // don't steal focus on first paint (or off a deep-link anchor); preventScroll
    // keeps useSnapReady's scroll-restoration authoritative.
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }
        mainRef.current?.focus({ preventScroll: true });
    }, [pathname]);

    return (
        <>
            <a href="#main-content" className="skip-link">
                Skip to content
            </a>
            <SiteNav />
            <main id="main-content" tabIndex={-1} ref={mainRef}>
                {/* Keyed by route so an error on one page clears when the user
                    navigates to another. */}
                <ErrorBoundary key={pathname}>
                    <Outlet />
                </ErrorBoundary>
            </main>
            <ScrollHint />
            <SiteFooter />
        </>
    );
}
