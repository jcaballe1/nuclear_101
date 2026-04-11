import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RealWorldOverlay from './RealWorldOverlay';
import './TextPanel.css';

const TextPanel = ({ isotopeType, showFission, onFissionDismiss, onFissionNext }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const panelRef = useRef(null);

  const handleOpenOverlay = () => {
    setShowOverlay(true);
    if (panelRef.current) panelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const content = {
    stable: {
      title: "Stable Isotope: Carbon-12",
      description: "Carbon-12 (⁶C¹²) contains 6 protons and 6 neutrons, creating a perfectly balanced nucleus.",
      sections: [
        {
          heading: "The Strong Nuclear Force",
          text: "The strongest force in nature acts at extremely short distances (10⁻¹⁵ m), binding protons and neutrons together. This attractive force overcomes the electrostatic repulsion between positively charged protons."
        },
        {
          heading: "Electrostatic Repulsion",
          text: "Protons, all positively charged, naturally repel each other according to Coulomb's law. In stable nuclei, the strong nuclear force dominates, keeping the nucleus intact."
        },
        {
          heading: "Stability",
          text: "The balance between attractive (strong force) and repulsive (electromagnetic) forces creates a stable configuration. Carbon-12 can exist indefinitely without spontaneous decay."
        }
      ]
    },
    unstable: {
      title: "Unstable Isotope: Uranium-235",
      description: "Uranium-235 (⁹²U²³⁵) contains 92 protons and 143 neutrons. This large nucleus is on the edge of instability.",
      sections: [
        {
          heading: "Increased Repulsion",
          text: "With 92 protons packed together, the electrostatic repulsion grows significantly stronger. The strong nuclear force, limited by distance, struggles to hold the entire nucleus together."
        },
        {
          heading: "The Neutron's Role",
          text: "Neutrons add mass and provide additional strong force without contributing to electrostatic repulsion. However, too many neutrons can also destabilize the nucleus."
        },
        {
          heading: "Critical Balance",
          text: "U-235 exists in a delicate equilibrium. The addition of just one more neutron can tip the balance, triggering nuclear fission—the splitting of the nucleus into smaller fragments."
        }
      ]
    }
  };

  const currentContent = content[isotopeType];

  return (
    <motion.div
      ref={panelRef}
      className="text-panel"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-panel-content">
        <button className="rwv-toggle-btn" onClick={handleOpenOverlay}>
          Real World View
        </button>
        <AnimatePresence mode="wait">
          <motion.div
            key={isotopeType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="isotope-title">{currentContent.title}</h2>
            <p className="isotope-description">{currentContent.description}</p>

            <div className="sections">
              {currentContent.sections.map((section, index) => (
                <motion.div
                  key={index}
                  className="section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <h3 className="section-heading">{section.heading}</h3>
                  <p className="section-text">{section.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showFission && (
            <motion.div
              className="fission-alert"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -20 }}
            >
              <button
                className="fission-close-btn"
                onClick={onFissionDismiss}
                aria-label="Close alert and read text"
                title="Close and read the text behind"
              >
                ×
              </button>
              {/* <div className="alert-badge">⚡ FISSION EVENT</div> */}
              <h3>Nuclear Fission Initiated</h3>
              <p>
                The incoming neutron has destabilized the U-235 nucleus, causing it to
                violently split into smaller fragments and release enormous energy. 
              </p>
              <p>
                This process is called <strong>Nuclear Fission</strong>.
              </p>
              <button className="fission-next-btn" onClick={onFissionNext}>
                Next: Explore Further the Nuclear Fission Process →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <RealWorldOverlay
        isOpen={showOverlay}
        onClose={() => setShowOverlay(false)}
        imageSrc={`${import.meta.env.BASE_URL}real-world/scene1-fuel-pellet.jpg`}
        imageLabel="Uranium-235 fuel pellet held in a gloved hand"
        caption="One fuel pellet holds the energy equivalent of approximately 1 ton of coal — small enough to balance on your fingertip."
      />
    </motion.div>
  );
};

export default TextPanel;
