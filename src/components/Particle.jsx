import React from 'react';
import { motion } from 'framer-motion';

const Particle = ({ id, type, x, y, vibration, layer }) => {
  const colors = {
    proton: '#ef4444',
    neutron: '#fbbf24'
  };

  const vibrationAmount = vibration * (layer + 1) * 0.3;

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
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{
          duration: 1.5 + Math.random(),
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 0.5
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
          x: [0, Math.random() * vibrationAmount - vibrationAmount/2, 0],
          y: [0, Math.random() * vibrationAmount - vibrationAmount/2, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{
          duration: 0.8 + Math.random() * 0.4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: Math.random() * 0.3
        }}
      />

    </motion.g>
  );
};

export default Particle;
