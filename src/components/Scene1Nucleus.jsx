import React, { useState } from 'react';
import TextPanel from './TextPanel';
import NucleusVisualization from './NucleusVisualization';

const Scene1Nucleus = ({ onComplete, onFissionNext }) => {
  const [isotopeType, setIsotopeType] = useState('stable');
  const [showFission, setShowFission] = useState(false);

  const handleAddNeutron = () => {
    if (isotopeType === 'unstable') {
      setShowFission(true);
      onComplete();
    }
  };

  return (
    <div className="nm-two-col">
      <TextPanel
        isotopeType={isotopeType}
        showFission={showFission}
        onFissionDismiss={() => setShowFission(false)}
        onFissionNext={() => { setShowFission(false); onFissionNext(); }}
      />
      <NucleusVisualization
        isotopeType={isotopeType}
        setIsotopeType={setIsotopeType}
        onAddNeutron={handleAddNeutron}
        showFission={showFission}
      />
    </div>
  );
};

export default Scene1Nucleus;
