import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Scene1Nucleus from './components/Scene1Nucleus';
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

const STORAGE_KEY = 'nuclear101-progress';
const loadProgress = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

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
  // Always show the landing page on mount/refresh — even if the user has prior progress.
  // Saved scene/done are still rehydrated so the user can resume from the same step
  // by clicking "Begin" on the landing page.
  const [landing, setLanding]     = useState(true);
  const [scene, setScene]         = useState(() => { const s = loadProgress(); return s?.scene ?? 1; });
  const [dir,   setDir]           = useState(1);
  const [done,  setDone]          = useState(() => { const s = loadProgress(); return s?.done ? new Set(s.done) : new Set(); });
  // 'visited' tracks scenes the user navigated past with Skip (but never interacted with)
  const [visited, setVisited]     = useState(new Set());
  const markDone = useCallback((id) => {
    setDone(prev => prev.has(id) ? prev : new Set([...prev, id]));
  }, []);

  const markVisited = useCallback((id) => {
    // Only mark visited if the scene hasn't been properly completed
    setVisited(prev => prev.has(id) ? prev : new Set([...prev, id]));
  }, []);

  // Persist progress on every change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        scene,
        done: [...done],
        landingSeen: !landing,
      }));
    } catch {
      // storage unavailable — silent fail
    }
  }, [scene, done, landing]);

  const resetProgress = useCallback(() => {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setScene(1);
    setDir(1);
    setDone(new Set());
    setVisited(new Set());
    setLanding(true);
  }, []);

  const go = useCallback((id) => {
    setDir(id > scene ? 1 : -1);
    setScene(id);
  }, [scene]);

  // Global keydown navigation
  useEffect(() => {
    if (landing) return;
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input (not that we have any, but good practice)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowLeft':
          if (scene > 1) go(scene - 1);
          break;
        case 'ArrowRight':
          if (scene < 7) go(scene + 1);
          break;
        case '1': case '2': case '3': case '4': case '5': case '6': case '7':
          go(parseInt(e.key, 10));
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scene, landing, go]);

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
            <LandingPage
              onStart={() => { setScene(1); setDone(new Set()); setVisited(new Set()); setLanding(false); }}
              onResume={() => setLanding(false)}
              savedScene={scene}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP NAV */}
      <header className="nm-header">
        <div className="nm-brand">
          <span className="nm-brand-orb" aria-hidden="true">⚛</span>
          <span className="nm-brand-name">Nuclear Energy 101</span>
        </div>

        <nav className="nm-stepper" aria-label="Course progress">
          <div className="nm-stepper-desktop">
            {SCENES.map((s, i) => (
              <React.Fragment key={s.id}>
                {i > 0 && (
                  <div className={`nm-line ${done.has(SCENES[i - 1].id) ? 'nm-line-lit' : ''}`} />
                )}
                <button
                  className={[
                    'nm-step',
                    scene === s.id                              ? 'nm-step-active'  : '',
                    done.has(s.id)                              ? 'nm-step-done'    : '',
                    visited.has(s.id) && !done.has(s.id)        ? 'nm-step-visited' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => go(s.id)}
                  aria-current={scene === s.id ? 'step' : undefined}
                >
                  <div className="nm-step-dot">
                    {done.has(s.id)                         ? '✓'
                     : visited.has(s.id) && !done.has(s.id) ? '~'
                     : s.short}
                  </div>
                  <span className="nm-step-lbl">{s.label}</span>
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* MOBILE COMPACT NAV */}
          <div className="nm-stepper-mobile">
            <select
              className="nm-mobile-dropdown"
              value={scene}
              onChange={(e) => go(Number(e.target.value))}
              aria-label="Select scene"
            >
              {SCENES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.short}. {s.label} {done.has(s.id) ? '(Done)' : visited.has(s.id) ? '(Skipped)' : ''}
                </option>
              ))}
            </select>
          </div>
        </nav>
      </header>

      {/* SCENE AREA */}
      <main className="nm-main">
        <AnimatePresence mode="wait" custom={dir}>
          <SceneWrap id={scene} dir={dir}>
            {scene === 1 && <Scene1Nucleus onComplete={() => markDone(1)} onFissionNext={() => go(2)} />}
            {scene === 2 && <Scene2Fission onComplete={() => markDone(2)} />}
            {scene === 3 && <Scene3ChainReaction onComplete={() => markDone(3)} />}
            {scene === 4 && <Scene4Reactor onComplete={() => markDone(4)} />}
            {scene === 5 && <Scene5Radiation onComplete={() => markDone(5)} />}
            {scene === 6 && <Scene6NuclearWaste onComplete={() => markDone(6)} />}
            {scene === 7 && <FinalReviewScene completedScenes={done} visitedScenes={visited} onRestart={resetProgress} />}
          </SceneWrap>
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
          <button className="nm-reset-link" onClick={resetProgress}>
            Reset progress
          </button>
        </div>

        <div className="nm-footer-center">
          <div className="nm-dots">
            {[1,2,3,4,5,6].map(n => (
              <button
                key={n}
                className={[
                  'nm-dot',
                  scene === n          ? 'nm-dot-active'  : '',
                  done.has(n)          ? 'nm-dot-done'    : '',
                  visited.has(n) && !done.has(n) ? 'nm-dot-visited' : '',
                ].filter(Boolean).join(' ')}
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
          {scene < 7 && (
            <div className="nm-next-group">
              <button
                className="nm-btn-next"
                onClick={() => go(scene + 1)}
              >
                {scene === 6 ? '★ Final Review' : 'Next →'}
              </button>
              <AnimatePresence>
                {!isComplete && (
                  <motion.button
                    key="skip"
                    className="nm-skip-link"
                    onClick={() => { markVisited(scene); go(scene + 1); }}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                  >
                    Skip for now
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </footer>

    </div>
  );
};

export default NucleusModule;
