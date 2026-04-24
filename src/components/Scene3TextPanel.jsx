import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RealWorldOverlay from './RealWorldOverlay';
import './Scene3TextPanel.css';

const Scene3TextPanel = ({ reactionStarted, controlRodPosition, temperature }) => {
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
        <button className="rwv-toggle-btn" onClick={handleOpenOverlay}>
          Real World View
        </button>
        
            {/* Merged Intro & Stages into a compact list */}
        <div className="concept-section">
          <h3 className="concept-title">The Chain Reaction</h3>
          <p className="concept-text" style={{ marginBottom: '8px' }}>
            A splitting U-235 atom releases 2-3 neutrons, triggering a self-sustaining cascade:
          </p>
          <ul className="stages-list" style={{ paddingLeft: '20px', margin: '0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Initiation:</strong> One neutron splits a nucleus, freeing more neutrons.</li>
            <li><strong>Propagation:</strong> These new neutrons strike other nuclei, causing exponential growth.</li>
            <li><strong>Control:</strong> "Neutron sponge" rods are lowered to catch stray neutrons and tame the reaction.</li>
          </ul>
        </div>

        {/* Condensed Criticality States */}
        <div className="criticality-section" style={{ marginTop: '16px' }}>
          <h3 className="concept-title">Reactor States</h3>
          <ul className="criticality-states-compact" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="state-icon" style={{ color: '#3b82f6', fontSize: '1.2em' }}>●</span>
              <span><strong>Subcritical:</strong> Rods lowered. Reaction safely fades out.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="state-icon" style={{ color: '#10b981', fontSize: '1.2em' }}>●</span>
              <span><strong>Critical:</strong> Rods balanced. Steady, controlled power generation.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="state-icon" style={{ color: '#ef4444', fontSize: '1.2em' }}>●</span>
              <span><strong>Supercritical:</strong> Rods raised. Dangerous, exponential runaway heat.</span>
            </li>
          </ul>
        </div>

         {/* Streamlined Live Feedback */}
        <AnimatePresence>
          {reactionStarted && (
            <motion.div
              className="live-feedback"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.2)' }}
            >
              <h3 className="feedback-title" style={{ margin: '0 0 8px 0', fontSize: '1em' }}>Live Status</h3>
              <div className="feedback-items" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div className="feedback-item">
                  <strong>Rods:</strong> {controlRodPosition < 33 ? 'Raised' : controlRodPosition < 66 ? 'Partial' : 'Lowered'}
                </div>
                <div className="feedback-item">
                  <strong>Temp:</strong> <span style={{ color: temperature < 30 ? '#3b82f6' : temperature < 70 ? '#f59e0b' : '#ef4444', fontWeight: 'bold' }}>
                    {temperature < 30 ? 'Cool' : temperature < 70 ? 'Hot' : 'Critical'}
                  </span>
                </div>
              </div>
              
              {temperature > 70 && (
                <div className="safety-tip" style={{ color: '#ef4444', fontSize: '0.9em', marginTop: '4px' }}>
                  <strong>⚠ Warning:</strong> Lower rods immediately to prevent thermal runaway!
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trimmed Real-World conclusion */}
        <div className="real-world-section" style={{ marginTop: '16px' }}>
          <h3 className="concept-title">Real-World Application</h3>
          <p className="concept-text">
            Operators continuously adjust rods to maintain a steady <strong>critical state</strong>, balancing temperatures to safely boil water and power the grid.
          </p>
        </div>

        {/* Moderator / Coolant / Control Rod explainer */}
        <div className="s3-reactor-controls">
          <h3 className="concept-title">Moderator, Coolant &amp; Control Rods</h3>
          <div className="s3-rctrl-cards">
            {[
              {
                icon: '💧',
                title: 'Moderator',
                color: '#3b82f6',
                bg: 'rgba(59,130,246,0.06)',
                text: 'Slows fast neutrons to thermal (low-energy) speeds so they can efficiently trigger fission in U-235. In most reactors, ordinary light water plays this role.',
              },
              {
                icon: '🌊',
                title: 'Coolant',
                color: '#0891b2',
                bg: 'rgba(8,145,178,0.06)',
                text: 'Carries heat from the reactor core to the steam generators that drive the turbine. In a PWR, the same water acts as both coolant and moderator — a useful double duty.',
              },
              {
                icon: '⬛',
                title: 'Control Rods',
                color: '#64748b',
                bg: 'rgba(100,116,139,0.08)',
                text: 'Rods made of boron, cadmium, or hafnium that absorb neutrons. Inserting them reduces the reaction rate; withdrawing them raises power. They are the primary safety brake.',
              },
            ].map(({ icon, title, color, bg, text }) => (
              <div key={title} className="s3-rctrl-card" style={{ borderLeftColor: color, background: bg }}>
                <span className="s3-rctrl-icon" style={{ color }} aria-hidden="true">{icon}</span>
                <div>
                  <h4 className="s3-rctrl-title" style={{ color }}>{title}</h4>
                  <p className="s3-rctrl-text">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
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
