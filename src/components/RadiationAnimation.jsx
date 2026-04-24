import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RadiationAnimation.css';

const RADIATIONS = [
  { id: 'alpha', name: 'Alpha', top: '25%' },
  { id: 'beta', name: 'Beta', top: '50%' },
  { id: 'gamma', name: 'Gamma', top: '75%' }
];

const SHIELDS = [
  { id: 'paper', name: 'Sheet of Paper', color: '#f1f5f9' },
  { id: 'plastic', name: 'Acrylic / Plastic', color: '#bae6fd' },
  { id: 'lead', name: 'Thick Lead / Concrete', color: '#64748b' }
];

const ParticleEmitter = ({ type, typeInfo, activeShield, onHit }) => {
  const [particles, setParticles] = useState([]);
  const particleIdRef = useRef(0);

  // Math helper for random sampling
  const sampleDepth = (shield) => {
    if (!shield) return 100; // Goes all the way
    
    // Shield spans from 50% to 80% (30% width)
    const start = 50;
    const width = 30;
    
    // Random exponential
    const expo = (mean) => -mean * Math.log(1 - Math.random());
    // Random gaussian (Box-Muller)
    const gaussian = (mean, stdDev) => {
      const u = 1 - Math.random();
      const v = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      return z * stdDev + mean;
    };

    if (type === 'alpha') {
      if (shield === 'paper') return start + expo(0.05 * width);
      if (shield === 'plastic' || shield === 'lead') return start + expo(0.02 * width);
    }
    if (type === 'beta') {
      if (shield === 'paper') return 100;
      if (shield === 'plastic') {
        // Gaussian centered mid-plastic
        let val = gaussian(start + 0.5 * width, 0.15 * width);
        return Math.max(start, Math.min(start + width - 1, val));
      }
      if (shield === 'lead') return start + expo(0.05 * width);
    }
    if (type === 'gamma') {
      if (shield === 'paper' || shield === 'plastic') return 100;
      if (shield === 'lead') {
        const penetration = expo(0.4 * width);
        return penetration > width ? 100 : start + penetration;
      }
    }
    return 100;
  };

  // Generate particles periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const targetDepth = sampleDepth(activeShield);
      const newParticle = { 
        id: particleIdRef.current++,
        timestamp: Date.now(),
        targetDepth,
        blocked: targetDepth < 100
      };
      setParticles(prev => [...prev, newParticle]);
    }, type === 'alpha' ? 800 : type === 'beta' ? 500 : 400);

    return () => clearInterval(interval);
  }, [type, activeShield]);

  const getParticleDuration = () => {
    if (type === 'alpha') return 3;
    if (type === 'beta') return 1.5;
    return 1;
  };

  return (
    <div className={`radiation-track ${type}-track`} style={{ top: typeInfo.top }}>
      <div className="track-label">{typeInfo.name}</div>
      <div className="stream-container">
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className={`particle particle-${type}`}
              initial={{ left: '0%' }}
              animate={{ left: `${particle.targetDepth}%` }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: getParticleDuration() * (particle.targetDepth / 100),
                ease: "linear"
              }}
              onAnimationComplete={() => {
                if (particle.blocked && onHit) {
                  // Register a hit to the global heatmap
                  onHit(type, particle.targetDepth, typeInfo.top);
                }
                setParticles(prev => prev.filter(p => p.id !== particle.id));
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const RadiationAnimation = ({ onComplete }) => {
  const [activeShield, setActiveShield] = useState(null);
  const [heatmapDots, setHeatmapDots] = useState([]);
  const dropZoneRef = useRef(null);

  // Clear heatmap when shield changes
  useEffect(() => {
    setHeatmapDots([]);
  }, [activeShield]);

  const handleHit = (type, x, topStr) => {
    // Add jitter to y position based on track top
    const baseTop = parseFloat(topStr);
    const yJitter = (Math.random() - 0.5) * 15; // +/- 7.5% jitter
    setHeatmapDots(prev => [...prev.slice(-300), { // Keep max 300 dots
      id: Math.random(),
      type,
      x,
      y: baseTop + yJitter
    }]);
  };

  const handleDragEnd = (event, info, shieldId) => {
    if (!dropZoneRef.current) return;
    const dropZoneRect = dropZoneRef.current.getBoundingClientRect();
    
    if (!info?.point) return;
    
    const clientX = info.point.x;
    const clientY = info.point.y;

    const isInside = (
      clientX >= dropZoneRect.left && clientX <= dropZoneRect.right &&
      clientY >= dropZoneRect.top && clientY <= dropZoneRect.bottom
    );

    if (isInside) {
      setActiveShield(shieldId);
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="radiation-animation-container">
      <div className="main-simulation-area">
        {/* Heatmap Layer */}
        {activeShield && (
          <div className="heatmap-layer">
            {heatmapDots.map(dot => (
              <div 
                key={dot.id} 
                className={`heatmap-dot hm-${dot.type}`}
                style={{ 
                  left: `${dot.x}%`, 
                  top: `calc(${dot.y}% - 10px)` // align roughly with track
                }} 
              />
            ))}
          </div>
        )}

        {/* Source */}
        <div className="source-emitter">
          <div className="source-core"></div>
          <div className="source-glow"></div>
          <div className="source-label">Radioactive Source</div>
        </div>

        {/* Tracks */}
        <div className="radiation-tracks">
          {RADIATIONS.map(rad => (
            <ParticleEmitter 
              key={rad.id} 
              type={rad.id} 
              typeInfo={rad} 
              activeShield={activeShield} 
              onHit={handleHit}
            />
          ))}
        </div>

        {/* Drop Zone / Active Shield */}
        <div className="shield-drop-zone" ref={dropZoneRef}>
          {activeShield ? (
            <div className={`active-shield shield-${activeShield}`}>
              <div className="shield-glass">{SHIELDS.find(s => s.id === activeShield)?.name || 'Shield'}</div>
              <button className="remove-shield-btn" onClick={(e) => { e.stopPropagation(); setActiveShield(null); }}>×</button>
            </div>
          ) : (
            <div className="drop-zone-placeholder">Drag & Drop Shield Here</div>
          )}
        </div>
      </div>

      <div className="shield-inventory">
        <h4>Shielding Materials (Drag or Click)</h4>
        <div className="shield-options">
          {SHIELDS.map(shield => (
            <motion.div
              key={shield.id}
              className={`shield-drag-item drag-${shield.id}`}
              drag
              dragSnapToOrigin
              onDragEnd={(e, info) => handleDragEnd(e, info, shield.id)}
              onClick={() => { setActiveShield(shield.id); if (onComplete) onComplete(); }}
              whileDrag={{ scale: 1.1, zIndex: 10, cursor: 'grabbing' }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="shield-icon" style={{ backgroundColor: shield.color, width: '40px' }} />
              {shield.name}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RadiationAnimation;