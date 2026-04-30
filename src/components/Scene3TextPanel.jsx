import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RealWorldOverlay from './RealWorldOverlay';
import Term from './Term';
import './Scene3TextPanel.css';

// ── Idle content: concept reference before reaction starts ────────
const IdleContent = () => (
  <>
    <div className="concept-section">
      <h3 className="concept-title">The Chain Reaction</h3>
      <p className="concept-text">
        A splitting <Term term="Uranium-235" display="U-235" /> atom releases 2–3{' '}
        <Term term="neutrons" />, triggering a self-sustaining cascade:
      </p>
      <ul className="stages-list">
        <li><strong>Initiation:</strong> One neutron splits a nucleus, freeing more neutrons.</li>
        <li><strong>Propagation:</strong> These new neutrons strike other nuclei, causing exponential growth.</li>
        <li><strong>Control:</strong> "Neutron sponge" rods are lowered to catch stray neutrons and tame the reaction.</li>
      </ul>
    </div>

    <div className="criticality-section">
      <h3 className="concept-title">Three Reactor States</h3>
      <ul className="criticality-states-compact">
        <li className="criticality-state-item">
          <span className="state-dot" style={{ background: '#3b82f6' }} />
          <span><strong>Subcritical (k&nbsp;&lt;&nbsp;1):</strong> Rods lowered. Reaction safely fades out.</span>
        </li>
        <li className="criticality-state-item">
          <span className="state-dot" style={{ background: '#10b981' }} />
          <span><strong>Critical (k&nbsp;=&nbsp;1):</strong> Rods balanced. Steady, controlled power generation.</span>
        </li>
        <li className="criticality-state-item">
          <span className="state-dot" style={{ background: '#ef4444' }} />
          <span><strong>Supercritical (k&nbsp;&gt;&nbsp;1):</strong> Rods raised. Exponential runaway heat.</span>
        </li>
      </ul>
    </div>

    <p className="s3-cta-hint">▶ Press <strong>Start Reaction</strong> to launch the simulation.</p>
  </>
);

// ── Running content: live zone guidance + k-factor explainer ──────
const ZONE_CARDS = {
  subcritical: {
    color: '#3b82f6', bg: 'rgba(59,130,246,0.06)',
    title: 'Subcritical — k < 1',
    body:  'Each neutron generation produces fewer neutrons than the last. The reaction is winding down. Raise the rods (drag left) to reduce absorption and push k back toward 1.',
    action: '← Raise rods to increase power',
  },
  critical: {
    color: '#10b981', bg: 'rgba(16,185,129,0.06)',
    title: 'Critical — k ≈ 1',
    body:  'Each fission triggers exactly one more fission on average. The chain reaction is self-sustaining and stable — this is the sweet spot for electricity generation.',
    action: 'Hold steady here for sustained power.',
  },
  supercritical: {
    color: '#dc2626', bg: 'rgba(220,38,38,0.06)',
    title: 'Supercritical — k > 1',
    body:  'Each generation produces MORE neutrons than the last. The reaction is accelerating exponentially. Lower the rods immediately to absorb excess neutrons.',
    action: '⚠ Lower rods now to prevent meltdown!',
  },
};

const RunningContent = ({ temperature }) => {
  const zone = temperature < 33 ? 'subcritical' : temperature < 66 ? 'critical' : 'supercritical';
  const card = ZONE_CARDS[zone];
  return (
    <>
      <motion.div
        key={zone}
        className="s3-zone-card"
        style={{ borderLeftColor: card.color, background: card.bg }}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h4 className="s3-zone-title" style={{ color: card.color }}>{card.title}</h4>
        <p className="s3-zone-body">{card.body}</p>
        <p className="s3-zone-action" style={{ color: card.color }}>{card.action}</p>
      </motion.div>

      <div className="s3-k-explainer">
        <h4 className="s3-k-title">What is <em>k</em>?</h4>
        <p className="s3-k-text">
          The <strong>neutron multiplication factor k</strong> is the ratio of neutrons in one
          generation to the previous one. Nuclear engineers maintain k&nbsp;=&nbsp;1.000 to within
          a few parts per thousand — even k&nbsp;=&nbsp;1.002 would double reactor power in minutes.
        </p>
        <div className="s3-k-legend">
          <span style={{ color: '#3b82f6' }}>k &lt; 1 — dying</span>
          <span style={{ color: '#10b981' }}>k = 1 — stable</span>
          <span style={{ color: '#dc2626' }}>k &gt; 1 — runaway</span>
        </div>
      </div>

      <div className="s3-color-legend">
        <h4 className="s3-color-legend-title">Neutron Generations (colour trace)</h4>
        <div className="s3-color-legend-items">
          <span><span className="s3-legend-dot" style={{ background: '#fbbf24' }} />Gen 1 (seed)</span>
          <span><span className="s3-legend-dot" style={{ background: '#fb923c' }} />Gen 2</span>
          <span><span className="s3-legend-dot" style={{ background: '#f87171' }} />Gen 3</span>
          <span><span className="s3-legend-dot" style={{ background: '#c084fc' }} />Gen 4+</span>
        </div>
      </div>
    </>
  );
};

const Scene3TextPanel = ({ reactionStarted, temperature }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const panelRef = useRef(null);

  const handleOpenOverlay = () => {
    setShowOverlay(true);
    if (panelRef.current) panelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={panelRef} className="scene3-text-panel">
      <div className="text-content">
        <h2 className="panel-title">Chain Reactions &amp; Nuclear Control</h2>
        <button className="rwv-toggle-btn" onClick={handleOpenOverlay}>Real World View</button>

        <AnimatePresence mode="wait">
          {!reactionStarted ? (
            <motion.div
              key="idle"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <IdleContent />
            </motion.div>
          ) : (
            <motion.div
              key="running"
              style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <RunningContent temperature={temperature} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <RealWorldOverlay
        isOpen={showOverlay}
        onClose={() => setShowOverlay(false)}
        imageSrc={`${import.meta.env.BASE_URL}real-world/scene3-control-rods.jpg`}
        imageLabel="Engineers inspecting a massive control rod assembly in a nuclear reactor"
        caption="Control rods can be 3–4 metres long and are made of neutron-absorbing materials such as cadmium, hafnium, or boron carbide."
      />
    </div>
  );
};

export default Scene3TextPanel;
