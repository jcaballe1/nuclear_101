import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Term from './Term';
import './BalanceScale.css';

const BalanceScale = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
    <div className="dmb-container">
      <div className="dmb-header">
        <span className="dmb-title">Digital Mass Balance</span>
        <span className="dmb-subtitle">E = mc²  ·  Mass–Energy Conservation</span>
      </div>

      <div className="dmb-body">
        {/* Left side: Before Fission */}
        <motion.div className="dmb-side dmb-left"
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="dmb-side-label">BEFORE FISSION</div>
          <div className="dmb-readout">
            <span className="dmb-nuclide dmb-nuclide-u"><sup>235</sup><sub>92</sub>U</span>
            <span className="dmb-plus">+</span>
            <span className="dmb-nuclide dmb-nuclide-n"><sup>1</sup><sub>0</sub>n</span>
          </div>
          <div className="dmb-mass dmb-mass-left">236.053 u</div>
        </motion.div>

        {/* Centre: delta-m */}
        <motion.div className="dmb-centre"
          initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="dmb-delta-label">MISSING MASS</div>
          <div className="dmb-delta-value">Δm = −0.186 u</div>

          {/* Arrow */}
          <svg className="dmb-arrow-svg" viewBox="0 0 60 80" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Energy difference driving fission">
            <title>Arrow indicating missing mass converts to energy</title>
            <defs>
              <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%"   stopColor="#ef4444" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            <motion.line x1="30" y1="5" x2="30" y2="60"
              stroke="url(#arrowGrad)" strokeWidth="5" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            />
            <motion.polygon points="30,75 20,57 40,57" fill="#f97316"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
            />
          </svg>

          {/* E=mc² badge */}
          <motion.div className="dmb-emc2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            <span className="dmb-emc2-eq">E = mc²</span>
            <span className="dmb-emc2-val">≈ 173 MeV Heat</span>
            <button className="dmb-info-btn" onClick={() => setShowModal(true)} aria-label="Explain the math">
              <span>ℹ</span> Explain the Math
            </button>
          </motion.div>
        </motion.div>

        {/* Right side: After Fission */}
        <motion.div className="dmb-side dmb-right"
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="dmb-side-label">AFTER FISSION</div>
          <div className="dmb-readout">
            <span className="dmb-nuclide dmb-nuclide-ba"><sup>141</sup><sub>56</sub>Ba</span>
            <span className="dmb-plus">+</span>
            <span className="dmb-nuclide dmb-nuclide-kr"><sup>92</sup><sub>36</sub>Kr</span>
            <span className="dmb-plus">+</span>
            <span className="dmb-nuclide dmb-nuclide-n">3 <sup>1</sup><sub>0</sub>n</span>
          </div>
          <div className="dmb-mass dmb-mass-right">235.867 u</div>
        </motion.div>
      </div>
    </div>

      {/* ── Math Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="dmb-modal-backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div className="dmb-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.25 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="dmb-modal-header">
                <h3 className="dmb-modal-title">The Worked-Out Math</h3>
                <button className="dmb-modal-close" onClick={() => setShowModal(false)} aria-label="Close">×</button>
              </div>

              <div className="dmb-modal-body">
                {/* Step 1 */}
                <div className="dmb-step">
                  <div className="dmb-step-label">Step 1 — The Missing Mass</div>
                  <div className="dmb-step-eq">
                    <span className="dmb-num-purple">236.053</span>
                    <span className="dmb-op"> u − </span>
                    <span className="dmb-num-blue">235.867</span>
                    <span className="dmb-op"> u = </span>
                    <span className="dmb-num-red">0.186 u</span>
                  </div>
                  <p className="dmb-step-text">
                    An <Term term="atomic mass unit" display="atomic mass unit" /> (u) is just a tiny unit of weight for atoms.
                    <span className="dmb-num-red"> 0.186 u</span> of physical matter has vanished from the products.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="dmb-step">
                  <div className="dmb-step-label">Step 2 — Nature's Exchange Rate</div>
                  <div className="dmb-step-eq">
                    <span className="dmb-op">1 u = </span>
                    <span className="dmb-num-gold">931.5 MeV</span>
                  </div>
                  <p className="dmb-step-text">
                    Because E = mc², nature has a strict exchange rate between mass and energy.
                    Every single unit of mass (u) converts to exactly
                    <span className="dmb-num-gold"> 931.5 <Term term="MeV" /></span> of energy, no exceptions.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="dmb-step">
                  <div className="dmb-step-label">Step 3 — The Calculation</div>
                  <div className="dmb-step-eq">
                    <span className="dmb-num-red">0.186</span>
                    <span className="dmb-op"> u × </span>
                    <span className="dmb-num-gold">931.5</span>
                    <span className="dmb-op"> = </span>
                    <span className="dmb-num-orange">173.2 MeV</span>
                  </div>
                  <p className="dmb-step-text">
                    Multiply the missing mass by the exchange rate and you get the energy released, 
                    <span className="dmb-num-orange"> 173.2 <Term term="MeV" /></span> of heat from a single fission event.
                  </p>
                </div>

                {/* Conclusion */}
                <div className="dmb-step dmb-step-conclusion">
                  <p className="dmb-step-text">
                    Millions of Electron Volts (MeV) are microscopic chunks of heat.
                    <strong> Quadrillions of these happening every second</strong> is what boils
                    the water that spins the turbine that powers a city.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default BalanceScale;
