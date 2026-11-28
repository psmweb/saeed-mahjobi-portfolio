import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { ArenaProp } from "@/data/agents";

export type RobotRig = {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  arms: { pivot: THREE.Group; sx: number; hand: THREE.Object3D }[];
  eyes: THREE.InstancedMesh;
  happy: THREE.Mesh;
  thrusters: { mesh: THREE.InstancedMesh; material: THREE.MeshBasicMaterial };
  prop: THREE.Group;
  propKind: ArenaProp;
  leds: THREE.InstancedMesh;
  shadow: THREE.Mesh;
};

export type RobotKit = {
  make: (color: string, prop: ArenaProp, name: string) => RobotRig;
  dispose: () => void;
};

type Pose = {
  phase: number;
  raise: number;
  forward: number;
  jump: number;
  happy: boolean;
  wave: boolean;
  floor: number;
  look: number;
  nod: number;
  calm: boolean;
};

type Vec3 = readonly [number, number, number];

const ORIGIN: Vec3 = [0, 0, 0];
const UNIT: Vec3 = [1, 1, 1];

const posePosition = new THREE.Vector3();
const poseQuaternion = new THREE.Quaternion();
const poseScale = new THREE.Vector3();
const poseEuler = new THREE.Euler();
const poseMatrix = new THREE.Matrix4();
const poseDummy = new THREE.Object3D();

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
}

function radialTexture(color: string, disposables: THREE.Texture[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  disposables.push(texture);
  if (!context) return texture;
  const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.35, `${color}88`);
  gradient.addColorStop(1, `${color}00`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 256, 256);
  texture.needsUpdate = true;
  return texture;
}

function frameTexture(disposables: THREE.Texture[]) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 170;
  const context = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  disposables.push(texture);
  if (!context) return texture;
  context.fillStyle = "#0b1622";
  context.fillRect(0, 0, 256, 170);
  context.fillStyle = "#38BDF8";
  context.fillRect(16, 16, 90, 14);
  context.fillStyle = "rgba(56,189,248,0.5)";
  context.fillRect(16, 46, 220, 10);
  context.fillRect(16, 66, 180, 10);
  context.fillStyle = "#38BDF8";
  roundRect(context, 16, 100, 100, 42, 10);
  context.fill();
  texture.needsUpdate = true;
  return texture;
}

function additive(color: string, opacity: number, disposables: THREE.Material[]) {
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
    fog: false,
    side: THREE.DoubleSide,
  });
  disposables.push(material);
  return material;
}

function posed(
  geometry: THREE.BufferGeometry,
  position: Vec3 = ORIGIN,
  rotation: Vec3 = ORIGIN,
  scale: Vec3 = UNIT,
) {
  const clone = geometry.index ? geometry.toNonIndexed() : geometry.clone();
  posePosition.set(position[0], position[1], position[2]);
  poseEuler.set(rotation[0], rotation[1], rotation[2]);
  poseQuaternion.setFromEuler(poseEuler);
  poseScale.set(scale[0], scale[1], scale[2]);
  poseMatrix.compose(posePosition, poseQuaternion, poseScale);
  clone.applyMatrix4(poseMatrix);
  return clone;
}

function fused(parts: THREE.BufferGeometry[]) {
  const merged = mergeGeometries(parts, false);
  parts.forEach((part) => part.dispose());
  if (!merged) throw new Error("robot geometry merge failed");
  merged.computeBoundingSphere();
  return merged;
}

function mesh(parent: THREE.Object3D, geometry: THREE.BufferGeometry, material: THREE.Material) {
  const surface = new THREE.Mesh(geometry, material);
  parent.add(surface);
  return surface;
}

function placeInstance(
  target: THREE.InstancedMesh,
  index: number,
  position: Vec3,
  rotation: Vec3 = ORIGIN,
  scale: Vec3 = UNIT,
) {
  poseDummy.position.set(position[0], position[1], position[2]);
  poseDummy.rotation.set(rotation[0], rotation[1], rotation[2]);
  poseDummy.scale.set(scale[0], scale[1], scale[2]);
  poseDummy.updateMatrix();
  target.setMatrixAt(index, poseDummy.matrix);
}

/** Shared obsidian, brushed metal, and seam stock. Static parts are one mesh per material. */
export function createRobotKit(): RobotKit {
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const textures: THREE.Texture[] = [];
  const keep = <T extends THREE.BufferGeometry>(geometry: T) => {
    geometries.push(geometry);
    return geometry;
  };

  const obsidian = new THREE.MeshPhysicalMaterial({
    color: "#0C0E14",
    metalness: 0.55,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
  });
  const brushed = new THREE.MeshPhysicalMaterial({
    color: "#B4B8C2",
    metalness: 1,
    roughness: 0.3,
    anisotropy: 0.75,
    clearcoat: 0.3,
    clearcoatRoughness: 0.2,
  });
  const seam = new THREE.MeshStandardMaterial({ color: "#020203", roughness: 0.7, metalness: 0.2 });
  const ledLit = new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false });
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: radialTexture("#000000", textures),
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    toneMapped: false,
  });
  materials.push(obsidian, brushed, seam, ledLit, shadowMaterial);

  const torsoGeo = keep(new THREE.CapsuleGeometry(0.27, 0.26, 5, 12));
  const chestGeo = keep(new THREE.CircleGeometry(0.075, 18));
  const chestRingGeo = keep(new THREE.TorusGeometry(0.105, 0.015, 6, 18));
  const beltGeo = keep(new THREE.TorusGeometry(0.27, 0.03, 6, 20));
  const seamGeo = keep(new THREE.TorusGeometry(0.27, 0.006, 4, 20));
  const seamBarGeo = keep(new THREE.BoxGeometry(0.006, 0.3, 0.02));
  const ledGeo = keep(new THREE.SphereGeometry(0.014, 8, 6));
  const packGeo = keep(new RoundedBoxGeometry(0.3, 0.26, 0.06, 2, 0.02));
  const neckGeo = keep(new THREE.CylinderGeometry(0.08, 0.1, 0.12, 12));
  const headGeo = keep(new THREE.SphereGeometry(0.36, 24, 16));
  const shellGeo = keep(new THREE.SphereGeometry(0.365, 24, 14, 0, Math.PI * 2, 0, 1.05));
  const visorGeo = keep(new THREE.SphereGeometry(0.372, 24, 14, Math.PI / 2 - 1.02, 2.04, Math.PI / 2 - 0.5, 1));
  const visorRimGeo = keep(new THREE.TorusGeometry(0.3, 0.012, 6, 24, Math.PI));
  const eyeGeo = keep(new THREE.CapsuleGeometry(0.04, 0.07, 3, 8));
  const smileGeo = keep(new THREE.TorusGeometry(0.06, 0.016, 4, 12, Math.PI));
  const glowGeo = keep(new THREE.PlaneGeometry(0.7, 0.32));
  const earGeo = keep(new THREE.CylinderGeometry(0.095, 0.095, 0.08, 12));
  const earRingGeo = keep(new THREE.TorusGeometry(0.07, 0.014, 6, 14));
  const antennaGeo = keep(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6));
  const antennaBallGeo = keep(new THREE.SphereGeometry(0.035, 10, 8));
  const jointGeo = keep(new THREE.SphereGeometry(0.075, 12, 8));
  const armGeo = keep(new THREE.CapsuleGeometry(0.062, 0.2, 3, 8));
  const handGeo = keep(new THREE.SphereGeometry(0.085, 12, 8));
  const palmGeo = keep(new THREE.SphereGeometry(0.04, 8, 6));
  const wristGeo = keep(new THREE.TorusGeometry(0.068, 0.014, 6, 12));
  const capGeo = keep(new THREE.SphereGeometry(0.095, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2));
  const legGeo = keep(new THREE.CapsuleGeometry(0.075, 0.1, 3, 8));
  const bootGeo = keep(new THREE.CylinderGeometry(0.07, 0.095, 0.07, 12));
  const flameGeo = keep(new THREE.ConeGeometry(0.08, 0.42, 8, 1, true));
  const shadowGeo = keep(new THREE.PlaneGeometry(1.1, 1.1));
  const screen = frameTexture(textures);

  const bodyObsidian = keep(
    fused([
      posed(torsoGeo, ORIGIN, ORIGIN, [1.12, 1, 0.86]),
      posed(bootGeo, [-0.13, -0.62, 0]),
      posed(bootGeo, [0.13, -0.62, 0]),
    ]),
  );
  const bodyBrushed = keep(
    fused([
      posed(chestRingGeo, [0, 0.06, 0.232], [Math.PI / 2, 0, 0]),
      posed(beltGeo, [0, -0.15, 0], [Math.PI / 2, 0, 0], [1.12, 0.86, 1]),
      posed(packGeo, [0, 0.04, -0.22]),
      posed(neckGeo, [0, 0.43, 0]),
      posed(legGeo, [-0.13, -0.5, 0]),
      posed(legGeo, [0.13, -0.5, 0]),
    ]),
  );
  const bodySeam = keep(
    fused([
      posed(seamGeo, [0, 0.13, 0], [Math.PI / 2, 0, 0], [1.13, 0.87, 1]),
      posed(seamGeo, [0, -0.03, 0], [Math.PI / 2, 0, 0], [1.13, 0.87, 1]),
      posed(seamBarGeo, [0, -0.02, 0.23]),
    ]),
  );
  const bodyAccent = keep(fused([posed(chestGeo, [0, 0.06, 0.244])]));
  const headBrushed = keep(fused([posed(headGeo, ORIGIN, ORIGIN, [1.14, 0.96, 1]), posed(antennaGeo, [0.12, 0.4, 0])]));
  const headObsidian = keep(
    fused([
      posed(shellGeo, ORIGIN, ORIGIN, [1.14, 0.96, 1]),
      posed(earGeo, [-0.41, 0, 0], [0, 0, Math.PI / 2]),
      posed(earGeo, [0.41, 0, 0], [0, 0, Math.PI / 2]),
    ]),
  );
  const headAccent = keep(
    fused([
      posed(visorRimGeo, [0, 0.02, 0.2], [0, 0, Math.PI], [1.38, 0.62, 1]),
      posed(earRingGeo, [-0.452, 0, 0], [0, Math.PI / 2, 0]),
      posed(earRingGeo, [0.452, 0, 0], [0, Math.PI / 2, 0]),
      posed(antennaBallGeo, [0.12, 0.49, 0]),
    ]),
  );
  const headVisor = keep(fused([posed(visorGeo, ORIGIN, ORIGIN, [1.14, 0.96, 1])]));
  const smileMerged = keep(fused([posed(smileGeo, [-0.13, -0.01, 0.39]), posed(smileGeo, [0.13, -0.01, 0.39])]));
  const armBrushed = keep(
    fused([
      posed(jointGeo),
      posed(handGeo, [0, -0.36, 0]),
      posed(wristGeo, [0, -0.29, 0], [Math.PI / 2, 0, 0]),
    ]),
  );
  const armObsidian = keep(fused([posed(armGeo, [0, -0.17, 0]), posed(capGeo, [0, 0.01, 0])]));
  const armAccent = keep(fused([posed(palmGeo, [0, -0.43, 0])]));

  const haloGeo = keep(new THREE.TorusGeometry(0.3, 0.035, 8, 28));
  const serverGeo = keep(new RoundedBoxGeometry(0.3, 0.3, 0.3, 2, 0.04));
  const stripeBar = new THREE.BoxGeometry(0.2, 0.025, 0.01);
  const stripeGeo = keep(
    fused([
      posed(stripeBar, [0, -0.08, 0.152]),
      posed(stripeBar, [0, 0, 0.152]),
      posed(stripeBar, [0, 0.08, 0.152]),
    ]),
  );
  stripeBar.dispose();
  const frameGeo = keep(new RoundedBoxGeometry(0.42, 0.3, 0.03, 2, 0.02));
  const displayGeo = keep(new THREE.PlaneGeometry(0.36, 0.24));
  const prismGeo = keep(new THREE.OctahedronGeometry(0.2, 0));
  const barrelGeo = keep(new THREE.CylinderGeometry(0.15, 0.15, 0.16, 16));
  const lensRimGeo = keep(new THREE.TorusGeometry(0.13, 0.025, 6, 16));
  const lensGlassGeo = keep(new THREE.CircleGeometry(0.11, 16));
  const screenMaterial = new THREE.MeshBasicMaterial({ map: screen, toneMapped: false });
  materials.push(screenMaterial);

  const sideLeds = [-0.1, 0, 0.1] as const;
  const eyeSides = [-1, 1] as const;

  const make = (color: string, prop: ArenaProp, name: string): RobotRig => {
    const accent = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 1.6,
      roughness: 0.3,
    });
    const visorMaterial = new THREE.MeshPhysicalMaterial({
      color: "#05060A",
      metalness: 0.3,
      roughness: 0.04,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      iridescence: 0.45,
      iridescenceIOR: 1.4,
      emissive: color,
      emissiveIntensity: 0.18,
      envMapIntensity: 1.6,
    });
    const eyeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.35),
      toneMapped: false,
    });
    materials.push(accent, visorMaterial, eyeMaterial);

    const root = new THREE.Group();
    root.name = name;
    const body = new THREE.Group();
    root.add(body);
    mesh(body, bodyObsidian, obsidian);
    mesh(body, bodyBrushed, brushed);
    mesh(body, bodySeam, seam);
    mesh(body, bodyAccent, accent);

    const leds = new THREE.InstancedMesh(ledGeo, ledLit, 3);
    leds.frustumCulled = false;
    const sideColor = new THREE.Color(color);
    const midColor = new THREE.Color("#3DDC97");
    sideLeds.forEach((x, index) => {
      placeInstance(leds, index, [x, -0.09, 0.236]);
      leds.setColorAt(index, index === 1 ? midColor : sideColor);
    });
    leds.instanceMatrix.needsUpdate = true;
    if (leds.instanceColor) leds.instanceColor.needsUpdate = true;
    body.add(leds);

    const head = new THREE.Group();
    head.position.y = 0.76;
    body.add(head);
    mesh(head, headBrushed, brushed);
    mesh(head, headObsidian, obsidian);
    mesh(head, headVisor, visorMaterial);
    mesh(head, headAccent, accent);

    const eyes = new THREE.InstancedMesh(eyeGeo, eyeMaterial, 2);
    eyes.frustumCulled = false;
    eyeSides.forEach((sx, index) => {
      placeInstance(eyes, index, [sx * 0.13, 0.01, 0.385], [-0.05, 0, 0]);
    });
    eyes.instanceMatrix.needsUpdate = true;
    head.add(eyes);

    const happy = mesh(head, smileMerged, eyeMaterial);
    happy.visible = false;

    const glow = mesh(head, glowGeo, additive("#ffffff", 0.35, materials));
    const glowMap = radialTexture(color, textures);
    (glow.material as THREE.MeshBasicMaterial).map = glowMap;
    glow.position.set(0, 0, 0.39);

    const arms: RobotRig["arms"] = [];
    for (const sx of eyeSides) {
      const pivot = new THREE.Group();
      pivot.position.set(sx * 0.36, 0.22, 0);
      body.add(pivot);
      mesh(pivot, armBrushed, brushed);
      mesh(pivot, armObsidian, obsidian);
      mesh(pivot, armAccent, accent);
      const hand = new THREE.Object3D();
      hand.position.y = -0.36;
      pivot.add(hand);
      arms.push({ pivot, sx, hand });
    }

    const flameMaterial = additive(color, 0.7, materials);
    const thrusterMesh = new THREE.InstancedMesh(flameGeo, flameMaterial, 2);
    thrusterMesh.frustumCulled = false;
    eyeSides.forEach((sx, index) => {
      placeInstance(thrusterMesh, index, [sx * 0.13, -0.86, 0], [Math.PI, 0, 0]);
    });
    thrusterMesh.instanceMatrix.needsUpdate = true;
    body.add(thrusterMesh);

    const propPivot = new THREE.Group();
    propPivot.position.set(0.62, 0.95, 0);
    body.add(propPivot);
    if (prop === "halo") {
      const haloMaterial = new THREE.MeshStandardMaterial({
        color: "#FFD27A",
        emissive: "#F59E0B",
        emissiveIntensity: 2.2,
        metalness: 0.6,
        roughness: 0.2,
      });
      materials.push(haloMaterial);
      const halo = mesh(propPivot, haloGeo, haloMaterial);
      halo.rotation.x = Math.PI / 2.3;
      propPivot.position.set(0, 1.32, 0);
    }
    if (prop === "server") {
      mesh(propPivot, serverGeo, obsidian);
      mesh(propPivot, stripeGeo, accent);
    }
    if (prop === "frame") {
      mesh(propPivot, frameGeo, obsidian);
      const display = mesh(propPivot, displayGeo, screenMaterial);
      display.position.z = 0.017;
    }
    if (prop === "prism") {
      const prismMaterial = new THREE.MeshPhysicalMaterial({
        color: "#C4B5FD",
        roughness: 0.05,
        metalness: 0.05,
        transparent: true,
        opacity: 0.78,
        thickness: 0.4,
        emissive: "#7C3AED",
        emissiveIntensity: 0.85,
        flatShading: true,
        envMapIntensity: 1.4,
      });
      materials.push(prismMaterial);
      const prism = mesh(propPivot, prismGeo, prismMaterial);
      prism.scale.y = 1.4;
    }
    if (prop === "lens") {
      const barrel = mesh(propPivot, barrelGeo, obsidian);
      barrel.rotation.x = Math.PI / 2;
      const rim = mesh(propPivot, lensRimGeo, brushed);
      rim.position.z = 0.09;
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: "#1a0f08",
        metalness: 0.2,
        roughness: 0.02,
        clearcoat: 1,
        emissive: "#FB923C",
        emissiveIntensity: 0.5,
      });
      materials.push(glassMaterial);
      const glass = mesh(propPivot, lensGlassGeo, glassMaterial);
      glass.position.z = 0.085;
    }

    const shadow = mesh(root, shadowGeo, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;

    const rim = new THREE.PointLight(color, 3.5, 3.2, 2);
    rim.position.set(0, 0.9, -0.7);
    body.add(rim);

    return {
      root,
      body,
      head,
      arms,
      eyes,
      happy,
      thrusters: { mesh: thrusterMesh, material: flameMaterial },
      prop: propPivot,
      propKind: prop,
      leds,
      shadow,
    };
  };

  return {
    make,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      textures.forEach((texture) => texture.dispose());
      geometries.length = 0;
      materials.length = 0;
      textures.length = 0;
    },
  };
}

const EYE_X = [-0.13, 0.13] as const;
const LED_X = [-0.1, 0, 0.1] as const;
const FLAME_X = [-0.13, 0.13] as const;

export function poseRobot(rig: RobotRig, time: number, pose: Pose) {
  const motion = pose.calm ? 0 : time;
  const bob = pose.calm ? 0 : Math.sin(motion * 3.2 + pose.phase) * 0.06;
  rig.body.position.y = bob + pose.jump;
  rig.body.rotation.z = pose.calm ? 0 : Math.sin(motion * 2 + pose.phase) * 0.04;
  rig.head.rotation.y = (pose.calm ? 0 : Math.sin(motion * 1.7 + pose.phase) * 0.18) + pose.look;
  rig.head.rotation.x = (pose.calm ? 0 : Math.sin(motion * 2.3 + pose.phase) * 0.06) + pose.nod;
  rig.head.rotation.z = pose.calm ? 0 : Math.sin(motion * 1.3 + pose.phase) * 0.06;

  const blink = pose.calm ? 1 : (motion * 1.1 + pose.phase) % 3.1 < 0.09 ? 0.15 : 1;
  EYE_X.forEach((x, index) => {
    placeInstance(rig.eyes, index, [x, 0.01, 0.385], [-0.05, 0, 0], [1, blink, 1]);
  });
  rig.eyes.instanceMatrix.needsUpdate = true;
  rig.eyes.visible = !pose.happy;
  rig.happy.visible = pose.happy;

  rig.arms.forEach((arm, index) => {
    const swing = pose.calm ? 0 : Math.sin(motion * 3 + pose.phase + index * Math.PI) * 0.18;
    arm.pivot.rotation.z =
      arm.sx * (0.18 + swing * 0.3) * (1 - pose.raise) + arm.sx * pose.raise * 2.4 * (1 - pose.forward * 0.6);
    arm.pivot.rotation.x = -pose.forward * 1.35 * pose.raise;
    if (pose.wave && index === 1) {
      arm.pivot.rotation.z = arm.sx * (2.5 + (pose.calm ? 0 : Math.sin(motion * 14) * 0.35));
    }
  });

  LED_X.forEach((x, index) => {
    const on = pose.calm ? true : (motion * 2.2 + index * 0.7 + pose.phase) % 1.6 > 0.35;
    const scale = on ? 1 : 0;
    placeInstance(rig.leds, index, [x, -0.09, 0.236], ORIGIN, [scale, scale, scale]);
  });
  rig.leds.instanceMatrix.needsUpdate = true;

  let opacity = 0;
  FLAME_X.forEach((x, index) => {
    const stretch = pose.calm ? 1 : 0.8 + 0.35 * Math.sin(motion * 28 + index * 2 + pose.phase);
    placeInstance(rig.thrusters.mesh, index, [x, -0.86, 0], [Math.PI, 0, 0], [1, stretch, 1]);
    opacity += pose.calm ? 0.55 : 0.55 + 0.25 * Math.sin(motion * 19 + index);
  });
  rig.thrusters.mesh.instanceMatrix.needsUpdate = true;
  rig.thrusters.material.opacity = opacity / FLAME_X.length;

  const hover = rig.propKind === "halo" ? 1.32 : 0.95;
  rig.prop.rotation.y = pose.calm ? 0 : motion * 1.4 + pose.phase;
  rig.prop.position.y = hover + (pose.calm ? 0 : Math.sin(motion * 2.6 + pose.phase) * 0.05);
  rig.shadow.position.y = pose.floor - rig.root.position.y;
}
