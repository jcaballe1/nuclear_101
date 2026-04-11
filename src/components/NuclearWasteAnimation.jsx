import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './NuclearWasteAnimation.css';

const NuclearWasteAnimation = ({ onComplete }) => {
  const [fuelRodPosition, setFuelRodPosition] = useState('reactor');
  const [poolActive, setPoolActive]           = useState(false);
  const [caskClosed, setCaskClosed]           = useState(false);
  const [showBubbles, setShowBubbles]         = useState(false);
  const [canMoveToCask, setCanMoveToCask]     = useState(false);
  const [sensorGreen, setSensorGreen]         = useState(false);
  const [recyclingActive, setRecyclingActive] = useState(false);
  const [showSeparation, setShowSeparation]   = useState(false);
  const [showConveyor, setShowConveyor]       = useState(false);
  const [caskAtRecycling, setCaskAtRecycling] = useState(false);
  const [clawsOpen, setClawsOpen]             = useState(false);
  const [rodInBath, setRodInBath]             = useState(false);
  const [cooldownPct, setCooldownPct]         = useState(0);
  const [dragOverPool, setDragOverPool]       = useState(false);
  const [dragOverCask, setDragOverCask]       = useState(false);

  const poolRef = useRef(null);
  const caskRef = useRef(null);

  useEffect(() => {
    if (poolActive && fuelRodPosition === 'pool') {
      setShowBubbles(true);
      setCooldownPct(0);
      const start = Date.now();
      const DURATION = 3000;
      const id = setInterval(() => {
        const pct = Math.min(((Date.now() - start) / DURATION) * 100, 100);
        setCooldownPct(pct);
        if (pct >= 100) { clearInterval(id); setCanMoveToCask(true); }
      }, 50);
      return () => clearInterval(id);
    }
  }, [poolActive, fuelRodPosition]);

  useEffect(() => {
    if (fuelRodPosition === 'cask' && !caskClosed) {
      const t = setTimeout(() => { setCaskClosed(true); setSensorGreen(true); }, 700);
      return () => clearTimeout(t);
    }
  }, [fuelRodPosition, caskClosed]);

  const getCoords = (event, info) => ({
    x: info?.point?.x ?? event.clientX,
    y: info?.point?.y ?? event.clientY,
  });

  const handleDrag = (event, info) => {
    if (!poolRef.current || !caskRef.current) return;
    const { x, y } = getCoords(event, info);
    const pr = poolRef.current.getBoundingClientRect();
    const cr = caskRef.current.getBoundingClientRect();
    if (fuelRodPosition === 'reactor') {
      setDragOverPool(x >= pr.left && x <= pr.right && y >= pr.top && y <= pr.bottom);
    }
    if (fuelRodPosition === 'pool' && canMoveToCask) {
      const m = 40;
      setDragOverCask(x >= cr.left - m && x <= cr.right + m && y >= cr.top - m && y <= cr.bottom + m);
    }
  };

  const handleDragEnd = (event, info) => {
    if (!poolRef.current || !caskRef.current) return;
    setDragOverPool(false);
    setDragOverCask(false);
    const { x, y } = getCoords(event, info);
    const pr = poolRef.current.getBoundingClientRect();
    const cr = caskRef.current.getBoundingClientRect();
    if (fuelRodPosition === 'reactor') {
      if (x >= pr.left && x <= pr.right && y >= pr.top && y <= pr.bottom) {
        setFuelRodPosition('pool');
        setPoolActive(true);
      }
    }
    if (fuelRodPosition === 'pool' && canMoveToCask) {
      const m = 40;
      if (x >= cr.left - m && x <= cr.right + m && y >= cr.top - m && y <= cr.bottom + m) {
        setFuelRodPosition('cask');
      }
    }
  };

  const handleRecycle = () => {
    if (!caskClosed) return;
    setRecyclingActive(true);
    setTimeout(() => setCaskAtRecycling(true), 500);
    setTimeout(() => setClawsOpen(true), 2000);
    setTimeout(() => { setFuelRodPosition('recycling'); setCaskClosed(false); }, 3000);
    setTimeout(() => setRodInBath(true), 3500);
    setTimeout(() => setShowSeparation(true), 4500);
    setTimeout(() => { setShowConveyor(true); if (onComplete) onComplete(); }, 5500);
    setTimeout(() => {
      setRecyclingActive(false); setCaskAtRecycling(false); setClawsOpen(false);
      setShowSeparation(false);  setShowConveyor(false);    setRodInBath(false);
      setFuelRodPosition('reactor'); setPoolActive(false); setShowBubbles(false);
      setCanMoveToCask(false); setSensorGreen(false); setCooldownPct(0);
    }, 9000);
  };

  const stA = fuelRodPosition !== 'reactor' ? (canMoveToCask || fuelRodPosition !== 'pool' ? 'done' : 'active') : 'idle';
  const stB = !poolActive ? 'idle' : sensorGreen ? 'done' : fuelRodPosition === 'cask' ? 'active' : canMoveToCask ? 'waiting' : 'idle';
  const stC = !sensorGreen ? 'idle' : showConveyor ? 'done' : recyclingActive ? 'active' : 'waiting';
  const STEPS = [
    { key: 'A', label: 'Cooling Pool', st: stA },
    { key: 'B', label: 'Dry Cask',     st: stB },
    { key: 'C', label: 'Recycling',    st: stC },
  ];

  return (
    <div className="nwa-container">

      <div className="nwa-progress">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.key}>
            <div className={`nwa-prog-step ${s.st}`}>
              <div className="nwa-prog-dot">{s.st === 'done' ? '✓' : s.key}</div>
              <div className="nwa-prog-label">{s.label}</div>
            </div>
            {i < 2 && <div className={`nwa-prog-line ${STEPS[i + 1].st !== 'idle' ? 'lit' : ''}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="nwa-stages">

        {/* STEP A */}
        <div className={`nwa-card nwa-card-a ${stA === 'done' ? 'nwa-card-done' : stA === 'active' ? 'nwa-card-active' : ''}`}>
          <div className="nwa-card-header">
            <span className={`nwa-badge nwa-badge-${stA}`}>A</span>
            <div>
              <h4>Cooling Pool</h4>
              <p>Fresh spent fuel is intensely radioactive — it must cool in water for years</p>
            </div>
          </div>

          <div className="nwa-row">
            <div className="nwa-reactor">
              <div className="nwa-reactor-tower">
                <div className="nwa-reactor-dome" />
                <div className="nwa-reactor-body">
                  <div className="nwa-reactor-glow" />
                  <div className="nwa-reactor-vent" />
                  <div className="nwa-reactor-vent" />
                </div>
              </div>
              <span className="nwa-label">Reactor</span>

              {fuelRodPosition === 'reactor' && (
                <motion.div
                  className="nwa-rod"
                  drag
                  dragSnapToOrigin
                  dragElastic={0.06}
                  dragMomentum={false}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  whileDrag={{ scale: 1.15, filter: 'drop-shadow(0 0 12px rgba(251,191,36,0.9))' }}
                  whileHover={{ scale: 1.06, y: -3 }}
                >
                  <div className="nwa-rod-shape">
                    <div className="nwa-rod-cap" />
                    <div className="nwa-rod-body-bar" />
                    <div className="nwa-rod-foot" />
                  </div>
                  <span className="nwa-rod-tag">☢ Spent Fuel</span>
                </motion.div>
              )}
            </div>

            <div className="nwa-arrow">→</div>

            <div className={`nwa-pool ${dragOverPool ? 'nwa-pool-target' : ''}`} ref={poolRef}>
              <div className={`nwa-pool-water ${poolActive ? 'nwa-cherenkov' : ''}`}>
                {poolActive && <div className="nwa-shimmer" />}
                {showBubbles && (
                  <div className="nwa-bubbles">
                    {[0,1,2,3,4,5,6].map(i => (
                      <motion.div
                        key={i}
                        className={`nwa-bubble nwa-bubble-${i % 3}`}
                        initial={{ bottom: '5%', opacity: 0.8, scale: 0.6 }}
                        animate={{ bottom: '95%', opacity: 0, scale: 1 }}
                        transition={{ duration: 1.4 + i * 0.2, repeat: Infinity, delay: i * 0.38, ease: 'easeOut' }}
                        style={{ left: `${8 + i * 13}%` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {fuelRodPosition === 'pool' && (
                <motion.div
                  className={`nwa-submerged-wrap ${canMoveToCask ? 'nwa-rod-cooled' : ''}`}
                  initial={{ y: -70, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, type: 'spring', bounce: 0.35 }}
                  drag={canMoveToCask}
                  dragElastic={0.08}
                  dragMomentum={false}
                  onDrag={handleDrag}
                  onDragEnd={handleDragEnd}
                  style={{ cursor: canMoveToCask ? 'grab' : 'default', zIndex: canMoveToCask ? 120 : 5 }}
                  whileDrag={{ scale: 1.25, filter: 'drop-shadow(0 0 16px rgba(96,165,250,0.9))' }}
                >
                  <div className="nwa-submerged-rod" />
                </motion.div>
              )}

              {poolActive && !canMoveToCask && (
                <div className="nwa-cooldown-bar">
                  <motion.div
                    className="nwa-cooldown-fill"
                    animate={{ width: `${cooldownPct}%` }}
                    transition={{ duration: 0.08 }}
                  />
                  <span className="nwa-cooldown-text">Cooling… {Math.round(cooldownPct)}%</span>
                </div>
              )}

              <span className="nwa-pool-label">Cooling Pool</span>
            </div>

            {canMoveToCask && fuelRodPosition === 'pool' && (
              <motion.div className="nwa-hint" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
                <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.1 }}></motion.span>
                {' '}Drag rod <strong>to the Dry Cask &rarr;</strong>
              </motion.div>
            )}
          </div>
        </div>

        <div className="nwa-connector" />

        {/* STEP B */}
        <div className={`nwa-card nwa-card-b ${stB === 'done' ? 'nwa-card-done' : stB === 'active' || stB === 'waiting' ? 'nwa-card-active' : ''}`}>
          <div className="nwa-card-header">
            <span className={`nwa-badge nwa-badge-${stB}`}>B</span>
            <div>
              <h4>Dry Cask Storage</h4>
              <p>Sealed steel casks store cooled fuel safely for decades on-site</p>
            </div>
          </div>

          <div className="nwa-row">
            <motion.div
              className={`nwa-cask-wrap ${dragOverCask ? 'nwa-cask-target' : ''}`}
              ref={caskRef}
              animate={caskAtRecycling ? { x: 180, opacity: 0 } : { x: 0, opacity: 1 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
            >
              <div className="nwa-cask">
                <div className="nwa-cask-stripe" />
                <div className="nwa-cask-inner">
                  <AnimatePresence>
                    {fuelRodPosition === 'cask' && !rodInBath && (
                      <motion.div
                        className="nwa-cask-rod"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0.4 }}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {caskClosed && !clawsOpen && (
                    <motion.div
                      className="nwa-cask-lid"
                      initial={{ y: -48, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -48, opacity: 0 }}
                      transition={{ type: 'spring', bounce: 0.25 }}
                    >
                      {[0,1,2,3].map(i => <div key={i} className="nwa-bolt" />)}
                    </motion.div>
                  )}
                </AnimatePresence>
                {clawsOpen && (
                  <motion.div className="nwa-claws" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <motion.div className="nwa-claw nwa-claw-l" animate={{ rotate: [-15, 0] }} />
                    <motion.div className="nwa-claw nwa-claw-r" animate={{ rotate: [15, 0] }} />
                  </motion.div>
                )}
              </div>
              <span className="nwa-label" style={{ marginTop: '0.45rem' }}>Dry Cask</span>
            </motion.div>

            <div className={`nwa-sensor ${sensorGreen ? 'nwa-sensor-safe' : ''}`}>
              <div className="nwa-sensor-body">
                <div className="nwa-sensor-window">
                  <div className="nwa-sensor-dot" />
                </div>
                <div className="nwa-sensor-scale" />
              </div>
              <span className="nwa-sensor-label">{sensorGreen ? '✓ SAFE & SEALED' : 'Monitoring…'}</span>
              {sensorGreen && (
                <motion.div
                  className="nwa-sensor-ring"
                  animate={{ scale: [1, 2.2, 1], opacity: [0.7, 0, 0.7] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              )}
            </div>
          </div>

          {!recyclingActive && sensorGreen && (
            <motion.button
              className="nwa-recycle-btn"
              onClick={handleRecycle}
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: 1, y: 0,
                boxShadow: ['0 4px 14px rgba(16,185,129,0.35)', '0 4px 22px rgba(16,185,129,0.75)', '0 4px 14px rgba(16,185,129,0.35)'],
              }}
              transition={{ opacity: { delay: 0.5 }, boxShadow: { repeat: Infinity, duration: 1.8 } }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              ♻️ Send Cask to Recycling Facility
            </motion.button>
          )}
        </div>

        <div className="nwa-connector" />

        {/* STEP C */}
        <div className={`nwa-card nwa-card-c ${stC === 'done' ? 'nwa-card-done' : stC === 'active' ? 'nwa-card-active' : ''}`}>
          <div className="nwa-card-header">
            <span className={`nwa-badge nwa-badge-${stC}`}>C</span>
            <div>
              <h4>Recycling Facility</h4>
              <p>The PUREX process recovers 90% of spent fuel as fresh reactor material</p>
            </div>
          </div>

          <div className="nwa-recycling-zone">
            {!caskAtRecycling && (
              <div className="nwa-recycling-idle">
                <span>🏭</span>
                <p>Awaiting cask delivery…</p>
              </div>
            )}

            {caskAtRecycling && (
              <motion.div className="nwa-facility" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="nwa-pipeline">

                  <div className="nwa-pipe-stage">
                    <div className="nwa-pipe-icon">🏭</div>
                    <div className="nwa-pipe-name">Delivered</div>
                    <motion.div className="nwa-pipe-check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>✓</motion.div>
                  </div>

                  <div className="nwa-pipe-arrow">→</div>

                  <div className="nwa-pipe-stage">
                    <AnimatePresence>
                      {rodInBath ? (
                        <motion.div
                          key="bath"
                          className="nwa-bath"
                          initial={{ scale: 0.7, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', bounce: 0.3 }}
                        >
                          <div className="nwa-bath-liquid">
                            <motion.div
                              className="nwa-bath-rod"
                              initial={{ y: -30 }}
                              animate={{ y: 10, opacity: [1, 1, 0.4, 0] }}
                              transition={{ duration: 1.5, delay: 0.4 }}
                            />
                            {[0,1,2,3].map(i => (
                              <motion.div key={i} className="nwa-bath-bub"
                                initial={{ bottom: '6%', opacity: 0.8 }}
                                animate={{ bottom: '92%', opacity: 0 }}
                                transition={{ duration: 0.9 + i * 0.2, repeat: Infinity, delay: i * 0.3 }}
                                style={{ left: `${18 + i * 20}%` }}
                              />
                            ))}
                          </div>
                          <span className="nwa-bath-label">PUREX</span>
                        </motion.div>
                      ) : (
                        <div key="ph" className="nwa-pipe-placeholder">⚗️</div>
                      )}
                    </AnimatePresence>
                    <div className="nwa-pipe-name">Chemical Bath</div>
                  </div>

                  <div className="nwa-pipe-arrow">→</div>

                  <div className="nwa-pipe-stage nwa-sep-stage">
                    {showSeparation ? (
                      <motion.div className="nwa-separation" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <motion.div className="nwa-sep-item" initial={{ x: -18, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                          <div className="nwa-sep-block nwa-sep-red"><span>☢</span></div>
                          <div className="nwa-sep-bar nwa-bar-red" />
                          <span className="nwa-sep-pct">10%</span>
                          <span className="nwa-sep-desc">Waste → Glass</span>
                        </motion.div>
                        <motion.div className="nwa-sep-item" initial={{ x: 18, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                          <div className="nwa-sep-block nwa-sep-blue"><span>⚡</span></div>
                          <div className="nwa-sep-bar nwa-bar-blue" />
                          <span className="nwa-sep-pct">90%</span>
                          <span className="nwa-sep-desc">Fresh Fuel</span>
                        </motion.div>
                      </motion.div>
                    ) : (
                      <div className="nwa-pipe-placeholder">⚖️</div>
                    )}
                    <div className="nwa-pipe-name">Separation</div>
                  </div>
                </div>

                {showConveyor && (
                  <motion.div className="nwa-conveyor" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="nwa-conveyor-track">
                      <motion.div className="nwa-pkg"
                        initial={{ left: '5%' }}
                        animate={{ left: '88%' }}
                        transition={{ duration: 2.5, ease: 'linear' }}
                      >⚡</motion.div>
                    </div>
                    <span className="nwa-conveyor-label">♻ Recycled fuel returned to the reactor</span>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NuclearWasteAnimation;
