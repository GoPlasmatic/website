import { motion } from "motion/react";

export function ChaoticSystemViz() {
  // Generate random chaotic connections
  const connections = Array.from({ length: 25 }).map((_, i) => ({
    id: i,
    x1: Math.random() * 100,
    y1: Math.random() * 100,
    x2: Math.random() * 100,
    y2: Math.random() * 100,
  }));

  const nodes = Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    x: 20 + Math.random() * 60,
    y: 20 + Math.random() * 60,
  }));

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="chaosGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Chaotic connections */}
      {connections.map((conn, i) => (
        <motion.line
          key={`line-${i}`}
          x1={conn.x1}
          y1={conn.y1}
          x2={conn.x2}
          y2={conn.y2}
          stroke="#ef476f"
          strokeWidth="0.15"
          opacity="0.2"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.2 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: i * 0.02 }}
        />
      ))}

      {/* Scattered nodes */}
      {nodes.map((node, i) => (
        <motion.g key={`node-${i}`}>
          <motion.circle
            cx={node.x}
            cy={node.y}
            r="0.8"
            fill="#ef476f"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              scale: { duration: 0.3, delay: 0.5 + i * 0.05 },
              opacity: { duration: 2, repeat: Infinity, delay: i * 0.2 },
            }}
            filter="url(#chaosGlow)"
          />
        </motion.g>
      ))}
    </svg>
  );
}
