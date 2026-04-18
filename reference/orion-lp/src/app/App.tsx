import { motion } from "motion/react";
import { ParticleNetwork3D } from "./components/ParticleNetwork3D";
import { ChaoticSystemViz } from "./components/ChaoticSystemViz";
import { SpineVisualization } from "./components/SpineVisualization";
import { SectionDivider } from "./components/SectionDivider";
import SectionCta from "../imports/SectionCta";
import SectionOrion from "../imports/SectionOrion";
import { ArrowRight, GitBranch, Zap, Shield, Database, Zap as Lightning, Building2, Search, Link2, Bot } from "lucide-react";
import logoSvg from "../imports/Plasmatic_Logo_4C_Dark_Landscape.svg";

export default function App() {
  return (
    <div className="dark min-h-screen bg-[#063b4c] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between backdrop-blur-md bg-[#063b4c]/80 border-b border-[rgba(17,159,205,0.1)]">
        <img src={logoSvg} alt="Plasmatic" className="h-9" />
        <div className="flex items-center gap-8">
          <a href="#" className="text-sm text-[#7fafc0] hover:text-white transition-colors">Product</a>
          <a href="#" className="text-sm text-[#7fafc0] hover:text-white transition-colors">Docs</a>
          <a href="#" className="text-sm text-[#7fafc0] hover:text-white transition-colors">Community</a>
          <a href="#" className="text-sm text-[#7fafc0] hover:text-white transition-colors">GitHub</a>
          <button className="px-5 py-2 bg-[#06d6a0] hover:bg-[#06d6a0]/90 text-[#063b4c] font-medium rounded-lg transition-all text-sm">
            Get started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* 3D Particle Network - Full viewport */}
        <ParticleNetwork3D />

        {/* Radial gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-[#063b4c]/70 to-[#063b4c] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-5xl space-y-8"
          >
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-block px-3 py-1 rounded-full border border-[#4cbd97]/30 bg-[#4cbd97]/10 backdrop-blur-sm"
              >
                <span className="text-xs uppercase tracking-wider text-[#4cbd97] font-mono">Introducing Orion</span>
              </motion.div>

              <h1 className="text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] text-[#ecf4f8]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                The nervous system for modern software.
              </h1>
            </div>

            <p className="text-lg text-[#7fafc0] leading-relaxed max-w-2xl">
              A runtime layer that coordinates and governs system behaviour.
              Control how your entire system responds—without touching code.
            </p>

            <div className="flex items-center gap-4 pt-4">
              <button className="px-7 py-4 bg-[#06d6a0] hover:bg-[#06d6a0]/90 text-[#063b4c] font-bold rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-[#06d6a0]/20 text-base">
                Get started
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-7 py-4 border border-[rgba(17,159,205,0.22)] hover:border-[#119fcd]/40 hover:bg-[rgba(17,159,205,0.1)] rounded-lg transition-all text-base text-[#7fafc0]">
                View documentation
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 z-10"
        >
          <span className="text-sm text-[#7fafc0]">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="w-4 h-4 rotate-90" />
          </motion.div>
        </motion.div>
      </section>

      <SectionDivider />

      {/* Problem Section */}
      <section className="py-32 px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <h2 className="text-6xl font-medium tracking-tight leading-tight text-[#ecf4f8]">
                Systems are growing faster than they can coordinate.
              </h2>

              <div className="space-y-6">
                <p className="text-xl text-[#7fafc0] leading-relaxed">
                  Every service has its own logic. Every deployment changes behaviour.
                  Every integration introduces drift.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#ef476f]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[#ef476f]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[#ecf4f8]">Behaviour is unpredictable</p>
                      <p className="text-sm text-[#7fafc0]">Logic scattered across dozens of services</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#ef476f]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[#ef476f]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[#ecf4f8]">Changes take too long</p>
                      <p className="text-sm text-[#7fafc0]">Every update requires rebuilding and redeploying</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-[#ef476f]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[#ef476f]" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[#ecf4f8]">No single source of truth</p>
                      <p className="text-sm text-[#7fafc0]">Understanding system behaviour requires reading all the code</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 pl-6 border-l-2 border-[#06d6a0]">
                <p className="text-lg text-[#ecf4f8] leading-relaxed">
                  The issue isn't building systems.<br />
                  <strong className="text-white">It's controlling how they behave.</strong>
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square flex items-center justify-center"
            >
              <div className="absolute inset-0 p-8">
                <ChaoticSystemViz />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Solution Section */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square flex items-center justify-center"
            >
              {/* Spine visualization */}
              <div className="absolute inset-0 p-8">
                <SpineVisualization />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <h2 className="text-6xl font-medium tracking-tight leading-tight text-[#ecf4f8]">
                  What's missing is a{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#119fcd] to-[#06d6a0]">
                    nervous system.
                  </span>
                </h2>

                <p className="text-xl text-[#7fafc0] leading-relaxed">
                  Orion sits between your services as a runtime coordination layer—
                  a central spine that routes signals, governs behaviour, and controls how your entire system responds.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="p-6 rounded-xl border border-[rgba(17,159,205,0.2)] bg-gradient-to-r from-[rgba(17,159,205,0.1)] to-transparent">
                  <h3 className="font-medium text-[#ecf4f8] mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#119fcd]" />
                    Signal routing
                  </h3>
                  <p className="text-[#7fafc0]">Direct events to the right handlers based on content, priority, or context</p>
                </div>

                <div className="p-6 rounded-xl border border-[rgba(6,214,160,0.2)] bg-gradient-to-r from-[rgba(6,214,160,0.1)] to-transparent">
                  <h3 className="font-medium text-[#ecf4f8] mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#06d6a0]" />
                    Instant deployment
                  </h3>
                  <p className="text-[#7fafc0]">Change behaviour across all services without rebuilding or redeploying code</p>
                </div>

                <div className="p-6 rounded-xl border border-[rgba(255,209,103,0.2)] bg-gradient-to-r from-[rgba(255,209,103,0.1)] to-transparent">
                  <h3 className="font-medium text-[#ecf4f8] mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ffd167]" />
                    Central governance
                  </h3>
                  <p className="text-[#7fafc0]">One source of truth for how your system should behave</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Capabilities Section */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20 space-y-4"
          >
            <h2 className="text-6xl font-medium tracking-tight leading-tight text-[#ecf4f8]">
              Built like a real nervous system
            </h2>
            <p className="text-xl text-[#7fafc0] max-w-3xl mx-auto">
              Signals, reflexes, memory, and protection—the same principles that coordinate biological systems
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: GitBranch,
                title: "Signals",
                subtitle: "Route and orchestrate",
                desc: "Direct events through your system based on content, context, and priority. Coordinate workflows that span multiple services.",
                color: "#119fcd"
              },
              {
                icon: Zap,
                title: "Reflexes",
                subtitle: "Instant response",
                desc: "Deploy behaviour changes that take effect immediately across all services. No code deployments, no downtime.",
                color: "#ffd167"
              },
              {
                icon: Database,
                title: "Memory",
                subtitle: "Version and audit",
                desc: "Every behaviour change is versioned and traceable. Understand what changed, when, and why.",
                color: "#4cbd97"
              },
              {
                icon: Shield,
                title: "Protection",
                subtitle: "Govern and control",
                desc: "Enforce policies, validate changes, and maintain complete visibility over how your system behaves.",
                color: "#ef476f"
              }
            ].map((capability, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-10 rounded-2xl border border-[rgba(17,159,205,0.1)] hover:border-[rgba(6,214,160,0.3)] transition-all bg-[#0f2030]"
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${capability.color}15` }}
                >
                  <capability.icon className="w-7 h-7" style={{ color: capability.color }} />
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-2xl font-medium mb-1 text-[#ecf4f8]">{capability.title}</h3>
                    <p className="text-sm text-[#7fafc0] uppercase tracking-wider">{capability.subtitle}</p>
                  </div>
                  <p className="text-[#7fafc0] leading-relaxed">{capability.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* How It Works Section */}
      <section className="py-32 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20 space-y-4"
          >
            <h2 className="text-6xl font-medium tracking-tight leading-tight text-[#ecf4f8]">
              From scattered signals to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#119fcd] to-[#06d6a0]">
                coordinated behaviour
              </span>
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-stretch mb-24">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden border border-[rgba(239,71,111,0.2)] bg-[#0f2030] p-12"
            >
              <div className="absolute inset-0 opacity-40">
                <ChaoticSystemViz />
              </div>
              <div className="relative space-y-8">
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider text-[#7fafc0] font-mono">Before Orion</div>
                  <h3 className="text-3xl font-bold text-[#ecf4f8]">Scattered signals</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#ef476f] mt-2 shrink-0" />
                    <p className="text-[#7fafc0]">Logic embedded in every service</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#ef476f] mt-2 shrink-0" />
                    <p className="text-[#7fafc0]">Changes require full deployments</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#ef476f] mt-2 shrink-0" />
                    <p className="text-[#7fafc0]">Inconsistent behaviour across system</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden border border-[rgba(6,214,160,0.3)] bg-gradient-to-br from-[#06d6a0]/10 via-[#0f2030] to-[#0f2030] p-12"
            >
              <div className="absolute inset-0 opacity-50">
                <SpineVisualization />
              </div>
              <div className="relative space-y-8">
                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-wider text-[#06d6a0] font-mono">With Orion</div>
                  <h3 className="text-3xl font-bold text-[#ecf4f8]">Coordinated behaviour</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#06d6a0] mt-2 shrink-0" />
                    <p className="text-[#ecf4f8]">Central coordination layer</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#06d6a0] mt-2 shrink-0" />
                    <p className="text-[#ecf4f8]">Instant behaviour changes</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#06d6a0] mt-2 shrink-0" />
                    <p className="text-[#ecf4f8]">Governed, predictable system</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "Define behaviour", desc: "Describe what your system should do—routing, transformation, orchestration" },
              { num: "02", title: "Deploy instantly", desc: "Changes activate across all services without rebuilding or redeploying" },
              { num: "03", title: "Observe & govern", desc: "See how signals flow, trace decisions, enforce policies" }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-[#119fcd] to-[#06d6a0] rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="relative p-8 rounded-2xl border border-[rgba(17,159,205,0.1)] hover:border-[rgba(6,214,160,0.3)] transition-all bg-[#0f2030] space-y-4">
                  <div className="text-4xl font-light text-[#7fafc0]/30">{step.num}</div>
                  <h3 className="text-xl font-medium text-[#ecf4f8]">{step.title}</h3>
                  <p className="text-[#7fafc0]">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Orion Section */}
      <SectionOrion />

      <SectionDivider />

      {/* CTA Section */}
      <SectionCta />

      {/* Footer */}
      <footer className="border-t border-[rgba(17,159,205,0.1)] py-16 px-8 bg-[#07111a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <img src={logoSvg} alt="Plasmatic" className="h-10 mb-4" />
              <p className="text-[#7fafc0] text-sm leading-relaxed">
                Building the nervous system for modern software.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-[#ecf4f8]">Product</h4>
              <ul className="space-y-2 text-sm text-[#7fafc0]">
                <li><a href="#" className="hover:text-[#ecf4f8] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#ecf4f8] transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-[#ecf4f8] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#ecf4f8] transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-[#ecf4f8]">Resources</h4>
              <ul className="space-y-2 text-sm text-[#7fafc0]">
                <li><a href="#" className="hover:text-[#ecf4f8] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#ecf4f8] transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-[#ecf4f8] transition-colors">Examples</a></li>
                <li><a href="#" className="hover:text-[#ecf4f8] transition-colors">Community</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-4 text-[#ecf4f8]">Company</h4>
              <ul className="space-y-2 text-sm text-[#7fafc0]">
                <li><a href="#" className="hover:text-[#ecf4f8] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#ecf4f8] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#ecf4f8] transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-[#ecf4f8] transition-colors">GitHub</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[rgba(17,159,205,0.1)] flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#7fafc0]">
            <p>© 2026 Plasmatic. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-[#ecf4f8] transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-[#ecf4f8] transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}