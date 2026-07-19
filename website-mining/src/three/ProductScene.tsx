import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { prefersReducedMotion } from '../lib/motion'

const GOLD = new THREE.Color('#e0a83e')
const STRATA = new THREE.Color('#17130e')

/** Fallback texture for items with no photo — matches ItemCard's "no photo" state. */
function buildPlaceholderTexture(): THREE.Texture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#241d14'
  ctx.fillRect(0, 0, size, size)
  ctx.save()
  ctx.translate(size / 2, size / 2 - 18)
  ctx.rotate(Math.PI / 4)
  ctx.fillStyle = 'rgba(224,168,62,0.6)'
  ctx.fillRect(-7, -7, 14, 14)
  ctx.restore()
  ctx.fillStyle = 'rgba(138,129,119,0.9)'
  ctx.font = '600 15px ui-monospace, monospace'
  ctx.textAlign = 'center'
  ctx.letterSpacing = '2px'
  ctx.fillText('NO PHOTO — ASK US', size / 2, size / 2 + 34)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/** Slow-drifting gold specks around the plate. */
function Dust() {
  const points = useRef<THREE.Points>(null!)
  const reduced = useMemo(prefersReducedMotion, [])
  const { positions, seeds } = useMemo(() => {
    const count = 220
    const positions = new Float32Array(count * 3)
    const seeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 7
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4
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
    grad.addColorStop(0.4, 'rgba(224,168,62,0.4)')
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
      pos.setY(i, pos.getY(i) + Math.sin(t * 0.4 + seed) * 0.0009 + 0.0012)
      pos.setX(i, pos.getX(i) + Math.cos(t * 0.3 + seed) * 0.0007)
      if (pos.getY(i) > 2.6) pos.setY(i, -2.6)
    }
    pos.needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={0.05}
        transparent
        opacity={0.7}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

/** Gold-edged specimen plate carrying the product photo on its face. */
function Plate({ image }: { image: string | null }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    let cancelled = false
    if (!image) {
      setTexture(buildPlaceholderTexture())
      return
    }
    const loader = new THREE.TextureLoader()
    loader.load(
      image,
      (tex) => {
        if (cancelled) return
        tex.colorSpace = THREE.SRGBColorSpace
        setTexture(tex)
      },
      undefined,
      () => {
        if (cancelled) return
        setTexture(buildPlaceholderTexture())
      },
    )
    return () => {
      cancelled = true
    }
  }, [image])

  const geometry = useMemo(() => new THREE.BoxGeometry(2.6, 1.95, 0.1), [])

  const edgeMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: GOLD, metalness: 0.85, roughness: 0.32 }),
    [],
  )
  const backMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: STRATA, metalness: 0.4, roughness: 0.6 }),
    [],
  )

  const faceMaterial = useMemo(() => {
    if (!texture) return backMaterial
    // bone tint multiplies the photo's white background into the site's card stock
    return new THREE.MeshStandardMaterial({
      map: texture,
      color: new THREE.Color('#ede6d8'),
      metalness: 0.1,
      roughness: 0.55,
    })
  }, [texture, backMaterial])

  const materials = useMemo(
    () => [edgeMaterial, edgeMaterial, edgeMaterial, edgeMaterial, faceMaterial, backMaterial],
    [edgeMaterial, faceMaterial, backMaterial],
  )

  return (
    <group rotation={[0, 0.18, 0]}>
      <mesh geometry={geometry} material={materials} />
    </group>
  )
}

export default function ProductScene({ image }: { image: string | null }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 4.6], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      className="!absolute inset-0"
      aria-hidden
    >
      <fog attach="fog" args={['#0c0a07', 6, 11]} />
      <ambientLight intensity={0.4} color="#c9b18a" />
      <directionalLight position={[3, 3, 5]} intensity={2} color="#ffe0b0" />
      <directionalLight position={[-4, -2, 2]} intensity={0.45} color="#3a6ea5" />
      <pointLight position={[-2.5, 1.5, 3.5]} intensity={16} color="#e0a83e" distance={10} decay={2} />
      <Plate image={image} />
      <Dust />
    </Canvas>
  )
}
