import React, { useState } from 'react';
import ReactorAnimation from './ReactorAnimation';
import Scene4TextPanel from './Scene4TextPanel';
import './Scene4Reactor.css';

const Scene4Reactor = ({ onComplete }) => {
  const [power, setPower] = useState(0);

  const handlePowerChange = (val) => {
    setPower(val);
    if (val > 0 && onComplete) onComplete();
  };

  return (
    <div className="s4-root">
      <div className="s4-main">
        {/* LEFT — text panel (35%) */}
        <div className="s4-left">
          <Scene4TextPanel animationStarted={power > 0} />
        </div>

        {/* RIGHT — reactor canvas (65%) */}
        <div className="s4-right">
          <ReactorAnimation power={power} onPowerChange={handlePowerChange} />
        </div>
      </div>
    </div>
  );
};

export default Scene4Reactor;
