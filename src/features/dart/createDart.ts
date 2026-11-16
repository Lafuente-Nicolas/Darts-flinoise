import {
  CanvasTexture,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  Shape,
  ShapeGeometry,
  Vector2,
  type BufferGeometry,
  type Material,
} from 'three';

/**
 * Fléchette acier modélisée en centimètres, aux proportions d'un modèle de compétition :
 * pointe 3,2 cm · fût tungstène 5 cm (Ø 7,2 mm) · tige 3,5 cm · ailettes standard 3,7 × 1,75 cm.
 * L'axe de la fléchette est Y, la pointe en y = 0.
 */

const TIP_END = 3.2;
const BARREL_END = 8.2;
const SHAFT_END = 11.7;
const FLIGHT = { width: 1.75, height: 3.7, start: 9.5 } as const;
export const DART_LENGTH = FLIGHT.start + FLIGHT.height;

const COLORS = {
  flight: '#0b0b0b',
  flightEdge: '#c8121a',
};

type Profile = readonly (readonly [radius: number, y: number])[];

export interface DartModel {
  /** Groupe racine à placer dans la scène. */
  root: Group;
  /** Sous-groupe qui tourne sur l'axe de la fléchette. */
  spinner: Group;
  /** Imprime le logo sur les deux faces des ailettes. */
  setLogo(image: HTMLImageElement, anisotropy: number): void;
  dispose(): void;
}

export function createDart(): DartModel {
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [];

  const material = (params: ConstructorParameters<typeof MeshStandardMaterial>[0]) => {
    const m = new MeshStandardMaterial(params);
    materials.push(m);
    return m;
  };

  const M = {
    steel: material({ color: 0xe3e6ea, metalness: 1, roughness: 0.12 }),
    tungsten: material({ color: 0xa7adb4, metalness: 1, roughness: 0.22 }),
    grip: material({ color: 0x8e949b, metalness: 1, roughness: 0.42 }),
    pvdBlack: material({ color: 0x0e0e0f, metalness: 0.8, roughness: 0.3 }),
    pvdRed: material({ color: 0xc8121a, metalness: 0.55, roughness: 0.3 }),
    shaft: material({ color: 0x111111, metalness: 0.75, roughness: 0.26 }),
    chrome: material({ color: 0xd5d9de, metalness: 1, roughness: 0.08 }),
  };

  const lathe = (profile: Profile, mat: Material, segments = 64) => {
    const geometry = new LatheGeometry(
      profile.map(([r, y]) => new Vector2(r, y)),
      segments,
    );
    geometries.push(geometry);
    const mesh = new Mesh(geometry, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  };

  const ring = (from: number, to: number, radius: number, mat: Material) =>
    lathe(
      [
        [0, from],
        [radius, from],
        [radius, to],
        [0, to],
      ],
      mat,
      72,
    );

  const spinner = new Group();

  // Pointe acier (Ø 2,3 mm) et son épaulement
  spinner.add(
    lathe(
      [
        [0, 0],
        [0.025, 0.06],
        [0.07, 0.45],
        [0.1, 1.4],
        [0.115, 2.85],
        [0.17, 2.92],
        [0.17, TIP_END],
        [0, TIP_END],
      ],
      M.steel,
      32,
    ),
  );

  // Fût : nez fuselé…
  spinner.add(
    lathe(
      [
        [0, TIP_END],
        [0.22, TIP_END],
        [0.29, 3.32],
        [0.34, 3.62],
        [0.36, 3.78],
        [0, 3.78],
      ],
      M.tungsten,
      72,
    ),
  );

  // … zone de grip annelée, là où se posent les doigts…
  const grip: [number, number][] = [
    [0, 3.78],
    [0.36, 3.78],
  ];
  for (let y = 3.82; y < 6.3; y += 0.13) {
    grip.push([0.36, y], [0.322, y + 0.035], [0.322, y + 0.065], [0.36, y + 0.1]);
  }
  grip.push([0.36, 6.4], [0, 6.4]);
  spinner.add(lathe(grip, M.grip, 72));

  // … arrière lisse avec bandes PVD noires et liseré rouge.
  spinner.add(
    lathe(
      [
        [0, 6.4],
        [0.36, 6.4],
        [0.358, 6.9],
        [0.345, 7.35],
        [0.32, 7.75],
        [0.28, 8.05],
        [0.235, BARREL_END],
        [0, BARREL_END],
      ],
      M.tungsten,
      72,
    ),
  );
  spinner.add(ring(6.55, 6.7, 0.362, M.pvdBlack));
  spinner.add(ring(6.82, 6.88, 0.361, M.pvdRed));
  spinner.add(ring(7.0, 7.15, 0.356, M.pvdBlack));

  // Tige aluminium nervurée et anneau de maintien des ailettes
  const shaft: [number, number][] = [
    [0, BARREL_END],
    [0.19, BARREL_END],
    [0.19, 8.32],
    [0.15, 8.4],
  ];
  for (let y = 8.5; y < 10; y += 0.22) {
    shaft.push([0.142, y], [0.158, y + 0.07], [0.142, y + 0.14]);
  }
  shaft.push([0.145, 10.1], [0.15, 11.4], [0.165, 11.48], [0.165, SHAFT_END], [0, SHAFT_END]);
  spinner.add(lathe(shaft, M.shaft, 40));
  spinner.add(ring(11.32, 11.42, 0.19, M.chrome));

  // Ailettes : 4 pales emboîtées sur les 2,2 derniers centimètres de la tige
  const flightGeometry = new ShapeGeometry(flightShape(), 40);
  normalizeUv(flightGeometry);
  geometries.push(flightGeometry);

  const front = material({ color: 0xffffff, roughness: 0.45, metalness: 0.04 });
  const back = material({ color: 0xffffff, roughness: 0.45, metalness: 0.04 });
  setTexture(front, drawFlight(null, 'front'), 1);
  setTexture(back, drawFlight(null, 'back'), 1);

  for (let i = 0; i < 4; i++) {
    const blade = new Group();
    blade.rotation.y = (i * Math.PI) / 2;
    blade.position.y = FLIGHT.start;

    const frontMesh = new Mesh(flightGeometry, front);
    // Face arrière : même géométrie retournée, avec sa propre texture pour garder le logo lisible.
    const backMesh = new Mesh(flightGeometry, back);
    backMesh.scale.z = -1;
    frontMesh.castShadow = backMesh.castShadow = true;

    blade.add(frontMesh, backMesh);
    spinner.add(blade);
  }

  spinner.position.y = -DART_LENGTH / 2;
  const root = new Group();
  root.add(spinner);

  return {
    root,
    spinner,
    setLogo(image, anisotropy) {
      setTexture(front, drawFlight(image, 'front'), anisotropy);
      setTexture(back, drawFlight(image, 'back'), anisotropy);
    },
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => {
        if (m instanceof MeshStandardMaterial) m.map?.dispose();
        m.dispose();
      });
    },
  };
}

/* ------------------------------------------------------------------------- */

type PathCommand =
  | { op: 'move' | 'line'; x: number; y: number }
  | { op: 'curve'; cx: number; cy: number; x: number; y: number };

/** Ce qu'ont en commun un `Shape` three.js et un contexte 2D de canvas. */
interface PathTarget {
  moveTo(x: number, y: number): unknown;
  lineTo(x: number, y: number): unknown;
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): unknown;
}

/** Contour d'une ailette standard (x vers l'extérieur, y le long de la tige). */
function flightOutline(): PathCommand[] {
  const { width: W, height: H } = FLIGHT;
  return [
    { op: 'move', x: 0.16, y: 0 },
    { op: 'line', x: W * 0.9, y: H * 0.34 },
    { op: 'curve', cx: W, cy: H * 0.37, x: W, y: H * 0.43 },
    { op: 'line', x: W, y: H * 0.93 },
    { op: 'curve', cx: W, cy: H, x: W * 0.9, y: H },
    { op: 'line', x: 0, y: H },
    { op: 'line', x: 0, y: H * 0.62 },
    { op: 'line', x: 0.16, y: H * 0.62 },
  ];
}

/** Trace le contour sur une cible, avec une conversion de coordonnées optionnelle. */
function tracePath(
  target: PathTarget,
  map: (x: number, y: number) => readonly [number, number] = (x, y) => [x, y],
) {
  for (const cmd of flightOutline()) {
    const [x, y] = map(cmd.x, cmd.y);
    if (cmd.op === 'curve') {
      const [cx, cy] = map(cmd.cx, cmd.cy);
      target.quadraticCurveTo(cx, cy, x, y);
    } else if (cmd.op === 'move') {
      target.moveTo(x, y);
    } else {
      target.lineTo(x, y);
    }
  }
}

function flightShape(): Shape {
  const shape = new Shape();
  tracePath(shape);
  shape.closePath();
  return shape;
}

/** Ramène les UV de l'ailette dans [0, 1] pour qu'ils correspondent au canvas de texture. */
function normalizeUv(geometry: ShapeGeometry) {
  const uv = geometry.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) / FLIGHT.width, uv.getY(i) / FLIGHT.height);
  }
  uv.needsUpdate = true;
}

/**
 * Dessine l'ailette : fond noir, fines nervures, liseré rouge et logo.
 * La fléchette est inclinée de 45° à l'écran : le logo est tourné d'autant pour rester droit.
 * Vue de dos, la texture apparaît en miroir : on dessine donc un logo inversé, tourné dans l'autre sens.
 */
function drawFlight(logo: HTMLImageElement | null, side: 'front' | 'back'): HTMLCanvasElement {
  const { width: W, height: H } = FLIGHT;
  const px = 640;
  const canvas = document.createElement('canvas');
  canvas.width = px;
  canvas.height = Math.round((px * H) / W);
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const sx = canvas.width / W;
  const sy = canvas.height / H;
  const outline = () => {
    ctx.beginPath();
    tracePath(ctx, (x, y) => [x * sx, (H - y) * sy]);
    ctx.closePath();
  };

  ctx.save();
  outline();
  ctx.clip();
  ctx.fillStyle = COLORS.flight;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 2;
  for (let x = -canvas.height; x < canvas.width + canvas.height; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + canvas.height, canvas.height);
    ctx.stroke();
  }

  if (logo && logo.naturalWidth > 0) {
    const size = W * 0.86 * sx;
    const height = (size * logo.naturalHeight) / logo.naturalWidth;
    ctx.translate(W * 0.55 * sx, (H - H * 0.66) * sy); // centre du logo, aux 2/3 de la pale
    if (side === 'front') {
      ctx.rotate(-Math.PI / 4);
    } else {
      ctx.rotate(Math.PI / 4);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(logo, -size / 2, -height / 2, size, height);
  }
  ctx.restore();

  outline();
  ctx.lineWidth = 10;
  ctx.strokeStyle = COLORS.flightEdge;
  ctx.stroke();

  return canvas;
}

function setTexture(material: MeshStandardMaterial, canvas: HTMLCanvasElement, anisotropy: number) {
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = Math.min(8, anisotropy);
  material.map?.dispose();
  material.map = texture;
  material.needsUpdate = true;
}
