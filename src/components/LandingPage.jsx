import React from 'react';
import { motion } from 'framer-motion';
import './LandingPage.css';

const TOPICS = [
  { icon: '⚛', step: '01', label: 'The Nucleus',    desc: 'Protons, neutrons & isotopes' },
  { icon: '☄️', step: '02', label: 'Fission',        desc: 'Splitting atoms & E = mc²' },
  { icon: '💥', step: '03', label: 'Chain Reaction', desc: 'Sustaining & controlling the cascade' },
  { icon: '🔵', step: '04', label: 'The Reactor',    desc: 'Converting heat into electricity' },
  { icon: '☢',  step: '05', label: 'Radiation',      desc: 'Types, risks & shielding' },
  { icon: '♻',  step: '06', label: 'Fuel Cycle',     desc: 'From uranium mine to final storage' },
];

const OUTCOMES = [
  'Explain the physics of nuclear fission at a molecular level',
  'Describe how a nuclear reactor generates electricity from heat',
  'Compare the benefits and risks of nuclear energy objectively',
  'Discuss nuclear waste management and the fuel cycle',
];

const container = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

const LandingPage = ({ onStart }) => (
  <div className="lp-root">
    {/* ── BRAND BAR ── */}
    <div className="lp-brand">
      <span className="lp-brand-orb">⚛</span>
      <span className="lp-brand-name">Nuclear Energy 101</span>
    </div>

    {/* ── HERO ── */}
    <motion.section
      className="lp-hero"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="lp-tags">
        <span className="lp-tag">6 interactive scenes</span>
        <span className="lp-tag">~15 minutes</span>
        <span className="lp-tag">No prior knowledge required</span>
      </div>

      <h1 className="lp-title">
        How does a nuclear<br />power plant actually work?
      </h1>

      <p className="lp-subtitle">
        Nuclear power drives today's energy debate. Explore the core physics behind it and get a view from the atom to the grid.
      </p>
    </motion.section>

    {/* ── LEARNING OUTCOMES ── */}
    <motion.section
      className="lp-outcomes-section"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.h2 className="lp-section-title" variants={item}>
        After this module, you will be able to…
      </motion.h2>
      <div className="lp-outcomes">
        {OUTCOMES.map((o, i) => (
          <motion.div key={i} className="lp-outcome" variants={item}>
            <span className="lp-outcome-check">✓</span>
            <span>{o}</span>
          </motion.div>
        ))}
      </div>
    </motion.section>

    {/* ── ROADMAP ── */}
    <motion.section
      className="lp-roadmap-section"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.h2 className="lp-section-title" variants={item}>
        Your learning journey
      </motion.h2>
      <div className="lp-roadmap">
        {TOPICS.map((t, i) => (
          <motion.div key={i} className="lp-topic-card" variants={item}>
            <div className="lp-topic-step">{t.step}</div>
            <div className="lp-topic-icon">{t.icon}</div>
            <div className="lp-topic-body">
              <div className="lp-topic-label">{t.label}</div>
              <div className="lp-topic-desc">{t.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>

    {/* ── CTA ── */}
    <motion.div
      className="lp-cta"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.4 }}
    >
      <motion.button
        className="lp-start-btn"
        onClick={onStart}
        whileHover={{ x: -2, y: -2, boxShadow: '6px 6px 0px 0px #0f172a' }}
        whileTap={{ scale: 0.97 }}
      >
        Begin Module →
      </motion.button>
      <p className="lp-cta-note">
        You can revisit any scene at any time using the navigation bar.
      </p>
    </motion.div>
  </div>
);

export default LandingPage;
