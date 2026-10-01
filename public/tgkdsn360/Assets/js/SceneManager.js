console.log('🚀 SceneManager.js loaded');

let scenes = [];
let currentSceneId = null;
let sceneEl;
let assetsEl;
let hotspotContainer;

// Camera control variables
let camera;
let cameraRotation = { x: 0, y: 0 };
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// === INFO BOARD SHARED CONFIG ===
const INFOBOARD_CONFIG = {
  width: 0.8 * 6.5,
  height: 0.5 * 6.5,
  y: 0.4,
  rotation: '0 0 0'
};

// === INFO BOARD WORLD POSITIONS (x/z only differ) ===
const INFOBOARD_WORLD_POSITIONS = {
  scene1:  { x: 1.0, z: -3 },
  scene2:  { x: 2.3, z: -3 },
  scene4:  { x: -3.0, z: -1.0 },
  scene8:  { x: 1.0, z: -3 },
  scene11:  { x: -0.6, z: -3 },
  scene13: { x: 0, z: -4 }
};

// === INFO BOARD ROTATION PER SCENE ===
const INFOBOARD_ROTATIONS = {
  scene1:  '0 0 0',
  scene2:  '0 -10 0',
  scene4:  '0 90 0',
  scene8:  '0 -40 0',
  scene11:  '0 5 0',
  scene13: '0 0 0'
};

const DEV_START_SCENE = 'scene1';

// Child-friendly settings
const ROTATION_SPEED_MOUSE = 0.1;
const ROTATION_SPEED_KEYBOARD = 1.5;
const MAX_VERTICAL_ANGLE = 60; // Prevent upside-down (±60 degrees)
const MIN_VERTICAL_ANGLE = -60;

// Wait for A-Frame to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  sceneEl = document.querySelector('a-scene');

  if (sceneEl.hasLoaded) {
    init();
  } else {
    sceneEl.addEventListener('loaded', init);
  }
});

function init() {
  assetsEl = sceneEl.querySelector('a-assets');
  hotspotContainer = document.getElementById('hotspotContainer');
  camera = sceneEl.querySelector('[camera]');

  console.log('📦 Scene element:', sceneEl);
  console.log('📦 Assets element:', assetsEl);
  console.log('📦 Hotspot container:', hotspotContainer);
  console.log('📷 Camera element:', camera);

  // Initialize camera controls
  initCameraControls();

  /* =========================
     LOAD SCENE DATA
  ========================= */
  console.log('📥 Fetching scenes.json...');
  fetch('Assets/data/scenes.json')
    .then(res => {
      console.log('✅ Fetch response:', res.status);
      return res.json();
    })
    .then(data => {
      console.log('✅ Scenes data loaded:', data);
      scenes = data.scenes;

      // Load additional assets (nav icon)
      data.additionalAssets?.forEach(asset => {
        if (!document.getElementById(asset.id)) {
          const img = document.createElement('img');
          img.setAttribute('id', asset.id);
          img.setAttribute('src', asset.src);
          assetsEl.appendChild(img);
          console.log('📸 Loaded asset:', asset.id);
        }
      });

      console.log('🎬 Loading first scene:', scenes[0].id);
      loadSceneById(DEV_START_SCENE || scenes[0].id);
    })
    .catch(err => {
      console.error('❌ Error loading scenes:', err);
    });
}

/* =========================
   SCENE LOADER
========================= */
function loadSceneById(sceneId) {
  console.log('🔄 loadSceneById called with:', sceneId);

  const sceneData = scenes.find(s => s.id === sceneId);
  if (!sceneData) {
    console.error('❌ Scene not found:', sceneId);
    return;
  }

  console.log('✅ Scene data found:', sceneData);
  currentSceneId = sceneId;

  const oldSky = document.getElementById('scene-sky');

  /* NEW SKY */
  console.log('🌅 Creating new sky with image:', sceneData.image);
  const newSky = document.createElement('a-sky');
  newSky.setAttribute('src', sceneData.image);
  newSky.setAttribute('id', 'scene-sky-new');
  newSky.setAttribute('material', {
    shader: 'flat',
    transparent: true,
    opacity: 0
  });
  sceneEl.appendChild(newSky);

  // Wait for new sky to load, then start transition
  setTimeout(() => {
    // Fade out old sky
    if (oldSky) {
      oldSky.setAttribute('animation__fadeout', {
        property: 'material.opacity',
        to: 0,
        dur: 600,
        easing: 'easeInOutQuad'
      });
    }

    // Fade out old hotspots
    const oldHotspots = hotspotContainer.querySelectorAll('.clickable');
    oldHotspots.forEach(hotspot => {
      hotspot.setAttribute('animation__fadeout', {
        property: 'material.opacity',
        to: 0,
        dur: 600,
        easing: 'easeInOutQuad'
      });
    });

    // Fade in new sky
    newSky.setAttribute('animation__fadein', {
      property: 'material.opacity',
      to: 1,
      dur: 600,
      easing: 'easeInOutQuad'
    });

    // After transition, clean up and load new hotspots
    setTimeout(() => {
      if (oldSky) oldSky.remove();
      newSky.setAttribute('id', 'scene-sky');
      newSky.removeAttribute('animation__fadein');
      clearHotspots();
      loadHotspots(sceneData, true); // Pass true to fade in
      addInfoBoard(sceneData.id);
    }, 600);
  }, 100);

}

function loadHotspots(sceneData, fadeIn = false) {
  /* HOTSPOTS */
  sceneData.hotspots?.forEach(hotspot => {
    const el = document.createElement('a-image');

    el.setAttribute('id', hotspot.id);
    el.setAttribute('src', 'Assets/images/nav360.png');

    // Ensure transparency is enabled for PNG
    el.setAttribute('material', {
      transparent: true,
      alphaTest: 0.5,
      side: 'double',
      opacity: fadeIn ? 0 : 1 // Start invisible if fading in
    });

    // Adjust position to eye level (lower the y coordinate)
    const pos = hotspot.position.split(' ').map(parseFloat);
    const eyeLevelOffset = -1.6; // Adjust this value to raise/lower hotspots
    pos[1] += eyeLevelOffset; // Modify y coordinate
    el.setAttribute('position', `${pos[0]} ${pos[1]} ${pos[2]}`);

    el.setAttribute('rotation', hotspot.rotation);
    el.setAttribute('width', hotspot.navImage.width);
    el.setAttribute('height', hotspot.navImage.height);

    // 🔥 REQUIRED FOR CLICK
    el.classList.add('clickable');

    // Store target scene for click handler
    el.setAttribute('data-target', hotspot.target);

    // 🔥 DIRECT CLICK HANDLER - Attach immediately
    el.addEventListener('click', () => {
      console.log('🎯 Hotspot clicked → loading:', hotspot.target);
      loadSceneById(hotspot.target);
    });

    // Debug: log when cursor enters
    el.addEventListener('mouseenter', () => {
      console.log('👆 Cursor over hotspot:', hotspot.id);
    });

    hotspotContainer.appendChild(el);

    // Fade in if requested
    if (fadeIn) {
      setTimeout(() => {
        el.setAttribute('animation__fadein', {
          property: 'material.opacity',
          to: 1,
          dur: 600,
          easing: 'easeInOutQuad'
        });
      }, 50);
    }
  });
}

/* =========================
   CLEAR HOTSPOTS
========================= */
function clearHotspots() {
  if (hotspotContainer) {
    hotspotContainer.innerHTML = '';
  }
}

/* =========================
   CAMERA CONTROLS
   Child-Friendly Design:
   - Arrow keys (familiar from school)
   - Mouse drag (intuitive)
   - No WASD (prevents getting lost)
   - Rotation limits (no upside-down)
========================= */
function initCameraControls() {
  console.log('🎮 Initializing child-friendly camera controls');

  // Get initial camera rotation
  if (camera) {
    const rotation = camera.getAttribute('rotation');
    cameraRotation.x = rotation.x || 0;
    cameraRotation.y = rotation.y || 0;
  }

  // Mouse drag controls
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mouseleave', onMouseUp);

  // Touch controls for tablets
  document.addEventListener('touchstart', onTouchStart);
  document.addEventListener('touchmove', onTouchMove);
  document.addEventListener('touchend', onTouchEnd);

  // Keyboard controls (Arrow keys only - child-friendly)
  document.addEventListener('keydown', onKeyDown);

  console.log('✅ Camera controls initialized');
}

// Mouse drag functions
function onMouseDown(event) {
  isDragging = true;
  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  };
  document.body.style.cursor = 'grabbing';
}

function onMouseMove(event) {
  if (!isDragging || !camera) return;

  const deltaX = event.clientX - previousMousePosition.x;
  const deltaY = event.clientY - previousMousePosition.y;

  // Update rotation (horizontal is unlimited, vertical is limited)
  cameraRotation.y -= deltaX * ROTATION_SPEED_MOUSE;
  cameraRotation.x -= deltaY * ROTATION_SPEED_MOUSE;

  // Clamp vertical rotation to prevent upside-down
  cameraRotation.x = Math.max(MIN_VERTICAL_ANGLE, Math.min(MAX_VERTICAL_ANGLE, cameraRotation.x));

  // Apply rotation to camera
  camera.setAttribute('rotation', {
    x: cameraRotation.x,
    y: cameraRotation.y,
    z: 0
  });

  previousMousePosition = {
    x: event.clientX,
    y: event.clientY
  };
}

function onMouseUp() {
  isDragging = false;
  document.body.style.cursor = 'default';
}

// Touch controls (for tablets/touch devices)
let previousTouchPosition = { x: 0, y: 0 };

function onTouchStart(event) {
  if (event.touches.length === 1) {
    previousTouchPosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }
}

function onTouchMove(event) {
  if (event.touches.length === 1 && camera) {
    event.preventDefault();

    const deltaX = event.touches[0].clientX - previousTouchPosition.x;
    const deltaY = event.touches[0].clientY - previousTouchPosition.y;

    cameraRotation.y -= deltaX * ROTATION_SPEED_MOUSE;
    cameraRotation.x -= deltaY * ROTATION_SPEED_MOUSE;

    // Clamp vertical rotation
    cameraRotation.x = Math.max(MIN_VERTICAL_ANGLE, Math.min(MAX_VERTICAL_ANGLE, cameraRotation.x));

    camera.setAttribute('rotation', {
      x: cameraRotation.x,
      y: cameraRotation.y,
      z: 0
    });

    previousTouchPosition = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY
    };
  }
}

function onTouchEnd() {
  // Touch ended
}

// Keyboard controls (Arrow keys only - NO WASD)
function onKeyDown(event) {
  if (!camera) return;

  let rotationChanged = false;

  switch(event.key) {
    case 'ArrowLeft':
      cameraRotation.y += ROTATION_SPEED_KEYBOARD;
      rotationChanged = true;
      break;
    case 'ArrowRight':
      cameraRotation.y -= ROTATION_SPEED_KEYBOARD;
      rotationChanged = true;
      break;
    case 'ArrowUp':
      cameraRotation.x += ROTATION_SPEED_KEYBOARD;
      rotationChanged = true;
      break;
    case 'ArrowDown':
      cameraRotation.x -= ROTATION_SPEED_KEYBOARD;
      rotationChanged = true;
      break;
  }

  if (rotationChanged) {
    // Prevent default scrolling behavior
    event.preventDefault();

    // Clamp vertical rotation to prevent upside-down
    cameraRotation.x = Math.max(MIN_VERTICAL_ANGLE, Math.min(MAX_VERTICAL_ANGLE, cameraRotation.x));

    // Apply rotation to camera
    camera.setAttribute('rotation', {
      x: cameraRotation.x,
      y: cameraRotation.y,
      z: 0
    });
  }
}

/* =========================
   INFO BOARD SYSTEM
========================= */
function addInfoBoard(sceneId) {
const container = sceneEl;

  // Remove previous info board
  const oldBoard = document.querySelector('.info-board');
  if (oldBoard) oldBoard.remove();

  // Scene → Info board mapping
  const boardMap = {
    scene1:  { front: '#info-houselayout', back: '#info-houselayout' }, // House layout
    scene2:  { front: '#info-olod-front',  back: '#info-olod-back'  }, // Olod-olod
    scene4:  { front: '#info-soliu-front', back: '#info-soliu-back' }, // Soliu
    scene8:  { front: '#info-soriba-front',back: '#info-soriba-back'}, // Soriba
    scene11:  { front: '#info-kawas-front', back: '#info-kawas-back' }, // Kawas
    scene13: { front: '#info-tilud-front', back: '#info-tilud-back' }  // Tilud
  };

  // No info board for this scene
  if (!boardMap[sceneId]) return;

  const pos = INFOBOARD_WORLD_POSITIONS[sceneId];
  if (!pos) return;

  const rotation = INFOBOARD_ROTATIONS[sceneId] || INFOBOARD_CONFIG.rotation;
  const hasFrontBack = boardMap[sceneId].front !== boardMap[sceneId].back;

  if (hasFrontBack) {
    // Create entity container for flip animation
    const boardContainer = document.createElement('a-entity');
    boardContainer.classList.add('info-board');

    // Set IDs for quiz-enabled scenes
    if (sceneId === 'scene2') {
      boardContainer.setAttribute('id', 'scene2Infoboard');
    } else if (sceneId === 'scene4') {
      boardContainer.setAttribute('id', 'scene4Infoboard');
    } else if (sceneId === 'scene11') {
      boardContainer.setAttribute('id', 'scene11Infoboard');
    } else if (sceneId === 'scene13') {
      boardContainer.setAttribute('id', 'scene13Infoboard');
    }

    boardContainer.classList.add('clickable'); // Make it clickable for raycaster
    boardContainer.setAttribute('position', `${pos.x} ${INFOBOARD_CONFIG.y} ${pos.z}`);
    boardContainer.setAttribute('rotation', rotation);

    // Apply flip-board component (creates two child planes internally)
    boardContainer.setAttribute('flip-board', {
      frontSrc: boardMap[sceneId].front,
      backSrc: boardMap[sceneId].back,
      width: INFOBOARD_CONFIG.width,
      height: INFOBOARD_CONFIG.height,
      duration: 800
    });

    container.appendChild(boardContainer);
  } else {
    // scene1 (houselayout) - static board, no flip
    const board = document.createElement('a-plane');
    board.classList.add('info-board');
    board.setAttribute('src', boardMap[sceneId].front);
    board.setAttribute('position', `${pos.x} ${INFOBOARD_CONFIG.y} ${pos.z}`);
    board.setAttribute('width', INFOBOARD_CONFIG.width);
    board.setAttribute('height', INFOBOARD_CONFIG.height);
    board.setAttribute('rotation', rotation);
    board.setAttribute('material', 'shader: flat; transparent: true');

    container.appendChild(board);
  }
}
