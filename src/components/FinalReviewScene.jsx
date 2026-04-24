import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Quiz from './Quiz';
import './FinalReviewScene.css';

const CYCLE = [
  {
    id: 1, title: 'The Atom', sub: 'Scene 1',
    desc: 'Uranium-235 has a massive, unstable nucleus. A slow neutron triggers the whole chain.',
    color: '#6366f1', glow: 'rgba(99,102,241,0.35)',
  },
  {
    id: 2, title: 'Fission', sub: 'Scene 2',
    desc: 'Splitting one atom releases ~200 MeV. Mass converts to energy — E = mc².',
    color: '#f59e0b', glow: 'rgba(245,158,11,0.35)',
  },
  {
    id: 3, title: 'Chain Reaction', sub: 'Scene 3',
    desc: 'Each fission releases 2-3 neutrons that trigger more fissions in a self-sustaining cascade.',
    color: '#ef4444', glow: 'rgba(239,68,68,0.35)',
  },
  {
    id: 4, title: 'Power & Heat', sub: 'Scene 4',
    desc: 'Controlled heat turns water to steam. Steam spins turbines — zero CO₂ emitted.',
    color: '#10b981', glow: 'rgba(16,185,129,0.35)',
  },
  {
    id: 5, title: 'Radiation Safety', sub: 'Scene 5',
    desc: 'Alpha, beta, and gamma radiation are each stopped by the right shielding material.',
    color: '#0ea5e9', glow: 'rgba(14,165,233,0.35)',
  },
  {
    id: 6, title: 'The Fuel Cycle', sub: 'Scene 6',
    desc: '90% of spent fuel can be recycled via PUREX chemistry. Only 10% is true waste.',
    color: '#8b5cf6', glow: 'rgba(139,92,246,0.35)',
  },
];

const KEY_STATS = [
  { label: 'World Electricity Share', value: '~10%', note: 'Nuclear supplies about one-tenth of global electricity.' },
  { label: 'Deaths per TWh', value: '~0.03', note: 'Our World in Data ranks nuclear among the safest major energy sources.' },
  { label: 'Lifecycle Carbon', value: '~12 gCO2e/kWh', note: 'Comparable to wind and far below coal or gas.' },
];

const FinalReviewScene = ({ completedScenes = new Set(), visitedScenes = new Set(), onRestart }) => {
  const [visible, setVisible] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const score = completedScenes.size;
  const visitedOnlyCount = [...visitedScenes].filter(id => !completedScenes.has(id)).length;
  const allDone = score >= 6;

  useEffect(() => {
    CYCLE.forEach((c, i) => {
      setTimeout(() => setVisible(prev => [...prev, c.id]), 180 + i * 200);
    });
  }, []);

  if (showQuiz) {
    return (
      <div className="fr-root">
        <Quiz onComplete={() => setShowQuiz(false)} />
      </div>
    );
  }

  return (
    <div className="fr-root">

      {/* ── HEADER ── */}
      <motion.div
        className="fr-head"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="fr-title">
          {allDone ? 'Journey Complete!' : 'The Nuclear Energy Cycle'}
        </h2>
        <p className="fr-sub">
          {allDone
            ? 'You explored all 6 stages — from atom to electricity to recycling.'
            : `You completed ${score} of 6 scenes. Here's the full story.`}
        </p>

        {/* Progress bar */}
        <div className="fr-progress">
          <div className="fr-progress-track">
            <motion.div
              className="fr-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${(score / 6) * 100}%` }}
              transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
            />
          </div>
          <span className="fr-progress-lbl">
            {score}/6 completed{visitedOnlyCount > 0 ? ` · ${visitedOnlyCount} skipped` : ''}
          </span>
        </div>
      </motion.div>

      {/* ── CYCLE CARDS ── */}
      <div className="fr-cycle">
        {CYCLE.map((step, i) => (
          <React.Fragment key={step.id}>
            <AnimatePresence>
              {visible.includes(step.id) && (
                <motion.div
                  className={`fr-card ${completedScenes.has(step.id) ? 'fr-done' : visitedScenes.has(step.id) ? 'fr-visited' : ''}`}
                  style={{ '--sc': step.color, '--sg': step.glow }}
                  initial={{ opacity: 0, y: 20, scale: 0.88 }}
                  animate={{ opacity: 1, y: 0,  scale: 1 }}
                  transition={{ duration: 0.38, ease: [0.34, 1.56, 0.64, 1] }}
                  whileHover={{ y: -4, boxShadow: `0 8px 28px var(--sg)` }}
                >
                  <div className="fr-card-accent" />
                  <div className="fr-card-content">
                    <span className="fr-card-sub">{step.sub}</span>
                    <h3 className="fr-card-title">{step.title}</h3>
                    <p className="fr-card-desc">{step.desc}</p>
                  </div>
                  {completedScenes.has(step.id) && (
                    <motion.div
                      className="fr-check"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5, delay: 0.15 }}
                    >✓</motion.div>
                  )}
                  {visitedScenes.has(step.id) && !completedScenes.has(step.id) && (
                    <motion.div
                      className="fr-check-visited"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.4, delay: 0.15 }}
                    >~</motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {i < CYCLE.length - 1 && (
              <motion.div
                className="fr-arrow"
                initial={{ opacity: 0 }}
                animate={{ opacity: visible.includes(step.id) ? 1 : 0 }}
                transition={{ delay: 0.15 }}
              >
                <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
                  <path d="M0 8h22M16 2l8 6-8 6" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* ── KEY FACT ── */}
      <motion.div
        className="fr-insight"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
      >
        {KEY_STATS.map((stat) => (
          <div key={stat.label} className="fr-stat">
            <span className="fr-stat-label">{stat.label}</span>
            <strong className="fr-stat-value">{stat.value}</strong>
            <span className="fr-stat-note">{stat.note}</span>
          </div>
        ))}
      </motion.div>

      {/* ── ACTIONS ── */}
      <motion.div
        className="fr-actions"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0 }}
      >
        <button className="fr-btn-quiz" onClick={() => setShowQuiz(true)}>
          ✓ Test Yourself
        </button>
        <button className="fr-btn-restart" onClick={onRestart}>
          ↺ Restart Journey
        </button>
      </motion.div>

    </div>
  );
};

export default FinalReviewScene;
