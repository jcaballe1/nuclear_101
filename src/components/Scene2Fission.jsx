import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FissionAnimation from './FissionAnimation';
import BalanceScale from './BalanceScale';
import Scene2TextPanel from './Scene2TextPanel';
import './Scene2Fission.css';

const Scene2Fission = ({ onComplete }) => {
  const [fissionStarted, setFissionStarted] = useState(false);
  const [showBalance, setShowBalance] = useState(false);

  const handleStartFission = () => {
    setFissionStarted(true);
    setTimeout(() => {
      setShowBalance(true);
      if (onComplete) onComplete();
    }, 3500);
  };

  const handleReset = () => {
    setFissionStarted(false);
    setShowBalance(false);
  };

  return (
    <div className="scene2-fission">
      <div className="scene2-content">
        <Scene2TextPanel
          fissionStarted={fissionStarted}
          showBalance={showBalance}
        />

        <div className="animation-section">
          <div className="fission-canvas-wrap">
            <FissionAnimation
              fissionStarted={fissionStarted}
              onComplete={() => {}}
            />
          </div>

          <div className="controls-bar">
            {!fissionStarted ? (
              <motion.button
                className="start-fission-btn"
                onClick={handleStartFission}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Initiate Fission
              </motion.button>
            ) : (
              <motion.button
                className="reset-btn"
                onClick={handleReset}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="btn-icon">↻</span>
                Reset
              </motion.button>
            )}
          </div>

          <AnimatePresence>
            {showBalance && (
              <motion.div
                className="balance-inline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <BalanceScale />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Scene2Fission;

