import { useEffect, useRef, useState } from "react";
import { Cpu, UserCheck, Zap } from "lucide-react";

// AI-with-guardrails flow + proposal-review simulator. Ports simulateApproval()
// / simulateRejection() / resetProposalBox() to a phase state machine; the three
// flow steps pulse as the approval walks through them.

export default function GuardrailsSimulator() {
    // idle | step1 | step2 | step3 | approved | rejected
    const [phase, setPhase] = useState("idle");
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

    function approve() {
        clearTimers();
        setPhase("step1");
        schedule(() => {
            setPhase("step2");
            schedule(() => {
                setPhase("step3");
                schedule(() => setPhase("approved"), 800);
            }, 800);
        }, 800);
    }
    function reject() {
        clearTimers();
        setPhase("rejected");
    }
    function reset() {
        clearTimers();
        setPhase("idle");
    }

    const pulse = (s) => (phase === s ? " pulse-active" : "");

    let body;
    if (phase === "step1") {
        body = (
            <div className="sim-log">
                Step 1: AI optimization rule generated...
            </div>
        );
    } else if (phase === "step2") {
        body = (
            <div className="sim-log">
                Step 2: Verification check &amp; cryptographic signature
                secured...
            </div>
        );
    } else if (phase === "step3") {
        body = (
            <div className="sim-log">
                Step 3: Orion engine deploying hotswap configs...
            </div>
        );
    } else if (phase === "approved") {
        body = (
            <div className="sim-success-box">
                <span className="log-success">
                    ✔ Rule hot-swapped active in 8ms!
                </span>
                <br />
                <strong>Ledger Signature:</strong>{" "}
                <code>0x3f7b2c...a891e</code> (Signed)
                <br />
                <strong>Real-time Impact:</strong> Fraud threshold optimized
                safely.
                <br />
                <button className="btn-undo" onClick={reset}>
                    Rollback Change (1-Click)
                </button>
            </div>
        );
    } else if (phase === "rejected") {
        body = (
            <div className="sim-rejected-box">
                <span className="text-danger">✖ Proposal Rejected.</span>
                <br />
                The rule was dismissed. No code was updated, no production
                systems were modified.
                <br />
                <button className="btn-undo" onClick={reset}>
                    Reset Demo
                </button>
            </div>
        );
    } else {
        body = (
            <>
                <div className="proposal-details">
                    <strong>Proposed Change:</strong> Set{" "}
                    <code>payment.fraudScore &gt; 70</code> reject rule for
                    anonymous proxies.
                    <br />
                    <strong>AI Rationale:</strong> Observed 8.4% rise in
                    chargebacks from proxy sessions over past 2 hours.
                    <br />
                    <strong>Policy Check:</strong>{" "}
                    <span className="text-success">
                        ✔ Compliant with compliance limits.
                    </span>
                </div>
                <div className="proposal-actions">
                    <button className="btn-approve" onClick={approve}>
                        Approve &amp; Deploy Rule
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
            <div className="guardrails-visual-container">
                <div className={`guard-step step-ai${pulse("step1")}`} id="step-1">
                    <div className="step-num">01</div>
                    <h4>AI Proposes</h4>
                    <p>
                        Optimized rules are formulated based on business outcomes
                        and real-time telemetry.
                    </p>
                    <div className="step-icon">
                        <Cpu />
                    </div>
                </div>
                <div className="step-arrow">&rarr;</div>
                <div
                    className={`guard-step step-human${pulse("step2")}`}
                    id="step-2"
                >
                    <div className="step-num">02</div>
                    <h4>Human Approves</h4>
                    <p>
                        Changes go through policy guardrails. Humans review,
                        approve, and sign off.
                    </p>
                    <div className="step-icon">
                        <UserCheck />
                    </div>
                </div>
                <div className="step-arrow">&rarr;</div>
                <div
                    className={`guard-step step-orion${pulse("step3")}`}
                    id="step-3"
                >
                    <div className="step-num">03</div>
                    <h4>Orion Runs</h4>
                    <p>
                        Rules deploy dynamically. Changes are versioned, audited,
                        and instantly reversible.
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
                        AI Proposal Queue (1 pending)
                    </span>
                    <span className="status-indicator pulsing">
                        Pending Review
                    </span>
                </div>
                <div className="proposal-body" id="proposal-box">
                    {body}
                </div>
            </div>
        </div>
    );
}
