import { OrbitControls } from './OrbitControls.js'

// Load court texture
const courtTexture = new THREE.TextureLoader().load('./src/textures/court_texture.jpg');

// Basic Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
scene.background = new THREE.Color(0x000000);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 15);
scene.add(directionalLight);

// Shadows
renderer.shadowMap.enabled = true;
directionalLight.castShadow = true;

// Degrees to radians helper
function degrees_to_radians(degrees) {
  var pi = Math.PI; const courtTexture = new THREE.TextureLoader().load('./src/textures/court_texture.jpg');
  return degrees * (pi / 180);
}

// Court floor with wood texture
function createCourtFloor() {
  const courtGeometry = new THREE.BoxGeometry(30, 0.2, 15);
  const courtMaterial = new THREE.MeshPhongMaterial({
    map: courtTexture,
  });
  const court = new THREE.Mesh(courtGeometry, courtMaterial);
  court.receiveShadow = true;
  scene.add(court);
}

// White center line
function createCenterLine() {
  const lineWidth = 0.1;
  const lineHeight = 15;

  const centerLineGeometry = new THREE.PlaneGeometry(lineWidth, lineHeight);
  const centerLineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const centerLine = new THREE.Mesh(centerLineGeometry, centerLineMaterial);

  centerLine.rotation.x = -Math.PI / 2;
  centerLine.position.set(0, 0.11, 0);
  scene.add(centerLine);
}

// White center circle
function createCenterCircle() {
  const circleGeometry = new THREE.RingGeometry(1.3, 1.5, 64);
  const circleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const centerCircle = new THREE.Mesh(circleGeometry, circleMaterial);

  centerCircle.rotation.x = -Math.PI / 2;
  centerCircle.position.set(0, 0.11, 0);
  scene.add(centerCircle);
}

// Adds three-point arc and side lines
function addThreePointArcWithLines(xCenter, isLeftSide = true) {
  const radius = 6;
  const segments = 64;
  const mat = new THREE.LineBasicMaterial({ color: 0xffffff });
  const y = 0.11;

  const dir = isLeftSide ? 1 : -1;
  const thetaStart = -Math.PI / 2;
  const thetaEnd = Math.PI / 2;

  // Arc points
  const arcPts = [];
  for (let i = 0; i <= segments; i++) {
    const t = thetaStart + (i / segments) * (thetaEnd - thetaStart);
    const x = xCenter + dir * radius * Math.cos(t);
    const z = radius * Math.sin(t);
    arcPts.push(new THREE.Vector3(x, y, z));
  }
  scene.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(arcPts), mat));

  const xEdge = isLeftSide ? -15 : 15;
  const topZ = radius;
  const bottomZ = -radius;

  const topLine = [
    new THREE.Vector3(xCenter, y, topZ),
    new THREE.Vector3(xEdge, y, topZ)
  ];
  const bottomLine = [
    new THREE.Vector3(xCenter, y, bottomZ),
    new THREE.Vector3(xEdge, y, bottomZ)
  ];

  [topLine, bottomLine].forEach(pair => {
    scene.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pair), mat));
  });
}

// Outer white court rectangle
function addCourtBoundary() {
  const halfLen = 30 / 2;
  const halfWid = 15 / 2;
  const y = 0.12;

  const points = [
    new THREE.Vector3(-halfLen, y, -halfWid),
    new THREE.Vector3(-halfLen, y, halfWid),
    new THREE.Vector3(halfLen, y, halfWid),
    new THREE.Vector3(halfLen, y, -halfWid),
    new THREE.Vector3(-halfLen, y, -halfWid)
  ];

  const geom = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.LineLoop(geom, new THREE.LineBasicMaterial({ color: 0xffffff }));
  scene.add(line);
}

// Builds complete court with lines
function createBasketballCourt() {
  createCourtFloor();
  createCenterLine();
  createCenterCircle();
  addThreePointArcWithLines(-12, true);
  addThreePointArcWithLines(12, false);
  addCourtBoundary();
}

// Builds one basketball hoop
function createBasketballHoop(xPosition, direction) {
  const hoopGroup = new THREE.Group();

  // Base, pole, arm, backboard
  const baseGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.1, 32);
  const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
  const base = new THREE.Mesh(baseGeometry, baseMaterial);
  base.position.set(xPosition, 0.15, 0);
  base.castShadow = base.receiveShadow = true;
  hoopGroup.add(base);

  const poleGeometry = new THREE.CylinderGeometry(0.3, 0.3, 12);
  const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
  const pole = new THREE.Mesh(poleGeometry, poleMaterial);
  pole.position.set(xPosition, 6, 0);
  pole.castShadow = true;
  hoopGroup.add(pole);

  const armGeometry = new THREE.BoxGeometry(3, 0.3, 0.3);
  const armMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
  const arm = new THREE.Mesh(armGeometry, armMaterial);
  arm.position.set(xPosition - (direction * 1.5), 10, 0);
  arm.castShadow = true;
  hoopGroup.add(arm);

  const backboardGeometry = new THREE.BoxGeometry(0.2, 3.5, 2.5);
  const backboardMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  });
  const backboard = new THREE.Mesh(backboardGeometry, backboardMaterial);
  backboard.position.set(xPosition - (direction * 3), 10, 0);
  backboard.castShadow = true;
  hoopGroup.add(backboard);

  // Rim and net
  const rimGeometry = new THREE.TorusGeometry(0.9, 0.05, 8, 32);
  const rimMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600 });
  const rim = new THREE.Mesh(rimGeometry, rimMaterial);
  rim.position.set(xPosition - (direction * 3.6), 10, 0);
  rim.rotation.x = Math.PI / 2;
  rim.castShadow = true;
  hoopGroup.add(rim);

  const netMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const netRadius = 0.9;
  const netLength = 1.5;
  const numStrands = 12;

  for (let i = 0; i < numStrands; i++) {
    const angle = (i / numStrands) * Math.PI * 2;
    const points = [];
    const segments = 5;
    for (let j = 0; j <= segments; j++) {
      const t = j / segments;
      const y = -netLength * t;
      const radiusAtY = netRadius * (1 - t * 0.3);
      const x = Math.cos(angle) * radiusAtY;
      const z = Math.sin(angle) * radiusAtY;
      points.push(new THREE.Vector3(x, y, z));
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
    const netLine = new THREE.Line(lineGeo, netMaterial);
    netLine.position.set(xPosition - (direction * 3.6), 10, 0);
    hoopGroup.add(netLine);
  }
  scene.add(hoopGroup);
}

// Builds center basketball
function createBasketball() {
  const radius = 1;
  const segments = 32;

  const textureLoader = new THREE.TextureLoader();
  const ballTexture = textureLoader.load('./src/textures/basketball_texture.jpg');

  const ballMaterial = new THREE.MeshPhongMaterial({
    map: ballTexture,
    shininess: 30,
  });

  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(radius, segments, segments),
    ballMaterial
  );
  ball.castShadow = true;
  ball.position.set(0, radius + 2, 0);

  // Black seam toruses
  const seamTube = 0.03;
  const seamMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

  const equator = new THREE.Mesh(
    new THREE.TorusGeometry(radius + 0.01, seamTube, 8, 64),
    seamMat
  );
  equator.rotation.x = Math.PI / 2;
  ball.add(equator);

  const meridian1 = new THREE.Mesh(
    new THREE.TorusGeometry(radius + 0.01, seamTube, 8, 64),
    seamMat
  );
  meridian1.rotation.y = Math.PI / 2;
  ball.add(meridian1);

  const meridian2 = new THREE.Mesh(
    new THREE.TorusGeometry(radius + 0.01, seamTube, 8, 64),
    seamMat
  );
  meridian2.rotation.z = Math.PI / 2;
  ball.add(meridian2);

  scene.add(ball);
}

// Scoreboard with home/guest display
function createScoreboard(homeScore = 12, guestScore = 8) {
  const scoreboardGroup = new THREE.Group();

  const frameGeometry = new THREE.BoxGeometry(9, 5, 0.4);
  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    metalness: 0.5,
    roughness: 0.4,
  });
  const frame = new THREE.Mesh(frameGeometry, frameMaterial);
  frame.castShadow = true;
  scoreboardGroup.add(frame);

  const screenGeometry = new THREE.PlaneGeometry(8.2, 4.2);
  const screenMaterial = new THREE.MeshStandardMaterial({
    color: 0x00122b,
    roughness: 0.6,
    emissive: 0x00122b,
    emissiveIntensity: 0.9,
  });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.z = 0.21;
  scoreboardGroup.add(screen);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'white';
  ctx.font = 'bold 44px Arial';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#33aaff';
  ctx.shadowBlur = 10;
  ctx.fillText(`HOME: ${homeScore}`, canvas.width / 2, 100);
  ctx.fillText(`GUEST: ${guestScore}`, canvas.width / 2, 180);

  const textTexture = new THREE.CanvasTexture(canvas);
  textTexture.encoding = THREE.sRGBEncoding;

  const textMaterial = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
  const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(8.1, 4.1), textMaterial);
  textPlane.position.z = 0.22;
  scoreboardGroup.add(textPlane);

  const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 10, 16), poleMaterial);
  pole.position.set(0, -7.5, 0);
  scoreboardGroup.add(pole);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.4, 32), poleMaterial);
  base.position.set(0, -13, 0);
  scoreboardGroup.add(base);

  scoreboardGroup.position.set(-18, 13, 0);
  scoreboardGroup.rotation.y = Math.PI / 2;
  scene.add(scoreboardGroup);
}

// Builds bleachers behind court
function createBleachersAtBaseline(zPos, steps = 6, seats = 10, facing = "forward") {
  const group = new THREE.Group();

  const stepHeight = 0.5;
  const treadDepth = 1;
  const seatSpacing = 0.8;
  const seatSize = 0.6;

  const blockWidth = seats * seatSpacing + 1;
  const blockDepth = steps * treadDepth + 1;

  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(blockWidth, 0.5, blockDepth),
    new THREE.MeshPhongMaterial({ color: 0x555555 })
  );
  slab.position.set(0, 0.25, -blockDepth / 2);
  slab.receiveShadow = true;
  group.add(slab);

  for (let r = 0; r < steps; r++) {
    const y = (r + 1) * stepHeight;
    const zRow = -r * treadDepth - treadDepth / 2;

    const tread = new THREE.Mesh(
      new THREE.BoxGeometry(blockWidth, 0.2, treadDepth),
      new THREE.MeshPhongMaterial({ color: 0x777777 })
    );
    tread.position.set(0, y, zRow);
    tread.receiveShadow = true;
    group.add(tread);

    const startX = -blockWidth / 2 + 0.5;
    for (let s = 0; s < seats; s++) {
      const seat = new THREE.Mesh(
        new THREE.BoxGeometry(seatSize, 0.2, seatSize),
        new THREE.MeshPhongMaterial({ color: 0x0044cc })
      );
      seat.position.set(startX + s * seatSpacing, y + 0.1, zRow);
      seat.castShadow = true;
      group.add(seat);
    }
  }

  group.position.set(0, 0, zPos);
  if (facing === "backward") {
    group.rotation.y = Math.PI;
  }

  scene.add(group);
}

// Initializes all scene components
function initScene() {
  createBasketballCourt();
  createBasketballHoop(13, 1);
  createBasketballHoop(-13, -1);
  createBasketball();
  createScoreboard();
  createBleachersAtBaseline(-10, 6, 24, "forward");
  createBleachersAtBaseline(10, 6, 24, "backward");
}

initScene();

// Camera setup
const cameraTranslate = new THREE.Matrix4();
cameraTranslate.makeTranslation(0, 15, 30);
camera.applyMatrix4(cameraTranslate);

// Orbit controls
const controls = new OrbitControls(camera, renderer.domElement);
let isOrbitEnabled = true;

// UI: Instructions
const instructionsElement = document.createElement('div');
instructionsElement.style.position = 'absolute';
instructionsElement.style.bottom = '20px';
instructionsElement.style.left = '20px';
instructionsElement.style.color = 'white';
instructionsElement.style.fontSize = '16px';
instructionsElement.style.fontFamily = 'Arial, sans-serif';
instructionsElement.style.textAlign = 'left';
instructionsElement.innerHTML = `
  <h3>Controls:</h3>
  <p>O - Toggle orbit camera</p>
`;
document.body.appendChild(instructionsElement);

// UI: Score display
const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '20px';
scoreElement.style.left = '20px';
scoreElement.style.color = 'white';
scoreElement.style.fontSize = '20px';
scoreElement.style.fontFamily = 'Arial, sans-serif';
scoreElement.innerHTML = `Score: 0`;
document.body.appendChild(scoreElement);

// Keyboard input: toggle orbit control
function handleKeyDown(e) {
  if (e.key === "o") {
    isOrbitEnabled = !isOrbitEnabled;
  }
}
document.addEventListener('keydown', handleKeyDown);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.enabled = isOrbitEnabled;
  controls.update();
  renderer.render(scene, camera);
}

animate();
