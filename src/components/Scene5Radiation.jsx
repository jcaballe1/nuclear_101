import React, { useState } from 'react';
import { motion } from 'framer-motion';
import RadiationAnimation from './RadiationAnimation';
import Scene5TextPanel from './Scene5TextPanel';
import './Scene5Radiation.css';

const Scene5Radiation = ({ onComplete }) => {
  return (
    <div className="scene5-radiation">
      <div className="scene5-content">
        <Scene5TextPanel />

        <div className="visualization-controls-section">
          <RadiationAnimation onComplete={onComplete} />
        </div>
      </div>
    </div>
  );
};

export default Scene5Radiation;