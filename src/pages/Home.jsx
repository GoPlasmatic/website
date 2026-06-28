import { Link } from "react-router-dom";
import {
    PenLine,
    Zap,
    ShieldCheck,
    Shield,
    TrendingDown,
    Gauge,
    Network,
    Terminal,
    BookOpen,
    Rocket,
} from "lucide-react";
import HeroCanvas from "../components/HeroCanvas.jsx";
import SectionGraphic from "../components/SectionGraphic.jsx";
import { usePageTitle } from "../hooks/usePageTitle.js";
import architectureCore from "../assets/architecture-core.svg";
import fragmentation from "../assets/fragmentation.svg";
import logoSvg from "../assets/logo.svg";
import "../styles/home.css";

// The GitHub mark used in the vanilla site (lucide's Github glyph differs), kept
// verbatim so the brand icon renders identically.
function GithubMark() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.79-.25.79-.56v-2.17c-3.2.7-3.88-1.37-3.88-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.18-1.48 3.14-1.17 3.14-1.17.62 1.57.23 2.73.11 3.02.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.06.78 2.14v3.17c0 .31.2.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
        </svg>
    );
}

export default function Home() {
    usePageTitle("Plasmatic – Systems for modern software");
    return (
        <>
            {/* HERO */}
            <section className="hero" data-test-section="hero">
                <HeroCanvas />
                <div className="hero-text" id="heroText">
                    <div className="eyebrow">
                        <span>Modern infrastructure</span>
                    </div>
                    <h1 className="reveal-blur">
                        Plasmatic builds systems for{" "}
                        <span className="gradient-text">modern software.</span>
                    </h1>
                    <p className="lead hero-sub">
                        We design and develop infrastructure that defines,
                        executes and governs how complex systems behave.
                    </p>
                    <div className="hero-ctas">
                        <Link to="/orion" className="btn-primary">
                            Explore Orion &rarr;
                        </Link>
                        <a
                            href="https://github.com/GoPlasmatic/Orion"
                            target="_blank"
                            rel="noopener"
                            className="btn-secondary"
                        >
                            View on GitHub
                        </a>
                    </div>
                </div>
            </section>

            {/* WHAT WE DO */}
            <section className="section-full" data-test-section="what-we-do">
                <SectionGraphic
                    svg={architectureCore}
                    position="background"
                    colorSource="svg"
                    lineMode="outline"
                    numLines={24}
                    extrudeDepth={0}
                    targetExtent={17}
                    cameraPos="0,0,36"
                    objectOffset="9,0"
                    parallax="0.8,0.35,0.05"
                    tilt="0,0,0"
                    bloomStrength={0.28}
                    bloomRadius={0.12}
                    brightProbability={0}
                    dimGlow="0.35,0.35"
                    pulseProbability={1}
                    pulsesPerLine={1}
                    pulseSpeed="0.18,0.42"
                    pulseHeadBoost={4}
                    pulseTailBoost={1.4}
                    pulseHeadFalloff={90}
                    pulseTail="0.15,0.35"
                />
                <div className="section-container">
                    <div className="grid-2col">
                        <div className="col-content reveal-left">
                            <h2 className="reveal-blur">
                                Infrastructure at the{" "}
                                <span className="gradient-text">
                                    core of modern systems.
                                </span>
                            </h2>
                            <p className="section-body">
                                Plasmatic builds infrastructure that sits at the
                                core of modern systems.
                            </p>
                            <p className="section-body">
                                We focus on how systems define behaviour, execute
                                logic and maintain control at scale.
                            </p>
                            <div className="callout">
                                <p>
                                    Our work enables organisations to move faster{" "}
                                    <strong>
                                        without losing consistency or governance.
                                    </strong>
                                </p>
                            </div>
                        </div>
                        <div></div>
                    </div>
                </div>
            </section>

            {/* WHY THIS MATTERS */}
            <section className="section-full" data-test-section="why-this-matters">
                <SectionGraphic
                    svg={fragmentation}
                    position="background"
                    colorSource="svg"
                    lineMode="outline"
                    numLines={28}
                    extrudeDepth={0}
                    targetExtent={17}
                    cameraPos="0,0,36"
                    objectOffset="-9,0"
                    parallax="0.8,0.35,0.05"
                    tilt="0,0,0"
                    bloomStrength={0.28}
                    bloomRadius={0.12}
                    brightProbability={0}
                    dimGlow="0.35,0.35"
                    pulseProbability={1}
                    pulsesPerLine={1}
                    pulseSpeed="0.18,0.42"
                    pulseHeadBoost={4}
                    pulseTailBoost={1.4}
                    pulseHeadFalloff={90}
                    pulseTail="0.15,0.35"
                />
                <div className="section-container">
                    <div className="grid-2col">
                        <div></div>
                        <div className="col-content reveal-right">
                            <h2 className="reveal-blur">
                                Organisations are no longer limited by{" "}
                                <span className="gradient-text">speed.</span>
                            </h2>
                            <p className="section-body">
                                Software development has accelerated rapidly. AI
                                is generating code. Teams are shipping faster than
                                ever.
                            </p>
                            <div className="pain-points">
                                <div className="pain-point">
                                    <div className="dot dot-blue"></div>
                                    <div>
                                        <p className="pain-title">
                                            AI is generating code
                                        </p>
                                        <p className="pain-desc">
                                            Development velocity has never been
                                            higher
                                        </p>
                                    </div>
                                </div>
                                <div className="pain-point">
                                    <div className="dot dot-blue"></div>
                                    <div>
                                        <p className="pain-title">
                                            Teams are shipping faster than ever
                                        </p>
                                        <p className="pain-desc">
                                            Release cycles are compressing across
                                            the industry
                                        </p>
                                    </div>
                                </div>
                                <div className="pain-point">
                                    <div className="dot dot-blue"></div>
                                    <div>
                                        <p className="pain-title">
                                            Behaviour becomes inconsistent
                                        </p>
                                        <p className="pain-desc">
                                            Services fragment, governance becomes
                                            harder to enforce
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="callout">
                                <p>
                                    They are limited by <strong>control.</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* OUR APPROACH */}
            <section
                className="section-full section-dimmed"
                data-test-section="approach"
            >
                <div className="section-container">
                    <div className="section-header reveal">
                        <h2 className="reveal-blur">A better way to build.</h2>
                        <p>
                            System behaviour should not be tied to release cycles
                            or embedded across fragmented services.
                        </p>
                    </div>
                    <div className="grid-3col">
                        <div className="card card-elevated card-hoverable capability-card reveal">
                            <div className="icon-box icon-blue">
                                <PenLine />
                            </div>
                            <h3>Define clearly</h3>
                            <p className="capability-subtitle">
                                Single source of truth
                            </p>
                            <p>
                                Behaviour described once, in a central layer — not
                                scattered across dozens of services and deployment
                                pipelines.
                            </p>
                        </div>
                        <div className="card card-elevated card-hoverable capability-card reveal">
                            <div className="icon-box icon-teal">
                                <Zap />
                            </div>
                            <h3>Execute dynamically</h3>
                            <p className="capability-subtitle">
                                Real-time runtime
                            </p>
                            <p>
                                Changes activate instantly across all services. No
                                rebuilds, no deployments, no downtime.
                            </p>
                        </div>
                        <div className="card card-elevated card-hoverable capability-card reveal">
                            <div className="icon-box icon-yellow">
                                <ShieldCheck />
                            </div>
                            <h3>Govern centrally</h3>
                            <p className="capability-subtitle">
                                Control at scale
                            </p>
                            <p>
                                Enforce policies consistently. Systems can evolve
                                continuously while maintaining control and
                                consistency.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ORION */}
            <section
                className="section-orion section-dimmed"
                data-test-section="orion"
            >
                <div className="section-container">
                    <div className="grid-2col orion-grid">
                        <div className="reveal-left">
                            <div className="label-mono orion-label">
                                Orion &mdash; Business Runtime Engine
                            </div>
                            <h2 className="orion-heading reveal-blur">
                                Build minimal.
                                <br />
                                Change everything{" "}
                                <span className="gradient-text">instantly.</span>
                            </h2>
                            <div className="card orion-desc-card">
                                <p>
                                    Orion separates business logic from
                                    application code. Engineering builds the
                                    platform once, while business rules evolve
                                    independently at the speed of opportunity—with
                                    no rebuilds or redeployments.
                                </p>
                            </div>
                            <Link to="/orion" className="btn-primary">
                                Explore Orion &rarr;
                            </Link>
                        </div>
                        <div className="orion-feature-list reveal-right">
                            <div className="card orion-feature-card">
                                <div className="icon-chip orion-feature-icon">
                                    <Zap />
                                </div>
                                <h4>Real-time execution</h4>
                                <p>
                                    Deploy logic changes instantly. No engineering
                                    cycles, no PRs, no release schedules.
                                </p>
                            </div>
                            <div className="card orion-feature-card">
                                <div className="icon-chip orion-feature-icon">
                                    <Shield />
                                </div>
                                <h4>Built-in governance</h4>
                                <p>
                                    Every behaviour change is versioned, auditable
                                    and policy-enforced from a central layer.
                                </p>
                            </div>
                            <div className="card orion-feature-card">
                                <div className="icon-chip orion-feature-icon">
                                    <TrendingDown />
                                </div>
                                <h4>Reduced engineering overhead</h4>
                                <p>
                                    Logic lives in the runtime, not inside
                                    microservices. Easier to own, faster to
                                    evolve.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BUILT FOR MODERN ARCHITECTURES */}
            <section
                className="section-full section-dimmed"
                data-test-section="architectures"
            >
                <div className="section-container">
                    <div className="section-header reveal">
                        <h2 className="reveal-blur">
                            Built for modern architectures.
                        </h2>
                        <p>
                            Open, high-performance, and designed to work with how
                            distributed systems are actually built today.
                        </p>
                    </div>
                    <div className="grid-2x2">
                        <div className="card card-elevated card-hoverable capability-card reveal">
                            <div className="icon-box icon-teal">
                                <GithubMark />
                            </div>
                            <h3>Open source foundation</h3>
                            <p className="capability-subtitle">
                                Community-driven
                            </p>
                            <p>
                                Built in the open. Inspect the core, contribute,
                                and build on a foundation the community can trust.
                            </p>
                        </div>
                        <div className="card card-elevated card-hoverable capability-card reveal">
                            <div className="icon-box icon-blue">
                                <Gauge />
                            </div>
                            <h3>High-performance runtime</h3>
                            <p className="capability-subtitle">
                                Scale without compromise
                            </p>
                            <p>
                                Designed for throughput at scale. Execute millions
                                of governed workflows without performance
                                trade-offs.
                            </p>
                        </div>
                        <div className="card card-elevated card-hoverable capability-card reveal">
                            <div className="icon-box icon-yellow">
                                <Network />
                            </div>
                            <h3>Distributed systems native</h3>
                            <p className="capability-subtitle">
                                Built for the real world
                            </p>
                            <p>
                                Designed from the ground up for distributed
                                architectures — microservices, event-driven, and
                                everything in between.
                            </p>
                        </div>
                        <div className="card card-elevated card-hoverable capability-card reveal">
                            <div className="icon-box icon-red">
                                <Terminal />
                            </div>
                            <h3>API-first &amp; developer-friendly</h3>
                            <p className="capability-subtitle">
                                Integrate anywhere
                            </p>
                            <p>
                                Every capability exposed via clean APIs. Works with
                                your existing stack, language, and tooling.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* DEVELOPERS CTA */}
            <section className="section-cta" data-test-section="cta">
                <SectionGraphic
                    svg={logoSvg}
                    position="background"
                    colorSource="svg"
                    lineMode="outline"
                    numLines={160}
                    extrudeDepth={1.2}
                    objectOffset="5.5,0"
                    rotation="0,0,0"
                    tilt="12,8,0.06"
                    parallax="0.6,0.25,0.06"
                />
                <div className="section-container">
                    <div className="grid-2col">
                        <div className="cta-inner reveal-left">
                            <div className="label-mono cta-label">
                                For developers
                            </div>
                            <h2 className="reveal-blur">
                                Start building with Plasmatic.
                            </h2>
                            <p className="cta-desc">
                                Explore Orion, access documentation and start
                                building with Plasmatic tools.
                            </p>
                            <div className="dev-links">
                                <a
                                    href="https://goplasmatic.github.io/Orion/"
                                    target="_blank"
                                    rel="noopener"
                                    className="card card-hoverable dev-link-card"
                                >
                                    <div className="icon-chip dev-link-icon">
                                        <BookOpen />
                                    </div>
                                    <div className="dev-link-body">
                                        <h4>View documentation</h4>
                                        <p>
                                            Guides, API reference and integration
                                            docs
                                        </p>
                                    </div>
                                    <span className="label-mono dev-link-arrow">
                                        &rarr;
                                    </span>
                                </a>
                                <a
                                    href="https://github.com/GoPlasmatic/Orion"
                                    target="_blank"
                                    rel="noopener"
                                    className="card card-hoverable dev-link-card"
                                >
                                    <div className="icon-chip dev-link-icon">
                                        <GithubMark />
                                    </div>
                                    <div className="dev-link-body">
                                        <h4>GitHub</h4>
                                        <p>Explore the source and contribute</p>
                                    </div>
                                    <span className="label-mono dev-link-arrow">
                                        &rarr;
                                    </span>
                                </a>
                                <a
                                    href="https://goplasmatic.github.io/Orion/tutorials/cli-setup.html#cli-setup"
                                    target="_blank"
                                    rel="noopener"
                                    className="card card-hoverable dev-link-card"
                                >
                                    <div className="icon-chip dev-link-icon">
                                        <Rocket />
                                    </div>
                                    <div className="dev-link-body">
                                        <h4>Quickstart</h4>
                                        <p>
                                            Get Orion running in under five
                                            minutes
                                        </p>
                                    </div>
                                    <span className="label-mono dev-link-arrow">
                                        &rarr;
                                    </span>
                                </a>
                            </div>
                            <div className="cta-buttons">
                                <Link to="/orion" className="btn-primary">
                                    Explore Orion &rarr;
                                </Link>
                                <a
                                    href="https://github.com/GoPlasmatic/Orion"
                                    target="_blank"
                                    rel="noopener"
                                    className="btn-secondary"
                                >
                                    View on GitHub
                                </a>
                            </div>
                        </div>
                        <div></div>
                    </div>
                </div>
            </section>
        </>
    );
}
