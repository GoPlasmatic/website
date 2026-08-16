import { Link } from "react-router-dom";
import { DOCS_URL } from "../site-meta.js";

// Port of the <site-footer> custom element. Rendered inside a literal
// <site-footer> tag (display:block) with the exact `footer.footer` markup the
// Orion scene's final camera keyframe and the Playwright "footer" capture rely
// on.
export default function SiteFooter() {
    return (
        <site-footer>
            <footer className="footer section-dimmed" data-test-section="footer">
                <div className="section-container">
                    <p className="footer-strap">
                        Orion: the declarative runtime for AI agents,
                        workflows, microservices, and event processing.
                    </p>
                    <div className="footer-bottom">
                        <p>&copy; 2026 Plasmatic. All rights reserved.</p>
                        <div className="footer-links">
                            <a href={DOCS_URL} target="_blank" rel="noopener">
                                Docs
                            </a>
                            <a
                                href="https://github.com/GoPlasmatic"
                                target="_blank"
                                rel="noopener"
                            >
                                GitHub
                            </a>
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </site-footer>
    );
}
