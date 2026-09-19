import * as THREE from 'three';
import { ProductDefinition, PRODUCT_CATALOG } from '../../data/products';

// --- Procedural Textures ---

export function createSupermartFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Polished large white porcelain supermarket floor tiles
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle marble flecks
  for (let i = 0; i < 400; i++) {
    const rx = Math.random() * 1024;
    const ry = Math.random() * 1024;
    const rrad = 1 + Math.random() * 2;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(226, 232, 240, 0.4)' : 'rgba(203, 213, 225, 0.3)';
    ctx.beginPath();
    ctx.arc(rx, ry, rrad, 0, Math.PI * 2);
    ctx.fill();
  }

  // Modern tile grout grid (128x128px tiles)
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  for (let x = 0; x <= 1024; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y <= 1024; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Yellow safety boundary lines along center walkway
  ctx.fillStyle = '#facc15';
  ctx.fillRect(490, 0, 8, 1024);
  ctx.fillRect(526, 0, 8, 1024);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function createSupermartSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Deep modern supermarket green-blue gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 0);
  grad.addColorStop(0, '#064e3b');
  grad.addColorStop(0.5, '#047857');
  grad.addColorStop(1, '#065f46');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 256);

  // Border glow
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, 1004, 236);

  // Sign typography
  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SUPERMARKET SIMULATOR', 512, 65);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 78px sans-serif';
  ctx.fillText('SUPERMART 3D', 512, 155);

  ctx.fillStyle = '#a7f3d0';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('FRESH GROCERIES • DAILY ESSENTIALS • BEST VALUE', 512, 215);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function createWelcomeMatTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#991b1b';
  ctx.fillRect(0, 0, 512, 256);

  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 8;
  ctx.strokeRect(12, 12, 488, 232);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('WELCOME', 256, 125);

  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('HAPPY SHOPPING!', 256, 185);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Hanging Aisle Category Direction Sign
export function createAisleSign(aisleNum: number, title: string, color: string): THREE.Group {
  const group = new THREE.Group();

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 512, 160);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 148);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`AISLE ${aisleNum}`, 256, 60);

  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(title.toUpperCase(), 256, 120);

  const tex = new THREE.CanvasTexture(canvas);
  const geo = new THREE.BoxGeometry(2.4, 0.75, 0.08);
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.3 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  group.add(mesh);

  // Chains suspending the sign from the ceiling
  const chainMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
  [-0.9, 0.9].forEach((cx) => {
    const chainGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.4, 6);
    const chain = new THREE.Mesh(chainGeo, chainMat);
    chain.position.set(cx, 0.9, 0);
    group.add(chain);
  });

  return group;
}

export function createStoreRoomSignTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 192;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  ctx.fillStyle = '#fef3c7';
  ctx.font = '900 58px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('STOCK ROOM', canvas.width / 2, 86);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('AUTHORIZED STAFF ONLY', canvas.width / 2, 140);

  return new THREE.CanvasTexture(canvas);
}

// --- 3D Shelves & Products ---

export function create3DGondolaShelf(category: string, capacity: number, currentStock: number, productId: string | null): THREE.Group {
  const group = new THREE.Group();
  group.name = `shelf_${category}`;

  // Metallic supermarket gondola rack frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4, metalness: 0.2 });
  const shelfBoardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.1 });
  const priceTagMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 }); // Green price strip

  // Back panel
  const backGeo = new THREE.BoxGeometry(2.4, 2.4, 0.08);
  const back = new THREE.Mesh(backGeo, frameMat);
  back.position.set(0, 1.2, 0);
  back.castShadow = true;
  group.add(back);

  // Base footer
  const baseGeo = new THREE.BoxGeometry(2.5, 0.2, 0.9);
  const base = new THREE.Mesh(baseGeo, frameMat);
  base.position.set(0, 0.1, 0);
  base.castShadow = true;
  group.add(base);

  // 3 Shelf tiers (Bottom, Middle, Top)
  const shelfYPositions = [0.4, 1.1, 1.8];
  shelfYPositions.forEach((sy) => {
    const boardGeo = new THREE.BoxGeometry(2.4, 0.05, 0.7);
    const board = new THREE.Mesh(boardGeo, shelfBoardMat);
    board.position.set(0, sy, 0);
    board.castShadow = true;
    board.receiveShadow = true;
    group.add(board);

    // Front edge price tag strip
    const tagGeo = new THREE.BoxGeometry(2.4, 0.05, 0.03);
    const tag = new THREE.Mesh(tagGeo, priceTagMat);
    tag.position.set(0, sy - 0.02, 0.36);
    group.add(tag);
  });

  // Render actual 3D Product items on the shelf based on currentStock!
  if (productId && currentStock > 0) {
    const productDef = PRODUCT_CATALOG.find((p) => p.id === productId);
    if (productDef) {
      const itemsGroup = new THREE.Group();
      itemsGroup.name = 'shelf_items';

      const prodColor = new THREE.Color(productDef.color);
      const prodMat = new THREE.MeshStandardMaterial({ color: prodColor, roughness: 0.4 });

      // Calculate how many items to visually display (up to 12 slots across shelves)
      const visualCount = Math.min(12, Math.ceil((currentStock / capacity) * 12));

      let placed = 0;
      shelfYPositions.forEach((sy, tierIdx) => {
        // Up to 4 items per tier
        for (let col = 0; col < 4; col++) {
          if (placed >= visualCount) break;
          const px = -0.8 + col * 0.52;
          const pz = 0.15;

          let itemMesh: THREE.Mesh;
          if (productDef.modelType === 'bottle') {
            const botGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.35, 10);
            itemMesh = new THREE.Mesh(botGeo, prodMat);
            itemMesh.position.set(px, sy + 0.18, pz);
          } else if (productDef.modelType === 'can') {
            const canGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 10);
            itemMesh = new THREE.Mesh(canGeo, prodMat);
            itemMesh.position.set(px, sy + 0.13, pz);
          } else if (productDef.modelType === 'pouch') {
            const pouchGeo = new THREE.BoxGeometry(0.24, 0.32, 0.14);
            itemMesh = new THREE.Mesh(pouchGeo, prodMat);
            itemMesh.position.set(px, sy + 0.16, pz);
          } else {
            // Box/carton
            const boxGeo = new THREE.BoxGeometry(0.24, 0.3, 0.16);
            itemMesh = new THREE.Mesh(boxGeo, prodMat);
            itemMesh.position.set(px, sy + 0.15, pz);
          }

          itemMesh.castShadow = true;
          itemsGroup.add(itemMesh);
          placed++;
        }
      });
      group.add(itemsGroup);
    }
  }

  return group;
}

// Commercial Dairy Glass Display Cooler / Refrigerator
export function create3DFreezeCooler(currentStock: number = 0, capacity: number = 14, productId?: string | null): THREE.Group {
  const group = new THREE.Group();
  group.name = 'dairy_cooler';

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.3 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
    roughness: 0.1,
    transmission: 0.85,
    thickness: 0.5,
  });

  // Main tall insulated cabinet
  const cabinetGeo = new THREE.BoxGeometry(2.4, 2.6, 1.0);
  const cabinet = new THREE.Mesh(cabinetGeo, bodyMat);
  cabinet.position.set(0, 1.3, 0);
  cabinet.castShadow = true;
  group.add(cabinet);

  // Interior hollow cutout with cold light
  const intGeo = new THREE.BoxGeometry(2.2, 2.2, 0.7);
  const intMat = new THREE.MeshStandardMaterial({ color: 0xf0f9ff, roughness: 0.5 });
  const interior = new THREE.Mesh(intGeo, intMat);
  interior.position.set(0, 1.3, 0.1);
  group.add(interior);

  // Sliding glass front doors
  const glassGeo = new THREE.BoxGeometry(2.2, 2.2, 0.05);
  const glassDoor = new THREE.Mesh(glassGeo, glassMat);
  glassDoor.position.set(0, 1.3, 0.48);
  group.add(glassDoor);

  // Interior shelves (3 tiers)
  const shelfYPositions = [0.6, 1.2, 1.8];
  shelfYPositions.forEach((sy) => {
    const rackGeo = new THREE.BoxGeometry(2.1, 0.03, 0.6);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(0, sy, 0.1);
    group.add(rack);
  });

  // Chilled items inside only if stocked!
  if (productId && currentStock > 0) {
    const prodDef = PRODUCT_CATALOG.find((p) => p.id === productId);
    const prodColor = new THREE.Color(prodDef?.color || '#38bdf8');
    const prodMat = new THREE.MeshStandardMaterial({ color: prodColor, roughness: 0.3 });
    const visualCount = Math.min(12, Math.ceil((currentStock / capacity) * 12));
    let placed = 0;

    shelfYPositions.forEach((sy) => {
      [-0.7, -0.2, 0.3, 0.8].forEach((bx) => {
        if (placed >= visualCount) return;
        const bottleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.32, 10);
        const bottle = new THREE.Mesh(bottleGeo, prodMat);
        bottle.position.set(bx, sy + 0.16, 0.1);
        bottle.castShadow = true;
        group.add(bottle);
        placed++;
      });
    });
  }

  // Cold LED interior light
  const coolerLight = new THREE.PointLight(0x38bdf8, 1.5, 5);
  coolerLight.position.set(0, 2.2, 0.3);
  group.add(coolerLight);

  return group;
}

// Island Chest Deep Freezer for Frozen Food
export function create3DDeepFreezer(currentStock: number = 0, capacity: number = 12, productId?: string | null): THREE.Group {
  const group = new THREE.Group();
  group.name = 'deep_freezer';

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 }); // Blue trim
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.4,
    roughness: 0.1,
  });

  // Base chest
  const chestGeo = new THREE.BoxGeometry(2.5, 0.95, 1.2);
  const chest = new THREE.Mesh(chestGeo, bodyMat);
  chest.position.set(0, 0.47, 0);
  chest.castShadow = true;
  group.add(chest);

  // Blue bumper trim
  const trimGeo = new THREE.BoxGeometry(2.55, 0.1, 1.25);
  const trim = new THREE.Mesh(trimGeo, trimMat);
  trim.position.set(0, 0.85, 0);
  group.add(trim);

  // Sliding glass curved lid
  const lidGeo = new THREE.BoxGeometry(2.35, 0.04, 1.05);
  const lid = new THREE.Mesh(lidGeo, glassMat);
  lid.position.set(0, 0.95, 0);
  group.add(lid);

  // Frozen food items inside only if stocked!
  if (productId && currentStock > 0) {
    const prodDef = PRODUCT_CATALOG.find((p) => p.id === productId);
    const prodColor = new THREE.Color(prodDef?.color || '#0284c7');
    const frozenMat = new THREE.MeshStandardMaterial({ color: prodColor, roughness: 0.3 });
    const visualCount = Math.min(8, Math.ceil((currentStock / capacity) * 8));

    for (let i = 0; i < visualCount; i++) {
      const fx = -0.75 + (i % 4) * 0.5;
      const fz = Math.floor(i / 4) === 0 ? -0.2 : 0.2;
      const fBox = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.2, 0.25), frozenMat);
      fBox.position.set(fx, 0.65, fz);
      fBox.castShadow = true;
      group.add(fBox);
    }
  }

  return group;
}

// Checkout Counter with Conveyor Belt, Register & Card Terminal
export function create3DCheckoutCounter(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'checkout_counter';

  const counterMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 }); // Black rubber conveyor
  const metallicMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 });

  // Main L-shaped or long checkout counter table
  const tableGeo = new THREE.BoxGeometry(2.8, 0.95, 1.1);
  const table = new THREE.Mesh(tableGeo, counterMat);
  table.position.set(0, 0.47, 0);
  table.castShadow = true;
  table.receiveShadow = true;
  group.add(table);

  // Rubber conveyor belt strip
  const beltGeo = new THREE.BoxGeometry(1.5, 0.03, 0.6);
  const belt = new THREE.Mesh(beltGeo, beltMat);
  belt.position.set(-0.45, 0.96, 0);
  group.add(belt);

  // Touchscreen POS Monitor
  const standGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8);
  const stand = new THREE.Mesh(standGeo, metallicMat);
  stand.position.set(0.65, 1.07, -0.2);
  group.add(stand);

  const screenGeo = new THREE.BoxGeometry(0.4, 0.3, 0.05);
  const screenMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0284c7, emissiveIntensity: 0.4 });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0.65, 1.25, -0.2);
  screen.rotation.y = -0.3;
  group.add(screen);

  // Handheld Barcode Laser Scanner on Cradle
  const scannerGeo = new THREE.BoxGeometry(0.1, 0.16, 0.08);
  const scannerMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
  const scanner = new THREE.Mesh(scannerGeo, scannerMat);
  scanner.position.set(0.35, 1.02, 0.15);
  group.add(scanner);

  // Card payment chip/PIN machine
  const cardMachGeo = new THREE.BoxGeometry(0.12, 0.06, 0.2);
  const cardMachMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
  const cardMach = new THREE.Mesh(cardMachGeo, cardMachMat);
  cardMach.position.set(0.65, 0.98, 0.2);
  group.add(cardMach);

  // Plastic shopping bag carousel / grocery packing area
  const bagGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.4, 12);
  const bagMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.6 });
  const bag = new THREE.Mesh(bagGeo, bagMat);
  bag.position.set(1.1, 1.15, 0);
  group.add(bag);

  return group;
}

// Manager Office Ordering Desk with PC Computer
export function create3DManagerDesk(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'manager_desk';

  const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
  const pcMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });

  // Desk table
  const deskGeo = new THREE.BoxGeometry(1.8, 0.85, 1.0);
  const desk = new THREE.Mesh(deskGeo, woodMat);
  desk.position.set(0, 0.42, 0);
  desk.castShadow = true;
  group.add(desk);

  // PC Monitor showing "SuperOS" screen
  const monGeo = new THREE.BoxGeometry(0.6, 0.4, 0.04);
  const monMat = new THREE.MeshStandardMaterial({
    color: 0x059669, // SuperOS emerald green desktop
    emissive: 0x059669,
    emissiveIntensity: 0.5,
  });
  const mon = new THREE.Mesh(monGeo, monMat);
  mon.position.set(0, 1.15, -0.15);
  group.add(mon);

  const monStand = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 8), pcMat);
  monStand.position.set(0, 0.97, -0.15);
  group.add(monStand);

  // Keyboard & Mouse
  const kbGeo = new THREE.BoxGeometry(0.4, 0.02, 0.15);
  const kb = new THREE.Mesh(kbGeo, pcMat);
  kb.position.set(0, 0.86, 0.15);
  group.add(kb);

  // PC Tower on Floor
  const towerGeo = new THREE.BoxGeometry(0.2, 0.45, 0.4);
  const tower = new THREE.Mesh(towerGeo, pcMat);
  tower.position.set(0.65, 0.22, 0.1);
  group.add(tower);

  return group;
}

// Automatic Glass Sliding Entrance Doors
export function createGlassSlidingDoorMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'sliding_doors';

  const frameMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xa5f3fc,
    transparent: true,
    opacity: 0.3,
    roughness: 0.05,
    transmission: 0.9,
  });

  // Door Frame Header
  const headerGeo = new THREE.BoxGeometry(3.6, 0.4, 0.2);
  const header = new THREE.Mesh(headerGeo, frameMat);
  header.position.set(0, 3.2, 0);
  header.castShadow = true;
  group.add(header);

  // Left and right pillars
  [-1.7, 1.7].forEach((px) => {
    const postGeo = new THREE.BoxGeometry(0.2, 3.2, 0.2);
    const post = new THREE.Mesh(postGeo, frameMat);
    post.position.set(px, 1.6, 0);
    group.add(post);
  });

  // Left glass sliding door panel
  const doorL = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.9, 0.06), glassMat);
  doorL.position.set(-0.65, 1.5, 0);
  doorL.name = 'door_left';
  group.add(doorL);

  // Right glass sliding door panel
  const doorR = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.9, 0.06), glassMat);
  doorR.position.set(0.65, 1.5, 0);
  doorR.name = 'door_right';
  group.add(doorR);

  // Green motion sensor above door
  const sensorGeo = new THREE.BoxGeometry(0.3, 0.1, 0.12);
  const sensorMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.6 });
  const sensor = new THREE.Mesh(sensorGeo, sensorMat);
  sensor.position.set(0, 3.35, 0.12);
  group.add(sensor);

  return group;
}

// Cardboard Delivery Box (carrying or in storage)
export function createDeliveryBoxMesh(colorHex: string = '#d97706'): THREE.Group {
  const group = new THREE.Group();
  group.name = 'delivery_box';

  const boxMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 }); // Kraft brown cardboard
  const tapeMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 }); // Brown/clear tape
  const labelColor = new THREE.Color(colorHex);
  const labelMat = new THREE.MeshStandardMaterial({ color: labelColor });

  // Main box
  const boxGeo = new THREE.BoxGeometry(0.6, 0.45, 0.5);
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.position.y = 0.225;
  box.castShadow = true;
  group.add(box);

  // Sealing tape on top
  const tapeGeo = new THREE.BoxGeometry(0.62, 0.02, 0.08);
  const tape = new THREE.Mesh(tapeGeo, tapeMat);
  tape.position.y = 0.46;
  group.add(tape);

  // Color product label on side
  const labelGeo = new THREE.BoxGeometry(0.01, 0.2, 0.25);
  const label = new THREE.Mesh(labelGeo, labelMat);
  label.position.set(0.305, 0.25, 0);
  group.add(label);

  return group;
}

// Shopping Cart (Trolley)
export function createSupermarketTrolleyMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'shopping_cart';

  const metalMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.3 });
  const plasticMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 }); // Red handle
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });

  // Basket wireframe box
  const basketGeo = new THREE.BoxGeometry(0.6, 0.45, 0.75);
  const basketMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.2,
    wireframe: true,
  });
  const basket = new THREE.Mesh(basketGeo, basketMat);
  basket.position.y = 0.65;
  basket.castShadow = true;
  group.add(basket);

  // Red push handle
  const handleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.55, 8);
  const handle = new THREE.Mesh(handleGeo, plasticMat);
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0, 0.95, -0.42);
  group.add(handle);

  // 4 Wheels
  const wheelPositions = [
    [-0.25, 0.1, 0.3],
    [0.25, 0.1, 0.3],
    [-0.25, 0.1, -0.3],
    [0.25, 0.1, -0.3],
  ];
  wheelPositions.forEach(([wx, wy, wz]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 8), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(wx, wy, wz);
    group.add(wheel);
  });

  return group;
}

// Trash / Spills on Floor
export function createTrashMesh(type: 'paper' | 'spill' | 'cup'): THREE.Group {
  const group = new THREE.Group();

  if (type === 'spill') {
    const spillGeo = new THREE.CircleGeometry(0.35, 12);
    const spillMat = new THREE.MeshStandardMaterial({
      color: 0x78350f, // Soda / coffee spill
      roughness: 0.1,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });
    const spill = new THREE.Mesh(spillGeo, spillMat);
    spill.rotation.x = -Math.PI / 2;
    spill.position.y = 0.01;
    group.add(spill);
  } else if (type === 'paper') {
    const paperGeo = new THREE.DodecahedronGeometry(0.12, 0);
    const paperMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
    const paper = new THREE.Mesh(paperGeo, paperMat);
    paper.position.y = 0.08;
    group.add(paper);
  } else {
    // Crushed beverage cup
    const cupGeo = new THREE.CylinderGeometry(0.07, 0.05, 0.14, 8);
    const cupMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.6 });
    const cup = new THREE.Mesh(cupGeo, cupMat);
    cup.rotation.z = 1.2;
    cup.position.y = 0.06;
    group.add(cup);
  }

  return group;
}

// Delivery Van / Truck parked in loading zone
export function createDeliveryTruckMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'delivery_truck';

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 }); // Blue delivery truck
  const cargoMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }); // White cargo container
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
  const tireMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

  // Cab
  const cabGeo = new THREE.BoxGeometry(1.6, 1.4, 1.3);
  const cab = new THREE.Mesh(cabGeo, bodyMat);
  cab.position.set(0, 1.0, 1.5);
  cab.castShadow = true;
  group.add(cab);

  // Windshield
  const windGeo = new THREE.BoxGeometry(1.4, 0.6, 0.05);
  const wind = new THREE.Mesh(windGeo, glassMat);
  wind.position.set(0, 1.2, 2.16);
  group.add(wind);

  // Cargo Box
  const cargoGeo = new THREE.BoxGeometry(1.8, 1.8, 2.8);
  const cargo = new THREE.Mesh(cargoGeo, cargoMat);
  cargo.position.set(0, 1.3, -0.6);
  cargo.castShadow = true;
  group.add(cargo);

  // Wheels
  const wheelPositions = [
    [-0.9, 0.35, 1.4],
    [0.9, 0.35, 1.4],
    [-0.9, 0.35, -1.2],
    [0.9, 0.35, -1.2],
  ];
  wheelPositions.forEach(([wx, wy, wz]) => {
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.22, 12), tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.position.set(wx, wy, wz);
    tire.castShadow = true;
    group.add(tire);
  });

  return group;
}

// --- Realistic Human Character System ---
export const REALISTIC_SKIN_TONES = [
  '#f6d5be', // Fair warm
  '#eecab1', // Natural light
  '#dfb48c', // Warm honey tan
  '#c68a5c', // Golden bronze
  '#9e643e', // Rich chestnut
  '#6b3b1f', // Dark espresso
];

export const REALISTIC_HAIR_COLORS = [
  '#171717', // Jet black
  '#2a1d17', // Dark brown
  '#452317', // Chestnut brown
  '#784c28', // Medium brown
  '#a37042', // Warm auburn
];

// Helper: Realistic Human Head with Eyes, Brows, Nose, Mouth, Ears, Hair & Neck
function createRealisticHead({
  skinColor,
  hairColor,
  hairStyle = 'short',
}: {
  skinColor: string;
  hairColor: string;
  hairStyle?: 'short' | 'parted' | 'bob' | 'curly' | 'ponytail';
}) {
  const headGroup = new THREE.Group();

  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.65,
    metalness: 0.05,
  });

  // 1. Proportional Human Cranium & Face
  const cranium = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 24, 18),
    skinMat
  );
  cranium.position.set(0, 0.04, 0);
  cranium.scale.set(1.0, 1.15, 1.08);
  headGroup.add(cranium);

  // Jaw & Chin
  const jaw = new THREE.Mesh(
    new THREE.ConeGeometry(0.13, 0.16, 12),
    skinMat
  );
  jaw.rotation.x = Math.PI;
  jaw.position.set(0, -0.06, 0.03);
  headGroup.add(jaw);

  // 2. Realistic Eyes
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x27170e, roughness: 0.2 });
  const lashMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });

  [-0.055, 0.055].forEach((ex) => {
    // Sclera (eyeball)
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.021, 12, 8), eyeWhiteMat);
    eye.position.set(ex, 0.02, 0.155);
    headGroup.add(eye);

    // Iris & Pupil
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.010, 10, 8), irisMat);
    pupil.position.set(ex, 0.02, 0.166);
    headGroup.add(pupil);

    // Upper Eyelid
    const lid = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 6), skinMat);
    lid.scale.set(1.25, 0.18, 0.55);
    lid.position.set(ex, 0.034, 0.158);
    headGroup.add(lid);

    // Eyebrows
    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.006, 0.038, 3, 8), lashMat);
    brow.rotation.z = Math.PI / 2;
    brow.position.set(ex, 0.05, 0.16);
    brow.rotation.z = ex > 0 ? -0.08 : 0.08;
    headGroup.add(brow);
  });

  // 3. Realistic 3D Nose Bridge & Tip
  const noseBridge = new THREE.Mesh(new THREE.CapsuleGeometry(0.011, 0.035, 4, 8), skinMat);
  noseBridge.position.set(0, -0.01, 0.165);
  headGroup.add(noseBridge);

  const noseTip = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 8, 8),
    skinMat
  );
  noseTip.position.set(0, -0.035, 0.176);
  headGroup.add(noseTip);

  // 4. Natural Lips
  const lipMat = new THREE.MeshStandardMaterial({ color: 0xb5786a, roughness: 0.7 });
  const lips = new THREE.Mesh(new THREE.CapsuleGeometry(0.008, 0.038, 3, 8), lipMat);
  lips.rotation.z = Math.PI / 2;
  lips.position.set(0, -0.075, 0.154);
  headGroup.add(lips);

  // 5. Left & Right Ears
  [-0.155, 0.155].forEach((earX) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.026, 10, 8), skinMat);
    ear.scale.set(0.55, 1.15, 0.7);
    ear.position.set(earX, 0.01, -0.01);
    ear.rotation.y = earX > 0 ? 0.2 : -0.2;
    headGroup.add(ear);
  });

  // 6. Styled Hair with Volume
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.75 });
  const hairCrown = new THREE.Mesh(
    new THREE.SphereGeometry(0.172, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.55),
    hairMat
  );
  hairCrown.position.set(0, 0.08, -0.01);
  hairCrown.scale.set(1.02, 1.05, 1.06);
  headGroup.add(hairCrown);

  if (hairStyle === 'parted' || hairStyle === 'short') {
    const fringe = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.11, 4, 10), hairMat);
    fringe.rotation.z = Math.PI / 2;
    fringe.position.set(0.02, 0.15, 0.11);
    fringe.rotation.z = -0.12;
    headGroup.add(fringe);

    [-0.152, 0.152].forEach((sx) => {
      const burn = new THREE.Mesh(new THREE.CapsuleGeometry(0.015, 0.04, 3, 8), hairMat);
      burn.position.set(sx, 0.05, 0.04);
      headGroup.add(burn);
    });
  } else if (hairStyle === 'bob') {
    [-0.165, 0.165].forEach((bx) => {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.18, 0.14), hairMat);
      side.position.set(bx, -0.01, -0.01);
      headGroup.add(side);
    });
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.18, 0.04), hairMat);
    back.position.set(0, -0.01, -0.16);
    headGroup.add(back);
  } else if (hairStyle === 'ponytail') {
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.025, 0.22, 8), hairMat);
    tail.rotation.x = 0.4;
    tail.position.set(0, 0.04, -0.22);
    headGroup.add(tail);
  }

  // 7. Anatomical Neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.09, 0.14, 12),
    skinMat
  );
  neck.position.set(0, -0.16, 0);
  headGroup.add(neck);

  return { headGroup, skinMat };
}

// Helper: Realistic Human Shoes with Soles & Toe Contour
function createRealisticShoes(shoeColor: number, soleColor: number = 0xffffff) {
  const shoeMat = new THREE.MeshStandardMaterial({ color: shoeColor, roughness: 0.5 });
  const soleMat = new THREE.MeshStandardMaterial({ color: soleColor, roughness: 0.8 });

  const createFoot = () => {
    const footGroup = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.13, 4, 10), shoeMat);
    body.rotation.x = Math.PI / 2;
    body.scale.y = 1.35;
    body.position.set(0, 0.045, 0.04);
    footGroup.add(body);

    const sole = new THREE.Mesh(new THREE.CapsuleGeometry(0.062, 0.14, 3, 10), soleMat);
    sole.rotation.x = Math.PI / 2;
    sole.scale.y = 1.35;
    sole.position.set(0, 0.012, 0.04);
    footGroup.add(sole);

    const toe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.07, 10), shoeMat);
    toe.position.set(0, 0.045, 0.14);
    footGroup.add(toe);

    return footGroup;
  };

  return { footL: createFoot(), footR: createFoot() };
}

// Helper: Realistic Hand with Palm & Thumb
function createRealisticHand(skinMat: THREE.Material) {
  const hand = new THREE.Group();
  const palm = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.08, 0.04), skinMat);
  hand.add(palm);

  const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.045, 0.022), skinMat);
  thumb.position.set(0.038, 0.01, 0.018);
  thumb.rotation.z = 0.3;
  hand.add(thumb);

  return hand;
}

// --- Player Manager 3D Character (Realistic Store Manager) ---
export function createPlayerMesh(): {
  root: THREE.Group;
  boxGroup: THREE.Group;
  setWalking: (isWalking: boolean, time: number, isCarrying: boolean) => void;
  setCarryingBox: (carrying: boolean, colorHex?: string) => void;
} {
  const root = new THREE.Group();
  root.name = 'player_character';

  // Realistic Head
  const { headGroup, skinMat } = createRealisticHead({
    skinColor: '#dfb48c', // Warm natural tan skin
    hairColor: '#1e1b18', // Deep espresso styled hair
    hairStyle: 'parted',
  });
  headGroup.position.set(0, 1.62, 0);
  root.add(headGroup);

  // Clothing Materials
  const blazerMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.6 }); // Teal / Navy Manager Blazer
  const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }); // Crisp White Collared Shirt
  const beltMat = new THREE.MeshStandardMaterial({ color: 0x27170e, roughness: 0.4 }); // Dark Leather Belt
  const buckleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.2 }); // Gold Buckle
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.65 }); // Charcoal Chinos

  // Torso / Chest with Anatomical Taper
  const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.18, 6, 14), blazerMat);
  chest.scale.z = 0.72;
  chest.position.set(0, 1.22, 0);
  chest.castShadow = true;
  root.add(chest);

  // Collared Shirt V-Neck & Placket
  const shirtV = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.32, 0.03), shirtMat);
  shirtV.position.set(0, 1.32, 0.12);
  root.add(shirtV);

  // Manager ID Badge with Gold Border & Lanyard
  const badge = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.12, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
  );
  badge.position.set(0.14, 1.3, 0.14);
  root.add(badge);

  const badgeHeader = new THREE.Mesh(
    new THREE.BoxGeometry(0.092, 0.03, 0.022),
    new THREE.MeshStandardMaterial({ color: 0x059669 })
  );
  badgeHeader.position.set(0.14, 1.345, 0.14);
  root.add(badgeHeader);

  // Waist & Belt
  const waist = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.04, 5, 12), blazerMat);
  waist.scale.z = 0.72;
  waist.position.set(0, 0.94, 0);
  root.add(waist);

  const belt = new THREE.Mesh(new THREE.BoxGeometry(0.405, 0.05, 0.245), beltMat);
  belt.position.set(0, 0.85, 0);
  root.add(belt);

  const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.055, 0.015), buckleMat);
  buckle.position.set(0, 0.85, 0.126);
  root.add(buckle);

  // Legs with Proper Knee Contours
  const legLGroup = new THREE.Group();
  legLGroup.position.set(-0.13, 0.82, 0);
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.08, 0.72, 10), pantsMat);
  legL.position.set(0, -0.36, 0);
  legL.castShadow = true;
  legLGroup.add(legL);

  const legRGroup = new THREE.Group();
  legRGroup.position.set(0.13, 0.82, 0);
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.08, 0.72, 10), pantsMat);
  legR.position.set(0, -0.36, 0);
  legR.castShadow = true;
  legRGroup.add(legR);

  // Realistic Leather Shoes
  const { footL, footR } = createRealisticShoes(0x18181b, 0x0f172a);
  footL.position.set(0, -0.82, 0);
  legLGroup.add(footL);

  footR.position.set(0, -0.82, 0);
  legRGroup.add(footR);

  root.add(legLGroup);
  root.add(legRGroup);

  // Arms with Sleeves & Realistic Hands
  const armLGroup = new THREE.Group();
  armLGroup.position.set(-0.28, 1.4, 0);
  const armLSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.52, 10), blazerMat);
  armLSleeve.position.set(0, -0.26, 0);
  armLGroup.add(armLSleeve);

  const handL = createRealisticHand(skinMat);
  handL.position.set(0, -0.56, 0);
  armLGroup.add(handL);
  root.add(armLGroup);

  const armRGroup = new THREE.Group();
  armRGroup.position.set(0.28, 1.4, 0);
  const armRSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.52, 10), blazerMat);
  armRSleeve.position.set(0, -0.26, 0);
  armRGroup.add(armRSleeve);

  const handR = createRealisticHand(skinMat);
  handR.position.set(0, -0.56, 0);
  armRGroup.add(handR);
  root.add(armRGroup);

  // Held Delivery Box
  const boxGroup = new THREE.Group();
  const carriedBox = createDeliveryBoxMesh('#d97706');
  carriedBox.position.set(0, 1.05, 0.45);
  boxGroup.add(carriedBox);
  boxGroup.visible = false;
  root.add(boxGroup);

  return {
    root,
    boxGroup,
    setCarryingBox(carrying: boolean, colorHex: string = '#d97706') {
      boxGroup.visible = carrying;
      if (carrying) {
        armLGroup.rotation.set(-1.0, 0.3, 0.3);
        armRGroup.rotation.set(-1.0, -0.3, -0.3);
      } else {
        armLGroup.rotation.set(0, 0, 0);
        armRGroup.rotation.set(0, 0, 0);
      }
    },
    setWalking(isWalking: boolean, time: number, isCarrying: boolean) {
      if (isWalking) {
        const swing = Math.sin(time * 11) * 0.52;
        legLGroup.rotation.x = swing;
        legRGroup.rotation.x = -swing;
        root.position.y = Math.abs(Math.sin(time * 11)) * 0.04;

        if (isCarrying) {
          boxGroup.visible = true;
          armLGroup.rotation.set(-1.05 + Math.sin(time * 11) * 0.06, 0.3, 0.3);
          armRGroup.rotation.set(-1.05 + Math.sin(time * 11) * 0.06, -0.3, -0.3);
        } else {
          armLGroup.rotation.x = -swing * 0.55;
          armRGroup.rotation.x = swing * 0.55;
        }
      } else {
        legLGroup.rotation.x = 0;
        legRGroup.rotation.x = 0;
        root.position.y = 0;
        if (isCarrying) {
          armLGroup.rotation.set(-1.0, 0.3, 0.3);
          armRGroup.rotation.set(-1.0, -0.3, -0.3);
        } else {
          armLGroup.rotation.set(0, 0, 0);
          armRGroup.rotation.set(0, 0, 0);
        }
      }
    },
  };
}

// --- Customer 3D Character (Realistic Supermarket Shopper) ---
export function createCustomerMesh(colorHex: string, styleIdx: number): {
  root: THREE.Group;
  basketMesh: THREE.Group;
  setWalking: (isWalking: boolean, time: number) => void;
  setItemsCount: (count: number) => void;
} {
  const root = new THREE.Group();
  root.name = 'customer_character';

  const skinColor = REALISTIC_SKIN_TONES[styleIdx % REALISTIC_SKIN_TONES.length];
  const hairColor = REALISTIC_HAIR_COLORS[styleIdx % REALISTIC_HAIR_COLORS.length];
  const hairStyles: ('short' | 'parted' | 'bob' | 'curly' | 'ponytail')[] = [
    'short',
    'bob',
    'parted',
    'ponytail',
  ];
  const selectedHairStyle = hairStyles[styleIdx % hairStyles.length];

  // Realistic Head
  const { headGroup, skinMat } = createRealisticHead({
    skinColor,
    hairColor,
    hairStyle: selectedHairStyle,
  });
  headGroup.position.set(0, 1.58, 0);
  root.add(headGroup);

  // Realistic Casual Outfits (Polo, Knitted Sweater, Denim, Chinos)
  const shirtColor = new THREE.Color(colorHex);
  const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.65 });
  const denimPantsColors = [0x1e3a8a, 0x334155, 0x1e293b, 0x475569];
  const pantsMat = new THREE.MeshStandardMaterial({
    color: denimPantsColors[styleIdx % denimPantsColors.length],
    roughness: 0.75,
  });

  // Torso / Shirt
  const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.16, 6, 14), shirtMat);
  chest.scale.z = 0.72;
  chest.position.set(0, 1.18, 0);
  chest.castShadow = true;
  root.add(chest);

  // Subtle collar
  const collar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.25), shirtMat);
  collar.position.set(0, 1.4, 0);
  root.add(collar);

  // Waist
  const waist = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.03, 5, 12), pantsMat);
  waist.scale.z = 0.72;
  waist.position.set(0, 0.92, 0);
  root.add(waist);

  // Legs
  const legLGroup = new THREE.Group();
  legLGroup.position.set(-0.12, 0.82, 0);
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.075, 0.70, 10), pantsMat);
  legL.position.set(0, -0.35, 0);
  legL.castShadow = true;
  legLGroup.add(legL);

  const legRGroup = new THREE.Group();
  legRGroup.position.set(0.12, 0.82, 0);
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.075, 0.70, 10), pantsMat);
  legR.position.set(0, -0.35, 0);
  legR.castShadow = true;
  legRGroup.add(legR);

  // Modern Sneakers with White Rubber Soles
  const sneakerColors = [0x1e293b, 0x0284c7, 0xdc2626, 0x475569];
  const { footL, footR } = createRealisticShoes(sneakerColors[styleIdx % sneakerColors.length], 0xf8fafc);
  footL.position.set(0, -0.82, 0);
  legLGroup.add(footL);

  footR.position.set(0, -0.82, 0);
  legRGroup.add(footR);

  root.add(legLGroup);
  root.add(legRGroup);

  // Arms with Hands
  const armLGroup = new THREE.Group();
  armLGroup.position.set(-0.25, 1.35, 0);
  const armLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.058, 0.50, 10), shirtMat);
  armLMesh.position.set(0, -0.25, 0);
  armLGroup.add(armLMesh);
  const handL = createRealisticHand(skinMat);
  handL.position.set(0, -0.52, 0);
  armLGroup.add(handL);
  root.add(armLGroup);

  const armRGroup = new THREE.Group();
  armRGroup.position.set(0.25, 1.35, 0);
  const armRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.058, 0.50, 10), shirtMat);
  armRMesh.position.set(0, -0.25, 0);
  armRGroup.add(armRMesh);
  const handR = createRealisticHand(skinMat);
  handR.position.set(0, -0.52, 0);
  armRGroup.add(handR);
  root.add(armRGroup);

  // Realistic Metallic Wire Shopping Basket with Red Handles
  const basketMesh = new THREE.Group();
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
  const redHandleMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });

  const basketBase = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.26), wireMat);
  basketBase.position.set(0.38, 0.68, 0.12);
  basketMesh.add(basketBase);

  const handle1 = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 6, 12, Math.PI), redHandleMat);
  handle1.position.set(0.38, 0.84, 0.12);
  handle1.rotation.x = Math.PI;
  basketMesh.add(handle1);

  // Grocery items inside basket
  const itemInBasket = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.14, 0.18),
    new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 })
  );
  itemInBasket.position.set(0.38, 0.76, 0.12);
  itemInBasket.visible = false;
  basketMesh.add(itemInBasket);

  root.add(basketMesh);

  return {
    root,
    basketMesh,
    setItemsCount(count: number) {
      itemInBasket.visible = count > 0;
    },
    setWalking(isWalking: boolean, time: number) {
      if (isWalking) {
        const swing = Math.sin(time * 10) * 0.48;
        legLGroup.rotation.x = swing;
        legRGroup.rotation.x = -swing;
        armLGroup.rotation.x = -swing * 0.45;
        armRGroup.rotation.x = swing * 0.25; // holding basket steady
        root.position.y = Math.abs(Math.sin(time * 10)) * 0.035;
      } else {
        legLGroup.rotation.x = 0;
        legRGroup.rotation.x = 0;
        armLGroup.rotation.x = 0;
        armRGroup.rotation.x = 0;
        root.position.y = 0;
      }
    },
  };
}

// --- Supermarket Staff 3D Character (Cashier, Stocker, Cleaner) ---
export function createStaffMesh(role: 'cashier' | 'stocker' | 'cleaner', name: string): {
  root: THREE.Group;
  setWalking: (isWalking: boolean, time: number) => void;
  setOperating: (isOperating: boolean, time: number) => void;
} {
  const root = new THREE.Group();
  root.name = `staff_${role}`;

  let uniformColor = 0x059669; // Emerald green for cashier
  let apronColor = 0x065f46;
  if (role === 'stocker') {
    uniformColor = 0xd97706; // Amber for warehouse stocker
    apronColor = 0xb45309;
  } else if (role === 'cleaner') {
    uniformColor = 0x0284c7; // Cyan for cleaner
    apronColor = 0x0369a1;
  }

  // Realistic Head
  const { headGroup, skinMat } = createRealisticHead({
    skinColor: '#dfb48c',
    hairColor: '#171717',
    hairStyle: 'short',
  });
  headGroup.position.set(0, 1.6, 0);
  root.add(headGroup);

  // Uniform Materials
  const shirtMat = new THREE.MeshStandardMaterial({ color: uniformColor, roughness: 0.6 });
  const apronMat = new THREE.MeshStandardMaterial({ color: apronColor, roughness: 0.5 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

  // Body / Chest
  const chest = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.18, 6, 14), shirtMat);
  chest.scale.z = 0.72;
  chest.position.set(0, 1.2, 0);
  chest.castShadow = true;
  root.add(chest);

  // Staff Apron over Chest
  const apron = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.25, 5, 12), apronMat);
  apron.scale.z = 0.76;
  apron.position.set(0, 1.05, 0.01);
  root.add(apron);

  // Staff ID Badge on chest
  const badge = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.07, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
  );
  badge.position.set(0.11, 1.28, 0.15);
  root.add(badge);

  // Staff Cap / Visor with embroidered logo
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.07, 14), apronMat);
  cap.position.set(0, 1.74, 0);
  root.add(cap);

  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.015, 0.12), apronMat);
  visor.position.set(0, 1.72, 0.18);
  root.add(visor);

  // Legs
  const legLGroup = new THREE.Group();
  legLGroup.position.set(-0.13, 0.82, 0);
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.70, 10), pantsMat);
  legL.position.set(0, -0.35, 0);
  legLGroup.add(legL);

  const legRGroup = new THREE.Group();
  legRGroup.position.set(0.13, 0.82, 0);
  const legR = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.70, 10), pantsMat);
  legR.position.set(0, -0.35, 0);
  legRGroup.add(legR);

  // Realistic Work Boots
  const { footL, footR } = createRealisticShoes(0x0f172a, 0x334155);
  footL.position.set(0, -0.82, 0);
  legLGroup.add(footL);

  footR.position.set(0, -0.82, 0);
  legRGroup.add(footR);

  root.add(legLGroup);
  root.add(legRGroup);

  // Arms with Hands
  const armLGroup = new THREE.Group();
  armLGroup.position.set(-0.27, 1.38, 0);
  const armLMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.50, 10), shirtMat);
  armLMesh.position.set(0, -0.25, 0);
  armLGroup.add(armLMesh);
  const handL = createRealisticHand(skinMat);
  handL.position.set(0, -0.52, 0);
  armLGroup.add(handL);
  root.add(armLGroup);

  const armRGroup = new THREE.Group();
  armRGroup.position.set(0.27, 1.38, 0);
  const armRMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.50, 10), shirtMat);
  armRMesh.position.set(0, -0.25, 0);
  armRGroup.add(armRMesh);
  const handR = createRealisticHand(skinMat);
  handR.position.set(0, -0.52, 0);
  armRGroup.add(handR);
  root.add(armRGroup);

  // Realistic Role Equipment
  const toolGroup = new THREE.Group();
  if (role === 'cashier') {
    // Handheld barcode scanner
    const scanner = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.14, 0.10),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
    );
    scanner.position.set(0.28, 0.88, 0.18);
    toolGroup.add(scanner);
  } else if (role === 'cleaner') {
    // Floor Cleaning Mop
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 1.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.5 })
    );
    stick.position.set(0.28, 0.72, 0.18);
    toolGroup.add(stick);
  } else {
    // Restocker mini-box
    const b = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.24, 0.28),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 })
    );
    b.position.set(0, 0.95, 0.35);
    toolGroup.add(b);
  }
  root.add(toolGroup);

  return {
    root,
    setWalking(isWalking: boolean, time: number) {
      if (isWalking) {
        const swing = Math.sin(time * 10) * 0.45;
        legLGroup.rotation.x = swing;
        legRGroup.rotation.x = -swing;
        armLGroup.rotation.x = -swing * 0.4;
        armRGroup.rotation.x = swing * 0.4;
        root.position.y = Math.abs(Math.sin(time * 10)) * 0.03;
      } else {
        legLGroup.rotation.x = 0;
        legRGroup.rotation.x = 0;
        armLGroup.rotation.x = 0;
        armRGroup.rotation.x = 0;
        root.position.y = 0;
      }
    },
    setOperating(isOperating: boolean, time: number) {
      if (isOperating) {
        armRGroup.rotation.x = -0.75 + Math.sin(time * 6) * 0.18;
        armLGroup.rotation.x = -0.45;
      } else {
        armRGroup.rotation.x = 0;
        armLGroup.rotation.x = 0;
      }
    },
  };
}

// --- Supermarket Roof & Ceiling System ---

export function createSupermartCeilingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Off-white acoustic suspended ceiling tile panels (2x2 grid)
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle acoustic micro-perforations
  for (let i = 0; i < 600; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.fillRect(rx, ry, 2, 2);
  }

  // Aluminum T-bar suspension grid lines
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 4;
  for (let x = 0; x <= 512; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Recessed LED troffer luminaire panels in select tiles
  const ledTiles = [
    { x: 128, y: 128 },
    { x: 384, y: 384 },
  ];
  ledTiles.forEach((pos) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(pos.x - 56, pos.y - 56, 112, 112);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.strokeRect(pos.x - 56, pos.y - 56, 112, 112);
    // Diffuser louvers
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    for (let lx = pos.x - 48; lx <= pos.x + 48; lx += 16) {
      ctx.beginPath();
      ctx.moveTo(lx, pos.y - 50);
      ctx.lineTo(lx, pos.y + 50);
      ctx.stroke();
    }
  });

  // Circular HVAC air diffuser
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(384, 128, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.stroke();
  for (let r = 10; r <= 32; r += 8) {
    ctx.beginPath();
    ctx.arc(384, 128, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

export function createSupermartRooftopTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Dark industrial asphalt/bitumen gravel roof membrane
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, 512, 512);

  // Gravel flecks
  for (let i = 0; i < 2000; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(71, 85, 105, 0.6)' : 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(rx, ry, 2, 2);
  }

  // Roll roofing seam lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 3;
  for (let y = 0; y <= 512; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Yellow maintenance walkway paths
  ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
  ctx.fillRect(190, 0, 48, 512);
  ctx.fillRect(0, 232, 512, 48);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

export function createRooftopBillboardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Dark slate background with emerald & amber neon accents
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 1024, 256);

  // Outer border with neon glow
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 12;
  ctx.strokeRect(10, 10, 1004, 236);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 984, 216);

  // Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#34d399';
  ctx.font = '900 32px sans-serif';
  ctx.fillText('★ SUPERMARKET • MEGA STORE ★', 512, 65);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 84px sans-serif';
  ctx.fillText('SUPERMART', 512, 155);

  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('OPEN 24 HOURS • FRESH ORGANIC FOODS & ESSENTIALS', 512, 215);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export interface SupermartRoofHandle {
  root: THREE.Group;
  update: (delta: number, time: number) => void;
}

export function createSupermartRoof(floorWidth: number, floorDepth: number, wallH: number): SupermartRoofHandle {
  const root = new THREE.Group();
  root.name = 'supermart_roof_system';

  const halfW = floorWidth / 2;
  const halfD = floorDepth / 2;
  const roofY = wallH; // 4.0m

  // 1. Interior Ceiling (visible from inside supermarket when looking up)
  const ceilingTex = createSupermartCeilingTexture();
  const ceilingGeo = new THREE.PlaneGeometry(floorWidth, floorDepth);
  const ceilingMat = new THREE.MeshStandardMaterial({
    map: ceilingTex,
    roughness: 0.8,
    side: THREE.DoubleSide,
  });
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
  ceiling.rotation.x = Math.PI / 2; // Facing down into supermarket
  ceiling.position.set(0, roofY - 0.02, 0);
  root.add(ceiling);

  // 2. Main Exterior Concrete Roof Slab
  const slabThickness = 0.3;
  const slabW = floorWidth + 0.4;
  const slabD = floorDepth + 0.4;
  const rooftopTex = createSupermartRooftopTexture();
  
  const sideMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });
  const topMat = new THREE.MeshStandardMaterial({ map: rooftopTex, roughness: 0.9 });
  const slabMats = [
    sideMat, // right
    sideMat, // left
    topMat,  // top
    ceilingMat, // bottom
    sideMat, // front
    sideMat, // back
  ];
  const slabGeo = new THREE.BoxGeometry(slabW, slabThickness, slabD);
  const slab = new THREE.Mesh(slabGeo, slabMats);
  slab.position.set(0, roofY + slabThickness / 2, 0);
  slab.receiveShadow = true;
  root.add(slab);

  // 3. Perimeter Parapet Walls (rising 0.85m above roof surface)
  const parapetH = 0.85;
  const parapetThick = 0.35;
  const parapetY = roofY + slabThickness + parapetH / 2;
  const parapetMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 });
  const copingMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.3 });

  // Back Parapet
  const backP = new THREE.Mesh(new THREE.BoxGeometry(slabW, parapetH, parapetThick), parapetMat);
  backP.position.set(0, parapetY, -slabD / 2 + parapetThick / 2);
  root.add(backP);
  const backCoping = new THREE.Mesh(new THREE.BoxGeometry(slabW + 0.05, 0.08, parapetThick + 0.08), copingMat);
  backCoping.position.set(0, parapetY + parapetH / 2 + 0.04, -slabD / 2 + parapetThick / 2);
  root.add(backCoping);

  // Left Parapet
  const leftP = new THREE.Mesh(new THREE.BoxGeometry(parapetThick, parapetH, slabD), parapetMat);
  leftP.position.set(-slabW / 2 + parapetThick / 2, parapetY, 0);
  root.add(leftP);
  const leftCoping = new THREE.Mesh(new THREE.BoxGeometry(parapetThick + 0.08, 0.08, slabD + 0.05), copingMat);
  leftCoping.position.set(-slabW / 2 + parapetThick / 2, parapetY + parapetH / 2 + 0.04, 0);
  root.add(leftCoping);

  // Right Parapet
  const rightP = new THREE.Mesh(new THREE.BoxGeometry(parapetThick, parapetH, slabD), parapetMat);
  rightP.position.set(slabW / 2 - parapetThick / 2, parapetY, 0);
  root.add(rightP);
  const rightCoping = new THREE.Mesh(new THREE.BoxGeometry(parapetThick + 0.08, 0.08, slabD + 0.05), copingMat);
  rightCoping.position.set(slabW / 2 - parapetThick / 2, parapetY + parapetH / 2 + 0.04, 0);
  root.add(rightCoping);

  // Front Parapet (with center architectural pediment/parapet banner)
  const frontPLeft = new THREE.Mesh(new THREE.BoxGeometry((slabW - 7.5) / 2, parapetH, parapetThick), parapetMat);
  frontPLeft.position.set(-(slabW / 4 + 1.8), parapetY, slabD / 2 - parapetThick / 2);
  root.add(frontPLeft);

  const frontPRight = new THREE.Mesh(new THREE.BoxGeometry((slabW - 7.5) / 2, parapetH, parapetThick), parapetMat);
  frontPRight.position.set(slabW / 4 + 1.8, parapetY, slabD / 2 - parapetThick / 2);
  root.add(frontPRight);

  // Center raised front pediment above store entrance
  const centerPediment = new THREE.Mesh(new THREE.BoxGeometry(7.6, parapetH + 0.6, parapetThick * 1.2), parapetMat);
  centerPediment.position.set(0, parapetY + 0.3, slabD / 2 - parapetThick / 2);
  root.add(centerPediment);

  const frontCoping = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.08, parapetThick * 1.2 + 0.08), copingMat);
  frontCoping.position.set(0, parapetY + 0.3 + (parapetH + 0.6) / 2 + 0.04, slabD / 2 - parapetThick / 2);
  root.add(frontCoping);

  // 4. Rooftop Grand Illuminated Billboard / Storefront Sign
  const billboardTex = createRooftopBillboardTexture();
  const billboard = new THREE.Mesh(
    new THREE.BoxGeometry(8.2, 2.0, 0.3),
    new THREE.MeshStandardMaterial({ map: billboardTex, roughness: 0.3 })
  );
  billboard.position.set(0, parapetY + 1.4, slabD / 2 - 0.1);
  root.add(billboard);

  // Billboard steel rear support trusses
  [-3.2, 0, 3.2].forEach((tx) => {
    const truss = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7 })
    );
    truss.position.set(tx, parapetY + 0.9, slabD / 2 - 0.7);
    truss.rotation.x = 0.45;
    root.add(truss);
  });

  // 5. Storefront Grand Modern Entrance Canopy / Awning
  // Extends from facade (z = halfD) out over the sidewalk by 2.6m
  const canopyW = 8.5;
  const canopyD = 2.6;
  const canopyH = 0.18;
  const canopyY = 3.65;
  const canopyZ = halfD + canopyD / 2;

  const canopyFrameMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, metalness: 0.4, roughness: 0.3 });
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(canopyW, canopyH, canopyD), canopyFrameMat);
  canopy.position.set(0, canopyY, canopyZ);
  canopy.castShadow = true;
  root.add(canopy);

  // Under-canopy warm LED recessed downlights
  [-2.6, -0.9, 0.9, 2.6].forEach((cx) => {
    const spotDisc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.04, 12),
      new THREE.MeshBasicMaterial({ color: 0xfef08a })
    );
    spotDisc.position.set(cx, canopyY - canopyH / 2 - 0.01, canopyZ);
    root.add(spotDisc);
  });

  // Support steel tension tie rods from front wall to canopy edge
  [-3.8, 3.8].forEach((rx) => {
    const rod = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 2.8, 8),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 })
    );
    rod.position.set(rx, canopyY + 0.95, canopyZ);
    rod.rotation.x = -0.75;
    root.add(rod);
  });

  // 6. Rooftop HVAC Commercial Air Conditioner Units (2 Units)
  const hvacFanRotors: THREE.Mesh[] = [];

  [-halfW + 4.5, halfW - 4.5].forEach((hx, idx) => {
    const hvacGroup = new THREE.Group();
    hvacGroup.position.set(hx, roofY + slabThickness, -halfD + 4.5 + idx * 3.5);

    // Main housing cabinet
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.4, 1.6),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5, metalness: 0.3 })
    );
    body.position.set(0, 0.7, 0);
    body.castShadow = true;
    hvacGroup.add(body);

    // Side ventilation louver grilles
    const louverMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const louver = new THREE.Mesh(new THREE.BoxGeometry(2.42, 0.8, 0.4), louverMat);
    louver.position.set(0, 0.7, 0);
    hvacGroup.add(louver);

    // 2 Top fan exhaust cowls
    [-0.6, 0.6].forEach((fx) => {
      const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 0.15, 16),
        new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 })
      );
      ring.position.set(fx, 1.45, 0);
      hvacGroup.add(ring);

      // Fan blade
      const rotor = new THREE.Mesh(
        new THREE.BoxGeometry(0.72, 0.02, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x0f172a })
      );
      rotor.position.set(fx, 1.48, 0);
      hvacGroup.add(rotor);
      hvacFanRotors.push(rotor);
    });

    // Insulated duct pipe going into roof
    const duct = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.8, 12),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.5 })
    );
    duct.position.set(0.9, 0.4, 0.9);
    hvacGroup.add(duct);

    root.add(hvacGroup);
  });

  // 7. Rooftop Spinning Vent Turbines
  const turbines: THREE.Group[] = [];
  [-3.0, 3.0].forEach((tx) => {
    const tGroup = new THREE.Group();
    tGroup.position.set(tx, roofY + slabThickness, -halfD + 8.5);

    // Base collar pipe
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.25, 0.5, 12),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.5 })
    );
    pipe.position.set(0, 0.25, 0);
    tGroup.add(pipe);

    // Spinning turbine dome head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 })
    );
    head.scale.set(1, 0.75, 1);
    head.position.set(0, 0.65, 0);
    tGroup.add(head);
    turbines.push(tGroup);

    root.add(tGroup);
  });

  // 8. Rooftop Stairwell / Service Access Penthouse
  const pentH = 2.3;
  const pentW = 3.2;
  const pentD = 2.4;
  const pentY = roofY + slabThickness + pentH / 2;
  const pentHouse = new THREE.Mesh(
    new THREE.BoxGeometry(pentW, pentH, pentD),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 })
  );
  pentHouse.position.set(-1.5, pentY, -halfD + 3.2);
  pentHouse.castShadow = true;
  root.add(pentHouse);

  // Service access metal door
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1.8, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.4 })
  );
  door.position.set(-1.5, pentY - 0.25, -halfD + 3.2 + pentD / 2 + 0.04);
  root.add(door);

  // 9. Solar Panel Arrays (Clean Green Energy for the Supermarket)
  const solarMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    roughness: 0.15,
    metalness: 0.6,
  });
  const solarFrameMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });

  [-halfW + 5.5, 0, halfW - 5.5].forEach((sx) => {
    const rack = new THREE.Group();
    rack.position.set(sx, roofY + slabThickness, 1.0);

    // Panel slab angled at 25 degrees
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.08, 2.0), solarMat);
    panel.rotation.x = -0.42;
    panel.position.set(0, 0.65, 0);
    rack.add(panel);

    // Silver metal frame border
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.86, 0.06, 2.06), solarFrameMat);
    frame.rotation.x = -0.42;
    frame.position.set(0, 0.64, 0);
    rack.add(frame);

    // Steel support legs
    [-1.2, 1.2].forEach((lx) => {
      const legFront = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6),
        solarFrameMat
      );
      legFront.position.set(lx, 0.2, 0.8);
      rack.add(legFront);

      const legBack = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 1.1, 6),
        solarFrameMat
      );
      legBack.position.set(lx, 0.55, -0.8);
      rack.add(legBack);
    });

    root.add(rack);
  });

  // 10. Rooftop Antenna Tower & Blinking Aircraft Safety Beacon
  const mast = new THREE.Group();
  mast.position.set(halfW - 2.5, roofY + slabThickness, -halfD + 2.5);

  const mastTower = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.18, 4.5, 6),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
  );
  mastTower.position.set(0, 2.25, 0);
  mast.add(mastTower);

  // Satellite dish
  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 0.3 })
  );
  dish.rotation.x = -0.8;
  dish.position.set(0, 2.8, 0.3);
  mast.add(dish);

  // Blinking Red Beacon on top of mast
  const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), beaconMat);
  beacon.position.set(0, 4.55, 0);
  mast.add(beacon);

  root.add(mast);

  return {
    root,
    update: (_delta: number, time: number) => {
      // Spin HVAC fans
      hvacFanRotors.forEach((rotor) => {
        rotor.rotation.y += 0.3;
      });
      // Spin rooftop turbines
      turbines.forEach((t) => {
        t.rotation.y += 0.04;
      });
      // Pulse red aviation warning beacon
      beaconMat.color.setHex(Math.sin(time * 5) > 0 ? 0xff2222 : 0x550000);
    },
  };
}
