import { useEffect, useRef, useState } from "react";
import { Cpu, UserCheck, Zap } from "lucide-react";

// Lifecycle simulator of Orion's real change mechanics: an AI-drafted workflow
// diff walks draft → dry-run → approve & canary → activate → rollback. Every
// element mirrors a documented feature; audit lines appear only on mutating
// steps (dry-runs produce traces, not audit rows).

const AUDIT_LINES = {
    canary: "audit: workflow payment-fraud-check v7 rollout set to 10% by demo-user",
    activate: "audit: workflow payment-fraud-check v7 activated at 100% by demo-user",
    rollback: "audit: workflow payment-fraud-check rolled back to v6 by demo-user",
};

// The stage machine is linear (reject/reset are only reachable while the trail
// is empty), so each stage's visible audit trail is a fixed prefix — derived
// here rather than accumulated in state the transitions would have to sync.
const AUDIT_BY_STAGE = {
    canary: [AUDIT_LINES.canary],
    activating: [AUDIT_LINES.canary],
    active: [AUDIT_LINES.canary, AUDIT_LINES.activate],
    rolledback: [AUDIT_LINES.canary, AUDIT_LINES.activate, AUDIT_LINES.rollback],
};

const STATUS = {
    draft: "DRAFT — serving no traffic",
    dryrunning: "DRAFT — serving no traffic",
    dryrun: "DRAFT — serving no traffic",
    approving: "DRAFT — serving no traffic",
    canary: "Canary 10%",
    activating: "Canary 10%",
    active: "v7 active 100%",
    rolledback: "v6 active",
    rejected: "Rejected",
};

// Transient stages render a one-line sim-log while their timer runs.
const PROGRESS = {
    dryrunning:
        "Dry-running v7 against a sample order with stubbed connectors...",
    approving: "Setting rollout for v7 to 10% of traffic...",
    activating:
        "Building the new engine alongside the old, then swapping atomically...",
};

function DiffBlock() {
    return (
        <div className="sim-log sim-log-block">
            <div>&nbsp;&nbsp;"task": "fraud_check",</div>
            <div className="sim-err">
                - "condition": {"{"} "&gt;": [{"{"}"var":"fraud_score"{"}"}, 80] {"}"}
            </div>
            <div className="sim-ok">
                + "condition": {"{"} "&gt;": [{"{"}"var":"fraud_score"{"}"}, 70] {"}"}
            </div>
        </div>
    );
}

function TraceBlock() {
    return (
        <div className="sim-log sim-log-block">
            <div className="sim-dim">
                dry-run · payment-fraud-check v7 · sample order · 3 tasks
            </div>
            <div>
                <span className="sim-ok">✓</span>{" "}
                parse_order&nbsp;&nbsp;&nbsp;&nbsp;order parsed
            </div>
            <div>
                <span className="sim-ok">✓</span>{" "}
                fraud_check&nbsp;&nbsp;&nbsp;&nbsp;score 74 → flagged: true
            </div>
            <div>
                <span className="sim-ok">✓</span>{" "}
                map_response&nbsp;&nbsp;&nbsp;risk_level: "review"
            </div>
            <div className="sim-dim">
                trace stored. no traffic served.
            </div>
        </div>
    );
}

function AuditBlock({ lines }) {
    if (!lines.length) return null;
    return (
        <div className="sim-log sim-log-block">
            {lines.map((line) => (
                <div key={line}>{line}</div>
            ))}
        </div>
    );
}

function TrafficSplit() {
    return (
        <div style={{ marginTop: "12px" }}>
            <div
                style={{
                    display: "flex",
                    height: "10px",
                    borderRadius: "5px",
                    overflow: "hidden",
                    background: "rgba(0, 0, 0, 0.25)",
                }}
            >
                <div
                    style={{
                        width: "10%",
                        background: "var(--accent-green, #4CBD97)",
                    }}
                ></div>
                <div
                    style={{
                        width: "90%",
                        background: "rgba(17, 159, 205, 0.35)",
                    }}
                ></div>
            </div>
            <div
                className="sim-note"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "6px",
                }}
            >
                <span className="sim-ok">v7 canary · 10%</span>
                <span>v6 active · 90%</span>
            </div>
        </div>
    );
}

export default function GuardrailsSimulator() {
    // draft | dryrunning | dryrun | approving | canary | activating | active
    // | rolledback | rejected
    const [stage, setStage] = useState("draft");
    const timers = useRef([]);

    const clearTimers = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    };
    const schedule = (fn, ms) => {
        const t = setTimeout(fn, ms);
        timers.current.push(t);
    };

    useEffect(() => () => clearTimers(), []);

    function dryRun() {
        clearTimers();
        setStage("dryrunning");
        schedule(() => setStage("dryrun"), 900);
    }
    function approveCanary() {
        clearTimers();
        setStage("approving");
        schedule(() => setStage("canary"), 700);
    }
    function activate() {
        clearTimers();
        setStage("activating");
        schedule(() => setStage("active"), 800);
    }
    function rollBack() {
        clearTimers();
        setStage("rolledback");
    }
    function reject() {
        clearTimers();
        setStage("rejected");
    }
    function reset() {
        clearTimers();
        setStage("draft");
    }

    const pulse = (s) => (stage === s ? " pulse-active" : "");
    const audit = AUDIT_BY_STAGE[stage] ?? [];
    const statusPulsing = STATUS[stage] === STATUS.draft;

    let body;
    if (stage in PROGRESS) {
        body = <div className="sim-log">{PROGRESS[stage]}</div>;
    } else if (stage === "dryrun") {
        body = (
            <>
                <div className="proposal-details">
                    <strong>Dry-run passed.</strong> The trace shows what each
                    task did. The draft still serves no traffic.
                </div>
                <TraceBlock />
                <div className="proposal-actions">
                    <button className="btn-approve" onClick={approveCanary}>
                        Approve &amp; canary 10%
                    </button>
                    <button className="btn-reject" onClick={reject}>
                        Reject
                    </button>
                </div>
            </>
        );
    } else if (stage === "canary") {
        body = (
            <>
                <div className="proposal-details">
                    <strong>Canary running.</strong> One call in ten reaches v7.
                    Each caller consistently sees one version.
                </div>
                <TrafficSplit />
                <AuditBlock lines={audit} />
                <div className="proposal-actions">
                    <button className="btn-approve" onClick={activate}>
                        Activate 100%
                    </button>
                </div>
            </>
        );
    } else if (stage === "active") {
        body = (
            <div className="sim-success-box">
                <span className="sim-ok">✔ v7 active at 100%.</span>{" "}
                <strong>No restart. No dropped request.</strong>
                <br />
                v6 stays archived as the rollback target.
                <AuditBlock lines={audit} />
                <button className="btn-undo" onClick={rollBack}>
                    Roll back
                </button>
            </div>
        );
    } else if (stage === "rolledback") {
        body = (
            <div className="sim-success-box">
                <span className="sim-ok">✔ v6 restored.</span>{" "}
                One call. Nothing rebuilt, nothing redeployed.
                <AuditBlock lines={audit} />
                <button className="btn-undo" onClick={reset}>
                    Reset demo
                </button>
            </div>
        );
    } else if (stage === "rejected") {
        body = (
            <div className="sim-rejected-box">
                <span className="sim-err">✖ Draft rejected.</span>
                <br />
                The draft is archived. It never served traffic. Nothing to
                undo.
                <br />
                <button className="btn-undo" onClick={reset}>
                    Reset demo
                </button>
            </div>
        );
    } else {
        body = (
            <>
                <div className="proposal-details">
                    <strong>Drafted by an AI assistant:</strong>{" "}
                    <code>payment-fraud-check</code> v7, from active v6. Lowers
                    the threshold that flags an order for review.
                </div>
                <DiffBlock />
                <div className="proposal-actions">
                    <button className="btn-approve" onClick={dryRun}>
                        Dry-run
                    </button>
                    <button className="btn-reject" onClick={reject}>
                        Reject
                    </button>
                </div>
            </>
        );
    }

    return (
        <div className="diagram-card card card-glass reveal" style={{ padding: "24px" }}>
            {/* Shared device-frame header — same chrome as the deploy
                simulator, so the interactive widgets read as instruments of
                one machine. */}
            <div className="simulator-header">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
                <span className="simulator-title">
                    orion &mdash; change lifecycle
                </span>
            </div>
            <div className="guardrails-visual-container">
                <div
                    className={`guard-step step-ai${pulse("dryrunning")}`}
                    id="step-1"
                >
                    <div className="step-num">01</div>
                    <h4>AI builds</h4>
                    <p>
                        An assistant drafts and dry-runs the workflow through
                        the same admin API engineers use. Nothing serves
                        traffic until it is activated.
                    </p>
                    <div className="step-icon">
                        <Cpu />
                    </div>
                </div>
                <div className="step-arrow">&rarr;</div>
                <div
                    className={`guard-step step-human${pulse("approving")}`}
                    id="step-2"
                >
                    <div className="step-num">02</div>
                    <h4>You approve</h4>
                    <p>
                        Approving the diff approves the exact bytes that will
                        run. Versions are immutable.
                    </p>
                    <div className="step-icon">
                        <UserCheck />
                    </div>
                </div>
                <div className="step-arrow">&rarr;</div>
                <div
                    className={`guard-step step-orion${pulse("activating")}`}
                    id="step-3"
                >
                    <div className="step-num">03</div>
                    <h4>The runtime governs</h4>
                    <p>
                        Canary by percentage, one-call rollback, and every
                        change in the audit log.
                    </p>
                    <div className="step-icon">
                        <Zap />
                    </div>
                </div>
            </div>

            <div
                className="proposal-simulator-card reveal-blur"
                style={{ "--reveal-delay": "0.15s", marginTop: "24px" }}
            >
                <div className="sim-header">
                    <span className="label-mono">
                        workflow: payment-fraud-check
                    </span>
                    <span
                        className={`status-indicator${statusPulsing ? " pulsing" : ""}`}
                    >
                        {STATUS[stage]}
                    </span>
                </div>
                <div className="proposal-body" id="proposal-box">
                    {body}
                </div>
            </div>
        </div>
    );
}
