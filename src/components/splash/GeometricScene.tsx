import { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sparkles, Line } from '@react-three/drei';
import * as THREE from 'three';

extend({ Line_: THREE.Line });

function RotatingRings() {
  const outerRingRef = useRef<THREE.Mesh>(null);
  const middleRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (outerRingRef.current) {
      outerRingRef.current.rotation.x = Math.sin(t * 0.2) * 0.3;
      outerRingRef.current.rotation.y = t * 0.1;
    }
    if (middleRingRef.current) {
      middleRingRef.current.rotation.x = Math.cos(t * 0.3) * 0.4;
      middleRingRef.current.rotation.y = -t * 0.15;
      middleRingRef.current.rotation.z = Math.sin(t * 0.2) * 0.2;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.x = Math.sin(t * 0.4) * 0.5;
      innerRingRef.current.rotation.y = t * 0.2;
    }
  });

  const ringMaterial = useMemo(() => ({
    color: new THREE.Color('hsl(187, 85%, 43%)'),
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  }), []);

  return (
    <group>
      {/* Outer ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[3, 0.02, 16, 100]} />
        <meshStandardMaterial {...ringMaterial} opacity={0.3} />
      </mesh>

      {/* Middle ring */}
      <mesh ref={middleRingRef}>
        <torusGeometry args={[2.2, 0.02, 16, 100]} />
        <meshStandardMaterial {...ringMaterial} opacity={0.5} />
      </mesh>

      {/* Inner ring */}
      <mesh ref={innerRingRef}>
        <torusGeometry args={[1.5, 0.03, 16, 100]} />
        <meshStandardMaterial {...ringMaterial} opacity={0.7} />
      </mesh>
    </group>
  );
}

function HexagonalFrame() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.05;
      groupRef.current.rotation.z = Math.sin(t * 0.1) * 0.1;
    }
  });

  const hexPoints = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * 2.5, Math.sin(angle) * 2.5, 0));
    }
    points.push(points[0].clone());
    return points;
  }, []);

  return (
    <group ref={groupRef}>
      <Line
        points={hexPoints}
        color="hsl(187, 85%, 43%)"
        transparent
        opacity={0.3}
        lineWidth={1}
      />
      
      {/* Hexagon vertices with glowing spheres */}
      {hexPoints.slice(0, 6).map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color="hsl(187, 85%, 60%)"
            emissive="hsl(187, 85%, 43%)"
            emissiveIntensity={1}
          />
        </mesh>
      ))}
    </group>
  );
}

function CentralSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.1;
      meshRef.current.rotation.y = t * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.8, 1]} />
        <MeshDistortMaterial
          color="hsl(187, 85%, 30%)"
          emissive="hsl(187, 85%, 20%)"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
          distort={0.3}
          speed={2}
          transparent
          opacity={0.8}
        />
      </mesh>
    </Float>
  );
}

function OrbitingParticles() {
  const particlesRef = useRef<THREE.Group>(null);
  
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      angle: (i / 20) * Math.PI * 2,
      radius: 1.8 + Math.random() * 1.5,
      speed: 0.2 + Math.random() * 0.3,
      yOffset: (Math.random() - 0.5) * 2,
      color: i % 3 === 0 
        ? 'hsl(45, 100%, 70%)' 
        : i % 3 === 1 
          ? 'hsl(340, 90%, 65%)' 
          : 'hsl(187, 85%, 60%)',
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const p = particles[i];
        child.position.x = Math.cos(p.angle + t * p.speed) * p.radius;
        child.position.z = Math.sin(p.angle + t * p.speed) * p.radius;
        child.position.y = p.yOffset + Math.sin(t * 2 + i) * 0.3;
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.radius, p.yOffset, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshStandardMaterial
            color={p.color}
            emissive={p.color}
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
}

function DataLines() {
  const linesRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (linesRef.current) {
      linesRef.current.rotation.y = t * 0.02;
    }
  });

  const lines = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      return [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(
          Math.cos(angle) * 4,
          (Math.random() - 0.5) * 2,
          Math.sin(angle) * 4
        ),
      ];
    });
  }, []);

  return (
    <group ref={linesRef}>
      {lines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color="hsl(187, 85%, 43%)"
          transparent
          opacity={0.15}
          lineWidth={1}
        />
      ))}
    </group>
  );
}

export function GeometricScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="hsl(187, 85%, 60%)" />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="hsl(187, 85%, 40%)" />
        
        <RotatingRings />
        <HexagonalFrame />
        <CentralSphere />
        <OrbitingParticles />
        <DataLines />
        
        <Sparkles
          count={100}
          scale={8}
          size={1.5}
          speed={0.3}
          opacity={0.5}
          color="hsl(187, 85%, 60%)"
        />
      </Canvas>
    </div>
  );
}
