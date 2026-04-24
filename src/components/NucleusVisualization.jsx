import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particle from './Particle';
import './NucleusVisualization.css';

// ── MiniFissionBurst ──────────────────────────────────────────────────────
// Self-contained 1.4 s fission burst rendered as SVG children.
// Manages its own mounting lifetime so the animation always plays to
// completion regardless of the parent modal's open/closed state.
// Mount a new instance via a changing `key` to replay the animation.
const MiniFissionBurst = ({ particles }) => {
  const [alive, setAlive] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setAlive(false), 1400);
    return () => clearTimeout(t);
  }, []);

  if (!alive) return null;

  const half = Math.floor(particles.length / 2);

  return (
    <>
      {/* Expanding shockwave ring */}
      <motion.circle
        cx="0" cy="0"
        fill="none" stroke="#fbbf24" strokeWidth="6"
        initial={{ r: 0, opacity: 1 }}
        animate={{ r: 260, opacity: 0 }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      />
      {/* Inner orange glow ring */}
      <motion.circle
        cx="0" cy="0"
        fill="none" stroke="#f97316" strokeWidth="12"
        initial={{ r: 0, opacity: 0.85 }}
        animate={{ r: 140, opacity: 0 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
      />
      {/* Fragment 1 — upper-left */}
      <motion.g
        initial={{ x: 0, y: 0, opacity: 1 }}
        animate={{ x: -170, y: -130, opacity: 0 }}
        transition={{ duration: 1.3, ease: 'easeOut' }}
      >
        {particles.slice(0, half).map(p => (
          <circle
            key={`mf1-${p.id}`}
            cx={p.x * 0.5} cy={p.y * 0.5} r="8"
            fill={p.type === 'proton' ? '#ef4444' : '#fbbf24'}
            filter="url(#glow)"
          />
        ))}
      </motion.g>
      {/* Fragment 2 — lower-right */}
      <motion.g
        initial={{ x: 0, y: 0, opacity: 1 }}
        animate={{ x: 170, y: 130, opacity: 0 }}
        transition={{ duration: 1.3, ease: 'easeOut' }}
      >
        {particles.slice(half).map(p => (
          <circle
            key={`mf2-${p.id}`}
            cx={p.x * 0.5} cy={p.y * 0.5} r="8"
            fill={p.type === 'proton' ? '#ef4444' : '#fbbf24'}
            filter="url(#glow)"
          />
        ))}
      </motion.g>
    </>
  );
};

const NucleusVisualization = ({ isotopeType, setIsotopeType, onAddNeutron, showFission }) => {
  const [incomingNeutron, setIncomingNeutron] = useState(false);
  // Increments each time showFission transitions to true so MiniFissionBurst
  // gets a new key and replays from scratch on every Add Neutron click.
  const [burstId, setBurstId] = useState(0);
  useEffect(() => {
    if (showFission) setBurstId(id => id + 1);
  }, [showFission]);

  const isotopes = {
    stable: {
      name: 'Carbon-12',
      protons: 6,
      neutrons: 6,
      vibration: 1,
      size: 1,
      color: '#3b82f6'
    },
    unstable: {
      name: 'Uranium-235',
      protons: 92,
      neutrons: 143,
      vibration: 3,
      size: 1.8,
      color: '#a855f7'
    }
  };

  const config = isotopes[isotopeType];

  const handleAddNeutronClick = () => {
    if (isotopeType === 'unstable') {
      setIncomingNeutron(true);
      setTimeout(() => {
        setIncomingNeutron(false);
        onAddNeutron();
      }, 1000);
    }
  };

  // Mulberry32 — small, deterministic PRNG so the shuffle is stable across renders
  const mulberry32 = (seed) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // Fisher–Yates with a seeded RNG → same shuffle every render for a given isotope
  const seededShuffle = (arr, seed) => {
    const rng = mulberry32(seed);
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  // Generate particle positions in a clustered formation
  const generateParticles = () => {
    const particles = [];
    const totalParticles = config.protons + config.neutrons;
    const layers = Math.ceil(Math.sqrt(totalParticles / 3));

    // Build a flat type pool (P protons + N neutrons) and shuffle deterministically.
    // Seed is derived from the isotope composition so each isotope keeps its own
    // stable mix, but protons/neutrons are spatially interleaved rather than layered.
    const typePool = [
      ...Array(config.protons).fill('proton'),
      ...Array(config.neutrons).fill('neutron'),
    ];
    const seed = config.protons * 1000 + config.neutrons;
    const shuffledTypes = seededShuffle(typePool, seed);

    for (let layer = 0; layer < layers; layer++) {
      const particlesInLayer = Math.min(
        Math.floor((layer + 1) * 6),
        totalParticles - particles.length
      );
      const radius = (layer + 1) * 25 * config.size;

      for (let i = 0; i < particlesInLayer; i++) {
        if (particles.length >= totalParticles) break;

        const angle = (i / particlesInLayer) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        particles.push({
          id: particles.length,
          type: shuffledTypes[particles.length],
          x,
          y,
          layer,
        });
      }
    }

    return particles;
  };

  const particles = generateParticles();

  // Generate repulsion arrows for protons
  const generateRepulsionArrows = () => {
    const arrows = [];
    const protons = particles.filter(p => p.type === 'proton');
    
    // Show fewer arrows for unstable isotope to reduce clutter
    const step = isotopeType === 'unstable' ? 8 : 2;
    
    for (let i = 0; i < protons.length; i += step) {
      for (let j = i + step; j < protons.length; j += step) {
        const p1 = protons[i];
        const p2 = protons[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100 * config.size) {
          arrows.push({
            id: `${i}-${j}`,
            x1: p1.x,
            y1: p1.y,
            x2: p2.x,
            y2: p2.y
          });
        }
      }
    }
    
    return arrows;
  };

  const repulsionArrows = generateRepulsionArrows();

  return (
    <motion.div 
      className="visualization-panel"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="controls">
        <div className="toggle-container">
          <button
            className={`toggle-btn ${isotopeType === 'stable' ? 'active' : ''}`}
            onClick={() => setIsotopeType('stable')}
          >
            Stable Isotope
            <span className="label">C-12</span>
          </button>
          <button
            className={`toggle-btn ${isotopeType === 'unstable' ? 'active' : ''}`}
            onClick={() => setIsotopeType('unstable')}
          >
            Unstable Isotope
            <span className="label">U-235</span>
          </button>
        </div>

        <AnimatePresence>
          {isotopeType === 'unstable' && (
            <motion.button
              className="add-neutron-btn"
              onClick={handleAddNeutronClick}
              disabled={showFission || incomingNeutron}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="btn-icon">+</span>
              Add Neutron
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Legend Bar — sits outside the SVG canvas */}
      <div className="viz-legend-bar">
        <div className="viz-legend-item">
          <span className="viz-legend-dot" style={{ background: '#ef4444' }} />
          <span>Proton</span>
        </div>
        <div className="viz-legend-item">
          <span className="viz-legend-dot" style={{ background: '#fbbf24' }} />
          <span>Neutron</span>
        </div>
        <div className="viz-legend-item">
          <span className="viz-legend-glow" style={{ background: '#60a5fa' }} />
          <span>Strong Nuclear Force</span>
        </div>
        <div className="viz-legend-item">
          <span className="viz-legend-dash" />
          <span>Electrostatic Repulsion</span>
        </div>
      </div>

      <div className="visualization-container">
        <svg className="nucleus-svg" viewBox="-400 -400 800 800" role="img" aria-label="Nucleus visualization">
          <title>Cluster of protons and neutrons in an atomic nucleus</title>
          {/* Strong Nuclear Force Glow */}
          <defs>
            <radialGradient id="nuclearGlow">
              <stop offset="0%" stopColor={config.color} stopOpacity="0.4" />
              <stop offset="50%" stopColor={config.color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={config.color} stopOpacity="0" />
            </radialGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Nuclear Force Aura */}
          <motion.circle
            cx="0"
            cy="0"
            r={150 * config.size}
            fill="url(#nuclearGlow)"
            animate={{
              r: [150 * config.size, 160 * config.size, 150 * config.size],
              opacity: [0.6, 0.8, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Repulsion Arrows */}
          <AnimatePresence>
            {!showFission && repulsionArrows.map(arrow => (
              <motion.g key={arrow.id}>
                <motion.line
                  x1={arrow.x1}
                  y1={arrow.y1}
                  x2={arrow.x2}
                  y2={arrow.y2}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.6"
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: [0.5, 1, 0.5],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                {/* Arrow head */}
                <motion.polygon
                  points={`${arrow.x2},${arrow.y2} ${arrow.x2-5},${arrow.y2-5} ${arrow.x2-5},${arrow.y2+5}`}
                  fill="#ef4444"
                  opacity="0.6"
                  animate={{
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.g>
            ))}
          </AnimatePresence>

          {/* Particles */}
          <AnimatePresence>
            {!showFission && particles.map(particle => (
              <Particle
                key={particle.id}
                {...particle}
                vibration={config.vibration}
                showFission={showFission}
              />
            ))}
          </AnimatePresence>

          {/* Incoming Neutron */}
          <AnimatePresence>
            {incomingNeutron && (
              <motion.circle
                cx="0"
                cy="0"
                r="12"
                fill="#fbbf24"
                filter="url(#glow)"
                initial={{ x: 400, y: -200, scale: 0 }}
                animate={{ 
                  x: 0, 
                  y: 0, 
                  scale: [0, 1.2, 1],
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 1, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>

          {/* Fission Burst — key changes on each trigger, always runs 1.4 s to completion */}
          {burstId > 0 && <MiniFissionBurst key={burstId} particles={particles} />}
        </svg>

        {/* Stats Display */}
        <div className="stats-display">
          <div className="stat-item">
            <span className="stat-label">Protons:</span>
            <span className="stat-value proton-color">{config.protons}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Neutrons:</span>
            <span className="stat-value neutron-color">{config.neutrons}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Vibration:</span>
            <span className="stat-value">{isotopeType === 'stable' ? 'Low' : 'High'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NucleusVisualization;
