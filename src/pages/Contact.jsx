import { Mail } from "lucide-react";
import SectionGraphic from "../components/SectionGraphic.jsx";
import ContactForm from "../components/ContactForm.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { ROUTES } from "../site-meta.js";
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
                            Tell us about what you're building. We'll get back to
                            you within a couple of business days.
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
                    </div>
                    <div className="reveal-right">
                        <ContactForm />
                    </div>
                </div>
            </div>
        </section>
    );
}
