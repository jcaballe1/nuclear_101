import React from 'react';
import NuclearWasteAnimation from './NuclearWasteAnimation';
import Scene6TextPanel from './Scene6TextPanel';
import './Scene6NuclearWaste.css';

const Scene6NuclearWaste = ({ onComplete }) => (
  <div className="s6-root">
    <div className="s6-main">
      <div className="s6-left">
        <Scene6TextPanel />
      </div>
      <div className="s6-right">
        <NuclearWasteAnimation onComplete={onComplete} />
      </div>
    </div>
  </div>
);

export default Scene6NuclearWaste;
