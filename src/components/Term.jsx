import React, { useState, useRef, useEffect } from 'react';
import { GLOSSARY } from '../glossary';
import './Term.css';

const Term = ({ term, display }) => {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState('top');
  const spanRef = useRef(null);

  const handleEnter = () => {
    setShow(true);
    if (spanRef.current) {
      const rect = spanRef.current.getBoundingClientRect();
      const tooltipHeight = 60; // Approx
      if (rect.top < tooltipHeight + 10) {
        setPos('bottom');
      } else {
        setPos('top');
      }
    }
  };

  const handleLeave = () => {
    setShow(false);
  };

  const lowered = term.toLowerCase();
  const definition = GLOSSARY[lowered] || GLOSSARY[term] || 'Definition not found.';

  return (
    <span 
      className="glossary-term"
      ref={spanRef}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      tabIndex={0}
      role="button"
      aria-haspopup="tooltip"
      aria-expanded={show}
    >
      {display || term}
      {show && (
        <span className={`glossary-tooltip tooltip-${pos}`} role="tooltip">
          <strong>{term}</strong>: {definition}
        </span>
      )}
    </span>
  );
};

export default Term;