import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Layers, ShieldCheck } from "lucide-react";
import OrionCanvas from "../components/OrionCanvas.jsx";
import DeploySimulator from "../components/orion/DeploySimulator.jsx";
import UseCaseTabs from "../components/orion/UseCaseTabs.jsx";
import GuardrailsSimulator from "../components/orion/GuardrailsSimulator.jsx";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { DOCS_INSTALL_URL, DOCS_URL, ROUTES } from "../site-meta.js";
import { usePageStyles } from "../hooks/usePageStyles.js";
import orionCss from "../styles/orion.css?inline";

// "Compared honestly" callout links into the docs' comparison pages.
const COMPARE_LINKS = [
    { path: "compare/durable-execution.html", label: "Durable execution" },
    { path: "compare/api-gateways.html", label: "API gateways" },
    { path: "compare/automation-platforms.html", label: "Automation platforms" },
    { path: "compare/rule-engines.html", label: "Rule engines" },
    { path: "comparison.html", label: "Is Orion right for you?" },
];

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
                            <span>
                                Platform &middot; Build &middot; Deploy
                                &middot; Govern
                            </span>
                        </div>
                        <h1 className="reveal-blur">
                            <span className="gradient-text">Orion</span>
                        </h1>
                        <h1
                            className="reveal-blur hero-tagline"
                            style={{ "--reveal-delay": "0.12s" }}
                        >
                            The governed services platform for teams
                            building software with AI.
                        </h1>
                        <p className="lead">
                            Its runtime acts as the production nervous system,
                            coordinating, observing and controlling how services
                            behave, so engineers and AI assistants can build,
                            change and ship faster. The lifecycle is fixed:
                            draft, dry-run, canary, one-call rollback.
                        </p>
                        <div className="hero-ctas">
                            <Link to="/contact" className="btn-primary">
                                Talk to an engineer{" "}
                                <ArrowRight aria-hidden="true" />
                            </Link>
                            <a
                                href={DOCS_INSTALL_URL}
                                target="_blank"
                                rel="noopener"
                                className="btn-secondary"
                            >
                                Install in a minute
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
                                <div className="eyebrow eyebrow-amber">
                                    <span>Problem</span>
                                </div>
                                <h2 className="reveal-blur">
                                    AI writes the change in minutes. The
                                    pipeline still ships it in days.
                                </h2>
                                <p className="section-body">
                                    Every business runs on two clocks. The
                                    business clock moves at the speed of
                                    opportunity; the engineering clock moves at
                                    the speed of the release cycle. AI hasn't
                                    changed that, because the pipeline doesn't
                                    care who wrote the code.
                                </p>
                                <div className="callout reveal-blur">
                                    <p>
                                        The bottleneck moved from{" "}
                                        <em>writing</em> software to{" "}
                                        <em>shipping and governing</em> it.{" "}
                                        <strong>
                                            That is the part Orion takes over.
                                        </strong>
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

                {/* SOLUTION */}
                <section className="section-full" data-test-section="solution">
                    <div className="section-container">
                        <div className="grid-2col">
                            <div></div>
                            <div className="col-content reveal-right">
                                <div className="eyebrow">
                                    <span>Solution</span>
                                </div>
                                <h2 className="reveal-blur">
                                    The logic is yours. The architecture is the
                                    runtime's.
                                </h2>
                                <p className="section-body">
                                    A service is one JSON document: logic,
                                    connectors, endpoint. Post it and it's live
                                    a second later, with the guards you
                                    declared enforced before any logic runs. A
                                    review only has to catch logic errors,
                                    never architecture errors.
                                </p>

                                <UseCaseTabs />
                            </div>
                        </div>
                    </div>
                </section>

                {/* MODULAR MONOLITH */}
                <section
                    className="section-full section-dimmed"
                    data-test-section="architecture-freedom"
                >
                    <div className="section-container">
                        <div className="grid-2col">
                            <div className="col-content reveal-left">
                                <div className="eyebrow">
                                    <span>Architecture</span>
                                </div>
                                <h2 className="reveal-blur">
                                    Design the architecture.{" "}
                                    <span className="gradient-text">
                                        Defer the topology.
                                    </span>
                                </h2>
                                <p className="section-body">
                                    Orion runs as a modular monolith: one
                                    runtime holding many small services, each
                                    with its own endpoint, versions, and
                                    rollout, composed in-process with no
                                    network hop. Your architects draw the
                                    boundaries the domain wants, not the ones
                                    the deployment diagram forces. And when the
                                    estate grows, the topology changes while
                                    the architecture doesn't.
                                </p>
                                <div className="callout reveal-blur">
                                    <p>
                                        Decide the microservices question when
                                        production answers it,{" "}
                                        <strong>not on day one.</strong>
                                    </p>
                                </div>
                            </div>
                            <div
                                className="reveal-right"
                                style={{ "--reveal-delay": "0.1s" }}
                            >
                                <div className="feature-cards-stack">
                                    <div className="feature-card feature-card-blue">
                                        <h3>Boundaries without sprawl</h3>
                                        <p>
                                            Each service ships on its own
                                            schedule without becoming its own
                                            deployment, pipeline, or on-call
                                            surface.
                                        </p>
                                    </div>
                                    <div className="feature-card feature-card-green">
                                        <h3>Composition without the network</h3>
                                        <p>
                                            In-process calls between services,
                                            with the callee's guards still
                                            applied and cycles refused.
                                        </p>
                                    </div>
                                    <div className="feature-card feature-card-yellow">
                                        <h3>Scale as a topology decision</h3>
                                        <p>
                                            SQLite to start; PostgreSQL, Redis,
                                            and replicas when you need them. A
                                            configuration change, not a
                                            rewrite.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* THE ARTIFACT */}
                <section
                    className="section-full section-dimmed"
                    data-test-section="decouple"
                >
                    <div className="section-container">
                        <div className="section-header reveal">
                            <div className="eyebrow">
                                <span>The Artifact</span>
                            </div>
                            <h2 className="reveal-blur">
                                The AI writes one document. You review one
                                document.
                            </h2>
                            <p>
                                Spend your tokens on business logic, not on
                                rewriting the same guardrails for every
                                service.
                            </p>
                        </div>

                        <div
                            className="grid-2col reveal"
                            style={{ gap: "32px", alignItems: "start" }}
                        >
                            <div className="col-content">
                                <p className="section-body">
                                    Ask an AI for a conventional service and
                                    most of what it generates is
                                    infrastructure, every line yours to review,
                                    every copy slightly different. On Orion the
                                    entire output is the service definition;
                                    the guardrails are declared in
                                    configuration and enforced by the runtime.
                                    The same arithmetic holds for a pipeline, a
                                    webhook handler, or an agent tool.
                                </p>
                            </div>

                            <div className="decouple-flows-comparison">
                                <div className="decouple-flow-column">
                                    <div className="decouple-flow-header flow-amber">
                                        A conventional service, AI-generated
                                    </div>
                                    <div className="decouple-flow-canvas">
                                        <pre className="artifact-doc">
{`order-service/
  main.py
  middleware/
    auth.py
    rate_limit.py
  retry.py
  metrics.py
`}<span className="hl">{`  logic.py`}</span>{`
  Dockerfile
  ci.yaml
  k8s.yaml`}
                                        </pre>
                                        <p className="artifact-caption">
                                            The business logic is the smallest
                                            file in the tree.
                                        </p>
                                    </div>
                                </div>

                                <div className="decouple-flow-column">
                                    <div className="decouple-flow-header flow-teal">
                                        The same service on Orion
                                    </div>
                                    <div className="decouple-flow-canvas">
                                        <pre className="artifact-doc">
{`{
  "workflow": "order-triage",
  "tasks": [
    { "function": "parse_json" },
    { "function": "map",
      "condition": { ">": [
        { "var": "amount" }, 10000 ] },
      "set": { "risk_level": "review" }
    }
  ],
  "channel": { "route": "POST /orders" }
}`}
                                        </pre>
                                        <p className="artifact-caption">
                                            One document: logic, endpoint,
                                            connections. Reviewed as a diff.
                                        </p>
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
                            <h2 className="reveal-blur">
                                AI proposes. You approve. The runtime enforces.
                            </h2>
                            <p>
                                Every change follows the same path, whoever or
                                whatever wrote it.
                            </p>
                        </div>
                        <div className="grid-2col comparison-grid">
                            <div className="card comparison-card before-card reveal-left">
                                <div className="label-mono label-mono-upper comparison-label comparison-label-blue">
                                    The assistant
                                </div>
                                <h3>AI builds</h3>
                                <p className="section-body comparison-intro">
                                    Over MCP, an assistant works through the
                                    same admin API engineers use:
                                </p>
                                <div className="comparison-points">
                                    <div className="comparison-point">
                                        <span className="dot-sm dot-sm-blue"></span>
                                        <p>
                                            One paragraph of English becomes a
                                            drafted workflow with a real
                                            execution trace
                                        </p>
                                    </div>
                                    <div className="comparison-point">
                                        <span className="dot-sm dot-sm-blue"></span>
                                        <p>
                                            Reviewed as a diff, not as
                                            generated code
                                        </p>
                                    </div>
                                    <div className="comparison-point">
                                        <span className="dot-sm dot-sm-blue"></span>
                                        <p>
                                            Nothing it creates serves traffic
                                            until it is activated
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="card comparison-card after-card reveal-right">
                                <div className="label-mono label-mono-upper comparison-label comparison-label-green">
                                    The gate
                                </div>
                                <h3>You approve the exact bytes</h3>
                                <p className="section-body comparison-intro">
                                    Versions are immutable, so approving the
                                    diff is approving the exact bytes that will
                                    run:
                                </p>
                                <div className="comparison-points">
                                    <div className="comparison-point">
                                        <span className="dot-sm dot-sm-green"></span>
                                        <p>
                                            Canary to 10% of traffic; each
                                            caller consistently sees one
                                            version
                                        </p>
                                    </div>
                                    <div className="comparison-point">
                                        <span className="dot-sm dot-sm-green"></span>
                                        <p>
                                            Roll back with one call to the
                                            previous immutable version
                                        </p>
                                    </div>
                                    <div className="comparison-point">
                                        <span className="dot-sm dot-sm-green"></span>
                                        <p>
                                            Every change lands in the audit
                                            log: who, what, when
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="callout reveal"
                            style={{ maxWidth: "640px", margin: "28px auto 0" }}
                        >
                            <p>
                                The AI follows the same safe path your
                                engineers would,{" "}
                                <strong>because no other path exists.</strong>
                            </p>
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
                            <h2 className="reveal-blur">
                                Every change moves through the same gate.
                            </h2>
                            <p>
                                An assistant drafts, you approve, Orion
                                executes. Every step below is a real product
                                mechanic.
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
                                    Written in minutes. Live in seconds.{" "}
                                    <span className="gradient-text">
                                        Reversible in one call.
                                    </span>
                                </h2>
                                <div className="card orion-desc-card">
                                    <p>
                                        Business logic becomes a governed,
                                        living artifact. Engineers and AI
                                        assistants write it; the runtime
                                        versions, traces and guards every
                                        execution.
                                    </p>
                                    <p
                                        style={{
                                            marginTop: "16px",
                                            fontSize: "26px",
                                            fontWeight: 700,
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
                                    Talk to an engineer{" "}
                                    <ArrowRight aria-hidden="true" />
                                </Link>
                            </div>
                            <div className="orion-feature-list reveal-right">
                                <div className="card orion-feature-card">
                                    <div className="icon-chip orion-feature-icon">
                                        <Clock />
                                    </div>
                                    <h4>Authoring and shipping on the same clock</h4>
                                    <p>
                                        An assistant drafts the change in
                                        minutes; activation makes it live with
                                        no restart.
                                    </p>
                                </div>
                                <div className="card orion-feature-card">
                                    <div className="icon-chip orion-feature-icon">
                                        <Layers />
                                    </div>
                                    <h4>One runtime, five kinds of service</h4>
                                    <p>
                                        APIs, decisions, pipelines, ingestion
                                        and agent tools, with the same guards
                                        and lifecycle.
                                    </p>
                                </div>
                                <div className="card orion-feature-card">
                                    <div className="icon-chip orion-feature-icon">
                                        <ShieldCheck />
                                    </div>
                                    <h4>Governance on every change</h4>
                                    <p>
                                        Versioned, audited, reversible. What
                                        ran yesterday is still there to return
                                        to.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="callout reveal" style={{ marginTop: "28px" }}>
                            <p>
                                <strong>Compared honestly:</strong>{" "}
                                {COMPARE_LINKS.map(({ path, label }, i) => (
                                    <span key={path}>
                                        {i > 0 && <> &middot; </>}
                                        <a
                                            href={`${DOCS_URL}/${path}`}
                                            target="_blank"
                                            rel="noopener"
                                            className="link"
                                        >
                                            {label}
                                        </a>
                                    </span>
                                ))}
                            </p>
                            <p
                                style={{
                                    marginTop: "6px",
                                    fontSize: "14px",
                                    color: "var(--text-body)",
                                }}
                            >
                                The docs name where each neighbour wins; Orion
                                is for request-shaped work in milliseconds.
                            </p>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="section-cta" data-test-section="cta">
                    <div className="section-container">
                        <div className="grid-2col">
                            <div className="cta-inner reveal-left">
                                <div className="eyebrow">
                                    <span>Get started</span>
                                </div>
                                <h2 className="reveal-blur">
                                    Put a governed runtime under your business
                                    logic.
                                </h2>
                                <p className="cta-desc">
                                    Thirty minutes with a founding engineer.
                                    We'll scope a pilot on one of your real
                                    services.
                                </p>
                                <div className="audience-grid">
                                    <div className="card audience-card">
                                        <h4>Organisations</h4>
                                        <p>
                                            Run a pilot with the team behind
                                            Orion, from first service to
                                            production checklist.
                                        </p>
                                        <Link to="/contact" className="label-mono">
                                            Talk to an engineer &rarr;
                                        </Link>
                                    </div>
                                    <div className="card audience-card">
                                        <h4>Developers</h4>
                                        <p>
                                            One binary, installed in about a
                                            minute; a live service in four API
                                            calls.
                                        </p>
                                        <a
                                            href="https://github.com/GoPlasmatic/Orion"
                                            target="_blank"
                                            rel="noopener"
                                            className="label-mono"
                                        >
                                            github.com/GoPlasmatic/Orion &rarr;
                                        </a>
                                    </div>
                                </div>
                                <div className="cta-buttons">
                                    <Link to="/contact" className="btn-primary">
                                        Talk to an engineer{" "}
                                        <ArrowRight aria-hidden="true" />
                                    </Link>
                                    <a
                                        href={DOCS_INSTALL_URL}
                                        target="_blank"
                                        rel="noopener"
                                        className="btn-secondary"
                                    >
                                        Install in a minute
                                    </a>
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
