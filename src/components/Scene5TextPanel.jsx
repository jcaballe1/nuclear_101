import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RealWorldOverlay from './RealWorldOverlay';
import './Scene5TextPanel.css';

const Scene5TextPanel = () => {
  const [activeOverlay, setActiveOverlay] = useState(null);
  const panelRef = useRef(null);

  const openOverlay = (type) => {
    setActiveOverlay(type);
    if (panelRef.current) panelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={panelRef} className="scene5-text-panel">
      <div className="text-content">
        <h2 className="panel-title">Radiation & Shielding</h2>
        <div className="rwv-btn-row">
          <button className="rwv-toggle-btn rwv-sm" onClick={() => openOverlay('paper')}>📸 Alpha</button>
          <button className="rwv-toggle-btn rwv-sm" onClick={() => openOverlay('acrylic')}>📸 Beta</button>
          <button className="rwv-toggle-btn rwv-sm" onClick={() => openOverlay('concrete')}>📸 Gamma</button>
        </div>
        
        <div className="intro-section">
          <p className="intro-text">
            Radiation is simply energy traveling outward. Unstable atoms shoot out microscopic "embers" of energy. Shielding is the act of putting dense layers of <strong>sacrificial atoms</strong> in the way to absorb that energy safely.
          </p>
        </div>

        <div className="s5-radiation-types">
          <h3 className="s5-types-title">The Three Types</h3>

          {/* Alpha */}
          <div className="s5-rad-card s5-alpha">
            <div className="s5-rad-symbol">α</div>
            <div className="s5-rad-body">
              <strong className="s5-rad-name">Alpha Particles</strong>
              <p className="s5-rad-text">Heavy, slow clusters (2 protons + 2 neutrons). Because they are bulky, they crash immediately and are stopped by a simple <strong>sheet of paper</strong> or dead skin.</p>
            </div>
          </div>

          {/* Beta */}
          <div className="s5-rad-card s5-beta">
            <div className="s5-rad-symbol">β</div>
            <div className="s5-rad-body">
              <strong className="s5-rad-name">Beta Particles</strong>
              <p className="s5-rad-text">Fast, lightweight electrons. They pass through paper but are easily stopped by a thin layer of <strong>acrylic, glass, or plastic</strong>.</p>
            </div>
          </div>

          {/* Gamma */}
          <div className="s5-rad-card s5-gamma">
            <div className="s5-rad-symbol">γ</div>
            <div className="s5-rad-body">
              <strong className="s5-rad-name">Gamma Rays</strong>
              <p className="s5-rad-text">Pure, high-energy electromagnetic waves. Highly penetrating, requiring thick, dense walls of <strong>lead or concrete</strong> to catch and absorb the energy.</p>
            </div>
          </div>
        </div>
      </div>

      <RealWorldOverlay
        isOpen={activeOverlay !== null}
        onClose={() => setActiveOverlay(null)}
        imageSrc={
          activeOverlay === 'paper'   ? '/real-world/scene5-alpha-ppe.jpg' :
          activeOverlay === 'acrylic' ? '/real-world/scene5-beta-glovebox.png' :
                                        '/real-world/scene5-containment.png'
        }
        imageLabel={
          activeOverlay === 'paper'   ? 'A worker in a basic Tyvek PPE suit' :
          activeOverlay === 'acrylic' ? 'A nuclear scientist working using thick acrylic glovebox windows' :
                                        'Thick concrete nuclear containment dome'
        }
        caption={
          activeOverlay === 'paper'
            ? 'Alpha particles are so large and slow that they cannot penetrate even a thin Tyvek coverall or the outermost layer of dead skin. The main danger is ingestion or inhalation, a basic suit prevents all contact.'
            : activeOverlay === 'acrylic'
            ? 'Beta particles are stopped by a few millimetres of plastic or glass. Gloveboxes with thick acrylic windows let scientists handle radioactive samples with full visibility and zero exposure.'
            : 'Containment structures are built with massive layers of reinforced concrete and steel to ensure that all radiation generated within the reactor is safely absorbed on-site, serving as the ultimate shield.'
        }
      />
    </div>
  );
};

export default Scene5TextPanel;