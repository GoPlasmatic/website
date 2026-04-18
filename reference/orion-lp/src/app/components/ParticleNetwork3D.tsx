import { motion, useScroll, useTransform } from "motion/react";
import { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  z: number;
  size: number;
  connections: number[];
}

export function ParticleNetwork3D() {
  const { scrollYProgress } = useScroll();

  // Zoom effect - scales up as you scroll
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 3]);
  const rotateY = useTransform(scrollYProgress, [0, 0.5], [0, 45]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.5], [1, 0.8, 0]);

  // Generate particles in 3D space
  const particles = useMemo(() => {
    const particleCount = 60;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      // Distribute particles in 3D space
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 300 + Math.random() * 200;

      particles.push({
        id: i,
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: Math.random() * 800 - 400,
        size: 3 + Math.random() * 4,
        connections: [],
      });
    }

    // Create connections between nearby particles
    particles.forEach((particle, i) => {
      particles.forEach((other, j) => {
        if (i < j) {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const dz = particle.z - other.z;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (distance < 200 && particle.connections.length < 4) {
            particle.connections.push(j);
          }
        }
      });
    });

    return particles;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ perspective: "1000px" }}>
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          scale,
          rotateY,
          opacity,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="relative"
          style={{
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
          }}
        >
          {/* Render connections first (behind particles) */}
          {particles.map((particle) =>
            particle.connections.map((connId) => {
              const connected = particles[connId];
              if (!connected) return null;

              // Calculate midpoint for positioning
              const midX = (particle.x + connected.x) / 2;
              const midY = (particle.y + connected.y) / 2;
              const midZ = (particle.z + connected.z) / 2;

              // Calculate line length and angle
              const dx = connected.x - particle.x;
              const dy = connected.y - particle.y;
              const dz = connected.z - particle.z;
              const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);

              // Z-based opacity (closer = more visible)
              const zOpacity = 0.1 + ((midZ + 400) / 800) * 0.4;

              return (
                <motion.div
                  key={`${particle.id}-${connId}`}
                  className="absolute origin-left"
                  style={{
                    left: "50%",
                    top: "50%",
                    width: `${length}px`,
                    height: "1px",
                    background: `linear-gradient(90deg, rgba(17, 159, 205, ${zOpacity}), rgba(76, 189, 151, ${zOpacity}))`,
                    transform: `translate3d(${midX}px, ${midY}px, ${midZ}px) rotate(${angle}deg)`,
                    transformStyle: "preserve-3d",
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 1.5, delay: particle.id * 0.02 }}
                />
              );
            })
          )}

          {/* Render particles */}
          {particles.map((particle) => {
            // Z-based properties (closer = larger, brighter)
            const zScale = 1 + ((particle.z + 400) / 800) * 0.5;
            const zOpacity = 0.3 + ((particle.z + 400) / 800) * 0.7;
            const isClose = particle.z > 0;

            return (
              <motion.div
                key={particle.id}
                className="absolute rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  background: isClose
                    ? `radial-gradient(circle, rgba(76, 189, 151, ${zOpacity}), rgba(76, 189, 151, 0))`
                    : `radial-gradient(circle, rgba(17, 159, 205, ${zOpacity}), rgba(17, 159, 205, 0))`,
                  boxShadow: isClose
                    ? `0 0 ${particle.size * 3}px rgba(76, 189, 151, ${zOpacity * 0.6})`
                    : `0 0 ${particle.size * 2}px rgba(17, 159, 205, ${zOpacity * 0.5})`,
                  transform: `translate3d(${particle.x}px, ${particle.y}px, ${particle.z}px) scale(${zScale})`,
                  transformStyle: "preserve-3d",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: zScale,
                  opacity: zOpacity,
                }}
                transition={{
                  duration: 0.8,
                  delay: particle.id * 0.01,
                }}
              >
                {/* Pulse effect */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `1px solid ${isClose ? "rgba(76, 189, 151, 0.4)" : "rgba(17, 159, 205, 0.3)"}`,
                  }}
                  animate={{
                    scale: [1, 2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: particle.id * 0.1,
                  }}
                />
              </motion.div>
            );
          })}

          {/* Traveling signal particles */}
          {[...Array(8)].map((_, i) => {
            const pathParticle = particles[i * 7 % particles.length];
            const targetIdx = pathParticle?.connections[0];
            const targetParticle = targetIdx !== undefined ? particles[targetIdx] : null;

            if (!pathParticle || !targetParticle) return null;

            return (
              <motion.div
                key={`signal-${i}`}
                className="absolute rounded-full"
                style={{
                  left: "50%",
                  top: "50%",
                  width: "4px",
                  height: "4px",
                  background: "radial-gradient(circle, rgba(255, 209, 103, 1), rgba(255, 209, 103, 0))",
                  boxShadow: "0 0 10px rgba(255, 209, 103, 0.8)",
                  transformStyle: "preserve-3d",
                }}
                animate={{
                  x: [pathParticle.x, targetParticle.x, pathParticle.x],
                  y: [pathParticle.y, targetParticle.y, pathParticle.y],
                  z: [pathParticle.z, targetParticle.z, pathParticle.z],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 0.5,
                  ease: "linear",
                }}
              />
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
