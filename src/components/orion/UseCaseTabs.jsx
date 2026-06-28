import { useState } from "react";

// Real-world use-case selector for the Solution section. Ports switchUseCase()
// to React state — the card body renders from the active USE_CASES entry.

const USE_CASES = {
    pricing: {
        title: "Dynamic Surge Pricing",
        desc: "Adjust pricing rules in response to market demand, inventory levels, or user profiles instantly.",
        before: "Engineers push a Git branch, run unit/integration tests, build Docker containers, roll out a rolling Kubernetes deployment, and wait for DNS propagation. (Total time: 90 mins)",
        after: "Surge pricing multiplier is hot-swapped in the Orion logical layer. The rule goes live globally across all endpoints in 12ms with zero microservice restarts.",
    },
    fraud: {
        title: "Payment Fraud Score Rules",
        desc: "Evaluate transaction fraud risk scores dynamically at runtime and reject or approve card authorizations without downtime.",
        before: "Hardcode risk limits and scoring thresholds (e.g. score > 85) inside checkout service code. Adjusting the score threshold to block new attacks requires updating backend logic, code reviews, container builds, and rolling deployments. (Total time: 45 mins)",
        after: "Fraud rules evaluate payment risk models in the Orion layer. If risk scores rise above a dynamically adjusted threshold (e.g. fraudScore > 75), Orion blocks the payment at the gateway instantly. Rules swap in 8ms with zero backend service restarts.",
    },
    experience: {
        title: "Smart User Experience (A/B Routing)",
        desc: "Deploy customized UI behaviors, landing rules, or localized routing for cohorts on the fly.",
        before: "Update feature flag backend config, sync environment variables, and perform canary deployments to ensure service stability. (Total time: 30 mins)",
        after: "Route cohorts dynamically by updating rules in Orion. Path updates reflect instantly for targeted user cohorts with zero traffic interruption.",
    },
};

const TABS = [
    { key: "pricing", label: "Dynamic Pricing" },
    { key: "fraud", label: "Fraud Detection" },
    { key: "experience", label: "Customer Experience" },
];

export default function UseCaseTabs() {
    const [active, setActive] = useState("pricing");
    const data = USE_CASES[active];

    return (
        <>
            <div
                className="use-case-tabs reveal-blur"
                style={{ "--reveal-delay": "0.15s" }}
            >
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        className={`use-case-btn${active === t.key ? " active" : ""}`}
                        onClick={() => setActive(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div
                className="use-case-display-card card card-glass reveal-blur"
                id="use-case-card"
                style={{ "--reveal-delay": "0.2s" }}
            >
                <h4>{data.title}</h4>
                <p>{data.desc}</p>
                <div className="use-case-comparison">
                    <div className="comp-col comp-col-before">
                        <strong>Before Orion (Engineering Clock)</strong>
                        <p>{data.before}</p>
                    </div>
                    <div className="comp-col comp-col-after">
                        <strong>With Orion (Business Clock)</strong>
                        <p>{data.after}</p>
                    </div>
                </div>
            </div>
        </>
    );
}
