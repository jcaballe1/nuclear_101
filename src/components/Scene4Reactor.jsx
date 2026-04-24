import React, { useState } from 'react';
import ReactorAnimation from './ReactorAnimation';
import Scene4TextPanel from './Scene4TextPanel';
import './Scene4Reactor.css';

const REACTOR_TYPES = [
  { id: 'PWR', label: 'PWR', sub: 'Pressurised Water' },
  { id: 'BWR', label: 'BWR', sub: 'Boiling Water'     },
  { id: 'SMR', label: 'SMR', sub: 'Small Modular'     },
];

const Scene4Reactor = ({ onComplete }) => {
  const [power, setPower] = useState(0);
  const [reactorType, setReactorType] = useState('PWR');

  const handlePowerChange = (val) => {
    setPower(val);
    if (val > 0 && onComplete) onComplete();
  };

  return (
    <div className="s4-root">
      <div className="s4-main">
        {/* LEFT — text panel (35%) */}
        <div className="s4-left">
          <Scene4TextPanel animationStarted={power > 0} reactorType={reactorType} />
        </div>

        {/* RIGHT — reactor canvas (65%) */}
        <div className="s4-right">
          {/* Reactor-type tab strip */}
          <div className="s4-type-tabs" role="tablist" aria-label="Reactor type">
            {REACTOR_TYPES.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={reactorType === t.id}
                className={`s4-type-tab${reactorType === t.id ? ' active' : ''}`}
                onClick={() => setReactorType(t.id)}
              >
                <span className="s4-type-tab-label">{t.label}</span>
                <span className="s4-type-tab-sub">{t.sub}</span>
              </button>
            ))}
          </div>
          <ReactorAnimation power={power} onPowerChange={handlePowerChange} reactorType={reactorType} />
        </div>
      </div>
    </div>
  );
};

export default Scene4Reactor;
