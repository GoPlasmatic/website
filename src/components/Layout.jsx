import { Outlet } from "react-router-dom";
import SiteNav from "./SiteNav.jsx";
import SiteFooter from "./SiteFooter.jsx";
import ScrollHint from "./ScrollHint.jsx";
import { useReveal } from "../hooks/useReveal.js";
import { useSnapReady } from "../hooks/useSnapReady.js";

// Shared chrome the vanilla site injected via common.js: fixed nav, the page
// body, the scroll-hint badge, and the footer (which the Orion scene's final
// camera keyframe queries as `footer.footer`).
export default function Layout() {
    useSnapReady();
    useReveal();
    return (
        <>
            <SiteNav />
            <Outlet />
            <ScrollHint />
            <SiteFooter />
        </>
    );
}
