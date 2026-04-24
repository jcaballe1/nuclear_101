import React, { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './NucleusVisualization3D.css';

// Mulberry32 deterministic PRNG (matches the 2D variant for consistent layout)
const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Generate Fibonacci-sphere distributed positions (uniform on a sphere surface)
const fibonacciSphere = (n, radius) => {
  const points = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(n - 1, 1)) * 2; // [-1, 1]
    const r = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    points.push([x * radius, y * radius, z * radius]);
  }
  return points;
};

// Instanced cluster of nucleons. Per-frame jitter for "vibration".
const NucleonCluster = ({ protons, neutrons, vibration, colorProton, colorNeutron }) => {
  const total = protons + neutrons;
  // Nuclear radius rule: r = r0 * A^(1/3); choose r0 so the nucleus fits the canvas.
  const radius = 0.9 * Math.cbrt(total);
  const nucleonR = Math.max(0.18, 0.45 / Math.cbrt(Math.max(total / 12, 1)));

  // Stable shuffled type assignment (interleave protons and neutrons)
  const types = useMemo(() => {
    const pool = [
      ...Array(protons).fill('p'),
      ...Array(neutrons).fill('n'),
    ];
    const rng = mulberry32(protons * 1000 + neutrons);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }, [protons, neutrons]);

  const basePositions = useMemo(() => fibonacciSphere(total, radius), [total, radius]);

  // Per-nucleon vibration phase/amplitude (stable per render)
  const phases = useMemo(() => {
    const rng = mulberry32(total + 7);
    return basePositions.map(() => ({
      px: rng() * Math.PI * 2,
      py: rng() * Math.PI * 2,
      pz: rng() * Math.PI * 2,
      sp: 1.5 + rng() * 1.5,
    }));
  }, [basePositions, total]);

  const protonRef = useRef();
  const neutronRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const protonIndices = useMemo(
    () => types.map((t, i) => (t === 'p' ? i : -1)).filter(i => i >= 0),
    [types]
  );
  const neutronIndices = useMemo(
    () => types.map((t, i) => (t === 'n' ? i : -1)).filter(i => i >= 0),
    [types]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const amp = 0.04 * vibration;

    const writeMatrices = (mesh, indices) => {
      if (!mesh) return;
      indices.forEach((nIdx, slot) => {
        const [bx, by, bz] = basePositions[nIdx];
        const ph = phases[nIdx];
        const dx = Math.sin(t * ph.sp + ph.px) * amp;
        const dy = Math.cos(t * ph.sp + ph.py) * amp;
        const dz = Math.sin(t * ph.sp * 0.8 + ph.pz) * amp;
        dummy.position.set(bx + dx, by + dy, bz + dz);
        dummy.updateMatrix();
        mesh.setMatrixAt(slot, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    };

    writeMatrices(protonRef.current, protonIndices);
    writeMatrices(neutronRef.current, neutronIndices);
  });

  return (
    <group>
      {/* Faint glow sphere representing the strong-force aura */}
      <mesh>
        <sphereGeometry args={[radius * 1.2, 32, 32]} />
        <meshBasicMaterial color={colorProton} transparent opacity={0.04} />
      </mesh>

      {protonIndices.length > 0 && (
        <instancedMesh
          ref={protonRef}
          args={[null, null, protonIndices.length]}
          castShadow
        >
          <sphereGeometry args={[nucleonR, 16, 16]} />
          <meshStandardMaterial
            color={colorProton}
            roughness={0.4}
            metalness={0.15}
            emissive={colorProton}
            emissiveIntensity={0.2}
          />
        </instancedMesh>
      )}

      {neutronIndices.length > 0 && (
        <instancedMesh
          ref={neutronRef}
          args={[null, null, neutronIndices.length]}
        >
          <sphereGeometry args={[nucleonR, 16, 16]} />
          <meshStandardMaterial
            color={colorNeutron}
            roughness={0.5}
            metalness={0.1}
            emissive={colorNeutron}
            emissiveIntensity={0.15}
          />
        </instancedMesh>
      )}
    </group>
  );
};

const NucleusVisualization3D = ({ protons, neutrons, vibration = 1 }) => {
  const total = protons + neutrons;
  const radius = 0.9 * Math.cbrt(total);
  const camDist = Math.max(8, radius * 4);

  return (
    <div className="nv3d-canvas-wrap" role="img" aria-label="3D nucleus visualization">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [camDist, camDist * 0.4, camDist], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.55} />
          <pointLight position={[10, 10, 10]} intensity={1.0} />
          <pointLight position={[-10, -6, -6]} intensity={0.4} color="#a855f7" />
          <NucleonCluster
            protons={protons}
            neutrons={neutrons}
            vibration={vibration}
            colorProton="#ef4444"
            colorNeutron="#fbbf24"
          />
          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={camDist * 0.5}
            maxDistance={camDist * 2.5}
            autoRotate
            autoRotateSpeed={0.6}
          />
        </Suspense>
      </Canvas>
      <div className="nv3d-hint" aria-hidden="true">drag to rotate · scroll to zoom</div>
    </div>
  );
};

export default NucleusVisualization3D;
