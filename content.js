// Create the pet element
const pet = document.createElement('div');
pet.style.cssText = `
  position: fixed;
  bottom: -40px;
  left: 80px;
  width: 250px;
  height: 250px;
  z-index: 2147483647;
  pointer-events: none;
`;

// Create the image element
const petImg = document.createElement('img');
petImg.style.cssText = `
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
`;
petImg.alt = 'My little friend';
pet.appendChild(petImg);
document.body.appendChild(pet);

//  STATE VARIABLES 
let currentPose = 'idle-front';
let isWalking = false;
let walkFrame = 0;
let walkInterval = null;
let lookAroundTimer = null;

// IMAGE LISTS 
const walkLeftFrames = [
  'walk-left-1.png',
  'walk-left-2.png',
  'walk-left-3.png',
  'walk-left-4.png'
];
const walkRightFrames = [
  'walk-right-1.png',
  'walk-right-2.png',
  'walk-right-3.png',
  'walk-right-4.png'
];

// HELPER: CHANGE IMAGE 
function setImage(filename) {
  petImg.src = chrome.runtime.getURL(filename);
  currentPose = filename;
}

// HELPER: IDLE DIRECTIONS 
function setDirection(pose) {
  const map = {
    'front': 'pet-idle-front.png',
    'headleft': 'pet-idle-headleft.png',
    'left': 'pet-idle-left.png',
    'headright': 'pet-idle-headright.png',
    'right': 'pet-idle-right.png'
  };

  if (map[pose]) {
    setImage(map[pose]);
  }
}

//  DECIDE WHAT TO DO NEXT 
function decideNextAction() {
  if (isWalking) return;

  // 70% chance to look around, 30% chance to walk
  const shouldWalk = Math.random() > 0.7;

  if (shouldWalk) {
    const goLeft = Math.random() > 0.5;
    startWalkSequence(goLeft ? 'left' : 'right');
  } else {
    startLookAroundSequence();
  }
}

// 1. LOOK AROUND SEQUENCE 
function startLookAroundSequence() {
  if (isWalking) return;

  setDirection('front');

  setTimeout(() => {
    if (isWalking) return;
    setDirection('headleft');
  }, 2000);

  setTimeout(() => {
    if (isWalking) return;
    setDirection('left');
  }, 3000);

  setTimeout(() => {
    if (isWalking) return;
    setDirection('headleft');
  }, 4000);

  setTimeout(() => {
    if (isWalking) return;
    setDirection('front');
  }, 5000);

  setTimeout(() => {
    if (isWalking) return;
    setDirection('headright');
  }, 6000);

  setTimeout(() => {
    if (isWalking) return;
    setDirection('right');
  }, 7000);

  setTimeout(() => {
    if (isWalking) return;
    setDirection('headright');
  }, 8000);

  setTimeout(() => {
    if (isWalking) return;
    setDirection('front');

    // Decide next action after look-around finishes
    decideNextAction();
  }, 10000);
}

//  2. WALK SEQUENCE — TURN HEAD → TURN BODY → WALK 
function startWalkSequence(direction) {
  if (isWalking) return;

  isWalking = true;

  const frames = direction === 'left' ? walkLeftFrames : walkRightFrames;

  // Step 1: Turn head first
  setDirection(direction === 'left' ? 'headleft' : 'headright');

  // Step 2: Then turn whole body
  setTimeout(() => {
    if (!isWalking) return;
    setDirection(direction);
  }, 500);

  // Step 3: Then start walking
  setTimeout(() => {
    if (!isWalking) return;
    startWalkingMovement(direction, frames);
  }, 700);
}

//3. ACTUALLY WALK ACROSS THE SCREEN 
function startWalkingMovement(direction, frames) {
  walkFrame = 0;

  const startX = parseInt(pet.style.left) || 20;

  // Longer walk distance
  const distance = direction === 'left' ? -300 : 300;

  // Same speed as before: 40px per second
  const duration = 7000;

  const startTime = Date.now();

  // Move position
  function moveStep() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const newX = startX + distance * progress;
    pet.style.left = newX + 'px';

    if (progress < 1) {
      requestAnimationFrame(moveStep);
    } else {
      stopWalking(direction);
    }
  }

  moveStep();

  // Animate walk frames
  walkInterval = setInterval(() => {
    if (!isWalking) return;
    setImage(frames[walkFrame]);
    walkFrame = (walkFrame + 1) % frames.length;
  }, 280);
}

// 4. STOP WALKING
function stopWalking(direction) {
  isWalking = false;

  clearInterval(walkInterval);

  // After walking, idle facing that direction
  setDirection(direction);

  // Wait a bit, then decide what to do next
  lookAroundTimer = setTimeout(() => {
    decideNextAction();
  }, 2000);
}

// START EVERYTHING 
setDirection('front');

// Start with a little delay so he doesn't immediately do something
setTimeout(() => {
  decideNextAction();
}, 1500);

console.log('✅ Smarter walk sequence loaded: turn head → turn body → walk 💙🌊');
