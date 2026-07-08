import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js'
import { prefersReducedMotion } from '../lib/motion'

const noise = new ImprovedNoise()

const BENCHES = 11
const SEGMENTS = 160
const TOP_RADIUS = 13
const BOTTOM_RADIUS = 2.2
const BENCH_DROP = 1.05

/**
 * Procedural open-pit mine: concentric benches stepping down to the pit
 * floor, with radial noise so the rim reads as blasted rock, not a lathe.
 */
function buildPit(): { solid: THREE.BufferGeometry; rings: THREE.BufferGeometry } {
  const rows: number[][] = [] // each row: flat array of xyz around a ring
  const radiusAt = (bench: number) =>
    THREE.MathUtils.lerp(TOP_RADIUS, BOTTOM_RADIUS, bench / BENCHES)

  const wobble = (r: number, theta: number, bench: number) => {
    const n = noise.noise(Math.cos(theta) * 1.3 + bench * 0.45, Math.sin(theta) * 1.3, bench * 0.31)
    return r * (1 + n * 0.13)
  }

  // two rings per bench (outer edge of terrace, inner edge before wall drop)
  for (let b = 0; b <= BENCHES; b++) {
    const y = -b * BENCH_DROP
    const rOuter = radiusAt(b)
    const rInner = b === BENCHES ? 0.001 : radiusAt(b) - (radiusAt(b) - radiusAt(b + 1)) * 0.55
    for (const r of b === BENCHES ? [rOuter] : [rOuter, rInner]) {
      const ring: number[] = []
      for (let s = 0; s <= SEGMENTS; s++) {
        const theta = (s / SEGMENTS) * Math.PI * 2
        const rr = wobble(r, theta, b)
        ring.push(Math.cos(theta) * rr, y, Math.sin(theta) * rr)
      }
      rows.push(ring)
    }
  }

  // triangulate strip between consecutive rows
  const positions: number[] = []
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i]
    const b = rows[i + 1]
    for (let s = 0; s < SEGMENTS; s++) {
      const a0 = s * 3
      const a1 = (s + 1) * 3
      positions.push(
        a[a0], a[a0 + 1], a[a0 + 2], b[a0], b[a0 + 1], b[a0 + 2], a[a1], a[a1 + 1], a[a1 + 2],
        a[a1], a[a1 + 1], a[a1 + 2], b[a0], b[a0 + 1], b[a0 + 2], b[a1], b[a1 + 1], b[a1 + 2],
      )
    }
  }
  const solid = new THREE.BufferGeometry()
  solid.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  solid.computeVertexNormals()

  // bench-edge contour lines (every ring)
  const linePositions: number[] = []
  for (const ring of rows) {
    for (let s = 0; s < SEGMENTS; s++) {
      const i0 = s * 3
      const i1 = (s + 1) * 3
      linePositions.push(ring[i0], ring[i0 + 1], ring[i0 + 2], ring[i1], ring[i1 + 1], ring[i1 + 2])
    }
  }
  // haul-road spokes: radial connectors every 1/8 turn so the benches read as one pit
  for (let s = 0; s < SEGMENTS; s += SEGMENTS / 8) {
    for (let i = 0; i < rows.length - 1; i++) {
      const i0 = s * 3
      linePositions.push(
        rows[i][i0], rows[i][i0 + 1], rows[i][i0 + 2],
        rows[i + 1][i0], rows[i + 1][i0 + 1], rows[i + 1][i0 + 2],
      )
    }
  }
  const rings = new THREE.BufferGeometry()
  rings.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
  return { solid, rings }
}

function Pit({ progressRef }: { progressRef: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null!)
  const reduced = useMemo(prefersReducedMotion, [])
  const { solid, rings } = useMemo(buildPit, [])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    const p = reduced ? 0.5 : (progressRef.current ?? 0)
    group.current.rotation.y = t * 0.04 + p * 1.1
    // camera descends into the pit as the section scrolls
    const cam = state.camera
    cam.position.y = THREE.MathUtils.lerp(11, 3.2, p)
    cam.position.z = THREE.MathUtils.lerp(24, 9.5, p)
    cam.lookAt(0, THREE.MathUtils.lerp(-3, -9.5, p), 0)
  })

  return (
    <group ref={group} position={[0, 1.2, 0]}>
      <mesh geometry={solid}>
        <meshStandardMaterial color="#241c12" metalness={0.2} roughness={0.85} flatShading side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={rings}>
        <lineBasicMaterial color="#e0a83e" transparent opacity={0.75} />
      </lineSegments>
    </group>
  )
}

export default function PitScene({ progressRef }: { progressRef: React.RefObject<number> }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 11, 24], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      className="!absolute inset-0"
      aria-hidden
    >
      <fog attach="fog" args={['#0c0a07', 14, 34]} />
      <ambientLight intensity={0.5} color="#c9b18a" />
      <directionalLight position={[6, 10, 4]} intensity={1.4} color="#ffe0b0" />
      <pointLight position={[0, -8, 0]} intensity={60} color="#e0a83e" distance={22} decay={2} />
      <Pit progressRef={progressRef} />
    </Canvas>
  )
}
