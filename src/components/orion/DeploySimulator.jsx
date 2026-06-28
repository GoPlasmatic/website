import { useEffect, useRef, useState } from "react";

// Deployment-speed comparison (the two-clocks simulator). The Orion clock fills
// all stages near-instantly (staggered 100ms); the engineering clock advances
// one stage every 600ms. Auto-runs once shortly after mount, and on the button.
// Ports triggerParallelDeploy() to React state with timer cleanup on unmount.

const ENG_STAGES = [
    { name: "Commit & PR Push", duration: "10s" },
    { name: "Container Build", duration: "35s" },
    { name: "CI/CD Testing", duration: "30s" },
    { name: "Rolling Deploy", duration: "15s" },
];
const BIZ_STAGES = [
    { name: "Schema Check", duration: "2ms" },
    { name: "Policy Guardrails", duration: "3ms" },
    { name: "Edge Promotion", duration: "7ms" },
];

const blank = (stages) => stages.map(() => ({ active: false, fill: false }));

export default function DeploySimulator() {
    const [running, setRunning] = useState(false);
    const [eng, setEng] = useState(() => blank(ENG_STAGES));
    const [biz, setBiz] = useState(() => blank(BIZ_STAGES));
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
        setEng(blank(ENG_STAGES));
        setBiz(blank(BIZ_STAGES));

        // Orion clock — staggered start, instant fill.
        BIZ_STAGES.forEach((_, idx) => {
            schedule(() => {
                setBiz((prev) =>
                    prev.map((s, i) =>
                        i === idx ? { active: true, fill: true } : s,
                    ),
                );
            }, idx * 100);
        });

        // Engineering clock — slow sequential stages.
        let cur = 0;
        const nextEng = () => {
            if (cur < ENG_STAGES.length) {
                const idx = cur;
                setEng((prev) =>
                    prev.map((s, i) => (i === idx ? { ...s, active: true } : s)),
                );
                schedule(() => {
                    setEng((prev) =>
                        prev.map((s, i) =>
                            i === idx ? { ...s, fill: true } : s,
                        ),
                    );
                }, 50);
                cur++;
                schedule(nextEng, 600);
            } else {
                runningRef.current = false;
                setRunning(false);
            }
        };
        nextEng();
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

    const column = (label, color, badgeClass, badge, chartId, stages, state) => (
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
            <div className="stages-chart" id={chartId}>
                {stages.map((s, i) => (
                    <div
                        className={`stage-row${state[i].active ? " active" : ""}`}
                        key={s.name}
                    >
                        <div className="stage-info">
                            <span className="stage-name">{s.name}</span>
                            <span className="stage-duration">{s.duration}</span>
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
                <span className="simulator-title">
                    Deployment Speed Comparison
                </span>
            </div>
            <div className="simulator-body">
                <div className="sim-columns">
                    {column(
                        "Engineering Clock",
                        "#ffd167",
                        "speed-slow",
                        "90s Delay",
                        "eng-stages-chart",
                        ENG_STAGES,
                        eng,
                    )}
                    {column(
                        "Orion Clock",
                        "#4cbd97",
                        "speed-fast",
                        "12ms Hot-Swap",
                        "biz-stages-chart",
                        BIZ_STAGES,
                        biz,
                    )}
                </div>
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
