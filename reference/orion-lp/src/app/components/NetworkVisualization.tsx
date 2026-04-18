import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface Node {
  id: number;
  x: number;
  y: number;
  phase: number;
}

interface Signal {
  id: number;
  from: number;
  to: number;
  progress: number;
}

export function NetworkVisualization() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isOrganized, setIsOrganized] = useState(false);

  useEffect(() => {
    // Initialize scattered nodes
    const initialNodes: Node[] = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60,
      y: 20 + Math.random() * 60,
      phase: Math.random() * Math.PI * 2,
    }));
    setNodes(initialNodes);

    // Transition to organized state after 2s
    const timer = setTimeout(() => {
      setIsOrganized(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Animate signals
    const interval = setInterval(() => {
      setSignals((prev) => {
        const updated = prev
          .map((s) => ({ ...s, progress: s.progress + 0.02 }))
          .filter((s) => s.progress < 1);

        // Add new signal occasionally
        if (Math.random() < 0.1 && nodes.length > 1) {
          const from = Math.floor(Math.random() * nodes.length);
          let to = Math.floor(Math.random() * nodes.length);
          while (to === from) {
            to = Math.floor(Math.random() * nodes.length);
          }
          updated.push({ id: Date.now(), from, to, progress: 0 });
        }

        return updated;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [nodes.length]);

  const getNodePosition = (node: Node) => {
    if (isOrganized) {
      // Organize nodes in a spine-like structure
      const column = node.id % 3;
      const row = Math.floor(node.id / 3);
      return {
        x: 35 + column * 15,
        y: 15 + row * 18,
      };
    }
    return { x: node.x, y: node.y };
  };

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {/* Connection lines */}
        {isOrganized && nodes.map((node, i) => {
          if (i < nodes.length - 3) {
            const current = getNodePosition(node);
            const next = getNodePosition(nodes[i + 3]);
            return (
              <motion.line
                key={`line-${i}`}
                x1={current.x}
                y1={current.y}
                x2={next.x}
                y2={next.y}
                stroke="rgba(17, 159, 205, 0.2)"
                strokeWidth="0.1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            );
          }
          return null;
        })}

        {/* Signals */}
        {signals.map((signal) => {
          const fromNode = nodes[signal.from];
          const toNode = nodes[signal.to];
          if (!fromNode || !toNode) return null;

          const from = getNodePosition(fromNode);
          const to = getNodePosition(toNode);
          const x = from.x + (to.x - from.x) * signal.progress;
          const y = from.y + (to.y - from.y) * signal.progress;

          return (
            <circle
              key={signal.id}
              cx={x}
              cy={y}
              r="0.3"
              fill="#119fcd"
              opacity={0.8}
              filter="url(#glow)"
            />
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = getNodePosition(node);
          return (
            <motion.g key={node.id}>
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r="0.8"
                fill={isOrganized ? "#4cbd97" : "#119fcd"}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scale: 1,
                  cx: pos.x,
                  cy: pos.y,
                }}
                transition={{
                  opacity: { duration: 2, repeat: Infinity, delay: node.phase },
                  cx: { duration: 1.5, ease: "easeInOut" },
                  cy: { duration: 1.5, ease: "easeInOut" },
                  scale: { duration: 0.5 },
                }}
                filter="url(#glow)"
              />
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r="1.5"
                fill="none"
                stroke={isOrganized ? "#4cbd97" : "#119fcd"}
                strokeWidth="0.1"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.4, 0],
                  scale: [1, 1.5, 1],
                  cx: pos.x,
                  cy: pos.y,
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: node.phase,
                  cx: { duration: 1.5, ease: "easeInOut" },
                  cy: { duration: 1.5, ease: "easeInOut" },
                }}
              />
            </motion.g>
          );
        })}

        {/* Glow filter */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}
