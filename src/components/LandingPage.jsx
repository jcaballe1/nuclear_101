import React from 'react';
import { motion } from 'framer-motion';
import Term from './Term';
import './LandingPage.css';

const SineWaveIcon = () => (
  <svg width="44" height="28" viewBox="0 0 48 24" fill="none" aria-hidden="true">
    <path
      d="M1 12 C4 4 8 4 12 12 C16 20 20 20 24 12 C28 4 32 4 36 12 C40 20 44 20 47 12"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <circle cx="1"  cy="12" r="2" fill="currentColor" opacity="0.5" />
    <circle cx="47" cy="12" r="2" fill="currentColor" opacity="0.5" />
  </svg>
);

const DropletIcon = () => (
  <svg width="36" height="44" viewBox="0 0 32 40" fill="none" aria-hidden="true">
    <path
      d="M16 2 C16 2 2 18 2 27 C2 35.28 8.27 38 16 38 C23.73 38 30 35.28 30 27 C30 18 16 2 16 2Z"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <path
      d="M10 28 C10 23 13 21 16 23"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"
    />
  </svg>
);

const HexagonIcon = () => (
  <svg width="42" height="42" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path
      d="M20 3 L35 11.5 L35 28.5 L20 37 L5 28.5 L5 11.5 Z"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
    <path
      d="M20 12 L27 16 L27 24 L20 28 L13 24 L13 16 Z"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55"
    />
    <circle cx="20" cy="20" r="2.5" fill="currentColor" opacity="0.7" />
  </svg>
);

const BIG_PICTURE = [
  {
    Icon: SineWaveIcon,
    title: <>Continuous <Term term="baseload" display="Baseload" /> Power</>,
    text: 'Nuclear delivers consistent, uninterrupted electricity 24/7, regardless of weather.',
  },
  {
    Icon: DropletIcon,
    title: 'Zero-Carbon Emissions',
    text: <>Nuclear <Term term="fission" /> produces zero CO{'\u2082'}. The visible steam from cooling towers is pure water vapor.</>,
  },
  {
    Icon: HexagonIcon,
    title: 'A Natural Resource',
    text: 'Uranium is a naturally occurring metal mined from the earth. A single fuel pellet holds millions of times more energy than fossil fuels.',
  },
];

const FISSION_FUSION_ROWS = [
  { process: 'Fission', summary: <>Splits heavy atoms such as <Term term="Uranium-235" display="uranium-235" /></>, energy: '~80,000,000', carbon: '~12' },
  { process: 'Fusion', summary: <>Joins light atoms such as hydrogen <Term term="isotope" display="isotopes" /></>, energy: '~120,000,000', carbon: '~4-15 projected' },
  { process: 'Coal', summary: 'Burns carbon-rich rock', energy: '~24', carbon: '~820' },
  { process: 'Natural Gas', summary: 'Burns methane', energy: '~55', carbon: '~490' },
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
      <span className="lp-brand-orb" aria-hidden="true">⚛</span>
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
        Nuclear power drives today's energy debate. Here's the core physics, from the atom to the grid.
      </p>
    </motion.section>

    {/* ── BIG PICTURE CONTEXT ── */}
    <motion.section
      className="lp-bigpicture-section"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div className="lp-bigpicture-header" variants={item}>
        <span className="lp-bigpicture-label">Big Picture Context</span>
        <h2 className="lp-bigpicture-title">Why does nuclear energy matter?</h2>
      </motion.div>
      <motion.div className="lp-compare-panel" variants={item}>
        <p className="lp-compare-text">
          <strong>Fission</strong> is the process used in nuclear power plants today: a large atom splits and releases heat.
          <strong> Fusion</strong> is the opposite: tiny atoms join together, like in the Sun. Both are nuclear reactions, but only fission is commercially mature today.
        </p>
        <div className="lp-compare-table" role="table" aria-label="Fission, fusion, and fossil fuel comparison table">
          <div className="lp-compare-head" role="rowgroup">
            <span role="columnheader">Process</span>
            <span role="columnheader">Plain English</span>
            <span role="columnheader">MJ/kg</span>
            <span role="columnheader">gCO2e/kWh</span>
          </div>
          {FISSION_FUSION_ROWS.map((row) => (
            <div key={row.process} className="lp-compare-row" role="row">
              <span className="lp-compare-process" role="cell">{row.process}</span>
              <span role="cell">{row.summary}</span>
              <span role="cell">{row.energy}</span>
              <span role="cell">{row.carbon}</span>
            </div>
          ))}
        </div>
      </motion.div>
      <div className="lp-bigpicture-grid">
        {BIG_PICTURE.map(({ Icon, title, text }, i) => (
          <motion.div key={i} className="lp-bigpicture-card" variants={item}>
            <div className="lp-bigpicture-icon">
              <Icon />
            </div>
            <h3 className="lp-bigpicture-card-title">{title}</h3>
            <p className="lp-bigpicture-card-text">{text}</p>
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
