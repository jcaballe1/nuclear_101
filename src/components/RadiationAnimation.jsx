import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RadiationAnimation.css';

const RADIATIONS = [
  { id: 'alpha', name: 'Alpha', top: '25%' },
  { id: 'beta', name: 'Beta', top: '50%' },
  { id: 'gamma', name: 'Gamma', top: '75%' }
];

const SHIELDS = [
  { id: 'paper', name: 'Sheet of Paper', color: '#f1f5f9', width: 20 },
  { id: 'plastic', name: 'Acrylic / Plastic', color: '#bae6fd', width: 40 },
  { id: 'lead', name: 'Thick Lead / Concrete', color: '#64748b', width: 80 }
];

const ParticleEmitter = ({ type, typeInfo, activeShield }) => {
  const [particles, setParticles] = useState([]);
  const [hits, setHits] = useState([]);
  const particleIdRef = useRef(0);

  // Determine if it passes
  const getsBlockedBy = (shield) => {
    if (!shield) return false;
    if (type === 'alpha' && ['paper', 'plastic', 'lead'].includes(shield)) return true;
    if (type === 'beta' && ['plastic', 'lead'].includes(shield)) return true;
    if (type === 'gamma' && shield === 'lead') return true;
    return false;
  };

  const isBlocked = getsBlockedBy(activeShield);
  const stopPoint = isBlocked ? 50 : 100; // Stop at 50% if blocked, otherwise go to 100%

  // Generate particles periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const newParticle = { 
        id: particleIdRef.current++,
        timestamp: Date.now()
      };
      setParticles(prev => [...prev, newParticle]);
    }, type === 'alpha' ? 1200 : type === 'beta' ? 800 : 600);

    return () => clearInterval(interval);
  }, [type]);

  // Generate hit effects when blocked
  useEffect(() => {
    if (!isBlocked) {
      setHits([]); // Clear hits when not blocked
      return;
    }
    const interval = setInterval(() => {
      const newHit = { id: Date.now() + Math.random() };
      setHits(prev => [...prev.slice(-2), newHit]);
    }, 800 + Math.random() * 600);

    return () => clearInterval(interval);
  }, [isBlocked]);

  // Clean up old particles
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setParticles(prev => prev.filter(p => now - p.timestamp < 5000));
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  const getParticleDuration = () => {
    if (type === 'alpha') return 4;
    if (type === 'beta') return 2;
    return 1.2;
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
              animate={{ left: `${stopPoint}%` }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: getParticleDuration() * (stopPoint / 100),
                ease: "linear"
              }}
              onAnimationComplete={() => {
                setParticles(prev => prev.filter(p => p.id !== particle.id));
              }}
            />
          ))}
        </AnimatePresence>
        
        <AnimatePresence>
          {hits.map((hit) => (
            <motion.div
              key={hit.id}
              className={`hit-effect hit-${type}`}
              initial={{ opacity: 1, scale: 0.3 }}
              animate={{ opacity: 0, scale: 2.5 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const RadiationAnimation = ({ onComplete }) => {
  const [activeShield, setActiveShield] = useState(null);
  const [hoveredLead, setHoveredLead] = useState(false);
  const dropZoneRef = useRef(null);

  const handleDragEnd = (event, info, shieldId) => {
    if (!dropZoneRef.current) return;
    const dropZoneRect = dropZoneRef.current.getBoundingClientRect();
    
    // Get drag position from info.point
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
            />
          ))}
        </div>

        {/* Drop Zone / Active Shield */}
        <div className="shield-drop-zone" ref={dropZoneRef}>
          {activeShield ? (
            <div 
              className={`active-shield shield-${activeShield}`}
              onMouseEnter={() => activeShield === 'lead' && setHoveredLead(true)}
              onMouseLeave={() => setHoveredLead(false)}
            >
              <div className="shield-glass">{SHIELDS.find(s => s.id === activeShield)?.name || 'Shield'}</div>
              
              {/* Magnifying Glass Effect for Lead */}
              <AnimatePresence>
                {activeShield === 'lead' && hoveredLead && (
                  <motion.div 
                    className="magnifying-glass"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="mag-content">
                      <p>Microscopic View</p>
                      <div className="mag-atoms">
                        {[1,2,3,4,5,6,7,8,9].map(i => (
                           <motion.div 
                             key={i} 
                             className="mag-atom"
                             animate={{ x: [-1, 1, -1], y: [1, -1, 1] }}
                             transition={{ repeat: Infinity, duration: 0.1 + Math.random()*0.1 }}
                           />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
              onClick={() => setActiveShield(shield.id)}
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