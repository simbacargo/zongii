import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js'
import { prefersReducedMotion } from '../lib/motion'

const noise = new ImprovedNoise()

function fbm(x: number, y: number, z: number, octaves = 4): number {
  let value = 0
  let amplitude = 0.5
  let frequency = 1
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise.noise(x * frequency, y * frequency, z * frequency)
    amplitude *= 0.5
    frequency *= 2.05
  }
  return value
}

const BASALT = new THREE.Color('#241c12')
const BASALT_DARK = new THREE.Color('#120e08')
const GOLD = new THREE.Color('#e0a83e')
const GOLD_HOT = new THREE.Color('#f2c164')

/** Procedural gold-ore boulder: fbm-displaced icosahedron with vein colouring. */
function buildOreGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1.7, 96)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)
  const v = new THREE.Vector3()
  const c = new THREE.Color()

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).normalize()
    // chunky rock silhouette: low-frequency fbm + a hint of faceting
    const bump = fbm(v.x * 1.5 + 7.3, v.y * 1.5 + 2.1, v.z * 1.5 + 5.8)
    const facet = Math.abs(fbm(v.x * 3.4, v.y * 3.4, v.z * 3.4, 2)) * 0.35
    const r = 1.7 * (1 + bump * 0.34 + facet)
    pos.setXYZ(i, v.x * r, v.y * r, v.z * r)

    // gold veins: narrow bands where a second noise field crosses zero
    const vein = fbm(v.x * 2.6 + 31.7, v.y * 2.6 + 11.2, v.z * 2.6 + 19.4, 3)
    const veinMask = 1 - THREE.MathUtils.smoothstep(Math.abs(vein), 0.02, 0.16)
    const sparkle = fbm(v.x * 9 + 3.3, v.y * 9 + 8.8, v.z * 9 + 1.1, 2)
    const speckle = 1 - THREE.MathUtils.smoothstep(Math.abs(sparkle), 0.015, 0.05)

    const rockShade = 0.5 + 0.5 * fbm(v.x * 5 + 50, v.y * 5 + 50, v.z * 5 + 50, 3)
    c.copy(BASALT_DARK).lerp(BASALT, rockShade)
    c.lerp(veinMask > 0.5 ? GOLD_HOT : GOLD, Math.max(veinMask, speckle * 0.85))
    colors[i * 3] = c.r
    colors[i * 3 + 1] = c.g
    colors[i * 3 + 2] = c.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  return geo
}

function Ore({ scrollRef }: { scrollRef: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null!)
  const inner = useRef<THREE.Mesh>(null!)
  const geometry = useMemo(buildOreGeometry, [])
  const reduced = useMemo(prefersReducedMotion, [])
  const pointer = useThree((s) => s.pointer)

  useFrame((state, delta) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    const scroll = scrollRef.current ?? 0
    if (!reduced) {
      inner.current.rotation.y = t * 0.12 + scroll * 2.4
      inner.current.rotation.x = Math.sin(t * 0.15) * 0.08 + scroll * 0.7
      group.current.position.y = Math.sin(t * 0.5) * 0.08 - scroll * 1.6
      // mouse parallax, eased
      const targetX = pointer.x * 0.22
      const targetY = pointer.y * 0.12
      group.current.rotation.y += (targetX - group.current.rotation.y) * Math.min(1, delta * 2.4)
      group.current.rotation.x += (-targetY - group.current.rotation.x) * Math.min(1, delta * 2.4)
    }
    const s = 1 - scroll * 0.25
    group.current.scale.setScalar(s)
  })

  return (
    <group ref={group}>
      <mesh ref={inner} geometry={geometry}>
        <meshStandardMaterial vertexColors metalness={0.75} roughness={0.38} flatShading={false} />
      </mesh>
    </group>
  )
}

/** Slow-drifting gold dust. */
function Dust({ scrollRef }: { scrollRef: React.RefObject<number> }) {
  const points = useRef<THREE.Points>(null!)
  const reduced = useMemo(prefersReducedMotion, [])
  const { positions, seeds } = useMemo(() => {
    const count = 520
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 14
      positions[i * 3 + 1] = (Math.random() - 0.5) * 9
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1
      seeds[i] = Math.random() * Math.PI * 2
    }
    return { positions, seeds }
  }, [])

  const texture = useMemo(() => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')!
    const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    grad.addColorStop(0, 'rgba(242,193,100,1)')
    grad.addColorStop(0.4, 'rgba(224,168,62,0.45)')
    grad.addColorStop(1, 'rgba(224,168,62,0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)
    return new THREE.CanvasTexture(canvas)
  }, [])

  useFrame((state) => {
    if (!points.current || reduced) return
    const t = state.clock.elapsedTime
    const pos = points.current.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const seed = seeds[i]
      pos.setY(i, pos.getY(i) + Math.sin(t * 0.4 + seed) * 0.0011 + 0.0016)
      pos.setX(i, pos.getX(i) + Math.cos(t * 0.3 + seed) * 0.0008)
      if (pos.getY(i) > 4.6) pos.setY(i, -4.6)
    }
    pos.needsUpdate = true
    points.current.position.y = -(scrollRef.current ?? 0) * 0.8
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.055}
        transparent
        opacity={0.75}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

export default function OreScene({ scrollRef }: { scrollRef: React.RefObject<number> }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      className="!absolute inset-0"
      aria-hidden
    >
      <fog attach="fog" args={['#0c0a07', 7, 13]} />
      <ambientLight intensity={0.35} color="#c9b18a" />
      <directionalLight position={[4, 3, 5]} intensity={2.1} color="#ffe0b0" />
      <directionalLight position={[-5, -2, 2]} intensity={0.5} color="#3a6ea5" />
      <pointLight position={[-3, 2, 4]} intensity={26} color="#e0a83e" distance={12} decay={2} />
      <Ore scrollRef={scrollRef} />
      <Dust scrollRef={scrollRef} />
    </Canvas>
  )
}
