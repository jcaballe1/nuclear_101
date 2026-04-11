import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FissionAnimation.css';

const FissionAnimation = ({ fissionStarted }) => {
  const generateNucleusParticles = (count, offset = { x: 0, y: 0 }) => {
    const particles = [];
    const layers = Math.ceil(Math.sqrt(count / 3));
    for (let layer = 0; layer < layers; layer++) {
      const particlesInLayer = Math.min(Math.floor((layer + 1) * 6), count - particles.length);
      const radius = (layer + 1) * 12;
      for (let i = 0; i < particlesInLayer; i++) {
        if (particles.length >= count) break;
        const angle = (i / particlesInLayer) * Math.PI * 2;
        particles.push({
          x: Math.cos(angle) * radius + offset.x,
          y: Math.sin(angle) * radius + offset.y,
        });
      }
    }
    return particles;
  };

  // U-235 initial particles (coloured alternately proton/neutron)
  const u235Particles = generateNucleusParticles(60);
  // Asymmetric fragments: Kr-92 (smaller) and Ba-141 (larger)
  const krParticles  = generateNucleusParticles(28);
  const baParticles  = generateNucleusParticles(48);

  return (
    <div className="fission-animation-container">
      <svg className="fission-svg" viewBox="-400 -260 800 520">
        <defs>
          <radialGradient id="energyGlow">
            <stop offset="0%"   stopColor="#fbbf24" stopOpacity="0.85" />
            <stop offset="50%"  stopColor="#f97316" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="shockGlow">
            <stop offset="0%"   stopColor="#fde68a" stopOpacity="0.9" />
            <stop offset="60%"  stopColor="#f97316" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <filter id="particleGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="7" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="heatGlow">
            <feGaussianBlur stdDeviation="10" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <AnimatePresence>
          {!fissionStarted ? (
            /* ── IDLE: U-235 nucleus ─────────────────────────────────── */
            <motion.g key="idle" exit={{ opacity: 0, transition: { duration: 0.3 } }}>
              <circle cx="0" cy="0" r="110" fill="url(#energyGlow)" opacity="0.25" />
              {u235Particles.map((p, i) => (
                <motion.circle
                  key={i}
                  cx={p.x} cy={p.y} r="7"
                  fill={i % 2 === 0 ? '#a855f7' : '#fbbf24'}
                  stroke={i % 2 === 0 ? '#e9d5ff' : '#fef3c7'}
                  strokeWidth="1"
                  filter="url(#particleGlow)"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.8 + (i % 5) * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}
              <text x="0" y="135" textAnchor="middle" fill="#a855f7" fontSize="15" fontWeight="700">⁹²U²³⁵</text>
              <text x="0" y="-145" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="600">
                Waiting for neutron…
              </text>
            </motion.g>
          ) : (
            <motion.g key="fission">

              {/* ── STAGE 1: Incoming neutron (0 → 0.7 s) ─────────────── */}
              <motion.g
                initial={{ x: 340, y: -140 }}
                animate={{ x: 0,   y: 0 }}
                transition={{ duration: 0.7, ease: 'easeIn' }}
              >
                <motion.circle cx="0" cy="0" r="10" fill="#fbbf24" filter="url(#strongGlow)"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 0.25, repeat: 3 }}
                />
                <text x="16" y="4" fill="#fde68a" fontSize="12" fontWeight="700">n⁰</text>
              </motion.g>

              {/* ── STAGE 2: Compound U-236 vibrating dumbbell (0.8 → 2.2 s) ─ */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.4, times: [0, 0.08, 0.92, 1], delay: 0.8 }}
              >
                {/* Dumbbell outer glow */}
                <motion.ellipse cx="0" cy="0"
                  fill="url(#energyGlow)" opacity="0.35"
                  animate={{
                    rx: [90, 95, 140, 165, 175],
                    ry: [90, 95,  65,  42,  35],
                  }}
                  transition={{ duration: 1.4, delay: 0.8, ease: 'easeIn' }}
                />
                {/* Neck constriction — two lobes */}
                <motion.ellipse cx="0" cy="0"
                  fill="none" stroke="#c4b5fd" strokeWidth="2" opacity="0.5"
                  animate={{
                    rx: [85, 88, 130, 155, 165],
                    ry: [85, 88,  58,  38,  30],
                  }}
                  transition={{ duration: 1.4, delay: 0.8, ease: 'easeIn' }}
                />
                {/* Vibrating particles */}
                {u235Particles.map((p, i) => (
                  <motion.circle
                    key={`vib-${i}`}
                    cx={p.x} cy={p.y} r="6.5"
                    fill={i % 2 === 0 ? '#a855f7' : '#fbbf24'}
                    filter="url(#particleGlow)"
                    animate={{
                      x: [0, (i % 2 === 0 ? -1 : 1) * (8 + (i % 4) * 4), 0],
                      y: [0, (Math.sin(i) * 6), 0],
                      scale: [1, 1.25, 1],
                    }}
                    transition={{ duration: 0.18, repeat: 7, delay: 0.82 + i * 0.004 }}
                  />
                ))}
                <text x="0" y="-130" textAnchor="middle" fill="#c4b5fd" fontSize="13" fontWeight="700">
                  ⁹²U²³⁶ — stretching…
                </text>
              </motion.g>

              {/* ── STAGE 3a: Heat shockwave (1.5 s) ──────────────────── */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2 }}
              >
                {/* Outer heat ring */}
                <motion.circle cx="0" cy="0" r="0"
                  fill="url(#shockGlow)"
                  filter="url(#heatGlow)"
                  initial={{ r: 0, opacity: 0.9 }}
                  animate={{ r: 350, opacity: 0 }}
                  transition={{ duration: 1.4, delay: 2.2, ease: 'easeOut' }}
                />
                {/* Bright core ring */}
                <motion.circle cx="0" cy="0" r="0"
                  fill="none" stroke="#fde68a" strokeWidth="10"
                  initial={{ r: 0, opacity: 1 }}
                  animate={{ r: [0, 80, 280], opacity: [1, 0.9, 0], strokeWidth: [10, 8, 2] }}
                  transition={{ duration: 1.2, delay: 2.2, ease: 'easeOut' }}
                />
                {/* Secondary ring */}
                <motion.circle cx="0" cy="0" r="0"
                  fill="none" stroke="#f97316" strokeWidth="5"
                  initial={{ r: 0, opacity: 0.8 }}
                  animate={{ r: [0, 200], opacity: [0.8, 0] }}
                  transition={{ duration: 1.0, delay: 2.35, ease: 'easeOut' }}
                />
              </motion.g>

              {/* ── STAGE 3b: Kr-92 fragment (smaller, upper-left) ─────── */}
              <motion.g
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ x: -195, y: -100, opacity: [0, 1, 1] }}
                transition={{ duration: 1.6, delay: 2.25, ease: 'easeOut' }}
              >
                <motion.circle cx="0" cy="0" r="52" fill="url(#energyGlow)" opacity="0.3"
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 0.6, delay: 2.25 }}
                />
                {krParticles.map((p, i) => (
                  <circle key={`kr-${i}`} cx={p.x} cy={p.y} r="5.5"
                    fill="#38bdf8" stroke="#e0f2fe" strokeWidth="0.8"
                    filter="url(#particleGlow)"
                  />
                ))}
                <text x="0" y="72" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="700">⁹²Kr</text>
              </motion.g>

              {/* ── STAGE 3c: Ba-141 fragment (larger, lower-right) ────── */}
              <motion.g
                initial={{ x: 0, y: 0, opacity: 0 }}
                animate={{ x: 200, y: 105, opacity: [0, 1, 1] }}
                transition={{ duration: 1.6, delay: 2.25, ease: 'easeOut' }}
              >
                <motion.circle cx="0" cy="0" r="72" fill="url(#energyGlow)" opacity="0.3"
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 0.6, delay: 2.25 }}
                />
                {baParticles.map((p, i) => (
                  <circle key={`ba-${i}`} cx={p.x} cy={p.y} r="5.5"
                    fill="#f472b6" stroke="#fce7f3" strokeWidth="0.8"
                    filter="url(#particleGlow)"
                  />
                ))}
                <text x="0" y="92" textAnchor="middle" fill="#f472b6" fontSize="14" fontWeight="700">¹⁴¹Ba</text>
              </motion.g>

              {/* ── Released neutrons ──────────────────────────────────── */}
              {[
                { tx:  130, ty: -165 },
                { tx: -90,  ty:  180 },
                { tx:  210, ty:   30 },
              ].map((n, i) => (
                <motion.g key={`n-${i}`}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{ x: n.tx, y: n.ty, opacity: [0, 1, 1] }}
                  transition={{ duration: 1.3, delay: 2.3 + i * 0.12 }}
                >
                  <circle cx="0" cy="0" r="9" fill="#fbbf24" filter="url(#strongGlow)" />
                  <text x="14" y="4" fill="#fde68a" fontSize="11" fontWeight="700">n⁰</text>
                </motion.g>
              ))}

              {/* ── Ambient heat sparks ───────────────────────────────── */}
              {[...Array(18)].map((_, i) => {
                const angle = (i / 18) * Math.PI * 2;
                const dist  = 120 + (i % 5) * 30;
                return (
                  <motion.circle
                    key={`spark-${i}`}
                    cx={Math.cos(angle) * dist}
                    cy={Math.sin(angle) * dist}
                    r="3"
                    fill={i % 2 === 0 ? '#fbbf24' : '#f97316'}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.3, 0], opacity: [0, 0.8, 0] }}
                    transition={{ duration: 0.9, delay: 2.2 + i * 0.06, repeat: 2, repeatDelay: 0.3 }}
                  />
                );
              })}

            </motion.g>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
};

export default FissionAnimation;
