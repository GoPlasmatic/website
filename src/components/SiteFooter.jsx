import { Link } from "react-router-dom";

// Port of the <site-footer> custom element. Rendered inside a literal
// <site-footer> tag (display:block) with the exact `footer.footer` markup the
// Orion scene's final camera keyframe and the Playwright "footer" capture rely
// on.
export default function SiteFooter() {
    return (
        <site-footer>
            <footer className="footer section-dimmed" data-test-section="footer">
                <div className="section-container">
                    <div className="footer-bottom">
                        <p>&copy; 2026 Plasmatic. All rights reserved.</p>
                        <div className="footer-links">
                            <Link to="/privacy">Privacy Policy</Link>
                            <Link to="/terms">Terms of Service</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </site-footer>
    );
}
