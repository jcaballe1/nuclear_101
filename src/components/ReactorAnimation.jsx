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

  /* Core heat puffs only — tower plume is fully CSS-animated, no interval needed */
  const [steamPuffs, setSteamPuffs] = useState([]);

  useEffect(() => {
    if (power < 2) { setSteamPuffs([]); return; }
    const interval = Math.max(80, 450 - power * 3.8);
    const si = setInterval(() => {
      setSteamPuffs(prev => [...prev.slice(-12), { id: Date.now() + Math.random(), x: -175 + Math.random() * 50 }]);
    }, interval);
    return () => { clearInterval(si); };
  }, [power]);

  return (
    <div className="ra-wrap">
      {/* ── SVG Diagram ───────────────────────── */}
      <svg
        viewBox="-300 -420 950 860"
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
          {/* Steam plume — one shared soft blur pass for all plume layers */}
          <filter id="ra-steam" x="-80%" y="-120%" width="260%" height="400%">
            <feGaussianBlur stdDeviation="7" result="b"/>
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
          <linearGradient id="ra-tower-body" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#7a9ab0"/>
            <stop offset="22%"  stopColor="#607a90"/>
            <stop offset="55%"  stopColor="#3f5368"/>
            <stop offset="82%"  stopColor="#27384c"/>
            <stop offset="100%" stopColor="#172030"/>
          </linearGradient>
          <linearGradient id="ra-tower-edge-shadow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#000" stopOpacity="0"/>
            <stop offset="55%"  stopColor="#000" stopOpacity="0"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0.45"/>
          </linearGradient>
          <linearGradient id="ra-tower-base-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#3a5060"/>
            <stop offset="100%" stopColor="#1c2c3c"/>
          </linearGradient>
          <linearGradient id="ra-tower-rim-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#1e3a4a"/>
            <stop offset="100%" stopColor="#0e2535"/>
          </linearGradient>
          <radialGradient id="ra-bg" cx="38%" cy="38%" r="72%">
            <stop offset="0%"   stopColor="#1a2744"/>
            <stop offset="100%" stopColor="#060c18"/>
          </radialGradient>
        </defs>

        {/* ── Background ─────────────────────── */}
        <rect x="-300" y="-420" width="950" height="860" fill="url(#ra-bg)" rx="14"/>
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`vg${i}`} x1={-300 + i * 86} y1="-420" x2={-300 + i * 86} y2="440"
            stroke="#fff" strokeWidth="0.5" opacity="0.025"/>
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={`hg${i}`} x1="-300" y1={-420 + i * 96} x2="650" y2={-420 + i * 96}
            stroke="#fff" strokeWidth="0.5" opacity="0.025"/>
        ))}

        {/* ── REACTOR VESSEL ─────────────────────────────────────────────── */}
        {/* Vessel spans y=-180 to y=160 (340 px); SG base also at y=140 → aligned */}
        <rect x="-240" y="-180" width="180" height="340" rx="22"
          fill="url(#ra-vessel)" stroke="#5a6a80" strokeWidth="2.5"/>
        <rect x="-256" y="-198" width="212" height="24" rx="8"
          fill="#283347" stroke="#5a6a80" strokeWidth="1.5"/>
        <rect x="-256" y="162" width="212" height="24" rx="8"
          fill="#283347" stroke="#5a6a80" strokeWidth="1.5"/>
        {[-130, -76, -22, 32, 86, 128].map((y, i) => (
          <React.Fragment key={`bolt-${i}`}>
            <circle cx="-243" cy={y} r="4" fill="#2d3d52" stroke="#4a5e78" strokeWidth="1"/>
            <circle cx="-57"  cy={y} r="4" fill="#2d3d52" stroke="#4a5e78" strokeWidth="1"/>
          </React.Fragment>
        ))}

        {/* Core glow halo */}
        <motion.rect
          x="-220" y="-130" width="140" height="250" rx="10"
          fill="#f59e0b"
          animate={{ opacity: [coreGlow * 0.55, coreGlow, coreGlow * 0.55] }}
          transition={{ duration: 2.5 - p * 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ filter: 'url(#ra-glow-lg)' }}
        />
        {/* Core body */}
        <rect x="-220" y="-130" width="140" height="250" rx="10" fill="url(#ra-core)"
          opacity={0.5 + p * 0.4}/>

        {/* Fuel rods — span core height */}
        {[-48, -24, 0, 24, 48].map((ox, i) => (
          <motion.rect key={`fuel-${i}`}
            x={-153 + ox} y="-124" width="11" height="238" rx="4"
            fill={p > 0.02 ? '#fbbf24' : '#78350f'}
            animate={{ opacity: p > 0.02 ? [0.35, 0.85, 0.35] : 0.25 }}
            transition={{ duration: 1.6 - p * 0.8, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
          />
        ))}

        {/* Control rods — fully inserted at p=0, mostly withdrawn at p=1 */}
        {[-48, -24, 0, 24, 48].map((ox, i) => (
          <motion.rect key={`crod-${i}`}
            x={-151 + ox} width="10" rx="3"
            fill="#0d1520" stroke="#2d3d52" strokeWidth="1"
            animate={{
              y:      lerp(-124, -198, p),
              height: lerp(238,   62, p),
            }}
            transition={{ duration: 0.45, delay: i * 0.04, ease: 'easeOut' }}
          />
        ))}
        {/* Control rod drive mechanism — top guide bar + rod heads */}
        <rect x="-266" y="-214" width="232" height="14" rx="4"
          fill="#1a2433" stroke="#3a4d63" strokeWidth="1"/>
        {[-48, -24, 0, 24, 48].map((ox, i) => (
          <rect key={`rh-${i}`} x={-158 + ox} y="-218" width="15" height="10" rx="3"
            fill="#283347" stroke="#4a5e78" strokeWidth="1"/>
        ))}

        {/* Reactor label */}
        <text x="-150" y="208" fontSize="12" fill="#94a3b8" textAnchor="middle"
          fontWeight="700" letterSpacing="2">REACTOR CORE</text>

        {/* Internal heat puffs */}
        {steamPuffs.map(pp => (
          <motion.circle key={pp.id} cx={pp.x} cy={-90} r={6 + p * 4}
            fill="#fcd34d" fillOpacity={0.6 + p * 0.3}
            style={{ filter: 'url(#ra-glow-sm)' }}
            initial={{ y: 0, opacity: 0.7, scale: 0.6 }}
            animate={{ y: -180, opacity: 0, scale: 2 + p }}
            transition={{ duration: 1.6 - p * 0.6, ease: 'easeOut' }}
          />
        ))}

        {/* ── PRIMARY LOOP (orange = pressurised hot water) ─
            Reactor → Pressuriser tee → Steam Generator → Primary Pump → Reactor.
            Closed; never leaves containment. PWR & SMR only.
        ────────────────────────────────────────────────────── */}
        {hasPrimaryLoop && (<>
        {/* Hot leg: reactor top → SG primary inlet */}
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M -60 -180 L -60 -280 L 65 -280 L 65 -200"
            stroke="#c2410c" strokeWidth={16} dashLen={18} gapLen={18}
            duration={steamSpeed} sheen
          />
        </g>
        {/* Cold leg: SG bottom → Primary Pump → reactor bottom */}
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M 65 140 L 65 200 L -62 200 L -62 162"
            stroke="#b91c1c" strokeWidth={16} dashLen={18} gapLen={18}
            duration={waterSpeed * 0.85}
          />
        </g>
        </>)}

        {/* Pressuriser surge line — tee onto hot leg at y=-280 */}
        {isPWR && (<>
        <line x1="5" y1="-280" x2="5" y2="-240"
          stroke="#000" strokeWidth="12" opacity={pipeAlpha * 0.4} strokeLinecap="round"/>
        <line x1="5" y1="-280" x2="5" y2="-240"
          stroke="#c2410c" strokeWidth="7" opacity={pipeAlpha * 0.9} strokeLinecap="round"/>

        {/* Pressuriser vessel — enlarged 55×95 for visual weight */}
        <g opacity={0.4 + p * 0.55}>
          <rect x="-22" y="-380" width="54" height="100" rx="10"
            fill="#475569" stroke="#94a3b8" strokeWidth="2"/>
          <ellipse cx="5" cy="-380" rx="27" ry="7"
            fill="#64748b" stroke="#94a3b8" strokeWidth="1.5"/>
          <ellipse cx="5" cy="-280" rx="27" ry="7"
            fill="#64748b" stroke="#94a3b8" strokeWidth="1.5"/>
          <motion.rect x="-18" y="-358" width="46" height="70" rx="5"
            fill="#fb923c"
            animate={{ opacity: [0.3, 0.55 + p * 0.2, 0.3] }}
            transition={{ duration: 2.4 - p * 1.2, repeat: Infinity }}
          />
          {/* Electric immersion heaters */}
          <g>
            <rect x="-14" y="-296" width="38" height="2" rx="1" fill="#475569"/>
            {[-8, 1, 10].map((hx, i) => (
              <motion.rect key={`heater-${i}`}
                x={hx} y="-306" width="3" height="12" rx="1.2"
                animate={p > 0 ? {
                  fill: ['#7c2d12', '#f97316', '#fb7185', '#f97316', '#7c2d12'],
                } : { fill: '#7c2d12' }}
                transition={p > 0 ? {
                  duration: 1.6 - p * 0.9, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut',
                } : { duration: 0 }}
                style={p > 0 ? { filter: 'url(#ra-glow-sm)' } : undefined}
              />
            ))}
          </g>
          <text x="5" y="-392" fontSize="9" fill="#cbd5e1"
            textAnchor="middle" fontWeight="700" letterSpacing="1">PRESSURISER</text>
        </g>
        </>)}

        {/* Steam Generator — y=-200 to y=140 (h=340 matches reactor extent) */}
        {hasPrimaryLoop && (
        <g opacity={0.5 + p * 0.5}>
          <rect x="15" y="-200" width="100" height="340" rx="22"
            fill="#3b4a5e" stroke="#94a3b8" strokeWidth="2"/>
          <ellipse cx="65" cy="-200" rx="50" ry="9"
            fill="#475569" stroke="#94a3b8" strokeWidth="1.5"/>
          <ellipse cx="65" cy="140" rx="50" ry="9"
            fill="#475569" stroke="#94a3b8" strokeWidth="1.5"/>
          {[-140,-100,-60,-20,20,60,100].map((ty, i) => (
            <line key={`sgtb-${i}`} x1="22" y1={ty} x2="108" y2={ty}
              stroke="#1e293b" strokeWidth="1.5" opacity="0.6"/>
          ))}
          {p > 0.05 && [0, 1, 2, 3].map(i => (
            <motion.circle key={`sgb-${i}`} cx={38 + i * 18} r={3 + p * 2}
              fill="#fef3c7" fillOpacity={0.7}
              animate={{ cy: [120, -190], opacity: [0.7, 0] }}
              transition={{ duration: 2.4 - p * 1.0, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
            />
          ))}
          <text x="65" y="158" fontSize="11" fill="#cbd5e1" textAnchor="middle"
            fontWeight="700" letterSpacing="1.2">STEAM GENERATOR</text>
        </g>
        )}

        {/* Primary circulation pump — on cold-leg return at cy=200, cx=-80 */}
        {isPWR && (
        <g opacity={0.45 + p * 0.55}>
          <circle cx="-80" cy="200" r="18"
            fill="#374151" stroke="#94a3b8" strokeWidth="2"/>
          <g transform="translate(-80,200)">
            <motion.g
              style={{ transformOrigin: '0px 0px' }}
              animate={{ rotate: p < 0.02 ? 0 : 360 }}
              transition={{ duration: lerp(6, 0.5, p), repeat: Infinity, ease: 'linear' }}
            >
              {[0, 60, 120, 180, 240, 300].map(deg => (
                <line key={`ppb-${deg}`}
                  x1="0" y1="0"
                  x2={Math.cos(deg * Math.PI / 180) * 12}
                  y2={Math.sin(deg * Math.PI / 180) * 12}
                  stroke="#fda4af" strokeWidth="2.5" strokeLinecap="round"/>
              ))}
            </motion.g>
          </g>
          <circle cx="-80" cy="200" r="4" fill="#94a3b8"/>
          <text x="-80" y="232" fontSize="9" fill="#94a3b8" textAnchor="middle"
            fontWeight="700" letterSpacing="0.6">PRIMARY PUMP</text>
        </g>
        )}

        {/* ── SECONDARY LOOP — hot steam: SG top → Turbine ── (PWR & SMR) */}
        {hasPrimaryLoop && (<>
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M 115 -200 L 115 -260 L 180 -260"
            stroke="#c2410c" strokeWidth={16} dashLen={20} gapLen={18}
            duration={steamSpeed} sheen
          />
        </g>
        <motion.text x="148" y="-272" fontSize="10" fill="#fb923c"
          textAnchor="middle" fontStyle="italic"
          animate={{ opacity: pipeAlpha * 0.85 }}>
          hot steam
        </motion.text>
        </>)}

        {/* ── BWR DIRECT-STEAM LOOP — reactor top → turbine ── */}
        {isBWR && (<>
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M -60 -180 L -60 -300 L 180 -300 L 180 -260"
            stroke="#c2410c" strokeWidth={16} dashLen={20} gapLen={18}
            duration={steamSpeed} sheen
          />
        </g>
        <motion.text x="60" y="-312" fontSize="10" fill="#fb923c"
          textAnchor="middle" fontStyle="italic"
          animate={{ opacity: pipeAlpha * 0.85 }}>
          direct steam (slightly radioactive)
        </motion.text>
        </>)}

        {/* ── TURBINE x=180–340 ── */}
        <rect x="180" y="-320" width="160" height="130" rx="14"
          fill="url(#ra-turbine-grad)" stroke="#5a6a80" strokeWidth="2" opacity={0.3 + p * 0.7}/>
        <rect x="185" y="-315" width="150" height="6" rx="2"
          fill="#94a3b8" fillOpacity={0.28 * (0.3 + p * 0.7)}/>

        {/* Spinning blades */}
        <g transform="translate(260,-255)">
          <motion.g
            style={{ transformOrigin: '0px 0px' }}
            animate={{ rotate: p < 0.02 ? 0 : 360 }}
            transition={{ duration: spinDur, repeat: Infinity, ease: 'linear' }}
          >
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
              <line key={deg}
                x1="0" y1="0"
                x2={Math.cos((deg - 90) * Math.PI / 180) * 50}
                y2={Math.sin((deg - 90) * Math.PI / 180) * 50}
                stroke="#cbd5e1" strokeWidth={4 + p * 2} strokeLinecap="round"
                opacity={0.4 + p * 0.6}
              />
            ))}
          </motion.g>
        </g>
        {/* Hub */}
        <circle cx="260" cy="-255" r="15" fill="#4b5563" stroke="#94a3b8" strokeWidth="2.5"
          opacity={0.3 + p * 0.7}/>
        <circle cx="260" cy="-255" r="6" fill="#94a3b8" opacity={0.3 + p * 0.7}/>
        <text x="260" y="-332" fontSize="12" fill="#94a3b8" textAnchor="middle"
          fontWeight="700" letterSpacing="1.5" opacity={0.3 + p * 0.7}>TURBINE</text>

        {/* ── SHAFT x=340–402 ── */}
        <rect x="340" y="-263" width="62" height="16" rx="5"
          fill="#3b4a5e" stroke="#5a6a80" strokeWidth="1.5" opacity={0.3 + p * 0.7}/>
        {[348, 370].map((sx, i) => (
          <rect key={`sc-${i}`} x={sx} y="-268" width="14" height="26" rx="4"
            fill="#283347" stroke="#5a6a80" strokeWidth="1" opacity={0.3 + p * 0.7}/>
        ))}
        <g transform="translate(371,-255)">
          <motion.g
            style={{ transformOrigin: '0px 0px' }}
            animate={{ rotate: p < 0.02 ? 0 : 360 }}
            transition={{ duration: spinDur * 1.05, repeat: Infinity, ease: 'linear' }}
          >
            <line x1="0" y1="-11" x2="0" y2="11"
              stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" opacity={0.5 + p * 0.5}/>
          </motion.g>
        </g>

        {/* ── GENERATOR x=402–550 — cross-section: stator + salient-pole rotor ── */}
        {/* Casing */}
        <rect x="402" y="-320" width="148" height="130" rx="14"
          fill="url(#ra-gen-grad)" stroke="#3b82f6" strokeWidth="2.5"
          opacity={0.3 + p * 0.7}/>
        {/* Pulsing EM-field glow */}
        <motion.rect x="402" y="-320" width="148" height="130" rx="14"
          fill="none" stroke="#60a5fa"
          animate={{ strokeWidth: [2, 5 + p * 5, 2], strokeOpacity: [0.12, outputFlash * 0.9, 0.12] }}
          transition={{ duration: 1.8 - p * 1.0, repeat: Infinity }}
        />
        {/* End-cap flanges (show it's a cylindrical machine) */}
        <rect x="395" y="-308" width="11" height="106" rx="4"
          fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" opacity={0.3 + p * 0.7}/>
        <rect x="544" y="-308" width="11" height="106" rx="4"
          fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5" opacity={0.3 + p * 0.7}/>
        {/* Stator bore — dark bore inner circle */}
        <circle cx="476" cy="-255" r="46"
          fill="#0a1428" stroke="#1e40af" strokeWidth="2.5"
          opacity={0.3 + p * 0.7}/>
        {/* Stator copper slot windings — 12 radial bars around the bore */}
        {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg, i) => {
          const rad = deg * Math.PI / 180;
          return (
            <line key={`sw-${i}`}
              x1={476 + Math.cos(rad) * 34} y1={-255 + Math.sin(rad) * 34}
              x2={476 + Math.cos(rad) * 45} y2={-255 + Math.sin(rad) * 45}
              stroke={i % 2 === 0 ? '#d97706' : '#b45309'}
              strokeWidth="5" strokeLinecap="round"
              opacity={0.45 + p * 0.45}/>
          );
        })}
        {/* EM-field glow ring pulsing around the stator */}
        <motion.circle cx="476" cy="-255" r="46"
          fill="none" stroke="#93c5fd"
          animate={{ r: [44, 48, 44], strokeOpacity: [0.08, p * 0.55, 0.08] }}
          transition={{ duration: 1.8 - p * 1.0, repeat: Infinity }}
        />
        {/* Rotor — 4 salient poles with copper field coils */}
        <g transform="translate(476,-255)">
          <motion.g
            style={{ transformOrigin: '0px 0px' }}
            animate={{ rotate: p < 0.02 ? 0 : 360 }}
            transition={{ duration: spinDur * 1.1, repeat: Infinity, ease: 'linear' }}
            opacity={0.4 + p * 0.55}
          >
            {[0, 90, 180, 270].map((deg, i) => {
              const rad = deg * Math.PI / 180;
              const tipX = Math.cos(rad) * 28;
              const tipY = Math.sin(rad) * 28;
              return (
                <g key={`rp-${i}`}>
                  <line x1="0" y1="0" x2={tipX} y2={tipY}
                    stroke="#93c5fd" strokeWidth="10" strokeLinecap="round"/>
                  <circle cx={tipX} cy={tipY} r="9"
                    fill="#2563eb" stroke="#bfdbfe" strokeWidth="1.5"/>
                  <line
                    x1={Math.cos(rad) * 10} y1={Math.sin(rad) * 10}
                    x2={Math.cos(rad) * 18} y2={Math.sin(rad) * 18}
                    stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" opacity="0.8"/>
                </g>
              );
            })}
            <circle cx="0" cy="0" r="9" fill="#374151" stroke="#94a3b8" strokeWidth="2"/>
          </motion.g>
        </g>
        {/* ⚡ Lightning bolt — electrical output symbol */}
        <g opacity={0.25 + p * 0.75} filter="url(#ra-glow-sm)">
          <path d="M 559 -276 L 548 -255 L 556 -255 L 545 -234"
            stroke="#fbbf24" strokeWidth="3.5" fill="none"
            strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        <text x="476" y="-334" fontSize="12" fill="#93c5fd" textAnchor="middle"
          fontWeight="700" letterSpacing="1.5" opacity={0.3 + p * 0.7}>GENERATOR</text>

        {/* Power-output metrics live in the unified HTML dashboard */}

        {/* ── POWER CABLES — generator right → city ── */}
        <g opacity={0.2 + p * 0.8}>
          {[-7, 0, 7].map((offset, i) => (
            <motion.path key={`hv-${i}`}
              d={`M 550 ${-258 + offset} L 600 ${-258 + offset}`}
              stroke="#fbbf24" strokeWidth="2.5" fill="none"
              strokeDasharray="8 5"
              style={{ filter: 'url(#ra-glow-sm)' }}
              animate={{ strokeDashoffset: p > 0.02 ? [-13, 0] : 0 }}
              transition={{ duration: 0.5 - p * 0.3, repeat: Infinity, ease: 'linear', delay: i * 0.06 }}
            />
          ))}
        </g>

        {/* ── CITY SILHOUETTE x=600–650 ── */}
        <g opacity={0.3 + p * 0.7}>
          <rect x="600" y="-285" width="22" height="66" rx="2" fill="#283347"/>
          <rect x="603" y="-300" width="16" height="20" rx="2" fill="#2f3f56"/>
          <rect x="625" y="-268" width="18" height="50" rx="2" fill="#283347"/>
          <rect x="628" y="-283" width="12" height="18" rx="2" fill="#2f3f56"/>
          {[
            [602,-268],[610,-268],[602,-255],[610,-255],
            [627,-255],[627,-242],
          ].map(([wx, wy], i) => (
            <motion.rect key={`w${i}`} x={wx} y={wy} width="5" height="5"
              fill="#fef08a" rx="1"
              animate={{ opacity: [0.4 + p * 0.2, 0.7 + p * 0.3, 0.4 + p * 0.2] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
          <text x="618" y="-220" fontSize="10" fill="#64748b"
            textAnchor="middle" fontWeight="600">Power Grid</text>
        </g>

        {/* ── SECONDARY LOOP — spent steam: Turbine bottom → Condenser ── */}
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M 260 -190 L 260 200"
            stroke="#7c3aed" strokeWidth={16} dashLen={16} gapLen={20}
            duration={spentSpeed}
          />
        </g>
        <motion.text x="300" y="10" fontSize="10" fill="#c4b5fd"
          textAnchor="start" fontStyle="italic"
          animate={{ opacity: pipeAlpha * 0.85 }}>
          spent steam
        </motion.text>

        {/* ── CONDENSER — x=150–380, y=200–280 ── */}
        <g opacity={0.5 + p * 0.5}>
          <rect x="150" y="200" width="230" height="80" rx="14"
            fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2"/>
          {[220, 240, 260, 280].map((ty, i) => (
            <line key={`cb-${i}`} x1="160" y1={ty} x2="370" y2={ty}
              stroke="#0c1a3a" strokeWidth="1.5" opacity="0.7"/>
          ))}
          {p > 0.05 && [0,1,2,3,4].map(i => (
            <motion.circle key={`cd-${i}`} cx={170 + i * 40} r={2.5}
              fill="#bae6fd"
              animate={{ cy: [202, 278], opacity: [0.85, 0] }}
              transition={{ duration: 1.6 - p * 0.5, repeat: Infinity, delay: i * 0.35, ease: 'easeIn' }}
            />
          ))}
          <text x="265" y="298" fontSize="11" fill="#bae6fd" textAnchor="middle"
            fontWeight="700" letterSpacing="1.2">CONDENSER</text>
        </g>

        {/* ── FEEDWATER: Condenser left → Feedwater Pump → SG bottom ── */}
        {hasPrimaryLoop && (
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M 150 240 L 90 240"
            stroke="#1d4ed8" strokeWidth={14} dashLen={16} gapLen={16}
            duration={waterSpeed} sheen
          />
        </g>
        )}
        {/* BWR feedwater: Condenser → reactor bottom */}
        {isBWR && (
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M 150 240 L 80 240 L 80 180 L -60 180"
            stroke="#1d4ed8" strokeWidth={14} dashLen={16} gapLen={16}
            duration={waterSpeed} sheen
          />
        </g>
        )}
        {/* Feedwater pump */}
        <g opacity={0.5 + p * 0.5}>
          <circle cx="90" cy="240" r="16"
            fill="#1e40af" stroke="#60a5fa" strokeWidth="2"/>
          <g transform="translate(90,240)">
            <motion.g
              style={{ transformOrigin: '0px 0px' }}
              animate={{ rotate: p < 0.02 ? 0 : -360 }}
              transition={{ duration: lerp(6, 0.5, p), repeat: Infinity, ease: 'linear' }}
            >
              {[0,90,180,270].map(deg => (
                <line key={`fpb-${deg}`}
                  x1="0" y1="0"
                  x2={Math.cos(deg * Math.PI / 180) * 11}
                  y2={Math.sin(deg * Math.PI / 180) * 11}
                  stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round"/>
              ))}
            </motion.g>
          </g>
          <text x="90" y="274" fontSize="9" fill="#93c5fd" textAnchor="middle"
            fontWeight="700" letterSpacing="0.6">FEEDWATER PUMP</text>
        </g>
        {hasPrimaryLoop && (
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M 74 240 L 65 240 L 65 140"
            stroke="#1d4ed8" strokeWidth={14} dashLen={16} gapLen={16}
            duration={waterSpeed} sheen
          />
        </g>
        )}

        {/* ── COOLING TOWER — internal cx=460, shifted to SVG (520,-50) rim via translate ── */}
        <g opacity={0.35 + p * 0.65} transform="translate(60,-100)">
          <ellipse cx="460" cy="378" rx="88" ry="8" fill="#000" opacity="0.3"/>

          <path
            d="M 382,380 C 388,330 410,280 418,220 C 420,160 416,110 414,50 L 506,50 C 504,110 500,160 502,220 C 510,280 532,330 538,380 Z"
            fill="url(#ra-tower-body)"
          />
          <path
            d="M 382,380 C 388,330 410,280 418,220 C 420,160 416,110 414,50 L 506,50 C 504,110 500,160 502,220 C 510,280 532,330 538,380 Z"
            fill="url(#ra-tower-edge-shadow)"
          />

          {[
            { y: 330, rx: 70, ry: 3 },
            { y: 270, rx: 54, ry: 2.5 },
            { y: 210, rx: 46, ry: 2.5 },
            { y: 150, rx: 50, ry: 2 },
          ].map(({ y, rx, ry }, i) => (
            <ellipse key={`hband-${i}`} cx="460" cy={y} rx={rx} ry={ry}
              fill="none" stroke="#5a7a8e" strokeWidth="1.5" opacity="0.55"/>
          ))}

          <path d="M 400,380 C 405,330 424,280 427,220 C 429,160 425,110 424,50"
            fill="none" stroke="#8ab0c8" strokeWidth="1.2" opacity="0.45"/>
          <path d="M 520,380 C 515,330 494,280 491,220 C 489,160 493,110 494,50"
            fill="none" stroke="#2a3c4e" strokeWidth="1.2" opacity="0.45"/>

          {[
            [[392,376],[383,352]], [[408,376],[394,352]], [[426,376],[410,352]],
            [[494,376],[510,352]], [[512,376],[526,352]], [[528,376],[537,352]],
          ].map(([[x1,y1],[x2,y2]], i) => (
            <line key={`leg-${i}`} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="#4a6070" strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
          ))}
          <rect x="382" y="364" width="156" height="18" rx="3"
            fill="url(#ra-tower-base-grad)" stroke="#4a6878" strokeWidth="1"/>

          <ellipse cx="460" cy="50" rx="46" ry="10"
            fill="url(#ra-tower-rim-grad)" stroke="#22d3ee" strokeWidth="1.5"/>

          {p > 0.02 && (
            <g filter="url(#ra-steam)">
              {[0,1,2,3,4].map(i => (
                <motion.circle key={`twb-${i}`}
                  cx={436 + i * 12} r={3 + p * 2.5}
                  fill="#e0f2fe" fillOpacity="0.85"
                  animate={{ cy: [48, 22], opacity: [0.8, 0] }}
                  transition={{
                    duration: 1.6 - p * 0.5,
                    repeat:   Infinity,
                    delay:    i * 0.36,
                    ease:     'easeOut',
                  }}
                />
              ))}
            </g>
          )}

          <text x="460" y="402" fontSize="13" fill="#67e8f9" textAnchor="middle"
            fontWeight="700" letterSpacing="0.6">COOLING TOWER</text>
        </g>

        {/* ── TERTIARY LOOP — Condenser ↔ Cooling Tower ── */}
        {/* Warm water: condenser right → tower inlet */}
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M 380 240 L 414 240 L 414 120 L 520 120"
            stroke="#0891b2" strokeWidth={14} dashLen={18} gapLen={16}
            duration={waterSpeed}
          />
        </g>
        {/* Cool water return: tower base → pump → condenser */}
        <g opacity={pipeAlpha}>
          <FlowPipe
            d="M 520 280 L 520 370 L 380 370 L 380 280"
            stroke="#1d4ed8" strokeWidth={14} dashLen={18} gapLen={16}
            duration={waterSpeed} sheen
          />
        </g>
        {/* Tertiary circulating pump */}
        <g opacity={0.5 + p * 0.5}>
          <circle cx="420" cy="370" r="13"
            fill="#1e40af" stroke="#60a5fa" strokeWidth="2"/>
          <g transform="translate(420,370)">
            <motion.g
              style={{ transformOrigin: '0px 0px' }}
              animate={{ rotate: p < 0.02 ? 0 : 360 }}
              transition={{ duration: lerp(6, 0.5, p), repeat: Infinity, ease: 'linear' }}
            >
              {[0, 90, 180, 270].map(deg => (
                <line key={`tpb-${deg}`}
                  x1="0" y1="0"
                  x2={Math.cos(deg * Math.PI / 180) * 9}
                  y2={Math.sin(deg * Math.PI / 180) * 9}
                  stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round"/>
              ))}
            </motion.g>
          </g>
          <text x="420" y="390" fontSize="9" fill="#93c5fd" textAnchor="middle"
            fontWeight="700" letterSpacing="0.6">COOLING PUMP</text>
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

        {/* ── PIPE JOINT FLANGES ── */}
        <circle cx="-60" cy="-180" r="9" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" opacity={pipeAlpha}/>
        <circle cx="-62" cy="162" r="9" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1.5" opacity={pipeAlpha}/>
        <circle cx="180" cy="-260" r="9" fill="#475569" stroke="#64748b" strokeWidth="1.5" opacity={pipeAlpha}/>
        <circle cx="260" cy="-190" r="9" fill="#475569" stroke="#64748b" strokeWidth="1.5" opacity={pipeAlpha}/>
        <circle cx="260" cy="200" r="7" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" opacity={pipeAlpha}/>

        {/* ── IDLE PROMPT ──────────────────────────────────────── */}
        {power < 2 && (
          <g>
            <rect x="-280" y="380" width="280" height="36" rx="10"
              fill="#1e293b" fillOpacity="0.9" stroke="#334155" strokeWidth="1"/>
            <text x="-140" y="404" fontSize="13" fill="#94a3b8"
              textAnchor="middle" fontStyle="italic">
              Raise power to run the plant
            </text>
          </g>
        )}
      </svg>

      {/* ── UNIFIED CONTROL DASHBOARD (top-right overlay) ───────────────
          Combines the live thermal/electrical output readout with the
          reactor-power slider into a single visual panel. ───────────── */}
      <div className="ra-dashboard">
        <div className="ra-dash-title">CONTROL DASHBOARD</div>

        <div className="ra-dash-metric">
          <span className="ra-dash-mlabel">THERMAL</span>
          <span className="ra-dash-mvalue ra-dash-thermal">
            {Math.round(power * 30)}<em> MWt</em>
          </span>
        </div>
        <div className="ra-dash-divider"/>
        <div className="ra-dash-metric">
          <span className="ra-dash-mlabel">ELECTRICAL <small>(×0.33)</small></span>
          <span className="ra-dash-mvalue ra-dash-elec">
            {Math.round(power * 30 * 0.33)}<em> MWe</em>
          </span>
        </div>
        <div className="ra-dash-foot">33% thermal efficiency · 220 kV AC</div>

        <div className="ra-dash-slider">
          <div className="ra-dash-slider-head">
            <span className="ra-dash-slabel">REACTOR POWER</span>
            <span
              className="ra-dash-spct"
              style={{ color: power > 80 ? '#f97316' : power > 40 ? '#fbbf24' : '#60a5fa' }}
            >
              {power}%
            </span>
          </div>
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
          <div className="ra-dash-mw">{Math.round(power * 12)} MW · grid output</div>
        </div>
      </div>
    </div>
  );
};

export default ReactorAnimation;
