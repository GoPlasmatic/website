import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoUrl from "../assets/plasmatic-logo.svg";
import { DOCS_URL } from "../site-meta.js";

// Port of the <site-nav> custom element from the vanilla site. Rendered inside
// a literal <site-nav> tag so the `site-nav { display:block }` CSS still
// applies. `active` highlighting is derived from the current route.
export default function SiteNav() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { pathname } = useLocation();

    const activeKey = pathname.startsWith("/orion")
        ? "product"
        : pathname.startsWith("/contact")
          ? "contact"
          : pathname === "/"
            ? "home"
            : "";

    // Close the drawer when the route changes.
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Mirror the open state onto <body> so the mobile scroll-lock CSS applies.
    useEffect(() => {
        document.body.classList.toggle("nav-open", open);
        return () => document.body.classList.remove("nav-open");
    }, [open]);

    // Compact the bar once the page scrolls (see .nav.scrolled in common.css).
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const current = (key) =>
        key === activeKey ? { "aria-current": "page" } : {};

    return (
        <site-nav active={activeKey}>
            <nav
                className={`nav${open ? " open" : ""}${scrolled ? " scrolled" : ""}`}
            >
                <Link to="/" aria-label="Plasmatic home" className="nav-logo-link">
                    <img src={logoUrl} alt="Plasmatic" className="nav-logo" />
                </Link>
                <button
                    type="button"
                    className="nav-toggle"
                    aria-label="Toggle menu"
                    aria-expanded={open}
                    aria-controls="site-nav-links"
                    onClick={() => setOpen((o) => !o)}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <div className="nav-links" id="site-nav-links">
                    <Link to="/orion" {...current("product")}>
                        Product
                    </Link>
                    <a href={DOCS_URL} target="_blank" rel="noopener">
                        Docs
                    </a>
                    <Link to="/contact" {...current("contact")}>
                        Contact
                    </Link>
                    <a
                        href="https://github.com/GoPlasmatic"
                        target="_blank"
                        rel="noopener"
                    >
                        GitHub
                    </a>
                    <Link to="/contact" className="btn-nav">
                        Talk to an engineer
                    </Link>
                </div>
            </nav>
        </site-nav>
    );
}
