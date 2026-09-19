import * as THREE from 'three';

// --- Procedural Textures for City ---

export function createRoadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark asphalt base
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle asphalt grain texture
  for (let i = 0; i < 2000; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 1024;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(51, 65, 85, 0.5)' : 'rgba(15, 23, 42, 0.4)';
    ctx.fillRect(rx, ry, 2, 2);
  }

  // Double Solid Yellow Center Line
  ctx.fillStyle = '#facc15';
  ctx.fillRect(504, 0, 6, 1024);
  ctx.fillRect(514, 0, 6, 1024);

  // White outer edge boundary lines
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(40, 0, 10, 1024);
  ctx.fillRect(974, 0, 10, 1024);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 10);
  return texture;
}

export function createCrosswalkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark asphalt
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 256);

  // Bold white zebra crossing stripes
  ctx.fillStyle = '#f8fafc';
  for (let x = 32; x < 512; x += 64) {
    ctx.fillRect(x, 20, 36, 216);
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createSidewalkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm light grey concrete sidewalk pavers
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle paver pattern
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  for (let x = 0; x <= 512; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  return texture;
}

export function createHospitalSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Medical Blue / White banner
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 116);

  // Red cross emblem
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(64, 64, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(56, 36, 16, 56);
  ctx.fillRect(36, 56, 56, 16);

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 38px sans-serif';
  ctx.fillText('CITY HOSPITAL', 130, 60);

  ctx.fillStyle = '#fecaca';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('EMERGENCY & HEALTH CARE 24/7', 130, 95);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createSchoolSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // School maroon/gold banner
  ctx.fillStyle = '#831843';
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 116);

  // Text
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('PUBLIC HIGH SCHOOL', 40, 56);

  ctx.fillStyle = '#fdf2f8';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('KNOWLEDGE • EXCELLENCE • SPORTS', 40, 95);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// --- 3D City Buildings & Architecture ---

// 1. City Hospital Building (अस्पताल)
export function createHospitalMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'city_hospital';

  const whiteWallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  const blueTrimMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 });
  const darkGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transmission: 0.8,
    opacity: 0.4,
    transparent: true,
    roughness: 0.1,
  });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3 });

  // Main 4-story hospital block (Width 16m, Height 14m, Depth 10m)
  const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(16, 14, 10), whiteWallMat);
  mainBlock.position.set(0, 7, 0);
  mainBlock.castShadow = true;
  mainBlock.receiveShadow = true;
  group.add(mainBlock);

  // Left wing (Emergency entrance)
  const leftWing = new THREE.Mesh(new THREE.BoxGeometry(8, 7, 8), whiteWallMat);
  leftWing.position.set(-11, 3.5, -1);
  leftWing.castShadow = true;
  group.add(leftWing);

  // Right wing
  const rightWing = new THREE.Mesh(new THREE.BoxGeometry(7, 9, 8), whiteWallMat);
  rightWing.position.set(10.5, 4.5, -1);
  rightWing.castShadow = true;
  group.add(rightWing);

  // Blue architectural bands along floors
  for (let y of [3.5, 7.0, 10.5]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(16.2, 0.4, 10.2), blueTrimMat);
    band.position.set(0, y, 0);
    group.add(band);
  }

  // Modern Glass Ribbon Windows on facade
  for (let floor = 1; floor <= 3; floor++) {
    const wy = floor * 3.5;
    for (let c = -3; c <= 3; c++) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 0.2), darkGlassMat);
      win.position.set(c * 2.1, wy, 5.05);
      group.add(win);
    }
  }

  // Emergency Entrance Canopy / Awning
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 4), redMat);
  canopy.position.set(-6, 3.2, 6.5);
  canopy.castShadow = true;
  group.add(canopy);

  // Canopy support pillars
  [-8.5, -3.5].forEach((px) => {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 3.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x64748b })
    );
    pillar.position.set(px, 1.6, 8.2);
    pillar.castShadow = true;
    group.add(pillar);
  });

  // Main Entrance Signboard
  const signTex = createHospitalSignTexture();
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(7, 1.6, 0.2),
    new THREE.MeshStandardMaterial({ map: signTex })
  );
  sign.position.set(2, 4.2, 5.15);
  group.add(sign);

  // Big Glowing Red Cross on Roof / Front Facade
  const crossGroup = new THREE.Group();
  const crossV = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 3.8, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.6 })
  );
  const crossH = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 1.2, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.6 })
  );
  crossGroup.add(crossV);
  crossGroup.add(crossH);
  crossGroup.position.set(0, 15.2, 5.0);
  group.add(crossGroup);

  // Rooftop Helipad with "H"
  const heliPad = new THREE.Mesh(
    new THREE.CylinderGeometry(4.5, 4.5, 0.3, 24),
    new THREE.MeshStandardMaterial({ color: 0x334155 })
  );
  heliPad.position.set(0, 14.15, 0);
  group.add(heliPad);

  const heliH = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.05, 3.0),
    new THREE.MeshBasicMaterial({ color: 0xfacc15 })
  );
  heliH.position.set(-1.0, 14.35, 0);
  group.add(heliH);
  const heliH2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.05, 3.0),
    new THREE.MeshBasicMaterial({ color: 0xfacc15 })
  );
  heliH2.position.set(1.0, 14.35, 0);
  group.add(heliH2);
  const heliCross = new THREE.Mesh(
    new THREE.BoxGeometry(2.0, 0.05, 0.6),
    new THREE.MeshBasicMaterial({ color: 0xfacc15 })
  );
  heliCross.position.set(0, 14.35, 0);
  group.add(heliCross);

  return group;
}

// Ambulance Vehicle (एम्बुलेंस)
export function createAmbulanceMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'ambulance';

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
  const redStripeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });

  // Main van body
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 3.8), bodyMat);
  body.position.set(0, 1.1, 0);
  body.castShadow = true;
  group.add(body);

  // Red emergency stripe
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.25, 3.82), redStripeMat);
  stripe.position.set(0, 1.0, 0);
  group.add(stripe);

  // Red cross on side
  [-0.92, 0.92].forEach((sx) => {
    const sideCrossV = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.6, 0.2), redStripeMat);
    const sideCrossH = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.2, 0.6), redStripeMat);
    sideCrossV.position.set(sx, 1.4, 0);
    sideCrossH.position.set(sx, 1.4, 0);
    group.add(sideCrossV);
    group.add(sideCrossH);
  });

  // Windshield & windows
  const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 0.05), glassMat);
  frontGlass.position.set(0, 1.25, 1.92);
  group.add(frontGlass);

  // Emergency light bar (red & blue beacons)
  const lightBar = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.15, 0.3),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.8 })
  );
  lightBar.position.set(0, 1.92, 0.6);
  group.add(lightBar);

  // Wheels
  [
    [-0.95, 0.35, 1.1],
    [0.95, 0.35, 1.1],
    [-0.95, 0.35, -1.1],
    [0.95, 0.35, -1.1],
  ].forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.22, 12), tireMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;
    group.add(wheel);
  });

  return group;
}

// 2. City School Building (स्कूल)
export function createSchoolMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'city_school';

  const brickMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8 }); // Red-orange brick
  const creamTrimMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.4 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 }); // Slate pitched roof
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.2 });

  // Main 2-story building block
  const mainBlock = new THREE.Mesh(new THREE.BoxGeometry(18, 8, 9), brickMat);
  mainBlock.position.set(0, 4, 0);
  mainBlock.castShadow = true;
  mainBlock.receiveShadow = true;
  group.add(mainBlock);

  // Pitched gabled roof
  const roof = new THREE.Mesh(new THREE.ConeGeometry(13, 3.5, 4), roofMat);
  roof.rotation.y = Math.PI / 4;
  roof.scale.set(1.4, 1.0, 0.7);
  roof.position.set(0, 9.7, 0);
  roof.castShadow = true;
  group.add(roof);

  // Clock Tower in Center
  const tower = new THREE.Mesh(new THREE.BoxGeometry(3.5, 6.5, 3.5), brickMat);
  tower.position.set(0, 11, 2.5);
  tower.castShadow = true;
  group.add(tower);

  // Tower roof pyramid
  const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(2.8, 3.0, 4), roofMat);
  towerRoof.rotation.y = Math.PI / 4;
  towerRoof.position.set(0, 15.5, 2.5);
  group.add(towerRoof);

  // Working / Visible Clock Face
  const clockFace = new THREE.Mesh(
    new THREE.CylinderGeometry(0.8, 0.8, 0.1, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
  );
  clockFace.rotation.x = Math.PI / 2;
  clockFace.position.set(0, 12.5, 4.3);
  group.add(clockFace);

  // Clock hands
  const hourHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 0.05), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  hourHand.position.set(0, 12.6, 4.38);
  group.add(hourHand);
  const minHand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.05), new THREE.MeshBasicMaterial({ color: 0x000000 }));
  minHand.position.set(0.15, 12.5, 4.38);
  group.add(minHand);

  // School Signboard
  const signTex = createSchoolSignTexture();
  const sign = new THREE.Mesh(
    new THREE.BoxGeometry(7.5, 1.6, 0.2),
    new THREE.MeshStandardMaterial({ map: signTex })
  );
  sign.position.set(0, 4.5, 4.6);
  group.add(sign);

  // Entrance Portico with Classical Columns
  const porticoRoof = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.5, 2.5), creamTrimMat);
  porticoRoof.position.set(0, 3.2, 5.5);
  group.add(porticoRoof);

  [-2.2, -0.7, 0.7, 2.2].forEach((cx) => {
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.2, 3.2, 12),
      creamTrimMat
    );
    col.position.set(cx, 1.6, 6.2);
    col.castShadow = true;
    group.add(col);
  });

  // Windows in neat classrooms grid
  for (let floor = 1; floor <= 2; floor++) {
    const wy = floor * 2.8 - 0.2;
    for (let c = -4; c <= 4; c++) {
      if (Math.abs(c) < 2 && floor === 1) continue; // Entrance door area
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.15), glassMat);
      win.position.set(c * 1.9, wy, 4.55);
      group.add(win);
    }
  }

  // School Flag Pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.06, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
  );
  pole.position.set(6.5, 4, 6.5);
  pole.castShadow = true;
  group.add(pole);

  const flag = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.9, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b })
  );
  flag.position.set(7.3, 7.2, 6.5);
  group.add(flag);

  // Basketball Hoop in School Yard
  const hoopGroup = new THREE.Group();
  const poleB = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 3.8, 8),
    new THREE.MeshStandardMaterial({ color: 0x334155 })
  );
  poleB.position.set(0, 1.9, 0);
  hoopGroup.add(poleB);

  const backboard = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.0, 0.08),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  backboard.position.set(0, 3.5, 0.4);
  hoopGroup.add(backboard);

  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.03, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0xe11d48 })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.set(0, 3.2, 0.7);
  hoopGroup.add(rim);

  hoopGroup.position.set(-8.5, 0, 7.5);
  group.add(hoopGroup);

  return group;
}

// School Bus (स्कूल बस)
export function createSchoolBusMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'school_bus';

  const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 });
  const blackMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });

  // Long Bus Body
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.8, 5.5), yellowMat);
  body.position.set(0, 1.3, 0);
  body.castShadow = true;
  group.add(body);

  // Black accent side stripes
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.18, 5.52), blackMat);
  stripe.position.set(0, 0.8, 0);
  group.add(stripe);

  // Black roof trim
  const roofTrim = new THREE.Mesh(new THREE.BoxGeometry(2.04, 0.12, 5.54), blackMat);
  roofTrim.position.set(0, 2.22, 0);
  group.add(roofTrim);

  // Front grill & headlights
  const grill = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.1), blackMat);
  grill.position.set(0, 0.8, 2.76);
  group.add(grill);

  // Side passenger windows
  for (let z = -2.0; z <= 1.5; z += 0.8) {
    [-1.02, 1.02].forEach((wx) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.5, 0.6), glassMat);
      win.position.set(wx, 1.5, z);
      group.add(win);
    });
  }

  // Large windshield
  const wind = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.7, 0.05), glassMat);
  wind.position.set(0, 1.5, 2.76);
  group.add(wind);

  // "SCHOOL BUS" sign board on front roof
  const signGeo = new THREE.BoxGeometry(1.2, 0.25, 0.05);
  const sign = new THREE.Mesh(signGeo, blackMat);
  sign.position.set(0, 2.1, 2.77);
  group.add(sign);

  // Wheels
  [
    [-1.05, 0.4, 1.6],
    [1.05, 0.4, 1.6],
    [-1.05, 0.4, -1.6],
    [1.05, 0.4, -1.6],
  ].forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.25, 12), blackMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;
    group.add(wheel);
  });

  return group;
}

// 3. Residential Houses & Buildings (मकान)
export function createHouseMesh(style: 'modern' | 'bungalow' | 'duplex'): THREE.Group {
  const group = new THREE.Group();
  group.name = `house_${style}`;

  if (style === 'modern') {
    // Contemporary Multi-story Townhouse / House
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.6 });
    const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1 });

    // Ground floor
    const ground = new THREE.Mesh(new THREE.BoxGeometry(8, 3.5, 7), wallMat);
    ground.position.set(0, 1.75, 0);
    ground.castShadow = true;
    group.add(ground);

    // Modern Wood Panel Accent box
    const accent = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.4, 7.2), woodMat);
    accent.position.set(2.0, 1.75, 0);
    group.add(accent);

    // Second floor cantilevered box
    const floor2 = new THREE.Mesh(new THREE.BoxGeometry(8.5, 3.2, 6.5), darkMat);
    floor2.position.set(-0.2, 5.1, 0.4);
    floor2.castShadow = true;
    group.add(floor2);

    // Balcony with Glass Railing
    const balcony = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.9, 0.1),
      new THREE.MeshPhysicalMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.5, transmission: 0.9 })
    );
    balcony.position.set(2.0, 4.4, 3.7);
    group.add(balcony);

    // Garage Door
    const garage = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 2.4, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x475569 })
    );
    garage.position.set(-2.0, 1.2, 3.55);
    group.add(garage);

    // Large floor-to-ceiling windows
    const win1 = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.0, 0.1), glassMat);
    win1.position.set(2.0, 5.2, 3.7);
    group.add(win1);

    // Rooftop Terrace Water Tank & Solar Panels
    const tank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.8, 1.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x0284c7 })
    );
    tank.position.set(-2.5, 7.3, -1.5);
    group.add(tank);

    // Solar Panel on roof
    const solar = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.1, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
    );
    solar.rotation.x = -0.3;
    solar.position.set(1.5, 6.9, -1.0);
    group.add(solar);

    // Small green lawn garden patch in front
    const lawn = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.1, 3.0),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.9 })
    );
    lawn.position.set(0, 0.05, 5.0);
    group.add(lawn);
  } else if (style === 'bungalow') {
    // Cozy Suburban House with Pitched Roof and Porch
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5 }); // Warm pastel yellow
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.5 }); // Terracotta tile roof
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });

    // Main House Box
    const main = new THREE.Mesh(new THREE.BoxGeometry(7.5, 3.5, 6.5), wallMat);
    main.position.set(0, 1.75, 0);
    main.castShadow = true;
    group.add(main);

    // Triangular Gable Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(6.2, 2.8, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.2, 1.0, 0.9);
    roof.position.set(0, 4.8, 0);
    roof.castShadow = true;
    group.add(roof);

    // Chimney
    const chimney = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 2.0, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    chimney.position.set(2.0, 5.2, -1.0);
    chimney.castShadow = true;
    group.add(chimney);

    // Front Porch & Pillars
    const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.25, 1.8), roofMat);
    porchRoof.position.set(0, 2.6, 3.8);
    group.add(porchRoof);

    [-1.5, 1.5].forEach((px) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.6, 8), trimMat);
      p.position.set(px, 1.3, 4.5);
      group.add(p);
    });

    // Front Door
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 2.1, 0.1),
      new THREE.MeshStandardMaterial({ color: 0x78350f })
    );
    door.position.set(0, 1.05, 3.3);
    group.add(door);

    // Windows with white frames
    [-2.2, 2.2].forEach((wx) => {
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.2, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.2 })
      );
      win.position.set(wx, 1.8, 3.3);
      group.add(win);
    });

    // White Picket Fence in front
    for (let x = -3.8; x <= 3.8; x += 0.6) {
      if (Math.abs(x) < 0.8) continue; // Walkway gate opening
      const fencePost = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.08), trimMat);
      fencePost.position.set(x, 0.45, 5.4);
      group.add(fencePost);
    }
  } else {
    // 3-story Duplex / Residential Apartment Building
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xe0e7ff, roughness: 0.4 }); // Soft periwinkle
    const balconyMat = new THREE.MeshStandardMaterial({ color: 0x4f46e5, roughness: 0.3 }); // Indigo trim
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.2 });

    const building = new THREE.Mesh(new THREE.BoxGeometry(8.5, 9.5, 7.5), wallMat);
    building.position.set(0, 4.75, 0);
    building.castShadow = true;
    group.add(building);

    // 3 Tiers of balconies and windows
    for (let floor = 1; floor <= 3; floor++) {
      const fy = floor * 2.8 - 0.5;

      // Balcony ledge
      const balcLedge = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.8, 1.0), balconyMat);
      balcLedge.position.set(1.8, fy, 4.0);
      group.add(balcLedge);

      // Windows
      const win = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.6, 0.1), glassMat);
      win.position.set(-2.0, fy + 0.4, 3.8);
      group.add(win);
    }

    // Rooftop Parapet and Satellite Dish
    const dish = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.1, 0.2, 12),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 })
    );
    dish.rotation.x = 0.8;
    dish.position.set(2.0, 10.0, 0);
    group.add(dish);
  }

  return group;
}

// 4. City Street Furniture (Streetlights, Trees, Benches, Cars)
export function createStreetLightMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'street_light';

  const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
  const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // Warm illuminated glow

  // Tall pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 5.0, 8), metalMat);
  pole.position.y = 2.5;
  pole.castShadow = true;
  group.add(pole);

  // Curved arm
  const arm = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), metalMat);
  arm.position.set(0.5, 4.9, 0);
  group.add(arm);

  // Lamp shade
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.2, 8), metalMat);
  shade.position.set(1.0, 4.8, 0);
  group.add(shade);

  // Glowing bulb
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), lampMat);
  bulb.position.set(1.0, 4.7, 0);
  group.add(bulb);

  // Light source illuminating street below
  const light = new THREE.PointLight(0xfef08a, 0.8, 12);
  light.position.set(1.0, 4.5, 0);
  group.add(light);

  return group;
}

export function createCityTreeMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'city_tree';

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.8 });

  // Wooden trunk
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 2.5, 8), trunkMat);
  trunk.position.y = 1.25;
  trunk.castShadow = true;
  group.add(trunk);

  // 3 Spherical leafy foliage clusters
  const f1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 1), foliageMat);
  f1.position.set(0, 3.2, 0);
  f1.castShadow = true;
  group.add(f1);

  const f2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 1), foliageMat);
  f2.position.set(0.5, 3.8, 0.3);
  f2.castShadow = true;
  group.add(f2);

  const f3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 1), foliageMat);
  f3.position.set(-0.4, 3.6, -0.3);
  f3.castShadow = true;
  group.add(f3);

  // Tree planter base box
  const planter = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.35, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x475569 })
  );
  planter.position.y = 0.175;
  group.add(planter);

  return group;
}

export function createCityBenchMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'city_bench';

  const woodMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.6 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });

  // Seat slats
  const seat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.55), woodMat);
  seat.position.set(0, 0.45, 0);
  seat.castShadow = true;
  group.add(seat);

  // Backrest
  const back = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 0.06), woodMat);
  back.position.set(0, 0.75, -0.25);
  back.castShadow = true;
  group.add(back);

  // Iron legs
  [-0.7, 0.7].forEach((lx) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.5), frameMat);
    leg.position.set(lx, 0.225, 0);
    group.add(leg);
  });

  return group;
}

export function createCityCarMesh(colorHex: string = '#ef4444', isTaxi: boolean = false): THREE.Group {
  const group = new THREE.Group();
  group.name = isTaxi ? 'city_taxi' : 'city_car';

  const carColor = isTaxi ? 0xfacc15 : new THREE.Color(colorHex);
  const bodyMat = new THREE.MeshStandardMaterial({ color: carColor, roughness: 0.2, metalness: 0.2 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });

  // Lower chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.6, 4.0), bodyMat);
  chassis.position.set(0, 0.55, 0);
  chassis.castShadow = true;
  group.add(chassis);

  // Cabin
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.6, 2.2), bodyMat);
  cabin.position.set(0, 1.1, -0.3);
  cabin.castShadow = true;
  group.add(cabin);

  // Glass windows
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 0.05), glassMat);
  windshield.position.set(0, 1.1, 0.82);
  windshield.rotation.x = -0.3;
  group.add(windshield);

  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.5, 0.05), glassMat);
  rearGlass.position.set(0, 1.1, -1.42);
  rearGlass.rotation.x = 0.3;
  group.add(rearGlass);

  // Taxi rooftop sign
  if (isTaxi) {
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.2, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfacc15, emissiveIntensity: 0.4 })
    );
    sign.position.set(0, 1.5, -0.3);
    group.add(sign);
  }

  // Wheels
  [
    [-0.92, 0.3, 1.2],
    [0.92, 0.3, 1.2],
    [-0.92, 0.3, -1.2],
    [0.92, 0.3, -1.2],
  ].forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12), tireMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    wheel.castShadow = true;
    group.add(wheel);
  });

  return group;
}

// 5. Animated City Citizens / Pedestrians (शहर के लोग)
export interface CityPedestrian {
  id: string;
  name: string;
  role: 'student' | 'doctor' | 'citizen' | 'shopper';
  meshHandle: {
    root: THREE.Group;
    update: (delta: number, time: number) => void;
  };
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  speed: number;
  thought: string;
  waypointIndex: number;
  waypoints: { x: number; z: number }[];
}

export function createPedestrianMesh(role: 'student' | 'doctor' | 'citizen' | 'shopper'): {
  root: THREE.Group;
  update: (delta: number, time: number) => void;
} {
  const root = new THREE.Group();
  root.name = `pedestrian_${role}`;

  // Natural Human Skin & Hair Palette
  let skinColor = '#dfb48c'; // Warm tan
  let hairColor = '#171717'; // Jet black
  let hairStyle: 'short' | 'parted' | 'bob' | 'ponytail' = 'short';
  let jacketColor = 0x2563eb;
  let innerShirtColor = 0xf8fafc;
  let pantsColor = 0x1e293b;
  let shoeColor = 0x0f172a;
  let hasBackpack = false;
  let hasStethoscope = false;
  let hasTie = false;

  if (role === 'doctor') {
    // Dr. Anita Sharma
    skinColor = '#dfb48c';
    hairColor = '#1c1917';
    hairStyle = 'ponytail';
    jacketColor = 0xf8fafc; // Clean white doctor coat
    innerShirtColor = 0x0f766e; // Teal hospital scrubs
    pantsColor = 0x0f766e; // Matching scrubs pants
    shoeColor = 0x0284c7; // Clinic clogs / shoes
    hasStethoscope = true;
  } else if (role === 'student') {
    // High School Students (Aarav / Riya)
    skinColor = '#eecab1';
    hairColor = '#241a15';
    hairStyle = Math.random() > 0.5 ? 'parted' : 'bob';
    jacketColor = 0x881337; // Crimson / Maroon school uniform blazer
    innerShirtColor = 0xf8fafc; // White collared shirt
    pantsColor = 0x0f172a; // Dark school trousers
    shoeColor = 0x334155; // School sneakers
    hasBackpack = true;
    hasTie = true;
  } else if (role === 'shopper') {
    skinColor = '#c68a5c';
    hairColor = '#171717';
    hairStyle = 'short';
    jacketColor = 0x059669;
    innerShirtColor = 0xfacc15;
    pantsColor = 0x334155;
    shoeColor = 0xdc2626;
  } else {
    // Adult Citizen / Uncle Ramesh / Homeowner
    skinColor = '#c68a5c';
    hairColor = '#475569'; // Salt and pepper / mature
    hairStyle = 'short';
    jacketColor = 0xd97706; // Warm windbreaker
    innerShirtColor = 0x3b82f6;
    pantsColor = 0x1e293b;
    shoeColor = 0x78350f;
  }

  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.65 });
  const jacketMat = new THREE.MeshStandardMaterial({ color: jacketColor, roughness: 0.6 });
  const innerMat = new THREE.MeshStandardMaterial({ color: innerShirtColor, roughness: 0.5 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.75 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.75 });

  // 1. Realistic Head
  const headGroup = new THREE.Group();
  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.15, 22, 16), skinMat);
  cranium.position.set(0, 0.04, 0);
  cranium.scale.set(1.0, 1.15, 1.08);
  headGroup.add(cranium);

  const jaw = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.15, 10), skinMat);
  jaw.rotation.x = Math.PI;
  jaw.position.set(0, -0.05, 0.03);
  headGroup.add(jaw);

  // Realistic Eyes
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x1c1917, roughness: 0.2 });
  [-0.05, 0.05].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.020, 12, 8), eyeWhiteMat);
    eye.position.set(ex, 0.02, 0.145);
    headGroup.add(eye);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.009, 10, 8), irisMat);
    pupil.position.set(ex, 0.02, 0.155);
    headGroup.add(pupil);

    const brow = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.005, 0.035, 3, 8),
      new THREE.MeshStandardMaterial({ color: 0x18181b })
    );
    brow.rotation.z = Math.PI / 2;
    brow.position.set(ex, 0.046, 0.15);
    brow.rotation.z = ex > 0 ? -0.08 : 0.08;
    headGroup.add(brow);
  });

  // 3D Nose & Natural Lips
  const nose = new THREE.Mesh(new THREE.CapsuleGeometry(0.010, 0.032, 4, 8), skinMat);
  nose.position.set(0, -0.01, 0.155);
  headGroup.add(nose);

  const lips = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.007, 0.034, 3, 8),
    new THREE.MeshStandardMaterial({ color: 0xb5786a, roughness: 0.7 })
  );
  lips.position.set(0, -0.065, 0.145);
  headGroup.add(lips);

  // Ears
  [-0.145, 0.145].forEach((earX) => {
    const ear = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.05, 0.03), skinMat);
    ear.position.set(earX, 0.01, 0);
    headGroup.add(ear);
  });

  // Hair
  const hairCrown = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairMat
  );
  hairCrown.position.set(0, 0.07, -0.01);
  hairCrown.scale.set(1.02, 1.05, 1.06);
  headGroup.add(hairCrown);

  if (hairStyle === 'parted' || hairStyle === 'short') {
    const fringe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.07), hairMat);
    fringe.position.set(0.02, 0.14, 0.10);
    fringe.rotation.z = -0.12;
    headGroup.add(fringe);
  } else if (hairStyle === 'bob') {
    [-0.15, 0.15].forEach((bx) => {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.16, 0.12), hairMat);
      side.position.set(bx, 0.0, 0);
      headGroup.add(side);
    });
  } else if (hairStyle === 'ponytail') {
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.02, 0.20, 8), hairMat);
    tail.rotation.x = 0.4;
    tail.position.set(0, 0.04, -0.20);
    headGroup.add(tail);
  }

  // Neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.12, 10), skinMat);
  neck.position.set(0, -0.14, 0);
  headGroup.add(neck);

  headGroup.position.set(0, 1.58, 0);
  root.add(headGroup);

  // 2. Realistic Torso & Upper Clothing
  const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.16, 6, 14), jacketMat);
  chest.scale.z = 0.72;
  chest.position.set(0, 1.18, 0);
  chest.castShadow = true;
  root.add(chest);

  // Inner shirt / scrubs
  const innerShirt = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.30, 0.02), innerMat);
  innerShirt.position.set(0, 1.25, 0.115);
  root.add(innerShirt);

  if (hasTie) {
    const tie = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.22, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x0284c7 })
    );
    tie.position.set(0, 1.22, 0.125);
    root.add(tie);
  }

  // Waist
  const waist = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.03, 5, 12), pantsMat);
  waist.scale.z = 0.72;
  waist.position.set(0, 0.92, 0);
  root.add(waist);

  // 3. Legs
  const legLGroup = new THREE.Group();
  legLGroup.position.set(-0.12, 0.82, 0);
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.70, 10), pantsMat);
  legL.position.set(0, -0.35, 0);
  legL.castShadow = true;
  legLGroup.add(legL);

  const legRGroup = new THREE.Group();
  legRGroup.position.set(0.12, 0.82, 0);
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.075, 0.70, 10), pantsMat);
  legR.position.set(0, -0.35, 0);
  legR.castShadow = true;
  legRGroup.add(legR);

  // Realistic Shoes with Soles
  const shoeMat = new THREE.MeshStandardMaterial({ color: shoeColor, roughness: 0.5 });
  const soleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 });

  const createShoe = () => {
    const g = new THREE.Group();
    const sBody = new THREE.Mesh(new THREE.BoxGeometry(0.115, 0.07, 0.23), shoeMat);
    sBody.position.set(0, 0.04, 0.04);
    g.add(sBody);
    const sSole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.022, 0.24), soleMat);
    sSole.position.set(0, 0.011, 0.04);
    g.add(sSole);
    const sToe = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.07, 8), shoeMat);
    sToe.position.set(0, 0.04, 0.13);
    g.add(sToe);
    return g;
  };

  const fL = createShoe();
  fL.position.set(0, -0.82, 0);
  legLGroup.add(fL);

  const fR = createShoe();
  fR.position.set(0, -0.82, 0);
  legRGroup.add(fR);

  root.add(legLGroup);
  root.add(legRGroup);

  // 4. Arms with Hands
  const armLGroup = new THREE.Group();
  armLGroup.position.set(-0.25, 1.35, 0);
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.50, 10), jacketMat);
  armL.position.set(0, -0.25, 0);
  armLGroup.add(armL);
  const handL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.04), skinMat);
  handL.position.set(0, -0.52, 0);
  armLGroup.add(handL);
  root.add(armLGroup);

  const armRGroup = new THREE.Group();
  armRGroup.position.set(0.25, 1.35, 0);
  const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.50, 10), jacketMat);
  armR.position.set(0, -0.25, 0);
  armRGroup.add(armR);
  const handR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.04), skinMat);
  handR.position.set(0, -0.52, 0);
  armRGroup.add(handR);
  root.add(armRGroup);

  // Realistic Accessories
  if (hasBackpack) {
    const bag = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.42, 0.20),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6 })
    );
    bag.position.set(0, 1.15, -0.18);
    root.add(bag);

    // Shoulder straps
    [-0.10, 0.10].forEach((sx) => {
      const strap = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.35, 0.02),
        new THREE.MeshStandardMaterial({ color: 0x0369a1 })
      );
      strap.position.set(sx, 1.2, 0.12);
      root.add(strap);
    });
  }

  if (hasStethoscope) {
    const steth = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.018, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
    );
    steth.position.set(0, 1.22, 0.12);
    root.add(steth);

    // Chest badge
    const badge = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.05, 0.015),
      new THREE.MeshStandardMaterial({ color: 0x0284c7 })
    );
    badge.position.set(0.12, 1.28, 0.13);
    root.add(badge);
  }

  return {
    root,
    update(delta: number, time: number) {
      const swing = Math.sin(time * 9) * 0.48;
      legLGroup.rotation.x = swing;
      legRGroup.rotation.x = -swing;
      armLGroup.rotation.x = -swing * 0.42;
      armRGroup.rotation.x = swing * 0.42;
      root.position.y = Math.abs(Math.sin(time * 9)) * 0.035;
    },
  };
}
