import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  useEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from 'react';
import {
  CanvasTexture,
  EquirectangularReflectionMapping,
  MathUtils,
  PMREMGenerator,
  SRGBColorSpace,
  type Group,
} from 'three';
import logoUrl from '@/assets/logo.webp';
import { createDart } from './createDart';
import styles from './DartStage.module.css';

/** Pose de repos : légèrement de trois quarts, une ailette face à l'écran. */
const REST = { rotX: 0.08, rotY: -0.15 };
const DART_SCALE = 0.4;

interface Controls {
  rotX: number;
  rotY: number;
  velX: number;
  velY: number;
  dragging: boolean;
  lastX: number;
  lastY: number;
  /** Secondes restantes avant de revenir à la pose de repos. */
  idle: number;
}

interface DartSceneProps {
  /** Faux quand la fléchette est hors écran : le rendu s'arrête (batterie). */
  active: boolean;
  reducedMotion: boolean;
}

export default function DartScene({ active, reducedMotion }: DartSceneProps) {
  const controls = useRef<Controls>({
    ...REST,
    velX: 0,
    velY: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    idle: 0,
  });

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const c = controls.current;
    event.currentTarget.setPointerCapture(event.pointerId);
    c.dragging = true;
    c.lastX = event.clientX;
    c.lastY = event.clientY;
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const c = controls.current;
    if (!c.dragging) return;
    c.velY = (event.clientX - c.lastX) * 0.009;
    c.velX = (event.clientY - c.lastY) * 0.006;
    c.rotY += c.velY;
    c.rotX += c.velX;
    c.lastX = event.clientX;
    c.lastY = event.clientY;
    c.idle = 2.5;
  };

  const endDrag = () => {
    controls.current.dragging = false;
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, [number, number]> = {
      ArrowLeft: [0, -0.15],
      ArrowRight: [0, 0.15],
      ArrowUp: [-0.12, 0],
      ArrowDown: [0.12, 0],
    };
    const move = step[event.key];
    if (!move) return;
    event.preventDefault();
    controls.current.rotX += move[0];
    controls.current.rotY += move[1];
    controls.current.idle = 2.5;
  };

  return (
    <div
      className={styles.scene}
      tabIndex={0}
      role="group"
      aria-roledescription="modèle 3D"
      aria-label="Fléchette du club en 3D, logo Darts Flinoise sur les ailettes. Glissez ou utilisez les flèches du clavier pour la faire tourner."
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        frameloop={active ? 'always' : 'never'}
        camera={{ fov: 26, position: [0, 0.25, 13], near: 0.1, far: 100 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 1.15;
        }}
      >
        <StudioEnvironment />
        <ambientLight intensity={0.9} />
        <directionalLight
          position={[3, 6, 7]}
          intensity={4}
          color="#ffe7c4"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />
        <directionalLight position={[-6, 1, -5]} intensity={2.4} color="#c8121a" />
        <directionalLight position={[-2, 0, 9]} intensity={1.6} />
        <mesh rotation-x={-Math.PI / 2} position-y={-2.6} receiveShadow>
          <planeGeometry args={[40, 40]} />
          <shadowMaterial opacity={0.4} />
        </mesh>
        <Dart controls={controls} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}

function Dart({
  controls,
  reducedMotion,
}: {
  controls: RefObject<Controls>;
  reducedMotion: boolean;
}) {
  const pivot = useRef<Group>(null);
  const gl = useThree((state) => state.gl);
  const model = useMemo(() => createDart(), []);
  const clock = useRef({ time: 0, intro: reducedMotion ? 1 : 0 });

  useEffect(() => () => model.dispose(), [model]);

  useEffect(() => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => model.setLogo(image, gl.capabilities.getMaxAnisotropy());
    image.src = logoUrl;
    return () => {
      image.onload = null;
    };
  }, [model, gl]);

  useFrame((state, delta) => {
    const group = pivot.current;
    if (!group) return;
    const dt = Math.min(delta, 0.05);
    const c = controls.current;
    const t = clock.current;
    t.time += dt;

    // Élan après un glisser, puis retour doux face au logo.
    if (!c.dragging) {
      const damping = Math.pow(0.92, dt * 60);
      c.velX *= damping;
      c.velY *= damping;
      c.rotX += c.velX;
      c.rotY += c.velY;
      c.idle = Math.max(0, c.idle - dt);
      if (c.idle === 0) {
        const ease = 1 - Math.pow(0.975, dt * 60);
        c.rotX += (REST.rotX - c.rotX) * ease;
        c.rotY += (REST.rotY - c.rotY) * ease;
      }
    }
    c.rotX = MathUtils.clamp(c.rotX, -1, 1);

    // Entrée en vol à l'ouverture de la page.
    if (t.intro < 1) t.intro = Math.min(1, t.intro + dt / 1.2);
    const arrive = 1 - Math.pow(1 - t.intro, 3);
    const float = reducedMotion ? 0 : Math.sin(t.time * 1.1) * 0.06;

    group.rotation.set(c.rotX, c.rotY, 0);
    group.position.set((1 - arrive) * 7, (1 - arrive) * -3 + float, 0);
    model.spinner.rotation.y =
      (reducedMotion ? 0 : Math.sin(t.time * 0.5) * 0.38) + (1 - arrive) * 7;

    // Recadrage pour les écrans en portrait (téléphones).
    const aspect = state.size.width / Math.max(state.size.height, 1);
    const fit = aspect < 1 ? (1 / Math.max(aspect, 0.6)) * 0.92 : 1;
    state.camera.position.set(0, 0.25, 13 * fit);
    state.camera.lookAt(0.15, 0.1, 0);
  });

  return (
    <group ref={pivot}>
      <group rotation-z={-Math.PI / 4} scale={DART_SCALE}>
        <primitive object={model.root} />
      </group>
    </group>
  );
}

/** Reflets du métal : un petit studio peint, converti en environnement. */
function StudioEnvironment() {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#14110e';
    ctx.fillRect(0, 0, 1024, 512);
    ctx.fillStyle = '#fff3de';
    ctx.fillRect(120, 50, 300, 110);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(600, 30, 140, 230);
    ctx.fillRect(880, 120, 60, 200);
    ctx.fillStyle = '#c8121a';
    ctx.fillRect(300, 300, 200, 50);
    ctx.fillStyle = '#3a332a';
    ctx.fillRect(0, 400, 1024, 112);

    const texture = new CanvasTexture(canvas);
    texture.mapping = EquirectangularReflectionMapping;
    texture.colorSpace = SRGBColorSpace;
    const pmrem = new PMREMGenerator(gl);
    const environment = pmrem.fromEquirectangular(texture).texture;
    scene.environment = environment;
    texture.dispose();
    pmrem.dispose();

    return () => {
      scene.environment = null;
      environment.dispose();
    };
  }, [gl, scene]);

  return null;
}
