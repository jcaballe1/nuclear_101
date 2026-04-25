import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import './ReactorAnimation.css';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const lerp   = (a, b, t) => a + (b - a) * t;
const clamp  = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* A single animated dash-offset pipe segment  */
function FlowPipe({ d, stroke, strokeWidth = 16, dashLen = 18, gapLen = 20, duration, opacity = 1, sheen = false }) {
  const dashArray = `${dashLen} ${gapLen}`;
  return (
    <g>
      {/* Shadow */}
      <path d={d} stroke="#000" strokeWidth={strokeWidth + 4} fill="none" strokeLinecap="round" opacity={0.35} />
      {/* Base colour */}
      <path d={d} stroke={stroke} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" opacity={opacity} />
      {/* Animated flow dashes */}
      <motion.path
        d={d}
        stroke="#fff"
        strokeWidth={strokeWidth * 0.32}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={dashArray}
        animate={{ strokeDashoffset: [0, -(dashLen + gapLen)] }}
        transition={{ duration, repeat: Infinity, ease: 'linear' }}
        opacity={0.45}
      />
      {/* Sheen highlight */}
      {sheen && (
        <path d={d} stroke="#fff" strokeWidth={strokeWidth * 0.15} fill="none" strokeLinecap="round" opacity={0.18} />
      )}
    </g>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const ReactorAnimation = ({ power, onPowerChange, reactorType = 'PWR' }) => {
  /* Reactor-type flags */
  const isPWR = reactorType === 'PWR';
  const isBWR = reactorType === 'BWR';
  const isSMR = reactorType === 'SMR';
  // PWR & SMR share the primary-loop architecture (closed loop with steam
  // generator); BWR has no separate primary loop — steam is generated in the
  // reactor vessel itself and flows directly to the turbine.
  const hasPrimaryLoop = isPWR || isSMR;

  /* Derived animation values */
  const p          = clamp(power / 100, 0, 1);          // 0-1 fraction
  const steamSpeed = lerp(3.5, 0.55, p);                // lower = faster dash cycle
  const waterSpeed = lerp(5.0, 0.9,  p);
  const spentSpeed = lerp(4.5, 0.75, p);
  const turbineRpm = lerp(0,   1,    p);                 // 0-1 mapped to spin duration
  const spinDur    = p < 0.02 ? 9999 : lerp(8, 0.45, p);
  const coreGlow   = lerp(0.08, 0.9, p);
  const outputFlash= lerp(0.1, 1.0, p);
  const pipeAlpha  = clamp(p * 1.4, 0, 1);

  /* Vapor puffs (tower & core) using timestamps for unique keys */
  const [steamPuffs, setSteamPuffs] = useState([]);
  const [towerVapor, setTowerVapor] = useState([]);

  useEffect(() => {
    if (power < 2) { setSteamPuffs([]); setTowerVapor([]); return; }
    const interval = Math.max(80, 450 - power * 3.8);
    const si = setInterval(() => {
      setSteamPuffs(prev => [...prev.slice(-12), { id: Date.now() + Math.random(), x: -175 + Math.random() * 50 }]);
    }, interval);
    const vi = setInterval(() => {
      setTowerVapor(prev => [...prev.slice(-10), { id: Date.now() + Math.random(), x: 278 + Math.random() * 44 }]);
    }, interval * 1.4);
    return () => { clearInterval(si); clearInterval(vi); };
  }, [power]);

  return (
    <div className="ra-wrap">
      {/* ── SVG Diagram ───────────────────────── */}
      <svg
        viewBox="-300 -400 1000 740"
        preserveAspectRatio="xMidYMid meet"
        className="ra-svg"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Nuclear reactor schematic for ${reactorType}`}
      >
        <title>Schematic diagram of a {reactorType} nuclear reactor power plant</title>
        <defs>
          {/* Glow filters */}
          <filter id="ra-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="ra-glow-sm" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="ra-glow-lg" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="14" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* Gradients */}
          <radialGradient id="ra-core" cx="50%" cy="50%" r="55%">
            <stop offset="0%"   stopColor="#fff7ed"/>
            <stop offset="40%"  stopColor="#f59e0b"/>
            <stop offset="100%" stopColor="#92400e"/>
          </radialGradient>
          <linearGradient id="ra-vessel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#1e293b"/>
            <stop offset="22%"  stopColor="#475569"/>
            <stop offset="78%"  stopColor="#475569"/>
            <stop offset="100%" stopColor="#1e293b"/>
          </linearGradient>
          <linearGradient id="ra-turbine-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#374151"/>
            <stop offset="50%"  stopColor="#4b5d70"/>
            <stop offset="100%" stopColor="#1f2937"/>
          </linearGradient>
          <linearGradient id="ra-gen-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#1e3a8a"/>
            <stop offset="100%" stopColor="#1d4ed8"/>
          </linearGradient>
          <linearGradient id="ra-tower-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#164e63"/>
            <stop offset="100%" stopColor="#0c3d50"/>
          </linearGradient>
          <radialGradient id="ra-bg" cx="38%" cy="38%" r="72%">
            <stop offset="0%"   stopColor="#1a2744"/>
            <stop offset="100%" stopColor="#060c18"/>
          </radialGradient>
        </defs>

        {/* ── Background ─────────────────────── */}
        <rect x="-300" y="-400" width="1000" height="740" fill="url(#ra-bg)" rx="14"/>
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`vg${i}`} x1={-300 + i * 100} y1="-400" x2={-300 + i * 100} y2="340"
            stroke="#fff" strokeWidth="0.5" opacity="0.025"/>
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`hg${i}`} x1="-300" y1={-400 + i * 105} x2="700" y2={-400 + i * 105}
            stroke="#fff" strokeWidth="0.5" opacity="0.025"/>
        ))}

        {/* ── REACTOR VESSEL ─────────────────── */}
        <rect x="-240" y="-130" width="180" height="260" rx="22"
          fill="url(#ra-vessel)" stroke="#5a6a80" strokeWidth="2.5"/>
        <rect x="-256" y="-148" width="212" height="24" rx="8"
          fill="#283347" stroke="#5a6a80" strokeWidth="1.5"/>
        <rect x="-256" y="124" width="212" height="24" rx="8"
          fill="#283347" stroke="#5a6a80" strokeWidth="1.5"/>
        {[-95, -50, -5, 40, 85].map((y, i) => (
          <React.Fragment key={`bolt-${i}`}>
            <circle cx="-243" cy={y} r="4" fill="#2d3d52" stroke="#4a5e78" strokeWidth="1"/>
            <circle cx="-57"  cy={y} r="4" fill="#2d3d52" stroke="#4a5e78" strokeWidth="1"/>
          </React.Fragment>
        ))}

        {/* Core glow halo */}
        <motion.rect
          x="-220" y="-88" width="140" height="176" rx="10"
          fill="#f59e0b"
          animate={{ opacity: [coreGlow * 0.55, coreGlow, coreGlow * 0.55] }}
          transition={{ duration: 2.5 - p * 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: 'url(#ra-glow-lg)' }}
        />
        {/* Core body */}
        <rect x="-220" y="-88" width="140" height="176" rx="10" fill="url(#ra-core)"
          opacity={0.5 + p * 0.4}/>

        {/* Fuel rods */}
        {[-48, -24, 0, 24, 48].map((ox, i) => (
          <motion.rect key={`fuel-${i}`}
            x={-153 + ox} y="-83" width="11" height="166" rx="4"
            fill={p > 0.02 ? '#fbbf24' : '#78350f'}
            animate={{ opacity: p > 0.02 ? [0.35, 0.85, 0.35] : 0.25 }}
            transition={{ duration: 1.6 - p * 0.8, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
          />
        ))}

        {/* Control rods – fully lowered when power=0, retracted when high */}
        {[-48, -24, 0, 24, 48].map((ox, i) => (
          <motion.rect key={`crod-${i}`}
            x={-151 + ox} width="10" rx="3"
            fill="#0d1520" stroke="#2d3d52" strokeWidth="1"
            animate={{
              y: p < 0.02 ? -83 : -148,
              height: p < 0.02 ? 170 : 58,
            }}
            transition={{ duration: 0.65, delay: i * 0.06, ease: 'easeInOut' }}
          />
        ))}
        <rect x="-266" y="-164" width="232" height="14" rx="4"
          fill="#1a2433" stroke="#3a4d63" strokeWidth="1"/>
        {[-48, -24, 0, 24, 48].map((ox, i) => (
          <rect key={`rh-${i}`} x={-158 + ox} y="-168" width="15" height="10" rx="3"
            fill="#283347" stroke="#4a5e78" strokeWidth="1"/>
        ))}

        {/* Reactor label */}
        <text x="-150" y="170" fontSize="12" fill="#94a3b8" textAnchor="middle"
          fontWeight="700" letterSpacing="2">REACTOR CORE</text>

        {/* Internal heat puffs */}
        {steamPuffs.map(pp => (
          <motion.circle key={pp.id} cx={pp.x} cy={-65} r={6 + p * 4}
            fill="#fcd34d" fillOpacity={0.6 + p * 0.3}
            style={{ filter: 'url(#ra-glow-sm)' }}
            initial={{ y: 0, opacity: 0.7, scale: 0.6 }}
            animate={{ y: -145, opacity: 0, scale: 2 + p }}
            transition={{ duration: 1.6 - p * 0.6, ease: 'easeOut' }}
          />
        ))}

        {/* ── PRIMARY LOOP (orange = pressurised hot water) ─
            Reactor → Pressuriser tee → Steam Generator → Primary Pump → Reactor.
            Closed; never leaves containment. PWR & SMR only.
        ────────────────────────────────────────────────────── */}
        {hasPrimaryLoop && (<>
        {/* Hot leg: reactor top → SG primary inlet (top-left) */}
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M -60 -96 L -60 -240 L 35 -240 L 35 -200"
            stroke="#c2410c"
            strokeWidth={16}
            dashLen={18} gapLen={18}
            duration={steamSpeed}
            sheen
          />
        </g>
        {/* Cold leg: SG primary outlet (bottom) → Primary Pump → reactor bottom */}
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M 65 100 L 65 130 L -60 130 L -60 96"
            stroke="#b91c1c"
            strokeWidth={16}
            dashLen={18} gapLen={18}
            duration={waterSpeed * 0.85}
          />
        </g>
        </>)}

        {/* Pressuriser surge line (tee onto hot leg) — PWR only (SMR is integral) */}
        {isPWR && (<>
        <line x1="5" y1="-240" x2="5" y2="-210"
          stroke="#000" strokeWidth="12" opacity={pipeAlpha * 0.4} strokeLinecap="round"/>
        <line x1="5" y1="-240" x2="5" y2="-210"
          stroke="#c2410c" strokeWidth="7" opacity={pipeAlpha * 0.9} strokeLinecap="round"/>

        {/* Pressuriser vessel */}
        <g opacity={0.4 + p * 0.55}>
          <rect x="-15" y="-280" width="40" height="70" rx="8"
            fill="#475569" stroke="#94a3b8" strokeWidth="2"/>
          <ellipse cx="5" cy="-280" rx="20" ry="6"
            fill="#64748b" stroke="#94a3b8" strokeWidth="1.5"/>
          <motion.rect x="-12" y="-258" width="34" height="44" rx="4"
            fill="#fb923c"
            animate={{ opacity: [0.3, 0.55 + p * 0.2, 0.3] }}
            transition={{ duration: 2.4 - p * 1.2, repeat: Infinity }}
          />
          <text x="5" y="-292" fontSize="9" fill="#cbd5e1"
            textAnchor="middle" fontWeight="700" letterSpacing="1">PRESSURISER</text>
        </g>
        </>)}

        {/* Steam Generator (heat exchanger between primary & secondary) — PWR & SMR */}
        {hasPrimaryLoop && (
        <g opacity={0.5 + p * 0.5}>
          <rect x="20" y="-200" width="90" height="300" rx="22"
            fill="#3b4a5e" stroke="#94a3b8" strokeWidth="2"/>
          <ellipse cx="65" cy="-200" rx="45" ry="9"
            fill="#475569" stroke="#94a3b8" strokeWidth="1.5"/>
          <ellipse cx="65" cy="100" rx="45" ry="9"
            fill="#475569" stroke="#94a3b8" strokeWidth="1.5"/>
          {/* Tube bundle */}
          {[-120, -80, -40, 0, 40, 80].map((ty, i) => (
            <line key={`sgtb-${i}`} x1="32" y1={ty} x2="98" y2={ty}
              stroke="#1e293b" strokeWidth="1.5" opacity="0.6"/>
          ))}
          {/* Bubbles rising on the secondary side */}
          {p > 0.05 && [0, 1, 2].map(i => (
            <motion.circle key={`sgb-${i}`} cx={45 + i * 20} r={3 + p * 2}
              fill="#fef3c7" fillOpacity={0.7}
              animate={{ cy: [80, -190], opacity: [0.7, 0] }}
              transition={{ duration: 2.4 - p * 1.0, repeat: Infinity, delay: i * 0.6, ease: 'easeOut' }}
            />
          ))}
          <text x="65" y="122" fontSize="11" fill="#cbd5e1" textAnchor="middle"
            fontWeight="700" letterSpacing="1.2">STEAM GENERATOR</text>
        </g>
        )}

        {/* Primary circulation pump — PWR only (SMR uses natural circulation) */}
        {isPWR && (
        <g opacity={0.45 + p * 0.55}>
          <circle cx="20" cy="130" r="20"
            fill="#374151" stroke="#94a3b8" strokeWidth="2"/>
          <motion.g
            style={{ transformOrigin: '20px 130px' }}
            animate={{ rotate: p < 0.02 ? 0 : 360 }}
            transition={{ duration: lerp(6, 0.5, p), repeat: Infinity, ease: 'linear' }}
          >
            {[0, 60, 120, 180, 240, 300].map(deg => (
              <line key={`ppb-${deg}`}
                x1="20" y1="130"
                x2={20 + Math.cos(deg * Math.PI / 180) * 14}
                y2={130 + Math.sin(deg * Math.PI / 180) * 14}
                stroke="#fda4af" strokeWidth="2.5" strokeLinecap="round"/>
            ))}
          </motion.g>
          <circle cx="20" cy="130" r="4" fill="#94a3b8"/>
          <text x="20" y="168" fontSize="9" fill="#94a3b8" textAnchor="middle"
            fontWeight="700" letterSpacing="0.6">PRIMARY PUMP</text>
        </g>
        )}

        {/* ── SECONDARY LOOP — hot steam: SG → Turbine ── (PWR & SMR) */}
        {hasPrimaryLoop && (<>
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M 95 -200 L 95 -220 L 192 -220"
            stroke="#c2410c"
            strokeWidth={16}
            dashLen={20} gapLen={18}
            duration={steamSpeed}
            sheen
          />
        </g>
        <motion.text x="140" y="-232" fontSize="10" fill="#fb923c"
          textAnchor="middle" fontStyle="italic"
          animate={{ opacity: pipeAlpha * 0.85 }}>
          hot steam
        </motion.text>
        </>)}

        {/* ── BWR DIRECT-STEAM LOOP — reactor top → turbine ── */}
        {isBWR && (<>
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M -60 -96 L -60 -260 L 192 -260 L 192 -220"
            stroke="#c2410c"
            strokeWidth={16}
            dashLen={20} gapLen={18}
            duration={steamSpeed}
            sheen
          />
        </g>
        <motion.text x="66" y="-272" fontSize="10" fill="#fb923c"
          textAnchor="middle" fontStyle="italic"
          animate={{ opacity: pipeAlpha * 0.85 }}>
          direct steam (slightly radioactive)
        </motion.text>
        </>)}

        {/* ── TURBINE ───────────────────────────── */}
        <rect x="192" y="-285" width="160" height="130" rx="14"
          fill="url(#ra-turbine-grad)" stroke="#5a6a80" strokeWidth="2" opacity={0.3 + p * 0.7}/>
        <rect x="197" y="-280" width="150" height="6" rx="2"
          fill="#94a3b8" fillOpacity={0.28 * (0.3 + p * 0.7)}/>

        {/* Spinning blades */}
        <motion.g
          style={{ transformOrigin: '272px -220px' }}
          animate={{ rotate: p < 0.02 ? 0 : 360 }}
          transition={{ duration: spinDur, repeat: Infinity, ease: 'linear' }}
        >
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <line key={deg}
              x1="272" y1="-220"
              x2={272 + Math.cos((deg - 90) * Math.PI / 180) * 48}
              y2={-220 + Math.sin((deg - 90) * Math.PI / 180) * 48}
              stroke="#cbd5e1" strokeWidth={4 + p * 2} strokeLinecap="round"
              opacity={0.4 + p * 0.6}
            />
          ))}
        </motion.g>
        {/* Hub */}
        <circle cx="272" cy="-220" r="15" fill="#4b5563" stroke="#94a3b8" strokeWidth="2.5"
          opacity={0.3 + p * 0.7}/>
        <circle cx="272" cy="-220" r="6" fill="#94a3b8" opacity={0.3 + p * 0.7}/>
        <text x="272" y="-297" fontSize="12" fill="#94a3b8" textAnchor="middle"
          fontWeight="700" letterSpacing="1.5" opacity={0.3 + p * 0.7}>TURBINE</text>

        {/* ── SHAFT ─────────────────────────────── */}
        <rect x="352" y="-228" width="62" height="16" rx="5"
          fill="#3b4a5e" stroke="#5a6a80" strokeWidth="1.5" opacity={0.3 + p * 0.7}/>
        {[360, 382].map((sx, i) => (
          <rect key={`sc-${i}`} x={sx} y="-233" width="14" height="26" rx="4"
            fill="#283347" stroke="#5a6a80" strokeWidth="1" opacity={0.3 + p * 0.7}/>
        ))}
        {/* Spinning shaft indicator */}
        <motion.g
          style={{ transformOrigin: '383px -220px' }}
          animate={{ rotate: p < 0.02 ? 0 : 360 }}
          transition={{ duration: spinDur * 1.05, repeat: Infinity, ease: 'linear' }}
        >
          <line x1="383" y1="-231" x2="383" y2="-209"
            stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" opacity={0.5 + p * 0.5}/>
        </motion.g>

        {/* ── GENERATOR ─────────────────────────── */}
        <rect x="414" y="-285" width="148" height="130" rx="14"
          fill="url(#ra-gen-grad)" stroke="#3b82f6" strokeWidth="2"
          opacity={0.3 + p * 0.7}/>
        {/* Pulsing ring */}
        <motion.rect x="414" y="-285" width="148" height="130" rx="14"
          fill="none" stroke="#60a5fa"
          animate={{ strokeWidth: [2, 4 + p * 4, 2], strokeOpacity: [0.15, outputFlash * 0.9, 0.15] }}
          transition={{ duration: 1.8 - p * 1.0, repeat: Infinity }}
        />
        {/* HV Transmission Tower */}
        <motion.g
          transform="translate(488,-222)"
          animate={{ opacity: [outputFlash * 0.4, outputFlash, outputFlash * 0.4] }}
          transition={{ duration: 0.9 - p * 0.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: 'url(#ra-glow-sm)' }}
          opacity={0.3 + p * 0.7}
        >
          {/* Vertical mast */}
          <line x1="0" y1="-28" x2="0" y2="24" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Top crossarm */}
          <line x1="-22" y1="-18" x2="22" y2="-18" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Mid crossarm */}
          <line x1="-15" y1="-6" x2="15" y2="-6" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round"/>
          {/* A-frame base */}
          <line x1="-20" y1="24" x2="20" y2="24" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round"/>
          <line x1="-20" y1="24" x2="-6" y2="4" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round"/>
          <line x1="20" y1="24" x2="6" y2="4" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round"/>
          {/* Insulator caps */}
          <circle cx="-22" cy="-18" r="3" fill="#93c5fd" opacity="0.9"/>
          <circle cx="22" cy="-18" r="3" fill="#93c5fd" opacity="0.9"/>
          <circle cx="-15" cy="-6" r="2.5" fill="#93c5fd" opacity="0.8"/>
          <circle cx="15" cy="-6" r="2.5" fill="#93c5fd" opacity="0.8"/>
        </motion.g>
        <text x="488" y="-172" fontSize="12" fill="#93c5fd" textAnchor="middle"
          fontWeight="700" letterSpacing="1.5" opacity={0.3 + p * 0.7}>GENERATOR</text>

        {/* 2-metric power output panel above generator */}
        <rect x="415" y="-370" width="150" height="82" rx="6"
          fill="#0f172a" fillOpacity={0.9} stroke="#1e3a5f" strokeWidth="1"/>
        <text x="424" y="-355" fontSize="9" fill="#64748b" fontWeight="700" letterSpacing="1">THERMAL</text>
        <motion.text x="544" y="-355" fontSize="12" fill="#fcd34d" textAnchor="end"
          fontWeight="700"
          animate={{ opacity: 0.4 + p * 0.6 }}>
          {Math.round(power * 30)} MWt
        </motion.text>
        <line x1="415" y1="-344" x2="565" y2="-344" stroke="#1e3a5f" strokeWidth="1"/>
        <text x="424" y="-330" fontSize="9" fill="#64748b" fontWeight="700" letterSpacing="1">ELECTRICAL (×0.33)</text>
        <motion.text x="544" y="-315" fontSize="12" fill="#fef08a" textAnchor="end"
          fontWeight="700"
          style={{ filter: 'url(#ra-glow-sm)' }}
          animate={{ opacity: [outputFlash * 0.5, outputFlash, outputFlash * 0.5] }}
          transition={{ duration: 0.9 - p * 0.5, repeat: Infinity, ease: 'easeInOut' }}>
          {Math.round(power * 30 * 0.33)} MWe
        </motion.text>
        <line x1="415" y1="-305" x2="565" y2="-305" stroke="#1e3a5f" strokeWidth="1"/>
        <text x="420" y="-294" fontSize="8" fill="#475569" fontWeight="600">33% thermal efficiency · 220 kV AC</text>

        {/* ── POWER CABLES ─────────────────────── */}
        <g opacity={0.2 + p * 0.8}>
          {[-7, 0, 7].map((offset, i) => (
            <motion.path key={`hv-${i}`}
              d={`M 562 ${-225 + offset} L 615 ${-225 + offset}`}
              stroke="#fbbf24" strokeWidth="2.5" fill="none"
              strokeDasharray="8 5"
              style={{ filter: 'url(#ra-glow-sm)' }}
              animate={{ strokeDashoffset: p > 0.02 ? [-13, 0] : 0 }}
              transition={{ duration: 0.5 - p * 0.3, repeat: Infinity, ease: 'linear', delay: i * 0.06 }}
            />
          ))}
        </g>

        {/* ── CITY SILHOUETTE ────────────────────── */}
        <g opacity={0.3 + p * 0.7}>
          <rect x="615" y="-250" width="20" height="60"  rx="2" fill="#283347"/>
          <rect x="618" y="-263" width="14" height="17"  rx="2" fill="#2f3f56"/>
          <rect x="637" y="-236" width="17" height="46"  rx="2" fill="#283347"/>
          <rect x="640" y="-250" width="11" height="17"  rx="2" fill="#2f3f56"/>
          {[
            [617, -243], [624, -243], [617, -231], [624, -231],
            [639, -228], [639, -217],
          ].map(([wx, wy], i) => (
            <motion.rect key={`w${i}`} x={wx} y={wy} width="5" height="5"
              fill="#fef08a" rx="1"
              animate={{ opacity: [0.4 + p * 0.2, 0.7 + p * 0.3, 0.4 + p * 0.2] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
          <text x="634" y="-185" fontSize="11" fill="#64748b"
            textAnchor="middle" fontWeight="600">Power Grid</text>
        </g>

        {/* ── SECONDARY LOOP — spent steam: Turbine → Condenser ── */}
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M 270 -155 L 270 10"
            stroke="#7c3aed"
            strokeWidth={16}
            dashLen={16} gapLen={20}
            duration={spentSpeed}
          />
        </g>
        <motion.text x="310" y="-72" fontSize="10" fill="#c4b5fd"
          textAnchor="start" fontStyle="italic"
          animate={{ opacity: pipeAlpha * 0.85 }}>
          spent steam
        </motion.text>

        {/* ── CONDENSER (where steam gives up its latent heat) ── */}
        <g opacity={0.5 + p * 0.5}>
          <rect x="200" y="10" width="160" height="70" rx="14"
            fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2"/>
          {/* Tube bundle (tertiary water flows through these) */}
          {[28, 45, 62].map((ty, i) => (
            <line key={`cb-${i}`} x1="210" y1={ty} x2="350" y2={ty}
              stroke="#0c1a3a" strokeWidth="1.5" opacity="0.7"/>
          ))}
          {/* Condensation droplets */}
          {p > 0.05 && [0, 1, 2, 3].map(i => (
            <motion.circle key={`cd-${i}`} cx={225 + i * 32} r={2.5}
              fill="#bae6fd"
              animate={{ cy: [12, 78], opacity: [0.85, 0] }}
              transition={{ duration: 1.6 - p * 0.5, repeat: Infinity, delay: i * 0.4, ease: 'easeIn' }}
            />
          ))}
          <text x="280" y="100" fontSize="11" fill="#bae6fd" textAnchor="middle"
            fontWeight="700" letterSpacing="1.2">CONDENSER</text>
        </g>

        {/* ── SECONDARY LOOP — feedwater: Condenser → Feedwater Pump → SG ── (PWR & SMR) */}
        {hasPrimaryLoop && (
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M 200 50 L 110 50"
            stroke="#1d4ed8"
            strokeWidth={14}
            dashLen={16} gapLen={16}
            duration={waterSpeed}
            sheen
          />
        </g>
        )}
        {/* ── BWR feedwater: Condenser → Feedwater Pump → reactor bottom ── */}
        {isBWR && (
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M 200 50 L 155 50 L -30 50 L -30 96 L -60 96"
            stroke="#1d4ed8"
            strokeWidth={14}
            dashLen={16} gapLen={16}
            duration={waterSpeed}
            sheen
          />
        </g>
        )}
        {/* Feedwater pump */}
        <g opacity={0.5 + p * 0.5}>
          <circle cx="155" cy="50" r="16"
            fill="#1e40af" stroke="#60a5fa" strokeWidth="2"/>
          <motion.g
            style={{ transformOrigin: '155px 50px' }}
            animate={{ rotate: p < 0.02 ? 0 : -360 }}
            transition={{ duration: lerp(6, 0.5, p), repeat: Infinity, ease: 'linear' }}
          >
            {[0, 90, 180, 270].map(deg => (
              <line key={`fpb-${deg}`}
                x1="155" y1="50"
                x2={155 + Math.cos(deg * Math.PI / 180) * 11}
                y2={50 + Math.sin(deg * Math.PI / 180) * 11}
                stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round"/>
            ))}
          </motion.g>
          <text x="155" y="82" fontSize="9" fill="#93c5fd" textAnchor="middle"
            fontWeight="700" letterSpacing="0.6">FEEDWATER PUMP</text>
        </g>

        {/* ── COOLING TOWER (placed under the generator on the right) ─── */}
        <motion.path
          d="M 418 310 L 444 88 Q 480 132 516 88 L 542 310 Z"
          fill="url(#ra-tower-grad)" stroke="#0e7490" strokeWidth="2"
          animate={{ opacity: 0.35 + p * 0.6 }}/>
        <motion.ellipse cx="480" cy="88" rx="36" ry="9"
          fill="#0e7490" stroke="#22d3ee" strokeWidth="1"
          animate={{ opacity: 0.35 + p * 0.5 }}/>
        {/* Vapor puffs */}
        {towerVapor.map(v => (
          <motion.circle key={v.id} cx={v.x + 180} cy={88} r={8 + p * 5}
            fill="#bae6fd" fillOpacity={0.4 + p * 0.35}
            initial={{ y: 0, opacity: 0.6, scale: 1 }}
            animate={{ y: -160, opacity: 0, scale: 3 + p }}
            transition={{ duration: 2.8 - p * 0.8, ease: 'easeOut' }}
          />
        ))}
        <text x="480" y="280" fontSize="12" fill="#67e8f9" textAnchor="middle"
          fontWeight="600" letterSpacing="0.5" opacity={0.35 + p * 0.65}>
          COOLING TOWER
        </text>

        {/* ── TERTIARY LOOP — Condenser ↔ Cooling Tower ──
            Open loop: warm water leaves the condenser, sheds its heat
            to the atmosphere in the tower, then is pumped back. Never
            touches the radioactive primary water.
        ──────────────────────────────────────────────── */}
        {/* Warm water out (condenser top-right → over the top → tower top inlet) */}
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M 360 20 L 400 20 L 400 60 L 480 60 L 480 88"
            stroke="#0891b2"
            strokeWidth={14}
            dashLen={18} gapLen={16}
            duration={waterSpeed}
          />
        </g>
        {/* Cool water return (tower base → around the bottom → pump → condenser bottom) */}
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M 480 310 L 480 335 L 280 335 L 280 80"
            stroke="#1d4ed8"
            strokeWidth={14}
            dashLen={18} gapLen={16}
            duration={waterSpeed}
            sheen
          />
        </g>
        {/* Tertiary circulating pump (on the cool-return leg, beneath the condenser) */}
        <g opacity={0.5 + p * 0.5}>
          <circle cx="380" cy="335" r="12"
            fill="#1e40af" stroke="#60a5fa" strokeWidth="2"/>
          <motion.g
            style={{ transformOrigin: '380px 335px' }}
            animate={{ rotate: p < 0.02 ? 0 : 360 }}
            transition={{ duration: lerp(6, 0.5, p), repeat: Infinity, ease: 'linear' }}
          >
            {[0, 90, 180, 270].map(deg => (
              <line key={`tpb-${deg}`}
                x1="380" y1="335"
                x2={380 + Math.cos(deg * Math.PI / 180) * 8}
                y2={335 + Math.sin(deg * Math.PI / 180) * 8}
                stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round"/>
            ))}
          </motion.g>
        </g>

        {/* ── SMR INTEGRAL VESSEL OVERLAY + MODULAR BADGE ──
            SMRs house the steam generator (and pressuriser) inside a single
            compact pressure vessel. We draw a dashed cyan outline around the
            reactor + SG region to make the integration visually obvious.
        ─────────────────────────────────────────────────────────────── */}
        {isSMR && (
        <g>
          {/* Integral-vessel boundary */}
          <rect x="-265" y="-210" width="395" height="370" rx="32"
            fill="none" stroke="#22d3ee" strokeWidth="3"
            strokeDasharray="10 7" opacity="0.7"/>
          <rect x="-265" y="-232" width="165" height="22" rx="6"
            fill="#0e7490" stroke="#22d3ee" strokeWidth="1.2"/>
          <text x="-182" y="-217" fontSize="11" fill="#cffafe"
            textAnchor="middle" fontWeight="800" letterSpacing="1.4">
            INTEGRAL VESSEL
          </text>
          {/* MODULAR badge — single factory-built unit */}
          <g transform="translate(-70,-380)">
            <rect x="0" y="0" width="120" height="30" rx="6"
              fill="#7c2d12" stroke="#fb923c" strokeWidth="1.5"
              opacity="0.95"/>
            <text x="60" y="20" fontSize="13" fill="#fed7aa"
              textAnchor="middle" fontWeight="800" letterSpacing="1.8">
              ▦ MODULAR
            </text>
            <text x="60" y="45" fontSize="9" fill="#fdba74"
              textAnchor="middle" fontStyle="italic" letterSpacing="0.5">
              factory-built · ~50–300 MWe
            </text>
          </g>
        </g>
        )}

        {/* ── PIPE JOINT FLANGES ─────────────────── */}
        {/* Primary hot leg exiting reactor top */}
        <circle cx="-60" cy="-96" r="9" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5"
          opacity={pipeAlpha}/>
        {/* Primary cold leg entering reactor bottom */}
        <circle cx="-60" cy="96" r="9" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5"
          opacity={pipeAlpha}/>
        {/* Hot steam entering turbine */}
        <circle cx="192" cy="-220" r="9" fill="#475569" stroke="#64748b" strokeWidth="1.5"
          opacity={pipeAlpha}/>
        {/* Spent steam leaving turbine */}
        <circle cx="270" cy="-155" r="9" fill="#475569" stroke="#64748b" strokeWidth="1.5"
          opacity={pipeAlpha}/>
        {/* Spent steam entering condenser */}
        <circle cx="270" cy="10" r="7" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5"
          opacity={pipeAlpha}/>

        {/* ── IDLE PROMPT ────────────────────────── */}
        {power < 2 && (
          <g>
            <rect x="-280" y="288" width="240" height="36" rx="10"
              fill="#1e293b" fillOpacity="0.9" stroke="#334155" strokeWidth="1"/>
            <text x="-160" y="312" fontSize="13" fill="#94a3b8"
              textAnchor="middle" fontStyle="italic">
              Raise power to run the plant
            </text>
          </g>
        )}
      </svg>

      {/* ── POWER SLIDER ──────────────────────────── */}
      <div className="ra-slider-bar">
        <span className="ra-slider-label">Reactor Power</span>
        <div className="ra-slider-track">
          <input
            type="range"
            min="0" max="100"
            value={power}
            onChange={e => onPowerChange(Number(e.target.value))}
            className="ra-slider"
          />
          <div className="ra-slider-fill" style={{ width: `${power}%` }}/>
        </div>
        <motion.span
          className="ra-slider-pct"
          animate={{ color: power > 80 ? '#f97316' : power > 40 ? '#fbbf24' : '#60a5fa' }}
          transition={{ duration: 0.3 }}
        >
          {power}%
        </motion.span>
        <span className="ra-slider-mw">{Math.round(power * 12)} MW</span>
      </div>
    </div>
  );
};

export default ReactorAnimation;
