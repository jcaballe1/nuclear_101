import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import RealWorldOverlay from './RealWorldOverlay';
import './Scene6TextPanel.css';

const OVERLAYS = {
  pool: {
    imageSrc: '/real-world/scene6-spent-fuel.jpg',
    imageLabel: 'A glowing blue spent fuel pool',
    caption: 'Spent fuel pools emit an ethereal blue Cherenkov glow as water shields and cools the rods. After a few years of cooling, the fuel is cool enough to move to dry cask storage.',
  },
  cask: {
    imageSrc: '/real-world/scene6-dry-cask.jpg',
    imageLabel: 'Dry storage casks standing outdoors at a nuclear facility',
    caption: 'Dry casks are massive steel-and-concrete cylinders. They require no power, no pumps, no active cooling, passive safety engineering that keeps spent fuel contained for decades.',
  },
};

const Scene6TextPanel = () => {
  const [activeOverlay, setActiveOverlay] = useState(null);
  const panelRef = useRef(null);

  const openOverlay = (which) => {
    setActiveOverlay(which);
    if (panelRef.current) panelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={panelRef} className="scene6-text-panel">
      <div className="text-content">
        <h2 className="panel-title">Nuclear Waste &amp; the Fuel Cycle</h2>

        <div className="rwv-btn-row">
          <button className="rwv-toggle-btn rwv-sm" onClick={() => openOverlay('pool')}>
            📸 Spent Fuel Pool
          </button>
          <button className="rwv-toggle-btn rwv-sm" onClick={() => openOverlay('cask')}>
            📸 Dry Casks
          </button>
        </div>

        <div className="intro-section">
          <p className="intro-text">
            Spent nuclear fuel is like a used espresso puck, exhausted for its original purpose,
            yet still rich in extractable energy. Modern waste management turns a liability into an asset.
          </p>
        </div>

        <div className="s6-steps">
          <motion.div
            className="s6-step-card s6-step-1"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="s6-step-num">1</div>
            <div>
              <span className="s6-step-title">Cooling Pool</span>
              <p className="s6-step-text">
                Fresh spent fuel goes straight into deep pools of water. The water absorbs heat and
                radiation while producing the iconic blue <strong>Cherenkov glow</strong>, particles
                moving faster than light <em>in water</em>.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="s6-step-card s6-step-2"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="s6-step-num">2</div>
            <div>
              <span className="s6-step-title">Dry Cask Storage</span>
              <p className="s6-step-text">
                After years of cooling, rods transfer to thick concrete-and-steel dry casks. No pumps,
                no power, no active systems, entirely <strong>passive safety</strong> that works for decades.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="s6-step-card s6-step-3"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="s6-step-num">3</div>
            <div>
              <span className="s6-step-title">Closing the Loop</span>
              <p className="s6-step-text">
                ~90% of spent fuel is recyclable uranium &amp; plutonium. Reprocessing extracts it as
                fresh MOX fuel. Only ~10% becomes true high-level waste, vitrified into stable glass.
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {activeOverlay && (
        <RealWorldOverlay
          isOpen={true}
          onClose={() => setActiveOverlay(null)}
          imageSrc={OVERLAYS[activeOverlay].imageSrc}
          imageLabel={OVERLAYS[activeOverlay].imageLabel}
          caption={OVERLAYS[activeOverlay].caption}
        />
      )}
    </div>
  );
};

export default Scene6TextPanel;
