import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './RealWorldOverlay.css';

const RealWorldOverlay = ({ isOpen, onClose, imageSrc, imageLabel, caption }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="rwo-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        onClick={onClose}
      >
        <motion.div
          className="rwo-card"
          initial={{ opacity: 0, scale: 0.93, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 14 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="rwo-close" onClick={onClose} aria-label="Close overlay">
            ×
          </button>
          <div className="rwo-image-placeholder">
            {imageSrc
              ? <img className="rwo-image" src={imageSrc} alt={imageLabel} />
              : <span className="rwo-image-label">{imageLabel}</span>
            }
          </div>
          <p className="rwo-caption">{caption}</p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default RealWorldOverlay;
