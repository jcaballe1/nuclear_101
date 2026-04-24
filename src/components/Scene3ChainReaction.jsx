import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChainReactionAnimation from './ChainReactionAnimation';
import Scene3TextPanel from './Scene3TextPanel';
import './Scene3ChainReaction.css';

// Temperature Gauge (right-column dashboard widget) 
const TempGauge = ({ temperature }) => {
  const clamp  = Math.max(0, Math.min(100, temperature));
  const zone   = clamp < 33 ? 'subcritical' : clamp < 66 ? 'critical' : 'supercritical';
  const colour = { subcritical: '#3b82f6', critical: '#10b981', supercritical: '#dc2626' }[zone];
  const label  = { subcritical: '↓ SUBCRITICAL', critical: '✓ CRITICAL', supercritical: '⚠ SUPERCRITICAL' }[zone];
  const hint   = {
    subcritical:   'Reaction dying out. Rods absorbing neutrons.',
    critical:      'Balanced! Each neutron triggers exactly one more fission.',
    supercritical: 'RUNAWAY. Lower the rods immediately!',
  }[zone];

  return (
    <div className="tg-wrap">
      <div className="tg-header">
        <span className="tg-title">Core Temperature</span>
        <span className="tg-pct" style={{ color: colour }}>{Math.round(clamp)}%</span>
      </div>

      {/* Segmented horizontal bar */}
      <div className="tg-track">
        <motion.div
          className="tg-fill"
          animate={{ width: `${clamp}%`, backgroundColor: colour }}
          transition={{ duration: 0.35 }}
        />
        {/* Zone dividers */}
        <div className="tg-divider" style={{ left: '33%' }} />
        <div className="tg-divider" style={{ left: '66%' }} />
      </div>

      {/* Zone labels below track */}
      <div className="tg-zone-row">
        <span className="tg-zone-lbl tg-sub"  style={{ left: '0%'  }}>Sub-<br/>critical</span>
        <span className="tg-zone-lbl tg-crit" style={{ left: '33%' }}>Critical</span>
        <span className="tg-zone-lbl tg-sup"  style={{ left: '66%' }}>Super-<br/>critical</span>
      </div>

      <div className={`tg-badge tg-badge-${zone}`}>{label}</div>
      <p className="tg-hint">{hint}</p>
    </div>
  );
};

// Scene 3 
const Scene3ChainReaction = ({ onComplete }) => {
  const [reactionStarted,   setReactionStarted]   = useState(false);
  const [controlRodPosition, setControlRodPosition] = useState(0); // 0=raised, 100=lowered
  const [temperature, setTemperature] = useState(0);

  const meltdown = temperature > 85;
  const isStable  = reactionStarted && temperature < 66 && temperature > 2;

  const handleStartReaction = () => {
    setReactionStarted(true);
    setTemperature(3);
    if (onComplete) onComplete();
  };

  const handleReset = () => {
    setReactionStarted(false);
    setTemperature(0);
    setControlRodPosition(0);
  };

  return (
    <div className="s3-root">

      {/* 3-column main layout */}
      <div className="s3-main">

        {/* LEFT — educational text panel (25%) */}
        <div className="s3-left">
          <Scene3TextPanel
            reactionStarted={reactionStarted}
            controlRodPosition={controlRodPosition}
            temperature={temperature}
          />
        </div>

        {/* CENTRE — interactive reactor canvas (50%) */}
        <div className={`s3-center${meltdown ? ' meltdown' : ''}`}>
          <ChainReactionAnimation
            reactionStarted={reactionStarted}
            controlRodPosition={controlRodPosition}
            onTemperatureChange={setTemperature}
            temperature={temperature}
          />
          <AnimatePresence>
            {meltdown && (
              <motion.div
                className="s3-meltdown-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="s3-meltdown-line1">⚠ WARNING: SUPERCRITICAL</span>
                <span className="s3-meltdown-line2">LOWER RODS IMMEDIATELY!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT — dashboard controls (25%) */}
        <div className="s3-right">

          {/* Reactor status chip */}
          <div className={`s3-status-chip ${meltdown ? 's3-chip-meltdown' : isStable ? 's3-chip-stable' : 's3-chip-idle'}`}>
            {meltdown
              ? '⚠ MELTDOWN WARNING'
              : isStable
              ? '✓ STATUS: STABLE'
              : reactionStarted
              ? '⬤ REACTION ACTIVE'
              : '○ AWAITING START'}
          </div>

          <TempGauge temperature={temperature} />

          {/* Control rods */}
          <div className="s3-ctrl-box">
            <div className="s3-ctrl-header">
              <span className="s3-ctrl-label">Control Rods</span>
              <span className={`s3-rod-badge s3-rod-${controlRodPosition < 33 ? 'up' : controlRodPosition < 66 ? 'mid' : 'down'}`}>
                {controlRodPosition < 33 ? 'Raised' : controlRodPosition < 66 ? 'Partial' : 'Lowered'}
              </span>
            </div>
            <input
              type="range"
              min="0" max="100"
              value={controlRodPosition}
              onChange={e => setControlRodPosition(parseInt(e.target.value))}
              className="s3-slider"
            />
            <div className="s3-slider-labels">
              <span>Raise</span>
              <span>Lower</span>
            </div>
            <p className="s3-rod-hint">
              Drag right to lower rods. They absorb neutrons and cool the reaction.
            </p>
          </div>

          {/* Action button */}
          <div className="s3-action">
            {!reactionStarted ? (
              <motion.button
                className="s3-btn-start"
                onClick={handleStartReaction}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              >
                Start Reaction
              </motion.button>
            ) : (
              <motion.button
                className="s3-btn-reset"
                onClick={handleReset}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              >
                Reset Reactor
              </motion.button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Scene3ChainReaction;
