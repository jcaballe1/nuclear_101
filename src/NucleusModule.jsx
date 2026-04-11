import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NucleusVisualization from './components/NucleusVisualization';
import TextPanel from './components/TextPanel';
import Scene2Fission from './components/Scene2Fission';
import Scene3ChainReaction from './components/Scene3ChainReaction';
import Scene4Reactor from './components/Scene4Reactor';
import Scene5Radiation from './components/Scene5Radiation';
import Scene6NuclearWaste from './components/Scene6NuclearWaste';
import FinalReviewScene from './components/FinalReviewScene';
import LandingPage from './components/LandingPage';
import './NucleusModule.css';

const SCENES = [
  { id: 1, short: '1', label: 'Nucleus' },
  { id: 2, short: '2', label: 'Fission' },
  { id: 3, short: '3', label: 'Chain Reaction' },
  { id: 4, short: '4', label: 'Reactor' },
  { id: 5, short: '5', label: 'Radiation' },
  { id: 6, short: '6', label: 'Fuel Cycle' },
  { id: 7, short: '★', label: 'Review' },
];

const slide = {
  enter:  (d) => ({ opacity: 0, x: d > 0 ?  56 : -56 }),
  center: { opacity: 1, x: 0 },
  exit:   (d) => ({ opacity: 0, x: d > 0 ? -56 :  56 }),
};
const tConfig = { duration: 0.36, ease: [0.4, 0, 0.2, 1] };

const SceneWrap = ({ id, dir, children }) => (
  <motion.div
    key={`s${id}`}
    className="nm-scene"
    custom={dir}
    variants={slide}
    initial="enter"
    animate="center"
    exit="exit"
    transition={tConfig}
  >
    {children}
  </motion.div>
);

const NucleusModule = () => {
  const [landing, setLanding]     = useState(true);
  const [scene, setScene]         = useState(1);
  const [dir,   setDir]           = useState(1);
  const [done,  setDone]          = useState(new Set());
  const [isotopeType, setIsotopeType] = useState('stable');
  const [showFission, setShowFission] = useState(false);

  const markDone = useCallback((id) => {
    setDone(prev => prev.has(id) ? prev : new Set([...prev, id]));
  }, []);

  const go = (id) => {
    setDir(id > scene ? 1 : -1);
    setScene(id);
  };

  const handleAddNeutron = () => {
    if (isotopeType === 'unstable') {
      setShowFission(true);
      markDone(1);
    }
  };

  const handleFissionDismiss = () => {
    setShowFission(false);
  };

  const handleFissionNext = () => {
    setShowFission(false);
    go(2);
  };

  const isComplete = done.has(scene) || scene === 7;

  return (
    <div className="nm-root">

      {/* LANDING PAGE */}
      <AnimatePresence>
        {landing && (
          <motion.div
            key="landing"
            className="nm-landing-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <LandingPage onStart={() => setLanding(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP NAV */}
      <header className="nm-header">
        <div className="nm-brand">
          <span className="nm-brand-orb">⚛</span>
          <span className="nm-brand-name">Nuclear Energy 101</span>
        </div>

        <nav className="nm-stepper" aria-label="Course progress">
          {SCENES.map((s, i) => (
            <React.Fragment key={s.id}>
              {i > 0 && (
                <div className={`nm-line ${done.has(SCENES[i - 1].id) ? 'nm-line-lit' : ''}`} />
              )}
              <button
                className={[
                  'nm-step',
                  scene === s.id   ? 'nm-step-active' : '',
                  done.has(s.id)   ? 'nm-step-done'   : '',
                ].filter(Boolean).join(' ')}
                onClick={() => go(s.id)}
                aria-current={scene === s.id ? 'step' : undefined}
              >
                <div className="nm-step-dot">
                  {done.has(s.id) ? '✓' : s.short}
                </div>
                <span className="nm-step-lbl">{s.label}</span>
              </button>
            </React.Fragment>
          ))}
        </nav>
      </header>

      {/* SCENE AREA */}
      <main className="nm-main">
        <AnimatePresence mode="wait" custom={dir}>
          {scene === 1 && (
            <SceneWrap id={1} dir={dir}>
              <div className="nm-two-col">
                <TextPanel isotopeType={isotopeType} showFission={showFission} onFissionDismiss={handleFissionDismiss} onFissionNext={handleFissionNext} />
                <NucleusVisualization
                  isotopeType={isotopeType}
                  setIsotopeType={setIsotopeType}
                  onAddNeutron={handleAddNeutron}
                  showFission={showFission}
                />
              </div>
            </SceneWrap>
          )}
          {scene === 2 && (
            <SceneWrap id={2} dir={dir}>
              <Scene2Fission onComplete={() => markDone(2)} />
            </SceneWrap>
          )}
          {scene === 3 && (
            <SceneWrap id={3} dir={dir}>
              <Scene3ChainReaction onComplete={() => markDone(3)} />
            </SceneWrap>
          )}
          {scene === 4 && (
            <SceneWrap id={4} dir={dir}>
              <Scene4Reactor onComplete={() => markDone(4)} />
            </SceneWrap>
          )}
          {scene === 5 && (
            <SceneWrap id={5} dir={dir}>
              <Scene5Radiation onComplete={() => markDone(5)} />
            </SceneWrap>
          )}
          {scene === 6 && (
            <SceneWrap id={6} dir={dir}>
              <Scene6NuclearWaste onComplete={() => markDone(6)} />
            </SceneWrap>
          )}
          {scene === 7 && (
            <SceneWrap id={7} dir={dir}>
              <FinalReviewScene
                completedScenes={done}
                onRestart={() => { go(1); setDone(new Set()); setLanding(true); }}
              />
            </SceneWrap>
          )}
        </AnimatePresence>
      </main>

      {/* BOTTOM BAR */}
      <footer className="nm-footer">
        <div className="nm-footer-left">
          {scene <= 6 && (
            <span className="nm-scene-lbl">
              Step {scene} of 6 &mdash; {SCENES[scene - 1].label}
            </span>
          )}
        </div>

        <div className="nm-footer-center">
          <div className="nm-dots">
            {[1,2,3,4,5,6].map(n => (
              <button
                key={n}
                className={`nm-dot ${scene === n ? 'nm-dot-active' : ''} ${done.has(n) ? 'nm-dot-done' : ''}`}
                onClick={() => go(n)}
                aria-label={`Go to scene ${n}`}
              />
            ))}
          </div>
        </div>

        <div className="nm-footer-right">
          {scene > 1 && (
            <button className="nm-btn-ghost" onClick={() => go(scene - 1)}>← Back</button>
          )}
          <AnimatePresence mode="wait">
            {scene < 7 && isComplete && (
              <motion.button
                key="next"
                className="nm-btn-next"
                onClick={() => go(scene + 1)}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.88 }}
                transition={{ duration: 0.22 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
              >
                {scene === 6 ? '★ Final Review' : 'Next →'}
              </motion.button>
            )}
            {scene < 7 && !isComplete && (
              <motion.button
                key="skip"
                className="nm-btn-skip"
                onClick={() => go(scene + 1)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Skip
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </footer>

    </div>
  );
};

export default NucleusModule;
