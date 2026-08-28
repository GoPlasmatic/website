import { useState } from "react";

// Service-kind selector for the Solution section. One tab per kind of service
// the runtime carries (mirrors the docs intro); the card body renders from the
// active USE_CASES entry. Kept to one comparison strip so the Solution section
// fits inside a snap viewport without inner scrolling.

const USE_CASES = {
    apis: {
        label: "APIs",
        title: "Microservice APIs",
        desc: "Order triage: flag orders over $10,000, add a risk_level field, answer on POST /orders.",
        writes: "One JSON document, drafted by an engineer or an AI assistant.",
        carries: "The endpoint, validation, rate limiting, metrics, and versions.",
    },
    decisions: {
        label: "Decisions",
        title: "Decision APIs",
        desc: "Pricing tiers and eligibility as JSONLogic conditions. The decision is the response.",
        writes: "The condition tree, as data.",
        carries: "Validation that fails at save, and a trace of every decision.",
    },
    pipelines: {
        label: "Pipelines",
        title: "Event pipelines",
        desc: "A Kafka topic in, transform and enrich, publish onward.",
        writes: "The transform pipeline.",
        carries: "Retries, duplicate suppression, and a dead-letter queue for failed messages.",
    },
    ingestion: {
        label: "Ingestion",
        title: "Webhook & data ingestion",
        desc: "Normalize Stripe, GitHub, or Shopify payloads, then write to your databases.",
        writes: "The mapping.",
        carries: "Pooled connections, retries, circuit breakers, and credentials held outside the logic.",
    },
    agents: {
        label: "Agent tools",
        title: "AI agent tools",
        desc: "An agent calls your channels as tools, and through the CLI and its skills it drafts the workflows behind them.",
        writes: "The tools themselves.",
        carries: "Lifecycle rules the agent operates inside: draft, dry-run, then explicit activation.",
    },
};

const TABS = Object.entries(USE_CASES).map(([key, { label }]) => ({
    key,
    label,
}));

export default function UseCaseTabs() {
    const [active, setActive] = useState("apis");

    return (
        <div
            className="use-case-display-card card card-glass reveal-blur"
            id="use-case-card"
            style={{ "--reveal-delay": "0.2s" }}
        >
            <div className="use-case-tabs" role="tablist">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        role="tab"
                        id={`use-case-tab-${t.key}`}
                        aria-selected={active === t.key}
                        aria-controls={`use-case-panel-${t.key}`}
                        className={`use-case-btn${active === t.key ? " active" : ""}`}
                        onClick={() => setActive(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Every panel stays in the DOM and the inactive ones are hidden,
                rather than rendering only the active entry. These five service
                kinds are the page's most retrievable copy; rendering one at a
                time kept four of them out of the HTML source entirely. */}
            {Object.entries(USE_CASES).map(([key, data]) => (
                <div
                    key={key}
                    className="use-case-panel"
                    id={`use-case-panel-${key}`}
                    role="tabpanel"
                    aria-labelledby={`use-case-tab-${key}`}
                    hidden={active !== key}
                >
                    <h4>{data.title}</h4>
                    <p>{data.desc}</p>
                    <div className="use-case-comparison">
                        <div className="comp-col">
                            <strong>The AI writes</strong>
                            <p>{data.writes}</p>
                        </div>
                        <div className="comp-col comp-col-after">
                            <strong>The runtime carries</strong>
                            <p>{data.carries}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
