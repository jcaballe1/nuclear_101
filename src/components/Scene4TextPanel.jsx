import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RealWorldOverlay from './RealWorldOverlay';
import './Scene4TextPanel.css';

const Scene4TextPanel = ({ animationStarted }) => {
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

        <div className="stages">
          <motion.div 
            className="stage"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
          
          <ol style={{ listStyle: 'decimal', paddingLeft: '1.5rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><strong>Heat Generation:</strong> The uranium core undergoes controlled fission, heating the surrounding water to extreme temperatures (over 300°C).</li>
            <li><strong>Steam Production:</strong> This intense heat boils the water, creating high-pressure steam.</li>
            <li><strong>The Turbine:</strong> The pressurized steam blasts through pipes, forcing the massive blades of a steam turbine to spin at high speeds.</li>
            <li><strong>The Generator:</strong> The spinning turbine is connected to a generator (magnets rotating inside copper coils), which converts the mechanical motion into electricity via electromagnetic induction.</li>
            <li><strong>Cooling & Condensation:</strong> The spent steam is cooled back into liquid water by a cooling tower or river, and pumped back into the core in a closed loop.</li>
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
              {/* <div className="comparison-box">
                <strong>Energy Density Comparison:</strong>
                <ul>
                  <li>1 kg of coal: ~24 MJ</li>
                  <li>1 kg of uranium-235: ~80,000,000 MJ</li>
                  <li><em>Ratio: Uranium is ~3.3 million times more energy-dense</em></li>
                </ul>
              </div> */}
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
