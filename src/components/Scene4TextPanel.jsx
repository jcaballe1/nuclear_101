import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RealWorldOverlay from './RealWorldOverlay';
import './Scene4TextPanel.css';

const REACTOR_BLURBS = {
  PWR: {
    title: 'PWR — Pressurised Water Reactor',
    accent: '#fb923c',
    text: 'The most common design worldwide (~70% of operating reactors). Water in the primary loop is kept at ~155 bar so it cannot boil even at 320°C; that hot water transfers heat through a steam generator to a separate, non-radioactive secondary loop. Three loops keep radioactive water inside containment.',
  },
  BWR: {
    title: 'BWR — Boiling Water Reactor',
    accent: '#60a5fa',
    text: 'Simpler architecture: water boils directly inside the reactor pressure vessel and the steam goes straight to the turbine — no steam generator, no separate primary loop. Fewer components and slightly higher thermal efficiency, but the turbine sees mildly radioactive steam, so the turbine hall must be shielded.',
  },
  SMR: {
    title: 'SMR — Small Modular Reactor',
    accent: '#22d3ee',
    text: 'A new generation of compact reactors (typically 50–300 MWe) where the reactor, steam generator and pressuriser are integrated into one factory-built pressure vessel. Designed for passive safety, shorter construction times and siting flexibility — including replacement of retiring coal plants.',
  },
};

const Scene4TextPanel = ({ animationStarted, reactorType = 'PWR' }) => {
  const [activeOverlay, setActiveOverlay] = useState(null);
  const panelRef = useRef(null);

  const openOverlay = (type) => {
    setActiveOverlay(type);
    if (panelRef.current) panelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={panelRef} className="scene4-text-panel">
      <div className="text-content">
        <h2 className="panel-title">The Reactor Represented</h2>
        <div className="rwv-btn-row">
          <button className="rwv-toggle-btn rwv-sm" onClick={() => openOverlay('core')}>📸 Core</button>
          <button className="rwv-toggle-btn rwv-sm" onClick={() => openOverlay('turbine')}>📸 Turbine</button>
          <button className="rwv-toggle-btn rwv-sm" onClick={() => openOverlay('generator')}>📸 Generator</button>
        </div>
        
        <div className="intro-section">
          <p className="intro-text">
            Despite the complex quantum physics, a nuclear power plant has a simple goal: boiling water. We replace the coal fire with fission heat.
          </p>
        </div>

        {/* Reactor-type blurb — changes with the tab strip above the SVG */}
        <AnimatePresence mode="wait">
          <motion.div
            key={reactorType}
            className="s4-type-blurb"
            style={{ borderLeftColor: REACTOR_BLURBS[reactorType].accent }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <h3 className="s4-type-title" style={{ color: REACTOR_BLURBS[reactorType].accent }}>
              {REACTOR_BLURBS[reactorType].title}
            </h3>
            <p className="s4-type-text">{REACTOR_BLURBS[reactorType].text}</p>
          </motion.div>
        </AnimatePresence>

        {/* Why SMRs matter for Just Transition — only for SMR tab */}
        <AnimatePresence>
          {reactorType === 'SMR' && (
            <motion.div
              className="s4-jt-callout"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="s4-jt-header">
                <span className="s4-jt-icon" aria-hidden="true">⚑</span>
                <h4 className="s4-jt-title">Why SMRs matter for Just Transition</h4>
              </div>
              <p className="s4-jt-text">
                Coal plants leaving the grid take with them <strong>jobs, grid connections, district-heat infrastructure and tax revenue</strong>. SMRs can re-use that same site footprint and connection point, retain the technical workforce, and provide firm low-carbon power to bridge the variability of wind and solar — without requiring a multi-decade megaproject.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="stages">
          <motion.div 
            className="stage"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
          
          <ol style={{ listStyle: 'decimal', paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><strong>Heat generation (primary loop):</strong> The uranium core heats pressurised water to over 300&nbsp;°C. A <em>pressuriser</em> keeps it above 150&nbsp;bar so it cannot boil. A primary pump circulates it through the reactor.</li>
            <li><strong>Steam generator (heat exchanger):</strong> The hot primary water flows through tubes inside the <em>steam generator</em>, where its heat boils a separate, non-radioactive water supply on the secondary side into high-pressure steam.</li>
            <li><strong>The turbine:</strong> That steam blasts through the <em>turbine</em>, spinning massive blades that drive the generator shaft.</li>
            <li><strong>The generator:</strong> Magnets rotating inside copper coils convert the mechanical motion into electricity via electromagnetic induction.</li>
            <li><strong>Condenser &amp; feedwater pump:</strong> Spent steam enters the <em>condenser</em>, where a third loop of cold water from the cooling tower turns it back into liquid. A <em>feedwater pump</em> sends that liquid back to the steam generator — closing the secondary loop.</li>
            <li><strong>Cooling tower (tertiary loop):</strong> The third loop carries the rejected heat from the condenser to the cooling tower, where it escapes as harmless water vapour. This loop never touches the radioactive primary water.</li>
          </ol>
          </motion.div>
        </div>

        <AnimatePresence>
          {animationStarted && (
            <motion.div
              className="efficiency-note"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="note-title">Energy Efficiency</h3>
              <p className="note-text">
                Due to the laws of physics, nuclear plants operate at about <strong>33% thermal efficiency</strong>. The rest of the heat is harmlessly released as water vapor from the cooling towers, not smoke.
              </p>
              <div className="comparison-box">
                <strong>Energy Density and Lifecycle Carbon</strong>
                <div className="comparison-grid" role="table" aria-label="Fuel energy density and lifecycle carbon comparison">
                  <div className="comparison-grid-head" role="rowgroup">
                    <span role="columnheader">Fuel</span>
                    <span role="columnheader">MJ/kg</span>
                    <span role="columnheader">gCO2e/kWh</span>
                  </div>
                  {[
                    ['Coal', '~24', '~820'],
                    ['Natural Gas', '~55', '~490'],
                    ['Uranium-235', '~80,000,000', '~12'],
                    ['Hydrogen', '~120', '0 at use point'],
                  ].map(([fuel, energy, carbon]) => (
                    <div key={fuel} className="comparison-grid-row" role="row">
                      <span className="comparison-grid-fuel" role="cell">{fuel}</span>
                      <span role="cell">{energy}</span>
                      <span role="cell">{carbon}</span>
                    </div>
                  ))}
                </div>
                <em>Hydrogen is included for fuel energy density; its climate footprint depends on how the hydrogen is produced.</em>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <RealWorldOverlay
        isOpen={activeOverlay !== null}
        onClose={() => setActiveOverlay(null)}
        imageSrc={
          activeOverlay === 'core'      ? `${import.meta.env.BASE_URL}real-world/scene4-core.png` :
          activeOverlay === 'turbine'   ? `${import.meta.env.BASE_URL}real-world/scene4-turbine.jpg` :
                                         `${import.meta.env.BASE_URL}real-world/scene4-generator.jpeg`
        }
        imageLabel={
          activeOverlay === 'core'      ? 'The reactor pressure vessel and fuel assemblies' :
          activeOverlay === 'turbine'   ? 'A massive steam turbine inside a nuclear power plant hall' :
                                         'Industrial alternator / generator coupled to a steam turbine'
        }
        caption={
          activeOverlay === 'core'
            ? 'The reactor pressure vessel houses the fuel assemblies and keeps superheated coolant at 155 bar — preventing boiling despite temperatures above 300°C.'
            : activeOverlay === 'turbine'
            ? 'Industrial steam turbines can be 10+ metres long and generate over 1,000 MW of mechanical power — enough to power a million homes.'
            : 'Generators convert the turbine\'s mechanical rotation into electricity via electromagnetic induction. A typical unit produces 1,000–1,600 MW at 20 kV, stepped up to 220–400 kV for long-distance transmission.'
        }
      />
    </div>
  );
};

export default Scene4TextPanel;
