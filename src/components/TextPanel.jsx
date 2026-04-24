import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RealWorldOverlay from './RealWorldOverlay';import Term from './Term';import './TextPanel.css';

const ENRICHMENT_LEVELS = [
  { label: 'Natural',       pct: '0.7%',  visual: 5,  color: '#b45309', note: 'as mined from ore'      },
  { label: 'Reactor grade', pct: '4%',    visual: 22, color: '#d97706', note: 'used in power plants'   },
  { label: 'Weapons grade', pct: '90%',   visual: 90, color: '#ef4444', note: 'nuclear warheads'       },
];

const EnrichmentBar = () => (
  <div className="enrich-widget">
    <p className="enrich-title">U-235 Enrichment Levels</p>
    {ENRICHMENT_LEVELS.map(({ label, pct, visual, color, note }) => (
      <div key={label} className="enrich-row">
        <span className="enrich-label">{label}</span>
        <div className="enrich-track" aria-label={`${label}: ${pct}`}>
          <div className="enrich-fill" style={{ width: `${visual}%`, background: color }} />
        </div>
        <span className="enrich-pct" style={{ color }}>{pct}</span>
        <span className="enrich-note">{note}</span>
      </div>
    ))}
    <p className="enrich-caption">Bar widths are exaggerated for clarity — weapons grade is ~225× more enriched than reactor grade.</p>
  </div>
);

const ExpandIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const AtomIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    <ellipse cx="12" cy="12" rx="10" ry="4" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
    <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
  </svg>
);

const LIST_ITEMS = [
  {
    Icon: ExpandIcon,
    title: 'Isotopes: The Over-filled Balloon',
    text: <><Term term="isotope" display="Isotopes" /> are atoms of the same element with different numbers of <Term term="neutrons" />. Most uranium is <Term term="Uranium-238" display="U-238" />, which acts like a thick, stable balloon. But <Term term="Uranium-235" display="U-235" /> is stretched to its absolute limit — one tiny tap from a <Term term="neutrons" display="neutron" /> makes it violently pop (<Term term="fission" />).</>,
  },
  {
    Icon: FilterIcon,
    title: 'Enrichment: Filtering the Sand',
    text: <>Natural uranium is 99.3% stable <Term term="Uranium-238" display="U-238" /> (‘sand’) and only 0.7% unstable <Term term="Uranium-235" display="U-235" /> (‘gold’). To build a power plant, we must raise the <Term term="Uranium-235" display="U-235" /> share to ~4%. This filtering process is called Enrichment.</>,
  },
  {
    Icon: AtomIcon,
    title: 'The Physics of the Split',
    text: <>Inside the <Term term="Uranium-235" display="U-235" /> nucleus, an incredible tension exists between the Strong Nuclear Force (the glue holding it together) and Electrostatic Repulsion (<Term term="protons" /> pushing apart). Adding just one <Term term="neutrons" display="neutron" /> destroys this delicate balance.</>,
  },
];

const TextPanel = ({ isotopeType, showFission, onFissionDismiss, onFissionNext }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const panelRef = useRef(null);

  const handleOpenOverlay = () => {
    setShowOverlay(true);
    if (panelRef.current) panelRef.current.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div
      ref={panelRef}
      className="text-panel"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-panel-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="isotope-title">The Fuel &amp; The Nucleus</h2>

          <button className="rwv-toggle-btn" onClick={handleOpenOverlay}>
            Real World View
          </button>

          <p className="isotope-description">
            Why do we use Uranium? Because it is the only heavy element found in nature that is naturally ready to split and sustain a chain reaction. But not all Uranium is exactly the same.
          </p>

          <div className="sections">
            {LIST_ITEMS.map(({ Icon, title, text }, index) => (
              <motion.div
                key={index}
                className="section tp-list-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <div className="tp-list-icon">
                  <Icon />
                </div>
                <div className="tp-list-body">
                  <h3 className="section-heading tp-list-heading">{title}</h3>
                  <p className="section-text">{text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <EnrichmentBar />

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
