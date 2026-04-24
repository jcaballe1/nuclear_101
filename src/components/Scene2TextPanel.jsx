import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RealWorldOverlay from './RealWorldOverlay';
import Term from './Term';
import './Scene2TextPanel.css';

const Scene2TextPanel = ({ fissionStarted, showBalance }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const panelRef = useRef(null);

  const handleOpenOverlay = () => {
    setShowOverlay(true);
    if (panelRef.current) panelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={panelRef} className="scene2-text-panel">
      <div className="text-content">
        <h2 className="panel-title">Nuclear Fission Process</h2>
        <button className="rwv-toggle-btn" onClick={handleOpenOverlay}>
          Real World View
        </button>
        
        <div className="stages">
          <motion.div 
            className="stage"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="stage-number">Stage 1</h3>
            <h4 className="stage-title">Neutron Capture</h4>
            <p className="stage-text">
              A slow-moving <Term term="neutrons" display="neutron" /> approaches the <Term term="Uranium-235" display="Uranium-235" /> nucleus. The nucleus,
              with 92 <Term term="protons" /> and 143 <Term term="neutrons" />, is already in a delicate state of balance.
            </p>
          </motion.div>

          <motion.div 
            className="stage"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="stage-number">Stage 2</h3>
            <h4 className="stage-title">Compound Nucleus</h4>
            <p className="stage-text">
              The neutron is absorbed, creating Uranium-236. The extra energy
              causes the nucleus to vibrate violently and elongate like a liquid drop,
              stretching into an unstable "dumbbell" shape.
            </p>
          </motion.div>

          <motion.div 
            className="stage"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="stage-number">Stage 3</h3>
            <h4 className="stage-title">Nuclear Fission</h4>
            <p className="stage-text">
              The electrostatic repulsion overcomes the strong nuclear force.
              The nucleus splits into two lighter fragments (typically Krypton-92
              and Barium-141), releasing 2-3 additional <Term term="neutrons" />.
            </p>
          </motion.div>

          <motion.div 
            className="stage"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="stage-number">Stage 4</h3>
            <h4 className="stage-title">Energy Release</h4>
            <p className="stage-text">
              The fragments fly apart at tremendous speeds (≈3% speed of light),
              releasing ~200 <Term term="MeV" /> of kinetic energy. This energy manifests as heat, the
              foundation of nuclear power generation.
            </p>
          </motion.div>
        </div>

        <AnimatePresence>
          {showBalance && (
            <motion.div
              className="emc2-explanation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h3 className="explanation-title">Einstein's E=mc²</h3>
              <p className="explanation-text">
                The total mass of <Term term="fission" /> products is slightly less than the original
                <Term term="Uranium-235" display="U-235" /> + <Term term="neutrons" display="neutron" />. This "missing mass" (≈0.186 <Term term="atomic mass unit" display="atomic mass units" />) hasn't
                disappeared, it has been converted into pure energy according to Einstein's
                famous equation.
              </p>
              <div className="equation-breakdown">
                <div className="breakdown-item">
                  <strong>E</strong> = Energy released
                </div>
                <div className="breakdown-item">
                  <strong>m</strong> = Missing mass (0.186 u)
                </div>
                <div className="breakdown-item">
                  <strong>c²</strong> = Speed of light squared (≈9×10¹⁶ m²/s²)
                </div>
              </div>
              <p className="key-insight">
                <strong>Key Insight:</strong> Even tiny amounts of mass contain
                enormous energy. Just 0.186 u releases 173 MeV, enough to power
                a 100-watt bulb for 31 hours from a single atom!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <RealWorldOverlay
        isOpen={showOverlay}
        onClose={() => setShowOverlay(false)}
        imageSrc={`${import.meta.env.BASE_URL}real-world/scene2-fuel-pellet.jpg`}
        imageLabel="Uranium-235 fuel pellet held in a gloved hand"
        caption="One fuel pellet holds the energy equivalent of approximately 1 ton of coal, small enough to balance on your fingertip."
      />
    </div>
  );
};

export default Scene2TextPanel;
