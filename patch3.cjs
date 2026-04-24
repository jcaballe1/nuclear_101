const fs = require('fs');
const filePath = 'src/components/TextPanel.jsx';
let src = fs.readFileSync(filePath, 'utf8');
const start = 2489;
const end = 3582;
const lsq = '\u2018';
const rsq = '\u2019';
const nl = '\r\n';
const lines = [
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
];
const newBlock = lines.join(nl);
const out = src.slice(0, start) + newBlock + src.slice(end);
fs.writeFileSync(filePath, out, 'utf8');
console.log('OK - new file length', out.length);
