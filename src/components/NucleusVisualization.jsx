import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Particle from './Particle';
import './NucleusVisualization.css';

const NucleusVisualization = ({ isotopeType, setIsotopeType, onAddNeutron, showFission }) => {
  const [incomingNeutron, setIncomingNeutron] = useState(false);

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

  // Generate particle positions in a clustered formation
  const generateParticles = () => {
    const particles = [];
    const totalParticles = config.protons + config.neutrons;
    const layers = Math.ceil(Math.sqrt(totalParticles / 3));
    
    let protonCount = 0;
    let neutronCount = 0;

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
        
        // Alternate between protons and neutrons
        const isProton = protonCount < config.protons;
        
        particles.push({
          id: particles.length,
          type: isProton ? 'proton' : 'neutron',
          x,
          y,
          layer
        });

        if (isProton) protonCount++;
        else neutronCount++;
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
        <svg className="nucleus-svg" viewBox="-400 -400 800 800">
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

          {/* Fission Animation */}
          <AnimatePresence>
            {showFission && (
              <>
                {/* Fragment 1 */}
                <motion.g
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ 
                    x: -200, 
                    y: -150,
                    rotate: 360,
                    opacity: [1, 1, 0]
                  }}
                  transition={{ duration: 3, ease: "easeOut" }}
                >
                  {particles.slice(0, Math.floor(particles.length / 2)).map(p => (
                    <motion.circle
                      key={`frag1-${p.id}`}
                      cx={p.x * 0.5}
                      cy={p.y * 0.5}
                      r="10"
                      fill={p.type === 'proton' ? '#ef4444' : '#fbbf24'}
                      filter="url(#glow)"
                    />
                  ))}
                </motion.g>

                {/* Fragment 2 */}
                <motion.g
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{ 
                    x: 200, 
                    y: 150,
                    rotate: -360,
                    opacity: [1, 1, 0]
                  }}
                  transition={{ duration: 3, ease: "easeOut" }}
                >
                  {particles.slice(Math.floor(particles.length / 2)).map(p => (
                    <motion.circle
                      key={`frag2-${p.id}`}
                      cx={p.x * 0.5}
                      cy={p.y * 0.5}
                      r="10"
                      fill={p.type === 'proton' ? '#ef4444' : '#fbbf24'}
                      filter="url(#glow)"
                    />
                  ))}
                </motion.g>

                {/* Energy Burst */}
                <motion.circle
                  cx="0"
                  cy="0"
                  r="50"
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="4"
                  initial={{ r: 0, opacity: 1 }}
                  animate={{ 
                    r: 300,
                    opacity: 0
                  }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </>
            )}
          </AnimatePresence>
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
