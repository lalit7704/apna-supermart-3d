import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { useGame } from '../../context/GameContext';
import {
  createSupermartFloorTexture,
  createSupermartSignTexture,
  createStoreRoomSignTexture,
  createWelcomeMatTexture,
  createAisleSign,
  create3DGondolaShelf,
  create3DFreezeCooler,
  create3DDeepFreezer,
  create3DCheckoutCounter,
  create3DManagerDesk,
  createGlassSlidingDoorMesh,
  createDeliveryTruckMesh,
  createDeliveryBoxMesh,
  createTrashMesh,
  createPlayerMesh,
  createCustomerMesh,
  createStaffMesh,
  createSupermartRoof,
  SupermartRoofHandle,
} from './models3d';
import { sound } from '../../utils/audio';
import { PRODUCT_CATALOG } from '../../data/products';
import {
  createRoadTexture,
  createCrosswalkTexture,
  createSidewalkTexture,
  createHospitalMesh,
  createAmbulanceMesh,
  createSchoolMesh,
  createSchoolBusMesh,
  createHouseMesh,
  createStreetLightMesh,
  createCityTreeMesh,
  createCityBenchMesh,
  createCityCarMesh,
  createPedestrianMesh,
  CityPedestrian,
} from './cityModels';

interface Supermarket3DSceneProps {
  onOpenComputer: () => void;
  onOpenCheckout: (customerId?: string) => void;
  onOpenPriceManager: (productId?: string) => void;
  onOpenShelfOrganize?: (shelfId: string) => void;
  interactionPrompt: string | null;
  setInteractionPrompt: (prompt: string | null) => void;
  mobileJoystickDelta: { x: number; y: number };
  mobileIsRunning?: boolean;
  isInteractingTrigger: boolean;
  onInteractionHandled: () => void;
}

export const Supermarket3DScene: React.FC<Supermarket3DSceneProps> = ({
  onOpenComputer,
  onOpenCheckout,
  onOpenPriceManager,
  onOpenShelfOrganize,
  interactionPrompt,
  setInteractionPrompt,
  mobileJoystickDelta,
  mobileIsRunning = false,
  isInteractingTrigger,
  onInteractionHandled,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    cameraMode,
    carriedBox,
    shelfSlots,
    checkoutPosition,
    deliveryBoxes,
    trashItems,
    customers,
    employees,
    expansionLevel,
    isStoreOpen,
    pickupDeliveryBox,
    dropCarriedBox,
    restockShelfWithCarriedBox,
    cleanTrashItem,
    moveShelf,
    moveEmployee,
    moveCheckout,
  } = useGame();

  // Player physics state in 3D
  const playerState = useRef({
    x: 0,
    z: 2.0,
    vx: 0,
    vz: 0,
    rotationY: 0,
    pitch: 0,
    isMoving: false,
    speed: 4.5,
  });

  const keysPressed = useRef<Record<string, boolean>>({});
  const isPointerLocked = useRef<boolean>(false);
  const currentActionRef = useRef<(() => void) | null>(null);

  // Dynamic state refs for continuous 60fps render loop
  const mobileJoystickDeltaRef = useRef(mobileJoystickDelta);
  useEffect(() => {
    mobileJoystickDeltaRef.current = mobileJoystickDelta;
  }, [mobileJoystickDelta]);

  const mobileIsRunningRef = useRef(mobileIsRunning);
  useEffect(() => {
    mobileIsRunningRef.current = mobileIsRunning;
  }, [mobileIsRunning]);

  const carriedBoxRef = useRef(carriedBox);
  useEffect(() => {
    carriedBoxRef.current = carriedBox;
  }, [carriedBox]);

  const cameraModeRef = useRef(cameraMode);
  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  const shelfSlotsRef = useRef(shelfSlots);
  useEffect(() => {
    shelfSlotsRef.current = shelfSlots;
  }, [shelfSlots]);

  const deliveryBoxesRef = useRef(deliveryBoxes);
  useEffect(() => {
    deliveryBoxesRef.current = deliveryBoxes;
  }, [deliveryBoxes]);

  const trashItemsRef = useRef(trashItems);
  useEffect(() => {
    trashItemsRef.current = trashItems;
  }, [trashItems]);

  const customersRef = useRef(customers);
  useEffect(() => {
    customersRef.current = customers;
  }, [customers]);

  const pedestriansRef = useRef<CityPedestrian[]>([]);

  const onOpenComputerRef = useRef(onOpenComputer);
  onOpenComputerRef.current = onOpenComputer;

  const onOpenCheckoutRef = useRef(onOpenCheckout);
  onOpenCheckoutRef.current = onOpenCheckout;

  const onOpenShelfOrganizeRef = useRef(onOpenShelfOrganize);
  onOpenShelfOrganizeRef.current = onOpenShelfOrganize;

  const pickupDeliveryBoxRef = useRef(pickupDeliveryBox);
  pickupDeliveryBoxRef.current = pickupDeliveryBox;

  const restockShelfWithCarriedBoxRef = useRef(restockShelfWithCarriedBox);
  restockShelfWithCarriedBoxRef.current = restockShelfWithCarriedBox;

  const cleanTrashItemRef = useRef(cleanTrashItem);
  cleanTrashItemRef.current = cleanTrashItem;

  const employeesRef = useRef(employees);
  useEffect(() => {
    employeesRef.current = employees;
  }, [employees]);

  // Touch look rotation tracking for mobile gestures
  const touchLookRef = useRef<{ id: number | null; lastX: number; lastY: number }>({
    id: null,
    lastX: 0,
    lastY: 0,
  });

  // Reference to 3D instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const playerMeshHandleRef = useRef<ReturnType<typeof createPlayerMesh> | null>(null);
  const customerMeshesMap = useRef<Map<string, { root: THREE.Group; update: (c: any, delta: number, animTime?: number) => void }>>(new Map());
  const staffMeshesMap = useRef<Map<string, ReturnType<typeof createStaffMesh>>>(new Map());
  const slidingDoorRef = useRef<THREE.Group | null>(null);
  const shelvesGroupRef = useRef<THREE.Group | null>(null);
  const deliveryBoxesGroupRef = useRef<THREE.Group | null>(null);
  const trashGroupRef = useRef<THREE.Group | null>(null);
  const roofHandleRef = useRef<SupermartRoofHandle | null>(null);
  const checkoutRef = useRef<THREE.Group | null>(null);
  const [layoutEditorOpen, setLayoutEditorOpen] = useState(false);
  const [layoutSelection, setLayoutSelection] = useState('checkout');

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = true;

      // 'E' or Space for context interaction
      if (e.code === 'KeyE' || e.code === 'Space') {
        if (currentActionRef.current) {
          currentActionRef.current();
        }
      }

      // 'Q' to drop carried box
      if (e.code === 'KeyQ') {
        dropCarriedBox();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [dropCarriedBox]);

  // Handle Mobile Action Button Trigger
  useEffect(() => {
    if (isInteractingTrigger) {
      if (currentActionRef.current) {
        currentActionRef.current();
      }
      onInteractionHandled();
    }
  }, [isInteractingTrigger, onInteractionHandled]);

  // Three.js Scene Initialization (Mounted once)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xbae6fd); // Bright sunny day sky blue
    scene.fog = new THREE.Fog(0xdbeafe, 45, 140); // Natural atmospheric distance fog

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 200);
    cameraRef.current = camera;
    camera.position.set(0, 1.65, 2.0);

    // 2. Renderer with smooth shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    container.appendChild(renderer.domElement);

    // 3. Lighting (Realistic Supermarket Ambience & City Sunlight)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfffaed, 1.3);
    mainLight.position.set(20, 32, 20);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 100;
    mainLight.shadow.camera.left = -45;
    mainLight.shadow.camera.right = 45;
    mainLight.shadow.camera.top = 45;
    mainLight.shadow.camera.bottom = -45;
    mainLight.shadow.bias = -0.0005;
    scene.add(mainLight);

    // Ceiling fluorescent light rows
    [-4, 0, 4].forEach((lx) => {
      [-2, 2].forEach((lz) => {
        const ceilLight = new THREE.PointLight(0xffffff, 0.6, 9);
        ceilLight.position.set(lx, 3.7, lz);
        scene.add(ceilLight);

        const fixGeo = new THREE.BoxGeometry(2.0, 0.08, 0.3);
        const fixMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const fix = new THREE.Mesh(fixGeo, fixMat);
        fix.position.set(lx, 3.9, lz);
        scene.add(fix);
      });
    });

    // 4. Floor (Polished Supermarket Tiles)
    const floorWidth = 18 + expansionLevel * 4;
    const floorDepth = 16 + expansionLevel * 4;
    const floorTexture = createSupermartFloorTexture();
    const floorGeo = new THREE.PlaneGeometry(floorWidth, floorDepth);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.25,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    // Entrance mat inside front door
    const matTex = createWelcomeMatTexture();
    const matGeo = new THREE.PlaneGeometry(3.0, 1.6);
    const matMat = new THREE.MeshStandardMaterial({ map: matTex, roughness: 0.8 });
    const welcomeMat = new THREE.Mesh(matGeo, matMat);
    welcomeMat.rotation.x = -Math.PI / 2;
    welcomeMat.position.set(0, 0.015, 4.8);
    welcomeMat.receiveShadow = true;
    scene.add(welcomeMat);

    // 5. Walls & Exterior Glass Windows
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });

    const halfW = floorWidth / 2;
    const halfD = floorDepth / 2;
    const wallH = 4.0;

    // Back wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(floorWidth, wallH, 0.3), wallMat);
    backWall.position.set(0, wallH / 2, -halfD);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Left wall
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallH, floorDepth), wallMat);
    leftWall.position.set(-halfW, wallH / 2, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Right wall
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, wallH, floorDepth), wallMat);
    rightWall.position.set(halfW, wallH / 2, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // Front facade walls
    const frontWallLeft = new THREE.Mesh(new THREE.BoxGeometry((floorWidth - 4.5) / 2, wallH, 0.3), wallMat);
    frontWallLeft.position.set(-(floorWidth / 4 + 1.1), wallH / 2, halfD);
    scene.add(frontWallLeft);

    const frontWallRight = new THREE.Mesh(new THREE.BoxGeometry((floorWidth - 4.5) / 2, wallH, 0.3), wallMat);
    frontWallRight.position.set(floorWidth / 4 + 1.1, wallH / 2, halfD);
    scene.add(frontWallRight);

    // Back-of-house stock room for wholesale deliveries and extra inventory.
    const stockRoom = new THREE.Group();
    stockRoom.name = 'stock_room';
    const stockRoomWidth = 6.2;
    const stockRoomDepth = 4.2;
    const stockRoomCenterX = -5.2;
    const stockRoomCenterZ = -halfD + stockRoomDepth / 2 + 0.25;
    const stockRoomWallMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
    const stockRoomFloorMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });

    const stockFloor = new THREE.Mesh(
      new THREE.BoxGeometry(stockRoomWidth, 0.08, stockRoomDepth),
      stockRoomFloorMat
    );
    stockFloor.position.set(stockRoomCenterX, 0.04, stockRoomCenterZ);
    stockFloor.receiveShadow = true;
    stockRoom.add(stockFloor);

    const stockBackWall = new THREE.Mesh(
      new THREE.BoxGeometry(stockRoomWidth, wallH, 0.16),
      stockRoomWallMat
    );
    stockBackWall.position.set(stockRoomCenterX, wallH / 2, -halfD + 0.12);
    stockBackWall.castShadow = true;
    stockRoom.add(stockBackWall);

    [-stockRoomWidth / 2, stockRoomWidth / 2].forEach((offsetX) => {
      const sideWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, wallH, stockRoomDepth),
        stockRoomWallMat
      );
      sideWall.position.set(stockRoomCenterX + offsetX, wallH / 2, stockRoomCenterZ);
      sideWall.castShadow = true;
      stockRoom.add(sideWall);
    });

    const frontWallSegment = (x: number, width: number) => {
      const segment = new THREE.Mesh(
        new THREE.BoxGeometry(width, wallH, 0.16),
        stockRoomWallMat
      );
      segment.position.set(x, wallH / 2, -halfD + stockRoomDepth + 0.17);
      segment.castShadow = true;
      stockRoom.add(segment);
    };
    frontWallSegment(stockRoomCenterX - 2.25, 1.7);
    frontWallSegment(stockRoomCenterX + 2.25, 1.7);

    const stockDoorFrameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.55, roughness: 0.35 });
    [-0.85, 0.85].forEach((doorX) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.1, 0.2), stockDoorFrameMat);
      post.position.set(stockRoomCenterX + doorX, 1.55, -halfD + stockRoomDepth + 0.2);
      stockRoom.add(post);
    });
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.12, 0.2), stockDoorFrameMat);
    lintel.position.set(stockRoomCenterX, 3.1, -halfD + stockRoomDepth + 0.2);
    stockRoom.add(lintel);

    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.65, 0.08),
      new THREE.MeshStandardMaterial({ map: createStoreRoomSignTexture(), roughness: 0.45 })
    );
    sign.position.set(stockRoomCenterX, 3.55, -halfD + stockRoomDepth + 0.18);
    stockRoom.add(sign);

    [-6.9, -4.3, -3.5].forEach((shelfX, index) => {
      const rack = new THREE.Mesh(
        new THREE.BoxGeometry(index === 2 ? 0.55 : 1.8, 2.3, 0.7),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.45, roughness: 0.5, wireframe: true })
      );
      rack.position.set(shelfX, 1.15, stockRoomCenterZ - 0.65);
      stockRoom.add(rack);
    });

    const stockLight = new THREE.PointLight(0xfff1c2, 1.2, 8);
    stockLight.position.set(stockRoomCenterX, 3.5, stockRoomCenterZ);
    stockRoom.add(stockLight);
    scene.add(stockRoom);

    // 5.1 Supermarket Architectural Roof & Ceiling System
    const roofHandle = createSupermartRoof(floorWidth, floorDepth, wallH);
    roofHandleRef.current = roofHandle;
    scene.add(roofHandle.root);

    // Supermarket Sign above doors
    const signTex = createSupermartSignTexture();
    const signGeo = new THREE.BoxGeometry(7.0, 1.6, 0.2);
    const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.2 });
    const frontSign = new THREE.Mesh(signGeo, signMat);
    frontSign.position.set(0, 3.4, halfD + 0.15);
    scene.add(frontSign);

    // Automatic Glass Sliding Sensor Doors at entrance
    const slidingDoors = createGlassSlidingDoorMesh();
    slidingDoors.position.set(0, 0, halfD);
    scene.add(slidingDoors);
    slidingDoorRef.current = slidingDoors;

    // Hanging Aisle signs
    const aisle1Sign = createAisleSign(1, 'Groceries & Staples', '#059669');
    aisle1Sign.position.set(-4.5, 3.2, 0);
    scene.add(aisle1Sign);

    const aisle2Sign = createAisleSign(2, 'Snacks & Sweets', '#d97706');
    aisle2Sign.position.set(-1.5, 3.2, 0);
    scene.add(aisle2Sign);

    const aisle3Sign = createAisleSign(3, 'Drinks & Cleaners', '#0284c7');
    aisle3Sign.position.set(2.0, 3.2, 0);
    scene.add(aisle3Sign);

    // 6. Checkout Counter & Cash Register
    const checkout = create3DCheckoutCounter();
    checkout.position.set(checkoutPosition.x, 0, checkoutPosition.z);
    checkout.rotation.y = Math.PI;
    scene.add(checkout);
    checkoutRef.current = checkout;

    // 7. Manager Ordering Desk with PC
    const managerDesk = create3DManagerDesk();
    managerDesk.position.set(-5.5, 0, 3.5);
    managerDesk.rotation.y = Math.PI / 2;
    scene.add(managerDesk);

    // 8. Delivery Truck Parked in Loading Bay
    const deliveryTruck = createDeliveryTruckMesh();
    deliveryTruck.position.set(7.5, 0, halfD + 3.2);
    deliveryTruck.rotation.y = -Math.PI / 4;
    scene.add(deliveryTruck);

    // --- 8B. Outside City Environment (Road, School, Hospital, Houses, Trees, Cars, Pedestrians) ---
    const cityGroup = new THREE.Group();
    cityGroup.name = 'city_environment';

    // 1. Vast Lush Green Grass Terrain
    const grassGeo = new THREE.PlaneGeometry(160, 160);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.9 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(0, -0.02, halfD + 20);
    grass.receiveShadow = true;
    cityGroup.add(grass);

    // 2. Storefront Sidewalk / Pedestrian Plaza (width 90m, depth 5m)
    const swTex1 = createSidewalkTexture();
    const swGeo1 = new THREE.PlaneGeometry(90, 5.0);
    const swMat1 = new THREE.MeshStandardMaterial({ map: swTex1, roughness: 0.7 });
    const sidewalk1 = new THREE.Mesh(swGeo1, swMat1);
    sidewalk1.rotation.x = -Math.PI / 2;
    sidewalk1.position.set(0, 0.005, halfD + 2.5);
    sidewalk1.receiveShadow = true;
    cityGroup.add(sidewalk1);

    // 3. Two-Lane Asphalt City Road (width 110m, depth 8m)
    const roadTex = createRoadTexture();
    const roadGeo = new THREE.PlaneGeometry(110, 8.0);
    const roadMat = new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.8 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.01, halfD + 9.0);
    road.receiveShadow = true;
    cityGroup.add(road);

    // 4. White Zebra Pedestrian Crosswalk (connects sidewalk 1 to sidewalk 2)
    const crossTex = createCrosswalkTexture();
    const crossGeo = new THREE.PlaneGeometry(4.0, 8.0);
    const crossMat = new THREE.MeshStandardMaterial({ map: crossTex, roughness: 0.7 });
    const crosswalk = new THREE.Mesh(crossGeo, crossMat);
    crosswalk.rotation.x = -Math.PI / 2;
    crosswalk.position.set(0, 0.015, halfD + 9.0);
    crosswalk.receiveShadow = true;
    cityGroup.add(crosswalk);

    // 5. Opposite Sidewalk (width 90m, depth 4.5m)
    const swGeo2 = new THREE.PlaneGeometry(90, 4.5);
    const sidewalk2 = new THREE.Mesh(swGeo2, swMat1);
    sidewalk2.rotation.x = -Math.PI / 2;
    sidewalk2.position.set(0, 0.005, halfD + 15.25);
    sidewalk2.receiveShadow = true;
    cityGroup.add(sidewalk2);

    // 6. City Hospital Building (अस्पताल) & Parked Ambulance
    const hospital = createHospitalMesh();
    hospital.position.set(-18, 0, halfD + 25);
    cityGroup.add(hospital);

    const ambulance = createAmbulanceMesh();
    ambulance.position.set(-15, 0, halfD + 16.5);
    ambulance.rotation.y = Math.PI / 2;
    cityGroup.add(ambulance);

    // 7. City School Building (स्कूल) & Parked Yellow School Bus
    const school = createSchoolMesh();
    school.position.set(18, 0, halfD + 25);
    cityGroup.add(school);

    const schoolBus = createSchoolBusMesh();
    schoolBus.position.set(15, 0, halfD + 16.5);
    schoolBus.rotation.y = -Math.PI / 2;
    cityGroup.add(schoolBus);

    // 8. Residential Houses & Buildings (मकान)
    // Contemporary Modern Villa (Balcony, Solar panel, water tank, lawn)
    const villa = createHouseMesh('modern');
    villa.position.set(-34, 0, halfD + 23);
    cityGroup.add(villa);

    // Cozy Suburban Bungalow (Terracotta pitched roof, chimney, front porch, picket fence)
    const bungalow = createHouseMesh('bungalow');
    bungalow.position.set(34, 0, halfD + 23);
    cityGroup.add(bungalow);

    // 3-Story Duplex / Apartment Building in background center
    const duplex = createHouseMesh('duplex');
    duplex.position.set(0, 0, halfD + 28);
    cityGroup.add(duplex);

    // 9. Streetlights along Storefront & Opposite Sidewalks
    [-28, -16, -5, 5, 16, 28].forEach((lx) => {
      const lamp1 = createStreetLightMesh();
      lamp1.position.set(lx, 0, halfD + 4.8);
      lamp1.rotation.y = Math.PI;
      cityGroup.add(lamp1);

      const lamp2 = createStreetLightMesh();
      lamp2.position.set(lx, 0, halfD + 13.2);
      cityGroup.add(lamp2);
    });

    // 10. Shady City Trees with planters
    [-22, -11, 11, 22, -38, 38].forEach((tx) => {
      const tree1 = createCityTreeMesh();
      tree1.position.set(tx, 0, halfD + 4.2);
      cityGroup.add(tree1);

      const tree2 = createCityTreeMesh();
      tree2.position.set(tx, 0, halfD + 16.5);
      cityGroup.add(tree2);
    });

    // 11. Park Benches for Pedestrians
    [-3.5, 3.5].forEach((bx) => {
      const bench = createCityBenchMesh();
      bench.position.set(bx, 0, halfD + 3.2);
      cityGroup.add(bench);
    });

    // 12. City Cars along the Road
    const taxi = createCityCarMesh('#facc15', true);
    taxi.position.set(-8, 0, halfD + 7.2);
    taxi.rotation.y = Math.PI / 2;
    cityGroup.add(taxi);

    const car = createCityCarMesh('#dc2626', false);
    car.position.set(13, 0, halfD + 10.8);
    car.rotation.y = -Math.PI / 2;
    cityGroup.add(car);

    scene.add(cityGroup);

    // 13. Animated City Citizens / Pedestrians (शहर के लोग)
    const initialPedestrians: CityPedestrian[] = [
      {
        id: 'ped_1',
        name: 'Dr. Anita Sharma',
        role: 'doctor',
        meshHandle: createPedestrianMesh('doctor'),
        x: -16,
        z: halfD + 16.5,
        targetX: -11,
        targetZ: halfD + 16.5,
        speed: 1.0,
        thought: 'City Hospital Emergency is open 24/7! Stay healthy and eat fresh fruits.',
        waypointIndex: 0,
        waypoints: [
          { x: -16, z: halfD + 16.5 },
          { x: -11, z: halfD + 16.5 },
          { x: -14, z: halfD + 18.5 },
        ],
      },
      {
        id: 'ped_2',
        name: 'Student Aarav',
        role: 'student',
        meshHandle: createPedestrianMesh('student'),
        x: 18,
        z: halfD + 16.5,
        targetX: 13,
        targetZ: halfD + 16.5,
        speed: 1.1,
        thought: 'Public High School classes start at 8 AM. Got my books and backpack ready!',
        waypointIndex: 0,
        waypoints: [
          { x: 18, z: halfD + 16.5 },
          { x: 13, z: halfD + 16.5 },
          { x: 15, z: halfD + 18.5 },
        ],
      },
      {
        id: 'ped_3',
        name: 'Student Riya',
        role: 'student',
        meshHandle: createPedestrianMesh('student'),
        x: 0,
        z: halfD + 15,
        targetX: 0,
        targetZ: halfD + 3.5,
        speed: 1.15,
        thought: 'Crossing the zebra road to buy cold drinks and chocolate biscuits at SuperMart!',
        waypointIndex: 0,
        waypoints: [
          { x: 0, z: halfD + 15 },
          { x: 0, z: halfD + 3.5 },
          { x: 2, z: halfD + 3.5 },
          { x: 2, z: halfD + 15 },
        ],
      },
      {
        id: 'ped_4',
        name: 'Uncle Ramesh',
        role: 'citizen',
        meshHandle: createPedestrianMesh('citizen'),
        x: -12,
        z: halfD + 3.5,
        targetX: -2,
        targetZ: halfD + 3.5,
        speed: 0.85,
        thought: 'Morning walk along the storefront is so pleasant. The new SuperMart is great.',
        waypointIndex: 0,
        waypoints: [
          { x: -14, z: halfD + 3.5 },
          { x: -2, z: halfD + 3.5 },
        ],
      },
      {
        id: 'ped_5',
        name: 'Sunita (Homeowner)',
        role: 'citizen',
        meshHandle: createPedestrianMesh('citizen'),
        x: -28,
        z: halfD + 16,
        targetX: -19,
        targetZ: halfD + 16,
        speed: 0.95,
        thought: 'Our neighborhood is wonderful with the school, hospital, and SuperMart all nearby.',
        waypointIndex: 0,
        waypoints: [
          { x: -28, z: halfD + 16 },
          { x: -19, z: halfD + 16 },
        ],
      },
      {
        id: 'ped_6',
        name: 'Officer Kabir',
        role: 'shopper',
        meshHandle: createPedestrianMesh('shopper'),
        x: 6,
        z: halfD + 3.5,
        targetX: 20,
        targetZ: halfD + 3.5,
        speed: 1.0,
        thought: 'All quiet in the city! Road traffic is safe and zebra crossings are clear.',
        waypointIndex: 0,
        waypoints: [
          { x: 5, z: halfD + 3.5 },
          { x: 22, z: halfD + 3.5 },
        ],
      },
    ];

    initialPedestrians.forEach((p) => {
      p.meshHandle.root.position.set(p.x, 0, p.z);
      scene.add(p.meshHandle.root);
    });
    pedestriansRef.current = initialPedestrians;

    // 9. Player Character Mesh
    const playerHandle = createPlayerMesh();
    playerMeshHandleRef.current = playerHandle;
    scene.add(playerHandle.root);

    // Groups for dynamic objects
    const shelvesGroup = new THREE.Group();
    shelvesGroupRef.current = shelvesGroup;
    scene.add(shelvesGroup);

    const deliveryBoxesGroup = new THREE.Group();
    deliveryBoxesGroupRef.current = deliveryBoxesGroup;
    scene.add(deliveryBoxesGroup);

    const trashGroup = new THREE.Group();
    trashGroupRef.current = trashGroup;
    scene.add(trashGroup);

    // --- Mouse & Pointer Lock Controls ---
    const handleMouseDown = () => {
      if (document.pointerLockElement !== container) {
        container.requestPointerLock?.();
      }
    };

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === container;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return;
      const sensitivity = 0.0024;
      playerState.current.rotationY += e.movementX * sensitivity;
      playerState.current.pitch -= e.movementY * sensitivity;
      playerState.current.pitch = Math.max(-1.1, Math.min(1.1, playerState.current.pitch));
    };

    container.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);

    // --- Mobile Touch Look (Swipe to rotate camera) ---
    const handleTouchStart = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        // Only consider touches that start away from the bottom-left joystick zone
        // e.g. Right 70% of screen or top half of screen
        const isLeftJoystickZone = t.clientX < window.innerWidth * 0.38 && t.clientY > window.innerHeight * 0.55;
        if (!isLeftJoystickZone && touchLookRef.current.id === null) {
          touchLookRef.current = {
            id: t.identifier,
            lastX: t.clientX,
            lastY: t.clientY,
          };
          break;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchLookRef.current.id === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchLookRef.current.id) {
          const dx = t.clientX - touchLookRef.current.lastX;
          const dy = t.clientY - touchLookRef.current.lastY;
          touchLookRef.current.lastX = t.clientX;
          touchLookRef.current.lastY = t.clientY;

          const touchSensitivity = 0.0045;
          playerState.current.rotationY += dx * touchSensitivity;
          playerState.current.pitch -= dy * touchSensitivity;
          playerState.current.pitch = Math.max(-1.1, Math.min(1.1, playerState.current.pitch));
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === touchLookRef.current.id) {
          touchLookRef.current = { id: null, lastX: 0, lastY: 0 };
          break;
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // --- Animation & Physics Game Loop ---
    let animId: number;
    let clock = new THREE.Clock();
    let stepSoundTimer = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Check Mobile Joystick or Keyboard movement
      const joy = mobileJoystickDeltaRef.current;
      const hasJoy = Math.abs(joy.x) > 0.04 || Math.abs(joy.y) > 0.04;
      const isRunning = mobileIsRunningRef.current || keysPressed.current['ShiftLeft'] || keysPressed.current['ShiftRight'];
      const currentSpeed = (isRunning ? 6.5 : 4.2) * delta;

      let inputForward = 0; // +1 = forward, -1 = backward
      let inputRight = 0;   // +1 = right, -1 = left

      if (hasJoy) {
        // Dragging joystick UP (negative joy.y) moves forward (+1)
        // Dragging joystick DOWN (positive joy.y) moves backward (-1)
        // Dragging joystick RIGHT (positive joy.x) moves right (+1)
        // Dragging joystick LEFT (negative joy.x) moves left (-1)
        inputForward = -joy.y;
        inputRight = joy.x;
      } else {
        // ArrowUp / W = Move Forward
        if (keysPressed.current['KeyW'] || keysPressed.current['ArrowUp']) inputForward += 1;
        // ArrowDown / S = Move Backward
        if (keysPressed.current['KeyS'] || keysPressed.current['ArrowDown']) inputForward -= 1;
        // ArrowLeft / A = Move Left
        if (keysPressed.current['KeyA'] || keysPressed.current['ArrowLeft']) inputRight -= 1;
        // ArrowRight / D = Move Right
        if (keysPressed.current['KeyD'] || keysPressed.current['ArrowRight']) inputRight += 1;
      }

      if (inputForward !== 0 || inputRight !== 0) {
        playerState.current.isMoving = true;
        const length = Math.hypot(inputForward, inputRight);
        if (!hasJoy && length > 0) {
          inputForward /= length;
          inputRight /= length;
        }

        const sinRot = Math.sin(playerState.current.rotationY);
        const cosRot = Math.cos(playerState.current.rotationY);

        // Screen Forward vector in world coordinates: (sinRot, cosRot)
        // Screen Right vector in world coordinates: (-cosRot, sinRot)
        playerState.current.x += (inputForward * sinRot - inputRight * cosRot) * currentSpeed;
        playerState.current.z += (inputForward * cosRot + inputRight * sinRot) * currentSpeed;

        // Footstep audio
        stepSoundTimer += delta;
        if (stepSoundTimer > (isRunning ? 0.28 : 0.42)) {
          sound.playFootstep();
          stepSoundTimer = 0;
        }
      } else {
        playerState.current.isMoving = false;
      }

      // Automatic Sliding Door opening animation when player OR customer is near entrance
      if (slidingDoorRef.current) {
        const playerNearDoor = Math.hypot(playerState.current.x - 0, playerState.current.z - halfD) < 4.2;
        const customerNearDoor = customersRef.current.some(
          (c) => Math.hypot(c.x - 0, c.z - halfD) < 4.0
        );
        const shouldOpen = playerNearDoor || customerNearDoor;
        const doorL = slidingDoorRef.current.getObjectByName('door_left');
        const doorR = slidingDoorRef.current.getObjectByName('door_right');
        if (doorL && doorR) {
          const targetOffset = shouldOpen ? 1.35 : 0;
          doorL.position.x = THREE.MathUtils.lerp(doorL.position.x, -0.65 - targetOffset, delta * 6);
          doorR.position.x = THREE.MathUtils.lerp(doorR.position.x, 0.65 + targetOffset, delta * 6);
        }
      }

      // Constrain player movement (Supermarket interior + Outside City street/sidewalks)
      let pxNext = playerState.current.x;
      let pzNext = playerState.current.z;

      if (pzNext < halfD - 0.2) {
        // Inside supermarket
        pxNext = Math.max(-halfW + 0.8, Math.min(halfW - 0.8, pxNext));
        pzNext = Math.max(-halfD + 0.8, pzNext);
      } else if (pzNext >= halfD - 0.2 && pzNext <= halfD + 0.8) {
        // Doorway threshold - allow crossing through entrance aperture (-2.2 <= x <= 2.2)
        if (Math.abs(pxNext) > 2.2) {
          if (playerState.current.z < halfD) {
            pzNext = halfD - 0.25;
          } else {
            pzNext = halfD + 0.85;
          }
        }
      } else {
        // Outside in the city
        // Street, sidewalks & residential perimeter boundaries
        pxNext = Math.max(-42.0, Math.min(42.0, pxNext));
        pzNext = Math.min(halfD + 32.0, pzNext);

        // Solid building footprints collision avoidance
        // Hospital: x in [-26, -10], z in [halfD + 18, halfD + 30]
        if (pxNext > -26 && pxNext < -10 && pzNext > halfD + 18 && pzNext < halfD + 30) {
          pzNext = halfD + 18;
        }
        // School: x in [10, 26], z in [halfD + 18, halfD + 30]
        if (pxNext > 10 && pxNext < 26 && pzNext > halfD + 18 && pzNext < halfD + 30) {
          pzNext = halfD + 18;
        }
        // Villa: x in [-40, -28], z in [halfD + 18, halfD + 28]
        if (pxNext > -40 && pxNext < -28 && pzNext > halfD + 18 && pzNext < halfD + 28) {
          pzNext = halfD + 18;
        }
        // Bungalow: x in [28, 40], z in [halfD + 18, halfD + 28]
        if (pxNext > 28 && pxNext < 40 && pzNext > halfD + 18 && pzNext < halfD + 28) {
          pzNext = halfD + 18;
        }
        // Duplex / Apartments: x in [-5, 5], z in [halfD + 22, halfD + 32]
        if (pxNext > -5 && pxNext < 5 && pzNext > halfD + 22 && pzNext < halfD + 32) {
          pzNext = halfD + 22;
        }
      }

      playerState.current.x = pxNext;
      playerState.current.z = pzNext;

      // Update Player Mesh Pose & Walking
      const currentCarried = carriedBoxRef.current;
      const currentCamMode = cameraModeRef.current;

      if (playerHandle) {
        playerHandle.root.position.set(playerState.current.x, 0, playerState.current.z);
        playerHandle.root.rotation.y = playerState.current.rotationY;
        playerHandle.setWalking(playerState.current.isMoving, time, !!currentCarried);
        playerHandle.setCarryingBox(!!currentCarried, currentCarried?.color);

        playerHandle.root.visible = currentCamMode !== 'first_person';
      }

      // Camera Position & Orbit
      if (currentCamMode === 'first_person') {
        camera.position.set(playerState.current.x, 1.68, playerState.current.z);
        camera.rotation.order = 'YXZ';
        // In Three.js default camera looks along -Z. Character forward is +Z when rotationY = 0.
        // Adding Math.PI aligns first person camera forward with player facing direction.
        camera.rotation.y = playerState.current.rotationY + Math.PI;
        camera.rotation.x = playerState.current.pitch;
      } else {
        // Third person follow camera
        const camDistance = 3.2;
        const camHeight = 2.2;
        const sinRot = Math.sin(playerState.current.rotationY);
        const cosRot = Math.cos(playerState.current.rotationY);

        camera.position.x = playerState.current.x - sinRot * camDistance;
        camera.position.z = playerState.current.z - cosRot * camDistance;
        camera.position.y = camHeight;
        camera.lookAt(playerState.current.x, 1.3, playerState.current.z);
      }

      // Detect Contextual Interactions via Proximity
      let prompt: string | null = null;
      let action: (() => void) | null = null;

      const px = playerState.current.x;
      const pz = playerState.current.z;

      // 1. Proximity to Store Manager PC Desk
      const distToDesk = Math.hypot(px - (-5.5), pz - 3.5);
      if (distToDesk < 2.0) {
        prompt = `[E] Open Manager PC (Wholesale Orders)`;
        action = () => onOpenComputerRef.current();
      }

      // 2. Proximity to Checkout Counter Register
      const distToCheckout = Math.hypot(px - checkoutPosition.x, pz - checkoutPosition.z);
      if (!prompt && distToCheckout < 2.3) {
        const waitingCustomer = customersRef.current.find((c) => c.state === 'waiting_for_scan');
        if (waitingCustomer) {
          prompt = `[E] Checkout Customer (${waitingCustomer.name})`;
          action = () => onOpenCheckoutRef.current(waitingCustomer.id);
        } else {
          prompt = `[E] Operate Cash Register`;
          action = () => onOpenCheckoutRef.current();
        }
      }

      // 3. Proximity to Delivery Boxes (Storage room / outside entrance)
      if (!prompt && !currentCarried) {
        for (const box of deliveryBoxesRef.current) {
          const dist = Math.hypot(px - box.x, pz - box.z);
          if (dist < 1.8) {
            const pDef = PRODUCT_CATALOG.find((p) => p.id === box.productId);
            const pName = pDef?.name || box.productId;
            prompt = `[E] Pick Up Box: ${pName} (${box.quantity} units)`;
            action = () => pickupDeliveryBoxRef.current(box.id);
            break;
          }
        }
      }

      // 4. Proximity to Shelves (Restocking with Carried Box OR Organizing Shelf)
      if (!prompt) {
        for (const slot of shelfSlotsRef.current) {
          const dist = Math.hypot(px - slot.x, pz - slot.z);
          if (dist < 2.2) {
            if (currentCarried) {
              const isMatch = !slot.productId || slot.productId === currentCarried.productId || slot.currentStock === 0;
              if (isMatch && slot.currentStock < slot.capacity) {
                const space = slot.capacity - slot.currentStock;
                const fillAmt = Math.min(space, currentCarried.quantity);
                prompt = `[E] Restock ${slot.shelfName || 'Shelf'} with ${currentCarried.productName} (+${fillAmt})`;
                action = () => restockShelfWithCarriedBoxRef.current(slot.id);
                break;
              } else if (!isMatch) {
                prompt = `Shelf assigned to different product`;
              } else {
                prompt = `Shelf is full (${slot.currentStock}/${slot.capacity})`;
              }
            } else {
              const pDef = PRODUCT_CATALOG.find((p) => p.id === slot.productId);
              const pName = pDef ? `${pDef.name} (${slot.currentStock}/${slot.capacity})` : 'Empty (Tap to Assign)';
              prompt = `[E] Organize Shelf: ${pName}`;
              action = () => {
                if (onOpenShelfOrganizeRef.current) {
                  onOpenShelfOrganizeRef.current(slot.id);
                }
              };
              break;
            }
          }
        }
      }

      // 5. Proximity to Trash / Spill (Clean floor)
      if (!prompt) {
        for (const trash of trashItemsRef.current) {
          const dist = Math.hypot(px - trash.x, pz - trash.z);
          if (dist < 1.6) {
            prompt = `[E] Sweep & Clean Spill`;
            action = () => cleanTrashItemRef.current(trash.id);
            break;
          }
        }
      }

      // 5B. Proximity to Supermarket Shoppers & Customers (दुकान के ग्राहक)
      if (!prompt) {
        for (const cust of customersRef.current) {
          const dist = Math.hypot(px - cust.x, pz - cust.z);
          if (dist < 2.0) {
            prompt = `${cust.name}: "${cust.thought}"`;
            break;
          }
        }
      }

      // 6. Proximity to City Citizens & Pedestrians (शहर के लोग)
      if (!prompt) {
        for (const ped of pedestriansRef.current) {
          const dist = Math.hypot(px - ped.x, pz - ped.z);
          if (dist < 2.5) {
            prompt = `${ped.name}: "${ped.thought}"`;
            break;
          }
        }
      }

      // 7. Proximity to City Landmarks & Vehicles (Hospital, School, Houses, Road)
      if (!prompt) {
        const distHospital = Math.hypot(px - (-18), pz - (halfD + 20));
        const distSchool = Math.hypot(px - 18, pz - (halfD + 20));
        const distBus = Math.hypot(px - 15, pz - (halfD + 16.5));
        const distAmbulance = Math.hypot(px - (-15), pz - (halfD + 16.5));
        const distVilla = Math.hypot(px - (-34), pz - (halfD + 20));
        const distBungalow = Math.hypot(px - 34, pz - (halfD + 20));

        if (distHospital < 4.8) {
          prompt = `City Hospital - 24/7 Emergency & Medical Care`;
        } else if (distAmbulance < 2.5) {
          prompt = `Emergency Ambulance 108 - Rapid Response`;
        } else if (distSchool < 4.8) {
          prompt = `City Public High School - Primary & Secondary Education`;
        } else if (distBus < 2.5) {
          prompt = `School Bus - Student Transport Service`;
        } else if (distVilla < 4.5) {
          prompt = `Green Villa Residence - Private Modern House`;
        } else if (distBungalow < 4.5) {
          prompt = `Sunny Bungalow Residence - Picket Fence & Garden`;
        } else if (Math.abs(pz - (halfD + 9.0)) < 2.2 && Math.abs(px) < 2.0) {
          prompt = `Pedestrian Zebra Crossing - Safe Street Crossing`;
        }
      }

      currentActionRef.current = action;
      setInteractionPrompt(prompt);

      // --- Continuously Update City Pedestrian Movement & Walk Animations ---
      pedestriansRef.current.forEach((ped) => {
        if (!ped.waypoints || ped.waypoints.length === 0) return;
        const wp = ped.waypoints[ped.waypointIndex];
        const dx = wp.x - ped.x;
        const dz = wp.z - ped.z;
        const dist = Math.hypot(dx, dz);

        if (dist < 0.35) {
          ped.waypointIndex = (ped.waypointIndex + 1) % ped.waypoints.length;
        } else {
          const moveStep = Math.min(dist, ped.speed * delta);
          ped.x += (dx / dist) * moveStep;
          ped.z += (dz / dist) * moveStep;
          const facingAngle = Math.atan2(dx, dz);
          ped.meshHandle.root.position.set(ped.x, 0, ped.z);
          ped.meshHandle.root.rotation.y = facingAngle;
          ped.meshHandle.update(delta, time * 1.5);
        }
      });

      // --- Continuously Update Customer 3D Mesh Positions & Walk Animations at 60 FPS ---
      const frameDelta = Math.min(delta, 0.05);
      customersRef.current.forEach((c) => {
        const handle = customerMeshesMap.current.get(c.id);
        if (handle) {
          handle.update(c, frameDelta, time);
        }
      });

      // --- Continuously Update Cashier Staff Animation at 60 FPS ---
      const cashierEmp = employeesRef.current.find((e) => e.role === 'cashier' && e.hired);
      if (cashierEmp) {
        const staffHandle = staffMeshesMap.current.get(cashierEmp.id);
        if (staffHandle) {
          const hasWaiting = customersRef.current.some((c) => c.state === 'waiting_for_scan');
          staffHandle.setOperating(hasWaiting, performance.now() * 0.005);
        }
      }

      // Update Rooftop Equipment (HVAC fans, turbines, beacon light)
      roofHandleRef.current?.update(delta, time);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);

      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchEnd);

      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [expansionLevel, setInteractionPrompt]);

  useEffect(() => {
    checkoutRef.current?.position.set(checkoutPosition.x, 0, checkoutPosition.z);
  }, [checkoutPosition]);

  // Synchronize 3D Shelves with dynamic GameContext state
  useEffect(() => {
    const group = shelvesGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    shelfSlots.forEach((slot) => {
      let shelfMesh: THREE.Group;
      if (slot.modelType === 'cooler') {
        shelfMesh = create3DFreezeCooler(slot.currentStock, slot.capacity);
      } else if (slot.modelType === 'freezer') {
        shelfMesh = create3DDeepFreezer();
      } else {
        shelfMesh = create3DGondolaShelf(slot.category, slot.capacity, slot.currentStock, slot.productId);
      }

      shelfMesh.position.set(slot.x, 0, slot.z);
      shelfMesh.rotation.y = slot.rotationY;
      group.add(shelfMesh);
    });
  }, [shelfSlots]);

  // Synchronize Delivery Boxes in Storage Bay
  useEffect(() => {
    const group = deliveryBoxesGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    deliveryBoxes.forEach((box) => {
      const pDef = PRODUCT_CATALOG.find((p) => p.id === box.productId);
      const boxMesh = createDeliveryBoxMesh(pDef?.color || '#d97706');
      boxMesh.position.set(box.x, 0, box.z);
      group.add(boxMesh);
    });
  }, [deliveryBoxes]);

  // Synchronize Floor Trash & Spills
  useEffect(() => {
    const group = trashGroupRef.current;
    if (!group) return;

    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    trashItems.forEach((t) => {
      const trashMesh = createTrashMesh(t.type);
      trashMesh.position.set(t.x, 0, t.z);
      group.add(trashMesh);
    });
  }, [trashItems]);

  // Synchronize Customer 3D Meshes and Walking Animations
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const currentCustIds = new Set(customers.map((c) => c.id));
    for (const [id, handle] of customerMeshesMap.current.entries()) {
      if (!currentCustIds.has(id)) {
        scene.remove(handle.root);
        customerMeshesMap.current.delete(id);
      }
    }

    customers.forEach((cust, idx) => {
      let handle = customerMeshesMap.current.get(cust.id);
      if (!handle) {
        const meshHandle = createCustomerMesh(cust.color, idx);
        scene.add(meshHandle.root);

        handle = {
          root: meshHandle.root,
          update: (c: any, delta: number, animTime?: number) => {
            const dx = c.targetX - c.x;
            const dz = c.targetZ - c.z;
            const dist = Math.hypot(dx, dz);

            if (dist > 0.12) {
              const step = Math.min(dist, c.speed * delta);
              c.x += (dx / dist) * step;
              c.z += (dz / dist) * step;
              c.rotationY = Math.atan2(dx, dz);
              const walkClock = animTime !== undefined ? animTime * 3.0 : Date.now() * 0.005;
              meshHandle.setWalking(true, walkClock);
            } else {
              meshHandle.setWalking(false, 0);
            }

            meshHandle.root.position.set(c.x, 0, c.z);
            meshHandle.root.rotation.y = c.rotationY;
            meshHandle.setItemsCount(c.shoppingList.filter((it: any) => it.picked).length);
          },
        };
        customerMeshesMap.current.set(cust.id, handle);
      }

      handle.update(cust, 0.03);
    });
  }, [customers]);

  // Synchronize Hired Staff 3D Meshes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    employees.forEach((emp) => {
      let handle = staffMeshesMap.current.get(emp.id);
      if (emp.hired) {
        if (!handle) {
          const uniformColor = emp.role === 'cashier' ? '#0284c7' : emp.role === 'stocker' ? '#ea580c' : '#16a34a';
          const meshHandle = createStaffMesh(emp.role, uniformColor);

          if (emp.role === 'cashier') {
            meshHandle.root.position.set(emp.x ?? checkoutPosition.x - 0.7, 0, emp.z ?? checkoutPosition.z);
            meshHandle.root.rotation.y = 0;
          } else if (emp.role === 'stocker') {
            meshHandle.root.position.set(emp.x ?? -4.5, 0, emp.z ?? -3.8);
            meshHandle.root.rotation.y = 0;
          } else if (emp.role === 'cleaner') {
            meshHandle.root.position.set(emp.x ?? 2.0, 0, emp.z ?? 0.0);
            meshHandle.root.rotation.y = 0;
          }

          scene.add(meshHandle.root);
          staffMeshesMap.current.set(emp.id, meshHandle);
        } else {
          const defaults = emp.role === 'cashier' ? { x: checkoutPosition.x - 0.7, z: checkoutPosition.z } : emp.role === 'stocker' ? { x: -4.5, z: -3.8 } : { x: 2, z: 0 };
          handle.root.position.set(emp.x ?? defaults.x, 0, emp.z ?? defaults.z);
        }
      } else {
        if (handle) {
          scene.remove(handle.root);
          staffMeshesMap.current.delete(emp.id);
        }
      }
    });
  }, [employees, checkoutPosition]);

  const nudgeSelection = (dx: number, dz: number) => {
    if (layoutSelection === 'checkout') moveCheckout(dx, dz);
    else if (layoutSelection.startsWith('shelf:')) moveShelf(layoutSelection.slice(6), dx, dz);
    else if (layoutSelection.startsWith('staff:')) moveEmployee(layoutSelection.slice(6), dx, dz);
  };

  return (
    <div ref={containerRef} id="supermarket-canvas-container" className="relative w-full h-full cursor-crosshair overflow-hidden select-none touch-none">
      <button onClick={() => setLayoutEditorOpen((open) => !open)} className="absolute right-3 top-16 z-30 rounded-xl border border-slate-600 bg-slate-900/90 px-3 py-2 text-xs font-bold text-white shadow-lg touch-auto">
        {layoutEditorOpen ? 'Close Layout' : 'Edit Layout'}
      </button>
      {layoutEditorOpen && (
        <div onMouseDown={(event) => event.stopPropagation()} className="absolute right-3 top-28 z-30 w-56 rounded-2xl border border-slate-600 bg-slate-950/95 p-3 text-white shadow-2xl touch-auto">
          <p className="mb-2 text-xs font-black uppercase tracking-wide text-amber-300">Move store items</p>
          <select value={layoutSelection} onChange={(event) => setLayoutSelection(event.target.value)} className="mb-3 w-full rounded-lg border border-slate-600 bg-slate-800 p-2 text-xs text-white">
            <option value="checkout">Cash counter</option>
            {shelfSlots.map((shelf) => <option key={shelf.id} value={`shelf:${shelf.id}`}>{shelf.shelfName || shelf.id}</option>)}
            {employees.filter((employee) => employee.hired).map((employee) => <option key={employee.id} value={`staff:${employee.id}`}>{employee.name}</option>)}
          </select>
          <div className="grid grid-cols-3 gap-1 text-center">
            <span />
            <button onClick={() => nudgeSelection(0, -0.5)} className="rounded bg-slate-700 p-2">▲</button>
            <span />
            <button onClick={() => nudgeSelection(-0.5, 0)} className="rounded bg-slate-700 p-2">◀</button>
            <button onClick={() => nudgeSelection(0, 0.5)} className="rounded bg-slate-700 p-2">▼</button>
            <button onClick={() => nudgeSelection(0.5, 0)} className="rounded bg-slate-700 p-2">▶</button>
          </div>
          <p className="mt-2 text-[10px] leading-snug text-slate-300">Choose a shelf, counter, or hired staff member, then use arrows. Positions save with your game.</p>
        </div>
      )}
    </div>
  );
};
