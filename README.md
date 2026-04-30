# Nuclear Energy 101: Interactive Learning Journey

An interactive educational module exploring the fundamentals of nuclear physics, including atomic nuclei, isotope stability, nuclear fission, and Einstein's mass-energy equivalence.

## Features

### Scene 1: The Nucleus
- **Split-Screen Interface**: Educational text panel on the left, interactive visualization on the right
- **Isotope Comparison**: Toggle between stable (Carbon-12) and unstable (Uranium-235) isotopes
- **Visual Physics Representation**:
  - Strong Nuclear Force: Glowing aura representing attractive forces
  - Electrostatic Repulsion: Dynamic arrows showing proton repulsion
  - Vibration Animation: Visual indication of nuclear stability
- **Interactive Fission Demo**: Add a neutron to U-235 to trigger an animated nuclear fission event

### Scene 2: Nuclear Fission & E=mc²
- **Multi-Stage Fission Animation**:
  - Stage 1: Neutron capture by U-235
  - Stage 2: Compound nucleus formation (U-236) with liquid-drop elongation
  - Stage 3: Nuclear split into two fragments (Kr-92 and Ba-141) with 3 released neutrons
  - Stage 4: Energy release visualization with expanding shockwave and heat particles
- **Mass-Energy Balance Scale**:
  - Interactive scale showing before (U-235 + n) and after (fragments + 3n) fission
  - Visual representation of "missing mass" (0.186 atomic mass units)
  - Animated arrow connecting missing mass to E=mc²
  - Energy conversion demonstration (~173 MeV released)
- **Educational Text Panel**: Step-by-step explanation of the fission process and Einstein's equation
- **Modern UI**: Consistent dark mode with yellow/orange energy themes

### Scene 3: Chain Reactions & Control
- **Interactive Reactor Grid**: 5×5 grid of U-235 nuclei with real-time chain reaction simulation
- **Chain Reaction Animation**:
  - Single neutron triggers cascade of fissions
  - Each fission releases 2-3 new neutrons
  - Exponential growth visualization
  - Collision detection and physics simulation
- **Control Rod System**:
  - Interactive slider to raise/lower control rods (0-100%)
  - 4 vertical control rods that absorb neutrons
  - Visual absorption effects when neutrons hit rods
  - Real-time reaction control
- **Temperature Gauge**:
  - Live temperature monitoring (0-100%)
  - Color-coded: Blue (cool) → Yellow (hot) → Red (critical)
  - Dynamic response to fission rate
- **Warning System**: Flashing alert when temperature exceeds 70%
- **Critical States Education**:
  - Subcritical: Rods lowered, reaction dies
  - Critical: Balanced, steady-state power
  - Supercritical: Rods raised, runaway reaction
- **Live Feedback**: Real-time statistics showing fission count and active neutrons

### Scene 4: Nuclear Power Plant
- **Three Reactor Types**: Switch between PWR (Pressurised Water), BWR (Boiling Water), and SMR (Small Modular) reactor architectures
- **Full Plant Schematic**: Animated cross-section showing all major loops:
  - Primary loop (PWR/SMR): reactor core → pressuriser → steam generator → primary pump
  - Secondary loop: steam generator / reactor → turbine → generator → condenser
  - Tertiary loop: condenser → cooling tower → circulating pump
- **Live Reactor Animation**:
  - Reactor core glow and heat puffs scale with power level
  - Control rods animate into/out of the core
  - All pumps spin at realistic speed relative to power
  - Turbine blades and generator salient-pole rotor spin on correct axes
  - Animated flow in every pipe (dash-offset, colour-coded by temperature)
  - Steam generator rising bubbles on the secondary side
  - Cooling tower rising vapour bubbles at the rim
- **Power Slider**: Drag to set reactor output 0–100%; all animation speeds, glows, and readouts update in real time
- **Control Dashboard** (sidebar panel):
  - Live thermal output (MWt)
  - Live electrical output (MWe) at 33% thermal efficiency / 220 kV AC
  - Reactor power percentage with colour-coded indicator
  - Grid output in MW
- **SMR Overlay**: Dashed integral-vessel boundary and "MODULAR" badge shown when SMR is selected
- **Reactor-type badges**: BWR shows direct-steam path; SMR natural-circulation loop (no primary pump)

### General Features
- **Scene Navigation**: Toggle between Scenes 1–4
- **Smooth Transitions**: Framer-motion animations between scenes
- **Undergraduate-Level Content**: Scientific accuracy with accessible explanations
- **Responsive Design**: Works on desktop and tablet devices; dashboard reflows below SVG on narrow screens

## Technology Stack

- **React 18**: Component-based UI framework
- **Framer Motion**: Advanced animations and transitions
- **Three.js / React Three Fiber**: 3D nucleus visualisation (Scene 1)
- **Vite**: Fast build tool and development server
- **CSS3**: Custom styling with gradients and effects

## Deployment

The app is deployed to GitHub Pages at: https://jcaballe1.github.io/nuclear_101

To redeploy after changes:
```bash
npm run build
cd dist
git add -A
git commit -m "Update deployment"
git push -f https://github.com/jcaballe1/nuclear_101.git master:gh-pages
cd ..
```

## Installation

1. Navigate to the nuclear_101 directory:
```bash
cd "c:\Users\andre\OneDrive - HZ University of Applied Sciences\Team Critical Materials - General\Research projects\Nucleus - Just Transition Fund\preliminary literature\nuclear_101"
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

## Building for Production

Create an optimized production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Educational Content

### Scene 1: Isotope Stability

#### Stable Isotope (Carbon-12)
- 6 protons, 6 neutrons
- Balanced nuclear forces
- Minimal vibration
- Indefinite stability

#### Unstable Isotope (Uranium-235)
- 92 protons, 143 neutrons
- High electrostatic repulsion
- Significant vibration
- Susceptible to induced fission

#### Nuclear Fission Preview
When a neutron is added to U-235, students can observe:
- Neutron absorption
- Nuclear destabilization
- Nucleus splitting into fragments
- Energy release visualization

### Scene 2: Fission & E=mc²

#### Four-Stage Fission Process
1. **Neutron Capture**: Slow neutron approaches and is absorbed by U-235
2. **Compound Nucleus**: U-236 forms, vibrates violently, and elongates
3. **Nuclear Split**: Electrostatic repulsion overcomes strong force, creating Kr-92 and Ba-141 plus 3 neutrons
4. **Energy Release**: Fragments fly apart at ~3% speed of light, releasing ~200 MeV as heat

#### Mass-Energy Equivalence
- **Before Fission**: U-235 + 1 neutron = 236.053 atomic mass units
- **After Fission**: Fragments + 3 neutrons = 235.867 atomic mass units
- **Missing Mass**: 0.186 u converts to 173 MeV of kinetic energy
- **E=mc²**: Demonstrates that mass and energy are interchangeable
- **Real-World Impact**: Enough energy from one atom to power a 100W bulb for 31 hours

## Component Structure

```
src/
├── main.jsx                          # Application entry point
├── index.css                         # Global styles
├── NucleusModule.jsx                 # Main container with scene navigation
├── NucleusModule.css                 # Module styles
└── components/
    ├── TextPanel.jsx                 # Scene 1 text content
    ├── TextPanel.css                 # Scene 1 text styles
    ├── NucleusVisualization.jsx      # Scene 1 nucleus display
    ├── NucleusVisualization.css      # Scene 1 visualization styles
    ├── Particle.jsx                  # Individual particle component
    ├── Scene2Fission.jsx             # Scene 2 main component
    ├── Scene2Fission.css             # Scene 2 styles
    ├── FissionAnimation.jsx          # Detailed fission animation
    ├── FissionAnimation.css          # Fission animation styles
    ├── BalanceScale.jsx              # Mass-energy balance visualization
    ├── BalanceScale.css              # Balance scale styles
    ├── Scene2TextPanel.jsx           # Scene 2 educational text
    └── Scene2TextPanel.css           # Scene 2 text styles
```

## Usage Guide

### Scene 1: The Nucleus
1. **Navigate to Scene 1**: Click the "Scene 1: The Nucleus" button at the top
2. **Toggle Isotopes**: Click "Stable Isotope" or "Unstable Isotope" buttons to switch views
3. **Observe Forces**: Watch the glowing aura (strong force) and red arrows (repulsion)
4. **Trigger Fission**: Click "Add Neutron" when viewing U-235 to see nuclear fission
5. **Read Explanations**: The left panel provides context for each isotope's behavior

### Scene 2: Fission & E=mc²
1. **Navigate to Scene 2**: Click the "Scene 2: Fission & E=mc²" button at the top
2. **Initiate Fission**: Click the "Initiate Fission" button to start the animation
3. **Watch the Sequence**:
   - Neutron approaches and is captured by U-235
   - Nucleus elongates like a water droplet
   - Nucleus splits into two fragments with neutrons shooting out
   - Energy shockwave expands and dissipates into heat particles
4. **View Mass-Energy Balance**: After the animation, the balance scale appears showing:
   - Left side: U-235 + 1 neutron (heavier)
   - Right side: Fragments + 3 neutrons (lighter)
   - Missing mass converts to energy via E=mc²
5. **Reset**: Click "Reset" to replay the animation
6. **Read Explanations**: The left panel explains each stage of fission and the E=mc² relationship

### Scene 3: Chain Reactions & Control
1. **Navigate to Scene 3**: Click the "Scene 3: Chain Reactions" button at the top
2. **Start Chain Reaction**: Click "Start Chain Reaction" to fire initial neutron into the grid
3. **Watch the Cascade**:
   - Initial neutron strikes a U-235 nucleus
   - Nucleus fissions, releasing 2-3 new neutrons
   - Each neutron can trigger more fissions
   - Chain reaction multiplies exponentially
4. **Control the Reaction**:
   - **Raise Control Rods** (slider left): Neutrons pass through, supercritical reaction
   - **Lower Control Rods** (slider right): Neutrons absorbed, reaction slows/stops
   - Watch neutrons glow and disappear when hitting control rods
5. **Monitor Temperature**:
   - Temperature gauge shows heat level (0-100%)
   - Blue = Cool, Yellow = Hot, Red = Critical
   - Warning appears when temperature > 70%
6. **Experiment**:
   - Try raising rods → Watch runaway reaction and temperature spike
   - Lower rods → Observe reaction slow down and temperature cool
   - Find the balance for steady-state (critical) operation
7. **Reset**: Click "Reset Reactor" to start over with fresh fuel
8. **Learn Critical States**: Left panel explains subcritical, critical, and supercritical states

## Future Enhancements

- Additional isotopes (e.g., Plutonium-239, Thorium-232)
- Chain reaction visualization
- Energy level diagrams
- Binding energy calculations
- Interactive quiz mode
- Mobile-responsive optimizations

## License

Educational use only. Part of the "Nucleus - Just Transition Fund" research project.

## Credits

Developed for HZ University of Applied Sciences
Team Critical Materials Research Project
