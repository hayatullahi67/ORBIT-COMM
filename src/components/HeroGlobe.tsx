import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sphere, MeshDistortMaterial, Float, Text3D, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedGlobe() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const particlesRef = useRef<THREE.Points>(null!)

  // Create floating particles around the globe
  const particles = useMemo(() => {
    const positions = new Float32Array(2000 * 3)
    for (let i = 0; i < 2000; i++) {
      const radius = 4 + Math.random() * 6
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = 2 * Math.PI * Math.random()
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)
    }
    return positions
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.1
      meshRef.current.rotation.z = Math.sin(time * 0.2) * 0.1
    }
    
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.05
      particlesRef.current.rotation.x = time * 0.03
    }
  })

  return (
    <group>
      {/* Main Globe */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <Sphere ref={meshRef} args={[2, 64, 64]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color="#3b82f6"
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </Float>

      {/* Floating Particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={particles}
            itemSize={3}
            count={particles.length / 3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.02} color="#60a5fa" transparent opacity={0.6} />
      </points>

      {/* Ambient lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9333ea" />
    </group>
  )
}

const HeroGlobe = () => {
  return (
    <div className="h-64 sm:h-80 lg:h-96 w-full">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
        <AnimatedGlobe />
      </Canvas>
    </div>
  )
}

export default HeroGlobe