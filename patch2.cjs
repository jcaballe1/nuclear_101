const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'components', 'TextPanel.jsx');
let src = fs.readFileSync(filePath, 'utf8');
const lsq = '\u2018';
const rsq = '\u2019';
const nl = '\r\n';
const oldBlock = [
  "LIST_ITEMS = [",
  "  {",
  "    Icon: ExpandIcon,",
  "    title: 'Isotopes: The Over-filled Balloon',",
  "    text: 'Atoms of the same element can have different weights, called isotopes. Most uranium is U-238, which acts like a thick, stable balloon. It absorbs impacts easily. But U-235 is like an over-filled balloon stretched to its absolute limit. One tiny tap from a neutron makes it violently pop (fission).',",
  "  },",
  "  {",
  "    Icon: FilterIcon,",
  "    title: 'Enrichment: Filtering the Sand',",
  "    text: 'Natural uranium from the ground is 99.3% stable U-238 (" + lsq + "sand" + rsq + ") and only 0.7% unstable U-235 (" + lsq + "gold" + rsq + "). To build a power plant, we must filter out some of the sand to increase the amount of U-235 to about 4%. This filtering process is called Enrichment.',",
  "  },",
  "  {",
  "    Icon: AtomIcon,",
  "    title: 'The Physics of the Split',",
  "    text: 'Inside the U-235 nucleus, an incredible tension exists between the Strong Nuclear Force (the glue holding it together) and Electrostatic Repulsion (protons pushing apart). Adding just one neutron destroys this delicate balance.',",
  "  },",
  "];"
].join(nl);
const newBlock = [
  "LIST_ITEMS = [",
  "  {",
  "    Icon: ExpandIcon,",
  "    title: 'Isotopes: The Over-filled Balloon',",
  '    text: <><Term term="isotope" display="Isotopes" /> are atoms of the same element with different numbers of <Term term="neutrons" />. Most uranium is <Term term="Uranium-238" display="U-238" />, which acts like a thick, stable balloon. But <Term term="Uranium-235" display="U-235" /> is stretched to its absolute limit \u2014 one tiny tap from a <Term term="neutrons" display="neutron" /> makes it violently pop (<Term term="fission" />).</>,',
  "  },",
  "  {",
  "    Icon: FilterIcon,",
  "    title: 'Enrichment: Filtering the Sand',",
  '    text: <>Natural uranium is 99.3% stable <Term term="Uranium-238" display="U-238" /> (' + lsq + 'sand' + rsq + ') and only 0.7% unstable <Term term="Uranium-235" display="U-235" /> (' + lsq + 'gold' + rsq + '). To build a power plant, we must raise the <Term term="Uranium-235" display="U-235" /> share to ~4%. This filtering process is called Enrichment.</>,',
  "  },",
  "  {",
  "    Icon: AtomIcon,",
  "    title: 'The Physics of the Split',",
  '    text: <>Inside the <Term term="Uranium-235" display="U-235" /> nucleus, an incredible tension exists between the Strong Nuclear Force (the glue holding it together) and Electrostatic Repulsion (<Term term="protons" /> pushing apart). Adding just one <Term term="neutrons" display="neutron" /> destroys this delicate balance.</>,',
  "  },",
  "];"
].join(nl);
if (!src.includes(oldBlock)) { console.error('NOT FOUND'); process.exit(1); }
const out = src.replace(oldBlock, newBlock);
fs.writeFileSync(filePath, out, 'utf8');
console.log('OK');
