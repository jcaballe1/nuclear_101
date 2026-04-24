const fs = require('fs');
const glob = require('glob');
const path = require('path');

const targetFiles = glob.sync('src/components/**/*.jsx');

const terms = [
  { p: /isotope/gi, t: 'isotope' },
  { p: /MeV/g, t: 'MeV' },
  { p: /atomic mass unit/gi, t: 'atomic mass unit' },
  { p: /Cherenkov/gi, t: 'Cherenkov' },
  { p: /PUREX/g, t: 'PUREX' },
  { p: /baseload/gi, t: 'baseload' },
  { p: /MOX/g, t: 'MOX' },
  { p: /chain reaction/gi, t: 'chain reaction' },
  { p: /fission/gi, t: 'fission' },
  { p: /protons/gi, t: 'protons' },
  { p: /neutrons/gi, t: 'neutrons' },
  { p: /Uranium-235/gi, t: 'Uranium-235' },
  { p: /Uranium-238/gi, t: 'Uranium-238' },
  { p: /control rods/gi, t: 'control rods' },
  { p: /moderator/gi, t: 'moderator' },
  { p: /alpha particle/gi, t: 'alpha particle' },
  { p: /beta particle/gi, t: 'beta particle' },
  { p: /gamma ray(s?)/gi, t: 'gamma rays' },
  { p: /half-life/gi, t: 'half-life' },
  { p: /\bPWR\b/g, t: 'PWR' },
  { p: /\bBWR\b/g, t: 'BWR' },
  { p: /\bSMR\b/g, t: 'SMR' },
  { p: /spent fuel/gi, t: 'spent fuel' },
  { p: /decay/gi, t: 'decay' }
];

targetFiles.forEach(file => {
  if (file.includes('Term.jsx')) return;
  if (file.includes('Quiz.jsx')) return;
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;
  
  // A stupidly simple replace: just wrap the very first occurrence of any term text in JSX if not inside a tag.
  // Actually doing this correctly in React is hard because we can't just replace text nodes without risking invalid JSX.
  // Let's do it manually on a few select files.
});
