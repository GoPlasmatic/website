import { useEffect, useRef, useState } from "react";

// Same change, two paths. The conventional pipeline advances one stage every
// 600ms; the Orion lifecycle fills its stages on a staggered schedule in which
// "Review & approve" deliberately takes the longest hold, because the review is
// the whole job once the build and rollout machinery is gone. No printed
// timings: the animation paces the story, it does not claim numbers.
// Auto-runs once shortly after mount, and on the button.

const PIPELINE_STAGES = [
    { name: "Commit & PR" },
    { name: "Review" },
    { name: "Build & CI" },
    { name: "Rolling deploy" },
];
// Each Orion stage carries its own fill delay. The long hold before
// "Canary & activate" is the review hold: everything mechanical is
// near-instant, the human read is not.
const ORION_STAGES = [
    { name: "Draft", note: "no traffic", delay: 0 },
    { name: "Dry-run", note: "trace", delay: 150 },
    { name: "Review & approve", note: "diff", delay: 350 },
    { name: "Canary & activate", note: "atomic swap", delay: 1250 },
];

const blank = (stages) => stages.map(() => ({ active: false, fill: false }));

export default function DeploySimulator() {
    const [running, setRunning] = useState(false);
    const [pipeline, setPipeline] = useState(() => blank(PIPELINE_STAGES));
    const [orion, setOrion] = useState(() => blank(ORION_STAGES));
    const timers = useRef([]);
    const runningRef = useRef(false);

    const clearTimers = () => {
        timers.current.forEach(clearTimeout);
        timers.current = [];
    };
    const schedule = (fn, ms) => {
        const t = setTimeout(fn, ms);
        timers.current.push(t);
    };

    function run() {
        if (runningRef.current) return; // ignore clicks mid-animation
        runningRef.current = true;
        setRunning(true);
        clearTimers();
        setPipeline(blank(PIPELINE_STAGES));
        setOrion(blank(ORION_STAGES));

        // Orion lifecycle: staggered fills with the review hold in the middle.
        ORION_STAGES.forEach((stage, idx) => {
            schedule(() => {
                setOrion((prev) =>
                    prev.map((s, i) =>
                        i === idx ? { active: true, fill: true } : s,
                    ),
                );
            }, stage.delay);
        });

        // Conventional pipeline: slow sequential stages.
        let cur = 0;
        const nextStage = () => {
            if (cur < PIPELINE_STAGES.length) {
                const idx = cur;
                setPipeline((prev) =>
                    prev.map((s, i) => (i === idx ? { ...s, active: true } : s)),
                );
                schedule(() => {
                    setPipeline((prev) =>
                        prev.map((s, i) =>
                            i === idx ? { ...s, fill: true } : s,
                        ),
                    );
                }, 50);
                cur++;
                schedule(nextStage, 600);
            } else {
                runningRef.current = false;
                setRunning(false);
            }
        };
        nextStage();
    }

    // Run once after mount to show the user the comparison.
    useEffect(() => {
        const t = setTimeout(run, 800);
        return () => {
            clearTimeout(t);
            clearTimers();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const column = ({
        label,
        color,
        badgeClass,
        badge,
        support,
        chartId,
        stages,
        state,
    }) => (
        <div className="sim-column">
            <div className="sim-column-header">
                <span className="slider-label" style={{ color }}>
                    {label}
                </span>
                <span
                    className={`sim-speed-badge ${badgeClass}`}
                    style={{ fontSize: "10px", padding: "2px 8px", margin: 0 }}
                >
                    {badge}
                </span>
            </div>
            <div className="label-mono sim-support">{support}</div>
            <div className="stages-chart" id={chartId}>
                {stages.map((s, i) => (
                    <div
                        className={`stage-row${state[i].active ? " active" : ""}`}
                        key={s.name}
                    >
                        <div className="stage-info">
                            <span className="stage-name">{s.name}</span>
                            {s.note ? (
                                <span className="stage-duration">{s.note}</span>
                            ) : null}
                        </div>
                        <div className="stage-progress-bar">
                            <div
                                className={
                                    chartId === "biz-stages-chart"
                                        ? "progress-fill orion-fill"
                                        : "progress-fill"
                                }
                                style={{ width: state[i].fill ? "100%" : "0%" }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="simulator-card card card-glass">
            <div className="simulator-header">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
                <span className="simulator-title">Same change, two paths</span>
            </div>
            <div className="simulator-body">
                <div className="sim-columns">
                    {column({
                        label: "Conventional pipeline",
                        color: "#ffd167",
                        badgeClass: "speed-slow",
                        badge: "Minutes to days",
                        support: "per change, per service",
                        chartId: "eng-stages-chart",
                        stages: PIPELINE_STAGES,
                        state: pipeline,
                    })}
                    {column({
                        label: "Orion lifecycle",
                        color: "#4cbd97",
                        badgeClass: "speed-fast",
                        badge: "Live on activation",
                        support: "no restart, no dropped request",
                        chartId: "biz-stages-chart",
                        stages: ORION_STAGES,
                        state: orion,
                    })}
                </div>
                <p className="artifact-caption">
                    The review is the whole job. The build, packaging, and
                    rollout machinery is gone.
                </p>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: "8px",
                    }}
                >
                    <button
                        className="btn-deploy"
                        id="sim-trigger-btn"
                        disabled={running}
                        onClick={run}
                        style={{
                            padding: "8px 20px",
                            fontSize: "12px",
                            borderRadius: "6px",
                            opacity: running ? 0.5 : 1,
                            cursor: running ? "not-allowed" : "pointer",
                        }}
                    >
                        {running ? "Deploying..." : "Deploy Change"}
                    </button>
                </div>
            </div>
        </div>
    );
}
