import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { ArenaProp } from "@/data/agents";

export type RobotRig = {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  arms: { pivot: THREE.Group; sx: number; hand: THREE.Object3D }[];
  eyes: THREE.Mesh[];
  happy: THREE.Mesh[];
  thrusters: { mesh: THREE.Mesh; material: THREE.MeshBasicMaterial }[];
  prop: THREE.Group;
  propKind: ArenaProp;
  leds: THREE.Mesh[];
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

/** Shared obsidian, brushed metal, and seam stock. One geometry set for all five rigs. */
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
  const ledGreen = new THREE.MeshBasicMaterial({ color: "#3DDC97", toneMapped: false });
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: radialTexture("#000000", textures),
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    toneMapped: false,
  });
  materials.push(obsidian, brushed, seam, ledGreen, shadowMaterial);

  const torsoGeo = keep(new THREE.CapsuleGeometry(0.27, 0.26, 8, 20));
  const chestGeo = keep(new THREE.CircleGeometry(0.075, 28));
  const chestRingGeo = keep(new THREE.TorusGeometry(0.105, 0.015, 8, 28));
  const beltGeo = keep(new THREE.TorusGeometry(0.27, 0.03, 8, 32));
  const seamGeo = keep(new THREE.TorusGeometry(0.27, 0.006, 6, 36));
  const seamBarGeo = keep(new THREE.BoxGeometry(0.006, 0.3, 0.02));
  const ledGeo = keep(new THREE.SphereGeometry(0.014, 8, 6));
  const packGeo = keep(new RoundedBoxGeometry(0.3, 0.26, 0.06, 2, 0.02));
  const neckGeo = keep(new THREE.CylinderGeometry(0.08, 0.1, 0.12, 16));
  const headGeo = keep(new THREE.SphereGeometry(0.36, 32, 24));
  const shellGeo = keep(new THREE.SphereGeometry(0.365, 32, 20, 0, Math.PI * 2, 0, 1.05));
  const visorGeo = keep(new THREE.SphereGeometry(0.372, 36, 20, Math.PI / 2 - 1.02, 2.04, Math.PI / 2 - 0.5, 1));
  const visorRimGeo = keep(new THREE.TorusGeometry(0.3, 0.012, 8, 40, Math.PI));
  const eyeGeo = keep(new THREE.CapsuleGeometry(0.04, 0.07, 4, 10));
  const smileGeo = keep(new THREE.TorusGeometry(0.06, 0.016, 6, 16, Math.PI));
  const glowGeo = keep(new THREE.PlaneGeometry(0.7, 0.32));
  const earGeo = keep(new THREE.CylinderGeometry(0.095, 0.095, 0.08, 20));
  const earRingGeo = keep(new THREE.TorusGeometry(0.07, 0.014, 8, 20));
  const antennaGeo = keep(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8));
  const antennaBallGeo = keep(new THREE.SphereGeometry(0.035, 12, 10));
  const jointGeo = keep(new THREE.SphereGeometry(0.075, 16, 12));
  const armGeo = keep(new THREE.CapsuleGeometry(0.062, 0.2, 4, 12));
  const handGeo = keep(new THREE.SphereGeometry(0.085, 16, 12));
  const palmGeo = keep(new THREE.SphereGeometry(0.04, 10, 8));
  const wristGeo = keep(new THREE.TorusGeometry(0.068, 0.014, 8, 20));
  const capGeo = keep(new THREE.SphereGeometry(0.095, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2));
  const legGeo = keep(new THREE.CapsuleGeometry(0.075, 0.1, 4, 12));
  const bootGeo = keep(new THREE.CylinderGeometry(0.07, 0.095, 0.07, 16));
  const flameGeo = keep(new THREE.ConeGeometry(0.08, 0.42, 12, 1, true));
  const shadowGeo = keep(new THREE.PlaneGeometry(1.1, 1.1));
  const screen = frameTexture(textures);

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
    const ledSide = new THREE.MeshBasicMaterial({ color, toneMapped: false });
    materials.push(accent, visorMaterial, eyeMaterial, ledSide);

    const root = new THREE.Group();
    root.name = name;
    const body = new THREE.Group();
    root.add(body);

    const torso = new THREE.Mesh(torsoGeo, obsidian);
    torso.scale.set(1.12, 1, 0.86);
    body.add(torso);

    const chest = new THREE.Mesh(chestGeo, accent);
    chest.position.set(0, 0.06, 0.244);
    body.add(chest);
    const chestRing = new THREE.Mesh(chestRingGeo, brushed);
    chestRing.position.set(0, 0.06, 0.232);
    body.add(chestRing);

    const belt = new THREE.Mesh(beltGeo, brushed);
    belt.rotation.x = Math.PI / 2;
    belt.scale.set(1.12, 0.86, 1);
    belt.position.y = -0.15;
    body.add(belt);
    for (const y of [0.13, -0.03]) {
      const band = new THREE.Mesh(seamGeo, seam);
      band.rotation.x = Math.PI / 2;
      band.scale.set(1.13, 0.87, 1);
      band.position.y = y;
      body.add(band);
    }
    const seamBar = new THREE.Mesh(seamBarGeo, seam);
    seamBar.position.set(0, -0.02, 0.23);
    body.add(seamBar);

    const leds: THREE.Mesh[] = [];
    for (let q = 0; q < 3; q += 1) {
      const led = new THREE.Mesh(ledGeo, q === 1 ? ledGreen : ledSide);
      led.position.set(-0.1 + q * 0.1, -0.09, 0.236);
      body.add(led);
      leds.push(led);
    }

    const pack = new THREE.Mesh(packGeo, brushed);
    pack.position.set(0, 0.04, -0.22);
    body.add(pack);
    const neck = new THREE.Mesh(neckGeo, brushed);
    neck.position.y = 0.43;
    body.add(neck);

    const head = new THREE.Group();
    head.position.y = 0.76;
    body.add(head);
    const skull = new THREE.Mesh(headGeo, brushed);
    skull.scale.set(1.14, 0.96, 1);
    head.add(skull);
    const shell = new THREE.Mesh(shellGeo, obsidian);
    shell.scale.set(1.14, 0.96, 1);
    head.add(shell);
    const visor = new THREE.Mesh(visorGeo, visorMaterial);
    visor.scale.set(1.14, 0.96, 1);
    head.add(visor);
    const visorRim = new THREE.Mesh(visorRimGeo, accent);
    visorRim.rotation.z = Math.PI;
    visorRim.scale.set(1.38, 0.62, 1);
    visorRim.position.set(0, 0.02, 0.2);
    head.add(visorRim);

    const eyes: THREE.Mesh[] = [];
    const happy: THREE.Mesh[] = [];
    for (const sx of [-1, 1]) {
      const eye = new THREE.Mesh(eyeGeo, eyeMaterial);
      eye.position.set(sx * 0.13, 0.01, 0.385);
      eye.rotation.x = -0.05;
      head.add(eye);
      eyes.push(eye);
      const smile = new THREE.Mesh(smileGeo, eyeMaterial);
      smile.position.set(sx * 0.13, -0.01, 0.39);
      smile.visible = false;
      head.add(smile);
      happy.push(smile);
    }

    const glow = new THREE.Mesh(
      glowGeo,
      additive("#ffffff", 0.35, materials),
    );
    const glowMap = radialTexture(color, textures);
    (glow.material as THREE.MeshBasicMaterial).map = glowMap;
    glow.position.set(0, 0, 0.39);
    head.add(glow);

    for (const sx of [-1, 1]) {
      const ear = new THREE.Mesh(earGeo, obsidian);
      ear.rotation.z = Math.PI / 2;
      ear.position.set(sx * 0.41, 0, 0);
      head.add(ear);
      const ring = new THREE.Mesh(earRingGeo, accent);
      ring.rotation.y = Math.PI / 2;
      ring.position.set(sx * 0.452, 0, 0);
      head.add(ring);
    }

    const antenna = new THREE.Mesh(antennaGeo, brushed);
    antenna.position.set(0.12, 0.4, 0);
    head.add(antenna);
    const antennaBall = new THREE.Mesh(antennaBallGeo, accent);
    antennaBall.position.set(0.12, 0.49, 0);
    head.add(antennaBall);

    const arms: RobotRig["arms"] = [];
    for (const sx of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(sx * 0.36, 0.22, 0);
      body.add(pivot);
      pivot.add(new THREE.Mesh(jointGeo, brushed));
      const upper = new THREE.Mesh(armGeo, obsidian);
      upper.position.y = -0.17;
      pivot.add(upper);
      const hand = new THREE.Mesh(handGeo, brushed);
      hand.position.y = -0.36;
      pivot.add(hand);
      const palm = new THREE.Mesh(palmGeo, accent);
      palm.position.y = -0.43;
      pivot.add(palm);
      const wrist = new THREE.Mesh(wristGeo, brushed);
      wrist.rotation.x = Math.PI / 2;
      wrist.position.y = -0.29;
      pivot.add(wrist);
      const cap = new THREE.Mesh(capGeo, obsidian);
      cap.position.y = 0.01;
      pivot.add(cap);
      arms.push({ pivot, sx, hand });
    }

    const thrusters: RobotRig["thrusters"] = [];
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(legGeo, brushed);
      leg.position.set(sx * 0.13, -0.5, 0);
      body.add(leg);
      const boot = new THREE.Mesh(bootGeo, obsidian);
      boot.position.set(sx * 0.13, -0.62, 0);
      body.add(boot);
      const flameMaterial = additive(color, 0.7, materials);
      const flame = new THREE.Mesh(flameGeo, flameMaterial);
      flame.rotation.x = Math.PI;
      flame.position.set(sx * 0.13, -0.86, 0);
      body.add(flame);
      thrusters.push({ mesh: flame, material: flameMaterial });
    }

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
      const halo = new THREE.Mesh(keep(new THREE.TorusGeometry(0.3, 0.035, 10, 48)), haloMaterial);
      halo.rotation.x = Math.PI / 2.3;
      propPivot.position.set(0, 1.32, 0);
      propPivot.add(halo);
    }
    if (prop === "server") {
      propPivot.add(new THREE.Mesh(keep(new RoundedBoxGeometry(0.3, 0.3, 0.3, 3, 0.04)), obsidian));
      for (let i = 0; i < 3; i += 1) {
        const stripe = new THREE.Mesh(keep(new THREE.BoxGeometry(0.2, 0.025, 0.01)), accent);
        stripe.position.set(0, -0.08 + i * 0.08, 0.152);
        propPivot.add(stripe);
      }
    }
    if (prop === "frame") {
      propPivot.add(new THREE.Mesh(keep(new RoundedBoxGeometry(0.42, 0.3, 0.03, 2, 0.02)), obsidian));
      const display = new THREE.Mesh(
        keep(new THREE.PlaneGeometry(0.36, 0.24)),
        new THREE.MeshBasicMaterial({ map: screen, toneMapped: false }),
      );
      materials.push(display.material as THREE.Material);
      display.position.z = 0.017;
      propPivot.add(display);
    }
    if (prop === "prism") {
      const prismMaterial = new THREE.MeshPhysicalMaterial({
        color: "#C4B5FD",
        transmission: 0.4,
        roughness: 0.05,
        thickness: 0.4,
        emissive: "#7C3AED",
        emissiveIntensity: 0.8,
        flatShading: true,
        transparent: true,
      });
      materials.push(prismMaterial);
      const prism = new THREE.Mesh(keep(new THREE.OctahedronGeometry(0.2, 0)), prismMaterial);
      prism.scale.y = 1.4;
      propPivot.add(prism);
    }
    if (prop === "lens") {
      const barrel = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.15, 0.15, 0.16, 28)), obsidian);
      barrel.rotation.x = Math.PI / 2;
      propPivot.add(barrel);
      const rim = new THREE.Mesh(keep(new THREE.TorusGeometry(0.13, 0.025, 8, 28)), brushed);
      rim.position.z = 0.09;
      propPivot.add(rim);
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: "#1a0f08",
        metalness: 0.2,
        roughness: 0.02,
        clearcoat: 1,
        emissive: "#FB923C",
        emissiveIntensity: 0.5,
      });
      materials.push(glassMaterial);
      const glass = new THREE.Mesh(keep(new THREE.CircleGeometry(0.11, 28)), glassMaterial);
      glass.position.z = 0.085;
      propPivot.add(glass);
    }

    const shadow = new THREE.Mesh(shadowGeo, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    root.add(shadow);

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
      thrusters,
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

export function poseRobot(rig: RobotRig, time: number, pose: Pose) {
  const motion = pose.calm ? 0 : time;
  const bob = pose.calm ? 0 : Math.sin(motion * 3.2 + pose.phase) * 0.06;
  rig.body.position.y = bob + pose.jump;
  rig.body.rotation.z = pose.calm ? 0 : Math.sin(motion * 2 + pose.phase) * 0.04;
  rig.head.rotation.y = (pose.calm ? 0 : Math.sin(motion * 1.7 + pose.phase) * 0.18) + pose.look;
  rig.head.rotation.x = (pose.calm ? 0 : Math.sin(motion * 2.3 + pose.phase) * 0.06) + pose.nod;
  rig.head.rotation.z = pose.calm ? 0 : Math.sin(motion * 1.3 + pose.phase) * 0.06;

  const blink = pose.calm ? 1 : (motion * 1.1 + pose.phase) % 3.1 < 0.09 ? 0.15 : 1;
  rig.eyes.forEach((eye) => {
    eye.scale.y = blink;
    eye.visible = !pose.happy;
  });
  rig.happy.forEach((smile) => {
    smile.visible = pose.happy;
  });

  rig.arms.forEach((arm, index) => {
    const swing = pose.calm ? 0 : Math.sin(motion * 3 + pose.phase + index * Math.PI) * 0.18;
    arm.pivot.rotation.z =
      arm.sx * (0.18 + swing * 0.3) * (1 - pose.raise) + arm.sx * pose.raise * 2.4 * (1 - pose.forward * 0.6);
    arm.pivot.rotation.x = -pose.forward * 1.35 * pose.raise;
    if (pose.wave && index === 1) {
      arm.pivot.rotation.z = arm.sx * (2.5 + (pose.calm ? 0 : Math.sin(motion * 14) * 0.35));
    }
  });

  rig.leds.forEach((led, index) => {
    led.visible = pose.calm ? true : (motion * 2.2 + index * 0.7 + pose.phase) % 1.6 > 0.35;
  });
  rig.thrusters.forEach((thruster, index) => {
    if (pose.calm) {
      thruster.mesh.scale.y = 1;
      thruster.material.opacity = 0.55;
      return;
    }
    thruster.mesh.scale.y = 0.8 + 0.35 * Math.sin(motion * 28 + index * 2 + pose.phase);
    thruster.material.opacity = 0.55 + 0.25 * Math.sin(motion * 19 + index);
  });

  const hover = rig.propKind === "halo" ? 1.32 : 0.95;
  rig.prop.rotation.y = pose.calm ? 0 : motion * 1.4 + pose.phase;
  rig.prop.position.y = hover + (pose.calm ? 0 : Math.sin(motion * 2.6 + pose.phase) * 0.05);
  rig.shadow.position.y = pose.floor - rig.root.position.y;
}
