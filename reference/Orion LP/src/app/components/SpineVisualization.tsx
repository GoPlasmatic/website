import { motion } from "motion/react";

export function SpineVisualization() {
  const spineNodes = [15, 30, 45, 60, 75, 90];

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="spineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#119fcd" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#4cbd97" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#119fcd" stopOpacity="0.8" />
        </linearGradient>
        <filter id="spineGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.8" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Central spine line */}
      <motion.line
        x1="50"
        y1="5"
        x2="50"
        y2="95"
        stroke="url(#spineGradient)"
        strokeWidth="0.8"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        filter="url(#spineGlow)"
      />

      {/* Spine nodes with branching */}
      {spineNodes.map((y, i) => (
        <g key={i}>
          {/* Main node */}
          <motion.circle
            cx="50"
            cy={y}
            r="1.2"
            fill="#4cbd97"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 + i * 0.15, duration: 0.4 }}
            filter="url(#spineGlow)"
          />

          {/* Pulse ring */}
          <motion.circle
            cx="50"
            cy={y}
            r="2"
            fill="none"
            stroke="#4cbd97"
            strokeWidth="0.2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />

          {/* Left branch */}
          <motion.line
            x1="50"
            y1={y}
            x2="30"
            y2={y + 8}
            stroke="#119fcd"
            strokeWidth="0.3"
            opacity="0.6"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 + i * 0.15, duration: 0.5 }}
          />
          <motion.circle
            cx="30"
            cy={y + 8}
            r="0.6"
            fill="#119fcd"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1 + i * 0.15, duration: 0.3 }}
          />

          {/* Right branch */}
          <motion.line
            x1="50"
            y1={y}
            x2="70"
            y2={y + 8}
            stroke="#119fcd"
            strokeWidth="0.3"
            opacity="0.6"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7 + i * 0.15, duration: 0.5 }}
          />
          <motion.circle
            cx="70"
            cy={y + 8}
            r="0.6"
            fill="#119fcd"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1 + i * 0.15, duration: 0.3 }}
          />
        </g>
      ))}

      {/* Signal flows */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={`signal-${i}`}
          cx="50"
          cy="0"
          r="0.5"
          fill="#ffd167"
          initial={{ cy: 5 }}
          animate={{
            cy: [5, 95],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 1,
            ease: "linear",
          }}
          filter="url(#spineGlow)"
        />
      ))}
    </svg>
  );
}
