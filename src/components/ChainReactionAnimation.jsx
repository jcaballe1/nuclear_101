import React, { useEffect, useRef, useState } from 'react';
import './ChainReactionAnimation.css';

// Rods sit in mid-column gaps: atoms at x=-270,-180,-90,0,90,180,270
const ROD_X_POSITIONS = [-225, -45, 45, 225];
const COLS = 7;
const ROWS = 6;
const SPACING = 90;
const OFFSET_X = -270;  // col 0..6 → -270,-180,-90,0,90,180,270
const OFFSET_Y = -225;  // row 0..5 → -225,-135,-45,45,135,225

// Water molecule moderator dots: placed at midpoints between nucleus rows/cols
// x midpoints between 7 nucleus columns (spacing 90): -225,-135,-45,45,135,225
// y midpoints between 6 nucleus rows   (spacing 90): -180,-90,0,90,180
const WATER_MOL_X = [-225, -135, -45, 45, 135, 225];
const WATER_MOL_Y = [-180, -90, 0, 90, 180];
const WATER_POSITIONS = WATER_MOL_X.flatMap(x =>
  WATER_MOL_Y.map(y => ({ id: `wm-${x}-${y}`, x, y }))
); // 30 molecules
const WATER_SLOW_RADIUS = 20;   // px — neutron must be within this to be thermalised
const WATER_COOLDOWN_MS = 900;  // ms — one molecule can only slow one neutron per interval

const WOBBLE_MIN = 500;   // ms — delay before a hit nucleus actually splits
const WOBBLE_MAX = 700;

// Fissioned atoms regenerate as fresh U-235 after this delay so the demo is
// steady-state instead of running out of fuel in seconds.
const REGEN_MS = 3500;

// Temperature model:
//   targetTemp = (recent fissions/sec) * HEAT_PER_FISSION  -  BASE_COOLING
// Rods cool the reactor implicitly by absorbing neutrons (→ fewer fissions/sec).
// No separate rod-cooling term — cause flows correctly.
const HEAT_WINDOW_MS    = 1500;  // sliding window for fission-rate calculation
const HEAT_PER_FISSION  = 14;    // tunes how hot a single fission/sec runs
const BASE_COOLING      = 6;     // constant heat sink (coolant flow)

function randomWobble() {
  return WOBBLE_MIN + Math.random() * (WOBBLE_MAX - WOBBLE_MIN);
}

function makeNuclei() {
  const arr = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      arr.push({
        id: `nucleus-${row}-${col}`,
        x: OFFSET_X + col * SPACING,
        y: OFFSET_Y + row * SPACING,
        state: 'stable',       // 'stable' | 'wobbling' | 'fissioned'
        wobbleStart: 0,
        wobbleDelay: 0,
        pendingNeutrons: [],   // queued to spawn after wobble
      });
    }
  }
  return arr;
}

const ChainReactionAnimation = ({ reactionStarted, controlRodPosition, onTemperatureChange, temperature }) => {
  const nucleiRef      = useRef(makeNuclei());
  const neutronsRef    = useRef([]);
  const zapsRef        = useRef([]);
  const rafRef         = useRef(null);
  const rodPositionRef = useRef(controlRodPosition);
  // Map<waterMolId, timestamp> — tracks recently-slowed molecules to prevent
  // the same molecule from slowing multiple neutrons within WATER_COOLDOWN_MS
  const waterHitsRef   = useRef(new Map());
  // Rolling list of fission timestamps for rate-based heat calculation
  const fissionEventsRef = useRef([]);
  const [tick, setTick] = useState(0);

  useEffect(() => { rodPositionRef.current = controlRodPosition; }, [controlRodPosition]);

  useEffect(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

    if (!reactionStarted) {
      nucleiRef.current   = makeNuclei();
      neutronsRef.current = [];
      zapsRef.current     = [];
      fissionEventsRef.current = [];
      setTick(t => t + 1);
      return;
    }

    waterHitsRef.current.clear();
    fissionEventsRef.current = [];

    // seed neutron aimed at vertical mid-row
    neutronsRef.current = [{
      id: 'n-seed',
      x: -430,
      y: OFFSET_Y + Math.floor(ROWS / 2) * SPACING,
      vx: 10,
      vy: 0.25,
      thermalised: false,
      generation: 0,
    }];

    const loop = () => {
      const nuclei      = nucleiRef.current;
      const rodPosition = rodPositionRef.current;
      // rods slide from y=-280 downward (top of viewBox)
      const rodBottom = -280 + (rodPosition / 100) * 560;
      const now = Date.now();

      zapsRef.current = zapsRef.current.filter(z => now - z.time < 650);

      const survivors = [];
      const spawned   = [];

      // ── Move neutrons ─────────────────────────────────────────────────────
      for (let neutron of neutronsRef.current) {
        const nx = neutron.x + neutron.vx;
        const ny = neutron.y + neutron.vy;

        if (nx < -450 || nx > 450 || ny < -290 || ny > 290) continue;

        // rod absorption: ±20 px wide corridor (slightly wider for clear effect)
        let absorbed = false;
        for (const rodX of ROD_X_POSITIONS) {
          if (Math.abs(nx - rodX) < 20 && ny > -285 && ny < rodBottom) {
            absorbed = true;
            zapsRef.current.push({ id: `zap-${now}-${Math.random()}`, x: nx, y: ny, time: now });
            break;
          }
        }
        if (absorbed) continue;

        // nucleus collision (only 'stable' nuclei react)
        let hit = false;
        for (let i = 0; i < nuclei.length; i++) {
          const n = nuclei[i];
          if (n.state !== 'stable') continue;
          const dx = nx - n.x, dy = ny - n.y;
          if (dx * dx + dy * dy < 19 * 19) {
            // pre-compute pending neutrons; don't spawn yet — wobble first
            const numNew = 2 + (Math.random() < 0.4 ? 1 : 0); // avg 2.4
            const pending = [];
            for (let j = 0; j < numNew; j++) {
              const angle = (Math.PI * 2 / numNew) * j + (Math.random() - 0.5) * 0.7;
              const speed = 4 + Math.random() * 3.5;
              pending.push({
                id: `n-${now}-${i}-${j}-${Math.random()}`,
                x: n.x, y: n.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                thermalised: false,
                generation: Math.min((neutron.generation || 0) + 1, 4),
              });
            }
            nuclei[i] = { ...n, state: 'wobbling', wobbleStart: now, wobbleDelay: randomWobble(), pendingNeutrons: pending };
            hit = true;
            break;
          }
        }
        if (hit) continue;

        // ── Water molecule moderation: thermalise fast neutrons ──────────
        let slowed = neutron.thermalised || false;
        if (!slowed) {
          for (const wm of WATER_POSITIONS) {
            const dx = nx - wm.x, dy = ny - wm.y;
            if (dx * dx + dy * dy < WATER_SLOW_RADIUS * WATER_SLOW_RADIUS) {
              const lastHit = waterHitsRef.current.get(wm.id) || 0;
              if (now - lastHit > WATER_COOLDOWN_MS) {
                // slow by 40% and mark thermalised
                neutron = { ...neutron, vx: neutron.vx * 0.6, vy: neutron.vy * 0.6, thermalised: true };
                waterHitsRef.current.set(wm.id, now);
                slowed = true;
                break;
              }
            }
          }
        }

        survivors.push({ ...neutron, x: nx, y: ny });
      }

      // ── Wobble → Fission: release pending neutrons after delay ────────────
      for (let i = 0; i < nuclei.length; i++) {
        const n = nuclei[i];
        if (n.state === 'wobbling' && now - n.wobbleStart >= n.wobbleDelay) {
          spawned.push(...n.pendingNeutrons);
          fissionEventsRef.current.push(now);
          nuclei[i] = { ...n, state: 'fissioned', fissionTime: now, pendingNeutrons: [] };
        }
        // ── Regenerate fissioned atoms back to fresh U-235 ───────────────────
        else if (n.state === 'fissioned' && now - (n.fissionTime || 0) >= REGEN_MS) {
          nuclei[i] = { ...n, state: 'stable', fissionTime: 0, pendingNeutrons: [] };
        }
      }

      neutronsRef.current = [...survivors, ...spawned];
      nucleiRef.current   = [...nuclei];

      // ── Temperature / power ─────────────────────────────────────────────
      // Heat is driven by the *rate* of ongoing fissions, not by cumulative
      // count. Rods reduce the rate naturally by absorbing neutrons — no
      // separate cooling term is needed.
      fissionEventsRef.current = fissionEventsRef.current.filter(
        t => now - t < HEAT_WINDOW_MS
      );
      const fissionsPerSec = fissionEventsRef.current.length / (HEAT_WINDOW_MS / 1000);
      const targetTemp = Math.max(
        0,
        Math.min(100, fissionsPerSec * HEAT_PER_FISSION - BASE_COOLING)
      );

      onTemperatureChange(prev => {
        const diff = targetTemp - prev;
        // slow rise (observeable ramp); faster fall (responsive control)
        return prev + diff * (diff > 0 ? 0.004 : 0.015);
      });

      setTick(t => t + 1);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [reactionStarted, onTemperatureChange]);

  // ── Render ─────────────────────────────────────────────────────────────────
  const nuclei    = nucleiRef.current;
  const neutrons  = neutronsRef.current;
  const zaps      = zapsRef.current;
  const waterHits = waterHitsRef.current;
  // rods start at y=-280, height proportional to position
  const controlRodHeight  = (controlRodPosition / 100) * 560;
  const supercritical = (temperature || 0) > 66;
  const now = Date.now();

  const vib = (seed) => {
    // Continuous heat-driven vibration: amplitude scales with temperature
    // (quadratic so motion stays near-zero in the cool zone and ramps up
    // smoothly through critical/supercritical instead of snapping on at 66%).
    const t = Math.max(0, Math.min(1, (temperature || 0) / 100));
    const amp = 3.5 * t * t;
    if (amp < 0.05) return { dx: 0, dy: 0 };
    return {
      dx: Math.sin(tick * 0.55 + seed) * amp,
      dy: Math.cos(tick * 0.47 + seed) * amp,
    };
  };

  return (
    <div className={`chain-reaction-container${supercritical ? ' supercritical' : ''}`}>
      <svg
        className="chain-reaction-svg"
        viewBox="-420 -280 840 560"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Chain reaction core with control rods"
      >
        <title>Animation showing neutrons interacting with uranium nuclei in a reactor core</title>
        <defs>
          {/* Rod: metallic slate-grey gradient */}
          <linearGradient id="rodGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#1e293b" />
            <stop offset="45%"  stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <radialGradient id="nucleusGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#a855f7" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0"    />
          </radialGradient>
          <radialGradient id="wobbleGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#fbbf24" stopOpacity="0.9"  />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"    />
          </radialGradient>
          <filter id="glowSm">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="glowLg">
            <feGaussianBlur stdDeviation="5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* ── Water molecule moderator field (background layer) ── */}
        <g opacity={reactionStarted ? 1 : 0.45}>
          {WATER_POSITIONS.map(wm => {
            const hitAge = waterHits.has(wm.id) ? now - waterHits.get(wm.id) : Infinity;
            const isFlashing = hitAge < WATER_COOLDOWN_MS;
            const flashProgress = isFlashing ? Math.min(1, hitAge / WATER_COOLDOWN_MS) : 1;
            return (
              <circle
                key={wm.id}
                cx={wm.x} cy={wm.y} r={isFlashing ? 5 + (1 - flashProgress) * 3 : 5}
                fill={isFlashing ? `rgba(125,211,252,${0.75 - flashProgress * 0.55})` : 'rgba(125,211,252,0.18)'}
                stroke="rgba(56,189,248,0.4)" strokeWidth="0.8"
              />
            );
          })}
        </g>

        {/* ── Control Rods: slide between atom columns from top ── */}
        {ROD_X_POSITIONS.map((rodX, idx) => (
          <g key={`rod-${idx}`}>
            <rect
              x={rodX - 10} y={-280}
              width="20" height={Math.max(0, controlRodHeight)}
              fill="url(#rodGrad)" stroke="#94a3b8" strokeWidth="1.5" rx="3"
            />
            {/* hatching stripes */}
            {Array.from({ length: Math.max(0, Math.floor(controlRodHeight / 14)) }).map((_, k) => (
              <line key={k}
                x1={rodX - 9} y1={-280 + k * 14 + 7}
                x2={rodX + 9} y2={-280 + k * 14 + 7}
                stroke="#94a3b8" strokeWidth="0.8" opacity="0.4"
              />
            ))}
            {/* silver tip at bottom of rod */}
            {controlRodHeight > 6 && (
              <rect
                x={rodX - 9} y={-280 + controlRodHeight - 5}
                width="18" height="5"
                fill="#cbd5e1" rx="2"
              />
            )}
          </g>
        ))}

        {/* ── U-235 Nuclei ── */}
        {nuclei.map((nucleus, idx) => {
          if (nucleus.state === 'stable') {
            const { dx, dy } = vib(idx * 1.9);
            return (
              <g key={nucleus.id}>
                <circle cx={nucleus.x + dx} cy={nucleus.y + dy} r="22" fill="url(#nucleusGlow)" />
                <circle cx={nucleus.x + dx} cy={nucleus.y + dy} r="13"
                  fill="#7c3aed" stroke="#ddd6fe" strokeWidth="1.5"
                  filter="url(#glowSm)" />
              </g>
            );
          }

          if (nucleus.state === 'wobbling') {
            const progress = Math.min(1, (now - nucleus.wobbleStart) / nucleus.wobbleDelay);
            // fast oscillation: radius 13 ± 4, opacity 0.6–1
            const wr  = 13 + Math.sin(progress * Math.PI * 10) * 4;
            const gwr = 22 + Math.sin(progress * Math.PI * 10) * 8;
            const op  = 0.65 + Math.abs(Math.sin(progress * Math.PI * 14)) * 0.35;
            return (
              <g key={nucleus.id}>
                <circle cx={nucleus.x} cy={nucleus.y} r={gwr}
                  fill="url(#wobbleGlow)" opacity={op * 0.6} />
                <circle cx={nucleus.x} cy={nucleus.y} r={wr}
                  fill="#f59e0b" stroke="#fef3c7" strokeWidth="2"
                  filter="url(#glowLg)" opacity={op} />
              </g>
            );
          }

          if (nucleus.state === 'fissioned') {
            // Fade fragments out as the atom regenerates
            const age = (now - (nucleus.fissionTime || now)) / REGEN_MS;
            const fragOpacity = Math.max(0, 1 - age);
            const regenOpacity = Math.min(1, Math.max(0, (age - 0.7) / 0.3));
            return (
              <g key={nucleus.id}>
                <circle cx={nucleus.x - 10} cy={nucleus.y - 7} r="7"
                  fill="#3b82f6" filter="url(#glowSm)" opacity={fragOpacity} />
                <circle cx={nucleus.x + 10} cy={nucleus.y + 7} r="7"
                  fill="#ec4899" filter="url(#glowSm)" opacity={fragOpacity} />
                {/* fresh U-235 fading back in for the last 30% of the regen cycle */}
                {regenOpacity > 0 && (
                  <>
                    <circle cx={nucleus.x} cy={nucleus.y} r="22"
                      fill="url(#nucleusGlow)" opacity={regenOpacity} />
                    <circle cx={nucleus.x} cy={nucleus.y} r="13"
                      fill="#7c3aed" stroke="#ddd6fe" strokeWidth="1.5"
                      filter="url(#glowSm)" opacity={regenOpacity} />
                  </>
                )}
              </g>
            );
          }
          return null;
        })}

        {/* ── Neutrons: coloured by generation for lineage tracing ── */}
        {(() => {
          const GEN_COLORS = ['#fbbf24', '#fb923c', '#f87171', '#c084fc'];
          return neutrons.map(n => {
            const fill = GEN_COLORS[Math.min(n.generation || 0, GEN_COLORS.length - 1)];
            return (
              <circle key={n.id}
                cx={n.x} cy={n.y} r="6"
                fill={fill} stroke="rgba(255,255,255,0.55)" strokeWidth="1.5"
                filter="url(#glowSm)" />
            );
          });
        })()}

        {/* ── Rod absorption zap fizzle ── */}
        {zaps.map(zap => {
          const age = Math.min(1, (now - zap.time) / 650);
          const op  = 1 - age;
          const r   = age * 26;
          return (
            <g key={zap.id} opacity={op}>
              {[0, 1, 2, 3, 4, 5].map(i => {
                const angle = (Math.PI * 2 / 6) * i + 0.26;
                return (
                  <line key={i}
                    x1={zap.x} y1={zap.y}
                    x2={zap.x + Math.cos(angle) * r}
                    y2={zap.y + Math.sin(angle) * r}
                    stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round"
                  />
                );
              })}
              <circle cx={zap.x} cy={zap.y} r={r * 0.3 + 2} fill="#bfdbfe" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default ChainReactionAnimation;
