import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const Particle = ({ id, type, x, y, vibration, layer }) => {
  const colors = {
    proton: '#ef4444',
    neutron: '#fbbf24'
  };

  const vibrationAmount = vibration * (layer + 1) * 0.3;

  // All random values are computed once per particle identity and never
  // recalculated on re-renders. Using `id` as the seed guarantees every
  // particle gets a unique but stable set of motion parameters.
  const motion$ = useMemo(() => {
    // Lightweight seeded pseudo-random sequence based on the particle id.
    // Each call to next() advances the state and returns a float in [0, 1).
    let s = (id * 2654435761) >>> 0;
    const next = () => {
      s = (s ^ (s >>> 16)) >>> 0;
      s = Math.imul(s, 0x45d9f3b) >>> 0;
      s = (s ^ (s >>> 16)) >>> 0;
      return (s >>> 0) / 4294967296;
    };

    return {
      // Wobble target offsets — mirror repeatType bounces back, so only one
      // non-zero keyframe is needed (Framer mirrors it back to 0 automatically).
      wx: (next() * vibrationAmount) - vibrationAmount / 2,
      wy: (next() * vibrationAmount) - vibrationAmount / 2,
      wobbleDuration: 0.7 + next() * 0.5,   // 0.7 – 1.2 s
      wobbleDelay:    next() * 0.4,          // 0   – 0.4 s

      // Glow pulse
      glowDuration: 1.4 + next() * 0.8,     // 1.4 – 2.2 s
      glowDelay:    next() * 0.6,            // 0   – 0.6 s
    };
  }, [id, vibrationAmount]);

  return (
    <motion.g>
      {/* Particle glow */}
      <motion.circle
        cx={x}
        cy={y}
        r="16"
        fill={colors[type]}
        opacity="0.3"
        animate={{
          scale: [1, 1.2],
          opacity: [0.2, 0.4],
        }}
        transition={{
          duration: motion$.glowDuration,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
          delay: motion$.glowDelay,
        }}
      />

      {/* Main particle */}
      <motion.circle
        cx={x}
        cy={y}
        r="10"
        fill={colors[type]}
        stroke={type === 'proton' ? '#fee2e2' : '#fef3c7'}
        strokeWidth="1.5"
        filter="url(#glow)"
        animate={{
          x: [0, motion$.wx],
          y: [0, motion$.wy],
          scale: [1, 1.05],
        }}
        transition={{
          duration: motion$.wobbleDuration,
          repeat: Infinity,
          repeatType: 'mirror',
          ease: 'easeInOut',
          delay: motion$.wobbleDelay,
        }}
      />
    </motion.g>
  );
};

export default Particle;
