import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { usePageStyles } from "../hooks/usePageStyles.js";
import { DOCS_URL, ROUTES } from "../site-meta.js";
import legalCss from "../styles/legal.css?inline";

// Catch-all route. Without this, an unmatched path rendered an empty <main>
// under the nav and footer, which crawlers read as a soft 404: HTTP 200, the
// home page's title, and no content.
//
// In production this markup is served as dist/404.html with a real 404 status
// (wrangler.jsonc not_found_handling:"404-page"). It renders client-side too,
// for an in-app navigation to a dead link, which is why the noindex in
// site-meta.js is kept as well.
export default function NotFound() {
    usePageMeta(ROUTES["/404"]);
    usePageStyles(legalCss);
    return (
        <section className="section-legal" data-test-section="main">
            <div className="legal-container">
                <div className="label-mono legal-meta">Error 404</div>
                <h1>This page does not exist</h1>
                <p className="legal-lede">
                    The address you followed is not a page on this site. It may
                    have moved, or the link may have been mistyped.
                </p>
                <h2>Where to go instead</h2>
                <ul>
                    <li>
                        <Link to="/">The home page</Link>, for what Plasmatic
                        builds and why.
                    </li>
                    <li>
                        <Link to="/orion">Orion</Link>, the governed services
                        platform for teams building software with AI.
                    </li>
                    <li>
                        <Link to="/about">About</Link>, for the team and how the
                        business works.
                    </li>
                    <li>
                        <a href={DOCS_URL} target="_blank" rel="noopener">
                            The documentation
                        </a>
                        , for installation, reference and comparisons.
                    </li>
                </ul>
                <p>
                    <Link to="/contact" className="btn-primary">
                        Talk to an engineer <ArrowRight aria-hidden="true" />
                    </Link>
                </p>
            </div>
        </section>
    );
}
