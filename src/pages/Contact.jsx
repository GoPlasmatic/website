import { ArrowRight, Mail } from "lucide-react";
import SectionGraphic from "../components/SectionGraphic.jsx";
import ContactForm from "../components/ContactForm.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { DOCS_INSTALL_URL, ROUTES } from "../site-meta.js";
import { usePageStyles } from "../hooks/usePageStyles.js";
import logoSvg from "../assets/logo.svg";
import contactCss from "../styles/contact.css?inline";

export default function Contact() {
    usePageMeta(ROUTES["/contact"]);
    usePageStyles(contactCss);
    return (
        <section className="section-contact" data-test-section="main">
            <SectionGraphic
                svg={logoSvg}
                position="background"
                colorSource="svg"
                lineMode="outline"
                numLines={120}
                extrudeDepth={1.0}
                objectOffset="6.5,0"
                rotation="0,0,0"
                tilt="10,6,0.05"
                parallax="0.5,0.2,0.05"
            />
            <div className="section-container">
                <div className="grid-2col contact-grid">
                    <div className="reveal-left">
                        <div className="eyebrow">
                            <span>Get in touch</span>
                        </div>
                        <h1 className="reveal-blur">
                            Let's talk about{" "}
                            <span className="gradient-text">your systems.</span>
                        </h1>
                        <p className="section-body">
                            Thirty minutes with a founding engineer. We'll
                            scope a pilot on one of your real services, and we
                            reply within a couple of business days.
                        </p>
                        <div className="contact-direct">
                            <a
                                href="mailto:enquiries@goplasmatic.io"
                                className="contact-direct-link"
                            >
                                <Mail aria-hidden="true" />
                                <span>enquiries@goplasmatic.io</span>
                            </a>
                        </div>
                        <p
                            className="section-body"
                            style={{ marginTop: "28px", fontSize: "15px" }}
                        >
                            Not ready to talk? Orion installs in about a
                            minute.{" "}
                            <a
                                href={DOCS_INSTALL_URL}
                                target="_blank"
                                rel="noopener"
                                className="link-action"
                            >
                                Quickstart <ArrowRight aria-hidden="true" />
                            </a>
                        </p>
                    </div>
                    <div className="reveal-right">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
