import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import './HalfLifeDecay.css';

/* ──────────────────────────────────────────────
   Reference isotopes for the log timeline.
   Times converted to seconds for log placement.
─────────────────────────────────────────────── */
const ISOTOPES = [
  { label: 'I-131',  use: 'medical (thyroid)',   tHalf: 8 * 86400,                          color: '#34d399' },
  { label: 'Cs-137', use: 'spent fuel',          tHalf: 30.17 * 365.25 * 86400,             color: '#fbbf24' },
  { label: 'U-238',  use: 'natural uranium',     tHalf: 4.468e9 * 365.25 * 86400,           color: '#a855f7' },
];

const TIMELINE_MIN = 1;            // 1 s
const TIMELINE_MAX = 1.6e17;       // ~5 Gy
const logScale = (t) => {
  const lo = Math.log10(TIMELINE_MIN);
  const hi = Math.log10(TIMELINE_MAX);
  return ((Math.log10(t) - lo) / (hi - lo)) * 100; // 0–100 %
};

const formatHumanTime = (s) => {
  if (s < 60)             return `${s.toFixed(0)} s`;
  if (s < 3600)           return `${(s / 60).toFixed(1)} min`;
  if (s < 86400)          return `${(s / 3600).toFixed(1)} h`;
  if (s < 365.25 * 86400) return `${(s / 86400).toFixed(1)} d`;
  const y = s / (365.25 * 86400);
  if (y < 1e3)            return `${y.toFixed(1)} y`;
  if (y < 1e6)            return `${(y / 1e3).toFixed(1)} ky`;
  if (y < 1e9)            return `${(y / 1e6).toFixed(1)} My`;
  return `${(y / 1e9).toFixed(2)} Gy`;
};

const N0 = 100;

const HalfLifeDecay = () => {
  const [tHalf, setTHalf] = useState(4);             // seconds, slider value
  const [alive, setAlive] = useState(() => Array.from({ length: N0 }, () => true));
  const [elapsed, setElapsed] = useState(0);          // seconds since start of run
  const [running, setRunning] = useState(true);

  const startRef = useRef(performance.now());
  const lastRef  = useRef(performance.now());
  const rafRef   = useRef(null);

  // Reset whenever T½ changes — gives an immediately legible new curve.
  useEffect(() => {
    setAlive(Array.from({ length: N0 }, () => true));
    setElapsed(0);
    startRef.current = performance.now();
    lastRef.current  = performance.now();
  }, [tHalf]);

  useEffect(() => {
    if (!running) return;
    const tick = (now) => {
      const dt = (now - lastRef.current) / 1000;     // seconds since last tick
      lastRef.current = now;
      setElapsed((now - startRef.current) / 1000);

      // Per-nucleus decay probability over interval dt:
      //   p = 1 − (½)^(dt / T½)        (Poisson-style, exact for constant λ)
      const pDecay = 1 - Math.pow(0.5, dt / tHalf);

      setAlive(prev => {
        let any = false;
        const next = prev.map(a => {
          if (!a) return false;
          if (Math.random() < pDecay) return false;
          any = true;
          return true;
        });
        if (!any) setRunning(false);
        return next;
      });

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, tHalf]);

  const handleReset = () => {
    setAlive(Array.from({ length: N0 }, () => true));
    setElapsed(0);
    startRef.current = performance.now();
    lastRef.current  = performance.now();
    setRunning(true);
  };

  // Stable grid layout for the 100 nuclei (10 × 10).
  const dots = useMemo(() => {
    const arr = [];
    for (let i = 0; i < N0; i++) {
      arr.push({ id: i, col: i % 10, row: Math.floor(i / 10) });
    }
    return arr;
  }, []);

  const remaining = alive.filter(Boolean).length;
  const expected  = N0 * Math.pow(0.5, elapsed / tHalf);

  return (
    <div className="hld-wrap" role="group" aria-label="Half-life decay simulator">
      <div className="hld-header">
        <h4 className="hld-title">Spontaneous decay simulator</h4>
        <p className="hld-sub">
          Each glowing dot is one nucleus. Every frame, each surviving nucleus
          flips a weighted coin: probability&nbsp;
          <code>p&nbsp;=&nbsp;1&nbsp;−&nbsp;(½)<sup>Δt/T½</sup></code> of decaying.
        </p>
      </div>

      {/* Live counters */}
      <div className="hld-stats">
        <div className="hld-stat">
          <span className="hld-stat-label">Surviving</span>
          <span className="hld-stat-value hld-stat-value--alive">{remaining}</span>
        </div>
        <div className="hld-stat">
          <span className="hld-stat-label">Predicted N(t)</span>
          <span className="hld-stat-value">{expected.toFixed(1)}</span>
        </div>
        <div className="hld-stat">
          <span className="hld-stat-label">Elapsed</span>
          <span className="hld-stat-value">{elapsed.toFixed(1)}&nbsp;s</span>
        </div>
        <div className="hld-stat">
          <span className="hld-stat-label">Half-lives</span>
          <span className="hld-stat-value">{(elapsed / tHalf).toFixed(2)}</span>
        </div>
      </div>

      <div className="hld-formula">
        N(t) = N₀ · (½)<sup>t / T½</sup> = {N0} · (½)<sup>{(elapsed / tHalf).toFixed(2)}</sup> ≈ {expected.toFixed(1)}
      </div>

      {/* Dot grid */}
      <div className="hld-grid" aria-hidden="true">
        {dots.map(d => (
          <motion.div
            key={d.id}
            className={`hld-dot ${alive[d.id] ? 'hld-dot--alive' : 'hld-dot--decayed'}`}
            animate={
              alive[d.id]
                ? { scale: [1, 1.12, 1], opacity: 1 }
                : { scale: 0.55, opacity: 0.18 }
            }
            transition={
              alive[d.id]
                ? { duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: (d.id % 7) * 0.08 }
                : { duration: 0.6, ease: 'easeOut' }
            }
          />
        ))}
      </div>

      {/* Controls */}
      <div className="hld-controls">
        <label className="hld-slider-label">
          Half-life&nbsp;T½ <strong>{tHalf.toFixed(1)}&nbsp;s</strong>
          <input
            type="range"
            min="1" max="10" step="0.5"
            value={tHalf}
            onChange={(e) => setTHalf(Number(e.target.value))}
            className="hld-slider"
            aria-label="Half-life in seconds"
          />
        </label>
        <button className="hld-reset" onClick={handleReset}>↻ Restart sample</button>
      </div>

      {/* Logarithmic isotope timeline */}
      <div className="hld-timeline" role="img" aria-label="Logarithmic timeline of real isotope half-lives from 1 second to 5 billion years">
        <div className="hld-timeline-title">Real isotope half-lives (logarithmic)</div>
        <div className="hld-timeline-track">
          {/* Decade ticks: 1s, 1min(60), 1h(3600), 1d(86400), 1y, 1ky, 1My, 1Gy */}
          {[
            { t: 1,                                  label: '1 s' },
            { t: 60,                                 label: '1 min' },
            { t: 3600,                               label: '1 h' },
            { t: 86400,                              label: '1 d' },
            { t: 365.25 * 86400,                     label: '1 y' },
            { t: 1e3 * 365.25 * 86400,               label: '1 ky' },
            { t: 1e6 * 365.25 * 86400,               label: '1 My' },
            { t: 1e9 * 365.25 * 86400,               label: '1 Gy' },
          ].map((tick, i) => (
            <div key={i} className="hld-tick" style={{ left: `${logScale(tick.t)}%` }}>
              <div className="hld-tick-mark" />
              <div className="hld-tick-label">{tick.label}</div>
            </div>
          ))}

          {/* Isotope markers */}
          {ISOTOPES.map(iso => (
            <div
              key={iso.label}
              className="hld-iso"
              style={{ left: `${logScale(iso.tHalf)}%`, '--iso-color': iso.color }}
              title={`${iso.label} — ${iso.use} — T½ ≈ ${formatHumanTime(iso.tHalf)}`}
            >
              <div className="hld-iso-pin" />
              <div className="hld-iso-label">
                <strong>{iso.label}</strong>
                <span>{formatHumanTime(iso.tHalf)}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="hld-timeline-note">
          The same exponential law spans 17 orders of magnitude — from medical
          tracers that vanish in days to natural uranium older than the Earth.
        </p>
      </div>
    </div>
  );
};

export default HalfLifeDecay;
