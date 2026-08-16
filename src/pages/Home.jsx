import { Link } from "react-router-dom";
import {
    PenLine,
    Zap,
    ShieldCheck,
    Shield,
    Sparkles,
    Gauge,
    Activity,
    Network,
    Terminal,
    BookOpen,
    Rocket,
} from "lucide-react";
import HeroCanvas from "../components/HeroCanvas.jsx";
import SectionGraphic from "../components/SectionGraphic.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { DOCS_INSTALL_URL, DOCS_URL, ROUTES } from "../site-meta.js";
import { usePageStyles } from "../hooks/usePageStyles.js";
import architectureCore from "../assets/architecture-core.svg";
import fragmentation from "../assets/fragmentation.svg";
import logoSvg from "../assets/logo.svg";
import homeCss from "../styles/home.css?inline";

const BENCHMARK_URL =
    "https://github.com/GoPlasmatic/Orion/blob/main/crates/orion-server/tests/benchmark/results/v1.0.0/SUMMARY.md";

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
    usePageMeta(ROUTES["/"]);
    usePageStyles(homeCss);
    return (
        <>
            {/* HERO */}
            <section className="hero" data-test-section="hero">
                <HeroCanvas />
                <div className="hero-text" id="heroText">
                    <div className="eyebrow">
                        <span>Plasmatic &middot; Builders of Orion</span>
                    </div>
                    <h1 className="reveal-blur">
                        AI writes the software.{" "}
                        <span className="gradient-text">
                            We make running it safe.
                        </span>
                    </h1>
                    <p className="lead hero-sub">
                        Orion is Plasmatic's open-source declarative runtime:
                        engineers and their AI assistants write the business
                        logic; the runtime enforces the guardrails, versioning,
                        and rollback.
                    </p>
                    <div className="hero-ctas">
                        <Link to="/contact" className="btn-primary">
                            Talk to an engineer &rarr;
                        </Link>
                        <Link to="/orion" className="btn-secondary">
                            Explore Orion
                        </Link>
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
                                The architecture is the{" "}
                                <span className="gradient-text">
                                    runtime's job.
                                </span>
                            </h2>
                            <p className="section-body">
                                Every service needs the same architecture: rate
                                limiting, retries, metrics, versioning,
                                rollout. Plasmatic builds runtimes that enforce
                                it at execution time, so the only thing your
                                teams write and review is the logic that makes
                                your business different.
                            </p>
                            <div className="callout">
                                <p>
                                    Business logic becomes a governed,
                                    versioned artifact:{" "}
                                    <strong>
                                        changed in seconds by your engineers or
                                        their AI assistants, reversible in one
                                        call.
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
                                AI moved one cost.{" "}
                                <span className="gradient-text">
                                    It left the other.
                                </span>
                            </h2>
                            <p className="section-body">
                                Writing software accelerated. Shipping and
                                governing it didn't.
                            </p>
                            <div className="pain-points">
                                <div className="pain-point">
                                    <div className="dot dot-blue"></div>
                                    <div>
                                        <p className="pain-title">
                                            AI writes code faster than you can
                                            govern it
                                        </p>
                                        <p className="pain-desc">
                                            Every generated service is more
                                            unreviewed infrastructure, each
                                            copy slightly different
                                        </p>
                                    </div>
                                </div>
                                <div className="pain-point">
                                    <div className="dot dot-blue"></div>
                                    <div>
                                        <p className="pain-title">
                                            The release cycle didn't move
                                        </p>
                                        <p className="pain-desc">
                                            An AI drafts the change in minutes;
                                            the pipeline still ships it in
                                            days
                                        </p>
                                    </div>
                                </div>
                                <div className="pain-point">
                                    <div className="dot dot-blue"></div>
                                    <div>
                                        <p className="pain-title">
                                            Review is the new bottleneck
                                        </p>
                                        <p className="pain-desc">
                                            Most of what an AI generates is
                                            plumbing, and every line is yours
                                            to review
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="callout">
                                <p>
                                    Speed without governance isn't velocity.{" "}
                                    <strong>It's exposure.</strong>
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
                            Logic as a governed artifact. Guardrails as
                            configuration. One safe path for every change.
                        </p>
                    </div>
                    <div className="grid-3col">
                        <div className="card card-elevated card-hoverable capability-card reveal">
                            <div className="icon-box icon-blue">
                                <PenLine />
                            </div>
                            <h3>Declare the logic</h3>
                            <p className="capability-subtitle">
                                Written by people or AI
                            </p>
                            <p>
                                Business logic is a JSON document: versioned
                                like code, reviewed as a diff, writable by an
                                engineer or an AI assistant.
                            </p>
                        </div>
                        <div className="card card-elevated card-hoverable capability-card reveal">
                            <div className="icon-box icon-teal">
                                <Zap />
                            </div>
                            <h3>The runtime carries the rest</h3>
                            <p className="capability-subtitle">
                                Configured, not coded
                            </p>
                            <p>
                                Rate limiting, validation, caching, and
                                backpressure enforced before any logic runs;
                                circuit breakers and traces around every
                                backend call.
                            </p>
                        </div>
                        <div className="card card-elevated card-hoverable capability-card reveal">
                            <div className="icon-box icon-yellow">
                                <ShieldCheck />
                            </div>
                            <h3>Every change is governed</h3>
                            <p className="capability-subtitle">
                                Enforced, not promised
                            </p>
                            <p>
                                Draft, dry-run, canary, active. The same safe
                                path for a 3 a.m. fix and an AI's proposal.
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
                            <div className="eyebrow">
                                <span>
                                    Orion &middot; Declarative Services Runtime
                                    &middot; v1.0 &middot; Apache-2.0
                                </span>
                            </div>
                            <h2 className="orion-heading reveal-blur">
                                One runtime.
                                <br />
                                One safe path for{" "}
                                <span className="gradient-text">
                                    every change.
                                </span>
                            </h2>
                            <div className="card orion-desc-card">
                                <p>
                                    Orion turns a JSON definition into a live
                                    REST or Kafka service: APIs, decision
                                    endpoints, event pipelines, webhook
                                    ingestion, agent tools. Many services, one
                                    runtime, as a modular monolith; scaling out
                                    later is a topology change, not a rewrite.
                                </p>
                            </div>
                            <Link to="/orion" className="btn-primary">
                                Explore Orion &rarr;
                            </Link>
                        </div>
                        <div className="orion-feature-list reveal-right">
                            <div className="card orion-feature-card">
                                <div className="icon-chip orion-feature-icon">
                                    <Sparkles />
                                </div>
                                <h4>Built for AI authorship</h4>
                                <p>
                                    An assistant drafts, dry-runs, and rolls
                                    back services over MCP, inside the same
                                    lifecycle rules your engineers follow.
                                </p>
                            </div>
                            <div className="card orion-feature-card">
                                <div className="icon-chip orion-feature-icon">
                                    <Shield />
                                </div>
                                <h4>Guardrails as configuration</h4>
                                <p>
                                    Rate limiting, circuit breakers,
                                    validation, observability: declared once
                                    per channel, not rewritten per service.
                                </p>
                            </div>
                            <div className="card orion-feature-card">
                                <div className="icon-chip orion-feature-icon">
                                    <Gauge />
                                </div>
                                <h4>Production-grade, measured</h4>
                                <p>
                                    Performance that's published, not promised.
                                    One Rust binary; clustered replicas when
                                    you grow.
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
                            Open, measured, and designed for how distributed
                            systems are actually run today.
                        </p>
                    </div>
                    <div className="grid-2x2">
                        <div className="card card-elevated card-hoverable capability-card reveal">
                            <div className="icon-box icon-teal">
                                <GithubMark />
                            </div>
                            <h3>Open source foundation</h3>
                            <p className="capability-subtitle">
                                Apache-2.0
                            </p>
                            <p>
                                Developed in the open at GoPlasmatic/Orion;
                                v1.0 shipped in August 2026.
                            </p>
                        </div>
                        <div className="card card-elevated card-hoverable capability-card reveal">
                            <div className="icon-box icon-blue">
                                <Activity />
                            </div>
                            <h3>Rust-speed performance</h3>
                            <p className="capability-subtitle">
                                Measured, not claimed
                            </p>
                            <p>
                                5.1K&ndash;5.7K workflow requests/sec per
                                instance at single-digit milliseconds, on the{" "}
                                <a
                                    href={BENCHMARK_URL}
                                    target="_blank"
                                    rel="noopener"
                                    style={{ color: "var(--accent-blue)" }}
                                >
                                    published v1.0 benchmark
                                </a>
                                .
                            </p>
                        </div>
                        <div className="card card-elevated card-hoverable capability-card reveal">
                            <div className="icon-box icon-yellow">
                                <Network />
                            </div>
                            <h3>Connect to anything</h3>
                            <p className="capability-subtitle">
                                Built for the real world
                            </p>
                            <p>
                                REST, HTTP, and Kafka in; PostgreSQL, MySQL,
                                MongoDB, Elasticsearch, Redis, and any HTTP API
                                out. Credentials stay on the connector.
                            </p>
                        </div>
                        <div className="card card-elevated card-hoverable capability-card reveal">
                            <div className="icon-box icon-red">
                                <Terminal />
                            </div>
                            <h3>API-first &amp; developer-friendly</h3>
                            <p className="capability-subtitle">
                                Admin API, CLI, MCP
                            </p>
                            <p>
                                Admin API, CLI, CI/CD packages, and an MCP
                                server so an AI assistant operates the runtime
                                the same governed way your engineers do.
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
                            <div className="eyebrow">
                                <span>Evaluate Orion</span>
                            </div>
                            <h2 className="reveal-blur">
                                Two ways in. Both take minutes.
                            </h2>
                            <p className="cta-desc">
                                Evaluating for your team? Talk to an engineer.
                                Want proof first? It installs in about a
                                minute.
                            </p>
                            <div className="dev-links">
                                <a
                                    href={DOCS_URL}
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
                                            Concepts, guides, honest
                                            comparisons, API reference
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
                                    href={DOCS_INSTALL_URL}
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
                                            A server in about a minute; a live
                                            service in four API calls
                                        </p>
                                    </div>
                                    <span className="label-mono dev-link-arrow">
                                        &rarr;
                                    </span>
                                </a>
                            </div>
                            <div className="card card-static built-open-card">
                                <p>
                                    <strong>Built in the open.</strong>{" "}
                                    Apache-2.0, v1.0 shipped August 2026,
                                    benchmark published. One binary, your data
                                    in your own databases: nothing to migrate
                                    off.
                                </p>
                            </div>
                            <div className="cta-buttons">
                                <Link to="/contact" className="btn-primary">
                                    Talk to an engineer &rarr;
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
