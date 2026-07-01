import { useRef } from "react";
import { Link } from "react-router-dom";
import { Radio, Cpu, GitCommit, GitBranch, Plug, Clock, Layers, ShieldCheck } from "lucide-react";
import OrionCanvas from "../components/OrionCanvas.jsx";
import DeploySimulator from "../components/orion/DeploySimulator.jsx";
import UseCaseTabs from "../components/orion/UseCaseTabs.jsx";
import GuardrailsSimulator from "../components/orion/GuardrailsSimulator.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { ROUTES } from "../site-meta.js";
import { usePageStyles } from "../hooks/usePageStyles.js";
import orionCss from "../styles/orion.css?inline";

export default function Orion() {
    usePageMeta(ROUTES["/orion"]);
    usePageStyles(orionCss);
    const heroTextRef = useRef(null);

    return (
        <>
            <OrionCanvas heroTextRef={heroTextRef} />

            <div className="content">
                {/* HERO */}
                <section className="hero" data-test-section="hero">
                    <div className="hero-text" id="heroText" ref={heroTextRef}>
                        <div className="eyebrow">
                            <span>Build | Deploy | Govern</span>
                        </div>
                        <h1 className="reveal-blur">
                            <span className="gradient-text">Orion</span>
                        </h1>
                        <h1 className="reveal-blur" style={{ "--reveal-delay": "0.12s" }}>
                            The nervous system for modern software.
                        </h1>
                        <p className="lead">
                            Orion separates business logic from application code,
                            allowing changes to evolve independently and
                            instantly.
                        </p>
                        <div className="hero-ctas">
                            <Link to="/contact" className="btn-primary">
                                Start a conversation &rarr;
                            </Link>
                            <a href="#two-clocks" className="btn-secondary">
                                Explore how it works
                            </a>
                        </div>
                    </div>
                </section>

                {/* TWO CLOCKS */}
                <section
                    id="two-clocks"
                    className="section-full"
                    data-test-section="problem"
                >
                    <div className="section-container">
                        <div className="grid-2col">
                            <div className="col-content reveal-left">
                                <div
                                    className="eyebrow"
                                    style={{
                                        "--accent-teal": "#ffd167",
                                        borderColor: "rgba(255, 209, 103, 0.25)",
                                        background:
                                            "linear-gradient(135deg, rgba(255, 209, 103, 0.1), rgba(255, 209, 103, 0.05))",
                                    }}
                                >
                                    <span>Problem</span>
                                </div>
                                <h2 className="reveal-blur">
                                    Business logic lives on the engineering clock
                                </h2>
                                <p className="section-body">
                                    Every business runs on two clocks. The
                                    business clock moves at the speed of
                                    opportunity: markets, customers, competition.
                                    The engineering clock moves at the speed of
                                    the release cycle: design, build, test,
                                    deploy. Both are necessary. But most business
                                    logic lives on the engineering clock.
                                </p>
                                <div className="callout reveal-blur">
                                    <p>
                                        So every pricing change, every fraud
                                        rule, and every new customer experience
                                        becomes a software release.{" "}
                                        <strong>And the business waits.</strong>
                                    </p>
                                </div>
                            </div>
                            <div
                                className="reveal-right"
                                style={{
                                    "--reveal-delay": "0.1s",
                                    display: "flex",
                                    alignItems: "center",
                                }}
                            >
                                <DeploySimulator />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ORION (Solution) */}
                <section className="section-full" data-test-section="solution">
                    <div className="section-container">
                        <div className="grid-2col">
                            <div></div>
                            <div className="col-content reveal-right">
                                <div className="eyebrow">
                                    <span>Solution</span>
                                </div>
                                <h2 className="reveal-blur">
                                    Unlock the business logic
                                </h2>
                                <p className="section-body">
                                    Orion allows you to separate business logic
                                    from application code. Engineering builds the
                                    platform. Business logic evolves
                                    independently.
                                </p>

                                <UseCaseTabs />
                            </div>
                        </div>
                    </div>
                </section>

                {/* DECOUPLE DIAGRAM */}
                <section
                    className="section-full section-dimmed"
                    data-test-section="decouple"
                >
                    <div className="section-container">
                        <div className="section-header reveal">
                            <div className="eyebrow">
                                <span>Architecture</span>
                            </div>
                            <h2 className="reveal-blur">The Decouple</h2>
                            <p>
                                Orion lifts logic out of compiled services and
                                runs it in a dynamic, runtime-swappable
                                environment.
                            </p>
                        </div>

                        <div
                            className="grid-2col reveal"
                            style={{ gap: "32px", marginTop: "40px" }}
                        >
                            {/* Column 1: Where business logic sits */}
                            <div className="col-content">
                                <h3
                                    style={{
                                        fontSize: "20px",
                                        fontWeight: 600,
                                        color: "#f8fafc",
                                        marginBottom: "12px",
                                    }}
                                >
                                    Where Orion Changes The Architecture
                                </h3>

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "16px",
                                    }}
                                >
                                    <div
                                        className="approach-box old-way"
                                        style={{
                                            background: "rgba(255, 209, 103, 0.03)",
                                            border: "1px solid rgba(255, 209, 103, 0.1)",
                                            borderRadius: "8px",
                                            padding: "16px",
                                        }}
                                    >
                                        <h4
                                            style={{
                                                fontSize: "14px",
                                                fontWeight: 600,
                                                color: "#ffd167",
                                                marginBottom: "6px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: "6px",
                                                    height: "6px",
                                                    borderRadius: "50%",
                                                    background: "#ffd167",
                                                }}
                                            ></span>
                                            Old Approach: Coupled
                                        </h4>
                                        <p
                                            style={{
                                                fontSize: "13px",
                                                color: "#cbd5e1",
                                                lineHeight: 1.5,
                                                margin: 0,
                                            }}
                                        >
                                            Logic is compiled directly into
                                            microservices. Adjusting a threshold
                                            requires a git branch, code reviews,
                                            Docker builds, integration tests, and
                                            rolling K8s deployments.
                                        </p>
                                    </div>
                                    <div
                                        className="approach-box orion-way"
                                        style={{
                                            background: "rgba(76, 189, 151, 0.03)",
                                            border: "1px solid rgba(76, 189, 151, 0.1)",
                                            borderRadius: "8px",
                                            padding: "16px",
                                        }}
                                    >
                                        <h4
                                            style={{
                                                fontSize: "14px",
                                                fontWeight: 600,
                                                color: "#4cbd97",
                                                marginBottom: "6px",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    width: "6px",
                                                    height: "6px",
                                                    borderRadius: "50%",
                                                    background: "#4cbd97",
                                                }}
                                            ></span>
                                            Orion Approach: Decoupled
                                        </h4>
                                        <p
                                            style={{
                                                fontSize: "13px",
                                                color: "#cbd5e1",
                                                lineHeight: 1.5,
                                                margin: 0,
                                            }}
                                        >
                                            Logic runs as an independent,
                                            declarative graph. Swapping rules
                                            happens dynamically at runtime in 8ms
                                            with safety validations and zero
                                            gateway downtime.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Flow comparison */}
                            <div>
                                <h3
                                    style={{
                                        fontSize: "20px",
                                        fontWeight: 600,
                                        color: "#f8fafc",
                                        marginBottom: "12px",
                                        textAlign: "center",
                                    }}
                                >
                                    Rule Flow Comparison
                                </h3>
                                <div className="decouple-flows-comparison">
                                    {/* Before (Coupled) */}
                                    <div className="decouple-flow-column">
                                        <div
                                            className="decouple-flow-header"
                                            style={{
                                                color: "#ffd167",
                                                borderColor:
                                                    "rgba(255, 209, 103, 0.2)",
                                            }}
                                        >
                                            Before (Coupled Code)
                                        </div>
                                        <div className="decouple-flow-canvas">
                                            <div className="orion-style-node unresolved">
                                                <span className="node-dot bg-gray"></span>
                                                <Radio className="node-icon" />
                                                <div className="node-text">
                                                    <div className="node-label">
                                                        POST /checkout
                                                    </div>
                                                    <div className="node-kind">
                                                        Channel
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flow-arrow">
                                                &darr;
                                            </div>
                                            <div className="orion-style-node draft">
                                                <span className="node-dot bg-blue"></span>
                                                <Cpu className="node-icon" />
                                                <div className="node-text">
                                                    <div className="node-label">
                                                        App Code (Monolith)
                                                    </div>
                                                    <div className="node-kind">
                                                        Hardcoded Logic
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flow-arrow">
                                                &darr;
                                            </div>
                                            <div className="orion-style-node error-node">
                                                <span className="node-dot bg-yellow"></span>
                                                <GitCommit className="node-icon" />
                                                <div className="node-text">
                                                    <div className="node-label">
                                                        fraudScore &gt; 80
                                                    </div>
                                                    <div className="node-kind">
                                                        Hardcoded Rule
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* After (Orion Decoupled) */}
                                    <div className="decouple-flow-column">
                                        <div
                                            className="decouple-flow-header"
                                            style={{
                                                color: "#4cbd97",
                                                borderColor:
                                                    "rgba(76, 189, 151, 0.2)",
                                            }}
                                        >
                                            After (Orion Decoupled)
                                        </div>
                                        <div className="decouple-flow-canvas">
                                            <div className="orion-style-node active">
                                                <span className="node-dot bg-green"></span>
                                                <Radio className="node-icon" />
                                                <div className="node-text">
                                                    <div className="node-label">
                                                        POST /orders
                                                    </div>
                                                    <div className="node-kind">
                                                        Channel
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flow-arrow">
                                                &darr;
                                            </div>
                                            <div className="orion-style-node active">
                                                <span className="node-dot bg-green"></span>
                                                <GitBranch className="node-icon" />
                                                <div className="node-text">
                                                    <div className="node-label">
                                                        payment-fraud-check
                                                    </div>
                                                    <div className="node-kind">
                                                        Workflow
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flow-arrow">
                                                &darr;
                                            </div>
                                            <div className="orion-style-node active">
                                                <span className="node-dot bg-green"></span>
                                                <Plug className="node-icon" />
                                                <div className="node-text">
                                                    <div className="node-label">
                                                        gateway-connector
                                                    </div>
                                                    <div className="node-kind">
                                                        Connector
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* AI & TRUST */}
                <section
                    className="section-full section-dimmed"
                    data-test-section="ai-trust"
                >
                    <div className="section-container">
                        <div className="section-header reveal">
                            <div className="eyebrow">
                                <span>Governance</span>
                            </div>
                            <h2 className="reveal-blur">AI &amp; Trust</h2>
                            <p>
                                Adaptability only matters when you can trust it.
                            </p>
                        </div>
                        <div className="grid-2col comparison-grid">
                            <div className="card comparison-card before-card reveal-left">
                                <div
                                    className="label-mono label-mono-upper comparison-label"
                                    style={{ color: "var(--accent-blue)" }}
                                >
                                    AI Optimization
                                </div>
                                <h3>AI Proposes</h3>
                                <p
                                    className="section-body"
                                    style={{
                                        fontSize: "15px",
                                        marginBottom: "20px",
                                        color: "rgba(255, 255, 255, 0.7)",
                                    }}
                                >
                                    Because business logic lives in its own
                                    layer, AI can safely optimize workflows,
                                    rules, and system behavior:
                                </p>
                                <div className="comparison-points">
                                    <div className="comparison-point">
                                        <span
                                            className="dot-sm"
                                            style={{
                                                background: "var(--accent-blue)",
                                            }}
                                        ></span>
                                        <p>
                                            A sharper fraud rule suggested at
                                            runtime
                                        </p>
                                    </div>
                                    <div className="comparison-point">
                                        <span
                                            className="dot-sm"
                                            style={{
                                                background: "var(--accent-blue)",
                                            }}
                                        ></span>
                                        <p>
                                            A better pricing ruleset matching
                                            market change
                                        </p>
                                    </div>
                                    <div className="comparison-point">
                                        <span
                                            className="dot-sm"
                                            style={{
                                                background: "var(--accent-blue)",
                                            }}
                                        ></span>
                                        <p>A smarter customer experience flow</p>
                                    </div>
                                </div>
                            </div>
                            <div className="card comparison-card after-card reveal-right">
                                <div className="label-mono label-mono-upper comparison-label comparison-label-green">
                                    Security Layer
                                </div>
                                <h3>Human Approves</h3>
                                <p
                                    className="section-body"
                                    style={{
                                        fontSize: "15px",
                                        marginBottom: "20px",
                                        color: "rgba(255, 255, 255, 0.7)",
                                    }}
                                >
                                    Every change is executed inside a structured
                                    trust model, fully reviewable and with
                                    complete auditability:
                                </p>
                                <div className="comparison-points">
                                    <div className="comparison-point">
                                        <span
                                            className="dot-sm"
                                            style={{
                                                background:
                                                    "var(--accent-green)",
                                            }}
                                        ></span>
                                        <p>
                                            Validated: Checked against system
                                            constraints
                                        </p>
                                    </div>
                                    <div className="comparison-point">
                                        <span
                                            className="dot-sm"
                                            style={{
                                                background:
                                                    "var(--accent-green)",
                                            }}
                                        ></span>
                                        <p>
                                            Versioned &amp; Audited: Trace every
                                            single change
                                        </p>
                                    </div>
                                    <div className="comparison-point">
                                        <span
                                            className="dot-sm"
                                            style={{
                                                background:
                                                    "var(--accent-green)",
                                            }}
                                        ></span>
                                        <p>
                                            Instantly Reversible: Rollback
                                            instantly if needed
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* GUARDRAILS DIAGRAM */}
                <section
                    className="section-full section-dimmed"
                    data-test-section="guardrails"
                >
                    <div className="section-container">
                        <div className="section-header reveal">
                            <div className="eyebrow">
                                <span>Guardrails</span>
                            </div>
                            <h2 className="reveal-blur">AI with Guardrails</h2>
                            <p>
                                AI proposes &rarr; A human approves &rarr; Orion
                                executes. Trustworthy runtime adaptability.
                            </p>
                        </div>

                        <GuardrailsSimulator />
                    </div>
                </section>

                {/* THE FUTURE */}
                <section
                    className="section-orion section-dimmed"
                    data-test-section="orion"
                >
                    <div className="section-container">
                        <div className="grid-2col orion-grid">
                            <div className="reveal-left">
                                <div className="eyebrow">
                                    <span>The Future</span>
                                </div>
                                <h2 className="orion-heading reveal-blur">
                                    Software that adapts to the AI era.
                                </h2>
                                <div className="card orion-desc-card">
                                    <p>
                                        The future isn’t software that gets
                                        rebuilt every time the business changes.
                                        It’s software that adapts. Two clocks.
                                        Working together.
                                    </p>
                                    <p
                                        style={{
                                            marginTop: "24px",
                                            fontSize: "28px",
                                            fontWeight: 800,
                                            fontFamily: "var(--font-display)",
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        Orion.
                                        <br />
                                        <span className="gradient-text">
                                            The nervous system for modern
                                            software.
                                        </span>
                                    </p>
                                </div>
                                <Link
                                    to="/contact"
                                    className="btn-primary"
                                    style={{ marginTop: "16px" }}
                                >
                                    Request early access &rarr;
                                </Link>
                            </div>
                            <div className="orion-feature-list reveal-right">
                                <div className="card orion-feature-card">
                                    <div className="icon-chip orion-feature-icon">
                                        <Clock />
                                    </div>
                                    <h4>Synchronized Speed</h4>
                                    <p>
                                        Unify the engineering clock and business
                                        clock to launch pricing and rule updates
                                        instantly.
                                    </p>
                                </div>
                                <div className="card orion-feature-card">
                                    <div className="icon-chip orion-feature-icon">
                                        <Layers />
                                    </div>
                                    <h4>Decoupled Evolvability</h4>
                                    <p>
                                        Separating logic from codebase means
                                        engineering builds once, and logic adapts
                                        indefinitely.
                                    </p>
                                </div>
                                <div className="card orion-feature-card">
                                    <div className="icon-chip orion-feature-icon">
                                        <ShieldCheck />
                                    </div>
                                    <h4>Governed AI Execution</h4>
                                    <p>
                                        Use AI to optimize business outcomes
                                        while maintaining strict human-in-the-loop
                                        review guardrails.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="section-cta" data-test-section="cta">
                    <div className="section-container">
                        <div className="grid-2col">
                            <div className="cta-inner reveal-left">
                                <div className="eyebrow">
                                    <span>Get involved</span>
                                </div>
                                <h2 className="reveal-blur">
                                    Shape what comes next.
                                </h2>
                                <p className="cta-desc">
                                    Plasmatic is building in the open. Whether
                                    you're an engineer, an organisation, or an
                                    investor &mdash; there's a place for you in
                                    this journey.
                                </p>
                                <div className="audience-grid">
                                    <div className="card audience-card">
                                        <h4>Organisations</h4>
                                        <p>
                                            Early access to Orion for platform
                                            and engineering teams building at
                                            scale.
                                        </p>
                                        <Link to="/contact" className="label-mono">
                                            Get in touch &rarr;
                                        </Link>
                                    </div>
                                    <div className="card audience-card">
                                        <h4>Investors</h4>
                                        <p>
                                            Redefining how distributed systems
                                            are governed, controlled and evolved.
                                        </p>
                                        <Link to="/contact" className="label-mono">
                                            Get in touch &rarr;
                                        </Link>
                                    </div>
                                    <div className="card audience-card">
                                        <h4>Developers</h4>
                                        <p>
                                            Explore repos, contribute, and shape
                                            the platform alongside the core team.
                                        </p>
                                        <a
                                            href="https://github.com/GoPlasmatic"
                                            target="_blank"
                                            rel="noopener"
                                            className="label-mono"
                                        >
                                            github.com/GoPlasmatic &rarr;
                                        </a>
                                    </div>
                                </div>
                                <div className="cta-buttons">
                                    <Link to="/contact" className="btn-primary">
                                        Request early access &rarr;
                                    </Link>
                                </div>
                            </div>
                            <div></div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
