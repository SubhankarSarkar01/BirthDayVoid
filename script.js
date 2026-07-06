/**
 * Digital Birthday Card SPA - Core Application Logic
 * Made with love for your bestie!
 */

// ==========================================
// 1. CONFIGURATION BLOCK
// Feel free to modify the passcode, image paths, letter text, or captions below!
// ==========================================
const CARD_CONFIG = {
  // Secret passcode to unlock the birthday card
  passcode: '0607',

  // Image assets (Can be relative local paths or external URLs)
  images: {
    profile: 'assets/profile_cat.png',
    wrong: 'assets/crying_character.png',
    peeking: 'assets/peeking_characters.png',
    crying: 'assets/crying_character.png',
    birthday: 'assets/birthday_reveal.png',
    hug: 'assets/virtual_hug.png',
    polaroid1: 'assets/polaroid_one.png',
    polaroid2: 'assets/polaroid_two.png',
    polaroid3: 'assets/polaroid_three.png'
  },

  // Captions for the polaroids on the final screen
  captions: {
    polaroid1: 'Troublemakers 💀',
    polaroid2: 'Pizza Partners 🍕',
    polaroid3: 'Dynamic Duo 🤠'
  },

  // The heartfelt / funny birthday wish letter content
  // Note: Supports HTML breaks <br> for styling paragraphs
  letterText: `Dearest best friend,<br><br>
  Happy Birthday to my favorite weirdo! 🥳<br><br>
  I am incredibly grateful for all the silly inside jokes, late-night chats, and the fact that we can communicate using just facial expressions.<br><br>
  Honestly, I don't know what I'd do without your questionable advice and ugly laugh. Here's to another year of making questionable decisions together, eating too much junk food, and complaining about being tired.<br><br>
  You are stuck with me forever, and I wouldn't have it any other way.<br><br>
  Love,<br>
  Your Favorite Person (me, obviously) ❤️`
};


// ==========================================
// 2. STATE & DOM REFERENCES
// ==========================================
let enteredPasscode = '';
let confettiActive = false;
let confettiInterval = null;
let confettiParticles = [];
const maxConfettiCount = 100;
const confettiColors = ['#ff6b8b', '#ffd166', '#06d6a0', '#118ab2', '#ff8e53', '#a8dadc'];

// DOM Element Selectors
const DOM = {
  statusTime: document.getElementById('status-time'),
  passcodeDots: document.querySelectorAll('.passcode-dot'),
  keypadButtons: document.querySelectorAll('.keypad-btn'),
  unlockBtn: document.getElementById('btn-unlock'),
  letterTextContainer: document.getElementById('letter-text'),
  confettiCanvas: document.getElementById('confetti-canvas'),
  
  // Navigation trigger buttons
  btnTryAgainLock: document.getElementById('btn-try-again-lock'),
  btnYes: document.getElementById('btn-yes'),
  btnNo: document.getElementById('btn-no'),
  btnTryAgainQuestion: document.getElementById('btn-try-again-question'),
  btnRevealNext: document.getElementById('btn-reveal-next'),
  btnLetterNext: document.getElementById('btn-letter-next'),
  btnHugNext: document.getElementById('btn-hug-next'),
  
  // Dynamic images
  imgProfile: document.getElementById('img-profile'),
  imgWrong: document.getElementById('img-wrong'),
  imgPeeking: document.getElementById('img-peeking'),
  imgCrying: document.getElementById('img-crying'),
  imgBirthday: document.getElementById('img-birthday'),
  imgHug: document.getElementById('img-hug'),
  imgPolaroid1: document.getElementById('img-polaroid-1'),
  imgPolaroid2: document.getElementById('img-polaroid-2'),
  imgPolaroid3: document.getElementById('img-polaroid-3'),
  
  // Polaroid captions
  captionPolaroid1: document.getElementById('caption-polaroid-1'),
  captionPolaroid2: document.getElementById('caption-polaroid-2'),
  captionPolaroid3: document.getElementById('caption-polaroid-3')
};


// ==========================================
// 3. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  setupConfigElements();
  setupClock();
  setupKeypad();
  setupEventListeners();
  initConfetti();
  
  // Generate random animated bubbles in the background
  generateDynamicBubbles();
});

// Load config elements into DOM
function setupConfigElements() {
  // Populate Images
  if (DOM.imgProfile) DOM.imgProfile.src = CARD_CONFIG.images.profile;
  if (DOM.imgWrong) DOM.imgWrong.src = CARD_CONFIG.images.wrong;
  if (DOM.imgPeeking) DOM.imgPeeking.src = CARD_CONFIG.images.peeking;
  if (DOM.imgCrying) DOM.imgCrying.src = CARD_CONFIG.images.crying;
  if (DOM.imgBirthday) DOM.imgBirthday.src = CARD_CONFIG.images.birthday;
  if (DOM.imgHug) DOM.imgHug.src = CARD_CONFIG.images.hug;
  if (DOM.imgPolaroid1) DOM.imgPolaroid1.src = CARD_CONFIG.images.polaroid1;
  if (DOM.imgPolaroid2) DOM.imgPolaroid2.src = CARD_CONFIG.images.polaroid2;
  if (DOM.imgPolaroid3) DOM.imgPolaroid3.src = CARD_CONFIG.images.polaroid3;

  // Populate Captions
  if (DOM.captionPolaroid1) DOM.captionPolaroid1.textContent = CARD_CONFIG.captions.polaroid1;
  if (DOM.captionPolaroid2) DOM.captionPolaroid2.textContent = CARD_CONFIG.captions.polaroid2;
  if (DOM.captionPolaroid3) DOM.captionPolaroid3.textContent = CARD_CONFIG.captions.polaroid3;

  // Populate Letter Text
  if (DOM.letterTextContainer) {
    DOM.letterTextContainer.innerHTML = CARD_CONFIG.letterText;
  }
}

// Keep simulated status bar clock updated
function setupClock() {
  const updateTime = () => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    if (DOM.statusTime) {
      DOM.statusTime.textContent = `${hours}:${minutes}`;
    }
  };
  updateTime();
  setInterval(updateTime, 60000);
}


// ==========================================
// 4. NAVIGATION STATE MACHINE
// Handles fluid screen sliding transitions
// ==========================================
function transitionTo(targetId, direction = 'next') {
  const currentScreen = document.querySelector('.screen.active');
  const targetScreen = document.getElementById(targetId);
  
  if (!currentScreen || !targetScreen || currentScreen === targetScreen) return;

  // Reset positioning classes
  currentScreen.classList.remove('active', 'prev', 'next');
  targetScreen.classList.remove('active', 'prev', 'next');

  if (direction === 'next') {
    currentScreen.classList.add('prev'); // slides left
    targetScreen.classList.add('next');  // starts off-screen right
    
    // Trigger reflow to apply 'next' state before animation starts
    targetScreen.offsetHeight;
    
    targetScreen.classList.remove('next');
    targetScreen.classList.add('active'); // slides into view
  } else {
    currentScreen.classList.add('next'); // slides right
    targetScreen.classList.add('prev');  // starts off-screen left
    
    // Trigger reflow
    targetScreen.offsetHeight;
    
    targetScreen.classList.remove('prev');
    targetScreen.classList.add('active'); // slides into view
  }

  // Handle page-specific hooks (confetti, overlays, etc.)
  handleScreenHooks(targetId);
}

// Special animations trigger on specific screens
function handleScreenHooks(screenId) {
  // Stop any active confetti by default
  stopConfetti();

  if (screenId === 'screen-3') {
    // Reveal Screen: Launch a single massive burst of confetti!
    startConfetti(true); // single burst mode
  } else if (screenId === 'screen-6') {
    // Final Screen: Continuous festive confetti rain
    startConfetti(false); // continuous mode
  }
}


// ==========================================
// 5. PASSCODE LOCK LOGIC
// ==========================================
function setupKeypad() {
  DOM.keypadButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      handleKeyPress(val);
    });
  });
}

function handleKeyPress(val) {
  // Add numerical digit
  if (val !== '*' && val !== '#') {
    if (enteredPasscode.length < 4) {
      enteredPasscode += val;
      updatePasscodeDots();
      
      // Auto-submit when 4 digits are entered
      if (enteredPasscode.length === 4) {
        setTimeout(validatePasscode, 300);
      }
    }
  } else {
    // Backspace / Clear on special symbols
    resetPasscodeEntry();
  }
}

function updatePasscodeDots() {
  DOM.passcodeDots.forEach((dot, index) => {
    if (index < enteredPasscode.length) {
      dot.classList.add('filled');
    } else {
      dot.classList.remove('filled');
    }
  });
}

function resetPasscodeEntry() {
  enteredPasscode = '';
  updatePasscodeDots();
  DOM.passcodeDots.forEach(dot => dot.classList.remove('shake'));
}

function validatePasscode() {
  if (enteredPasscode === CARD_CONFIG.passcode) {
    // SUCCESS
    resetPasscodeEntry();
    transitionTo('screen-2', 'next');
  } else {
    // FAILURE
    // Shake dots
    DOM.passcodeDots.forEach(dot => dot.classList.add('shake'));
    
    // Slide to screen 1B after shake completes
    setTimeout(() => {
      resetPasscodeEntry();
      transitionTo('screen-1b', 'next');
    }, 500);
  }
}


// ==========================================
// 6. EVENT HANDLERS
// ==========================================
function setupEventListeners() {
  // Screen 1: Unlock Manual click (as backup to auto-submit)
  if (DOM.unlockBtn) {
    DOM.unlockBtn.addEventListener('click', validatePasscode);
  }

  // Screen 1B: Wrong passcode Try Again
  if (DOM.btnTryAgainLock) {
    DOM.btnTryAgainLock.addEventListener('click', () => {
      transitionTo('screen-1', 'prev');
    });
  }

  // Screen 2: Question YES / NO
  if (DOM.btnYes) {
    DOM.btnYes.addEventListener('click', () => {
      transitionTo('screen-3', 'next');
    });
  }
  if (DOM.btnNo) {
    DOM.btnNo.addEventListener('click', () => {
      transitionTo('screen-2b', 'next');
    });
  }

  // Screen 2B: Try Again from NO
  if (DOM.btnTryAgainQuestion) {
    DOM.btnTryAgainQuestion.addEventListener('click', () => {
      transitionTo('screen-2', 'prev');
    });
  }

  // Screen 3: Next from Birthday Reveal
  if (DOM.btnRevealNext) {
    DOM.btnRevealNext.addEventListener('click', () => {
      transitionTo('screen-4', 'next');
    });
  }

  // Screen 4: Next from Letter
  if (DOM.btnLetterNext) {
    DOM.btnLetterNext.addEventListener('click', () => {
      transitionTo('screen-5', 'next');
    });
  }

  // Screen 5: Next from Hug
  if (DOM.btnHugNext) {
    DOM.btnHugNext.addEventListener('click', () => {
      transitionTo('screen-6', 'next');
    });
  }
}


// ==========================================
// 7. HIGH-PERFORMANCE CANVAS CONFETTI SYSTEM
// ==========================================
let canvas, ctx, width, height;

function initConfetti() {
  canvas = DOM.confettiCanvas;
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  
  // Set resolution to match simulation screen scale
  resizeConfettiCanvas();
  window.addEventListener('resize', resizeConfettiCanvas);
}

function resizeConfettiCanvas() {
  if (!canvas) return;
  const parent = canvas.parentElement;
  width = parent.clientWidth;
  height = parent.clientHeight;
  canvas.width = width;
  canvas.height = height;
}

class ConfettiParticle {
  constructor(isBurst = false) {
    this.x = Math.random() * width;
    // Burst starts mid-screen, continuous starts at top
    this.y = isBurst ? Math.random() * (height * 0.4) + (height * 0.2) : Math.random() * -50 - 10;
    this.size = Math.random() * 8 + 6;
    this.color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    this.speedX = isBurst ? (Math.random() * 8 - 4) : (Math.random() * 4 - 2);
    this.speedY = isBurst ? (Math.random() * -10 - 2) : (Math.random() * 3 + 2);
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 4 - 2;
    this.opacity = 1;
    this.decay = isBurst ? (Math.random() * 0.015 + 0.005) : 0;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    
    // Gravity simulation
    this.speedY += 0.15;
    
    // Horizontal wind oscillation
    this.speedX += Math.sin(this.y * 0.05) * 0.05;
    
    this.rotation += this.rotationSpeed;
    
    if (this.decay > 0) {
      this.opacity -= this.decay;
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    
    // Draw rectangular confetti piece
    ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    ctx.restore();
  }
}

function startConfetti(singleBurst = false) {
  resizeConfettiCanvas();
  confettiActive = true;
  confettiParticles = [];

  if (singleBurst) {
    // Generate 120 particles in one spot for the pop
    for (let i = 0; i < 120; i++) {
      confettiParticles.push(new ConfettiParticle(true));
    }
  }

  if (confettiInterval) clearInterval(confettiInterval);
  
  if (!singleBurst) {
    // Continuous rain loop
    confettiInterval = setInterval(() => {
      if (confettiParticles.length < maxConfettiCount) {
        confettiParticles.push(new ConfettiParticle(false));
      }
    }, 100);
  }

  requestAnimationFrame(updateConfetti);
}

function stopConfetti() {
  confettiActive = false;
  if (confettiInterval) {
    clearInterval(confettiInterval);
    confettiInterval = null;
  }
}

function updateConfetti() {
  if (!ctx || !canvas) return;
  
  ctx.clearRect(0, 0, width, height);

  // Filter out expired particles
  confettiParticles = confettiParticles.filter(p => {
    p.update();
    
    // Conditions to keep: inside screen and opaque
    const isInside = p.y < height + 20 && p.x > -20 && p.x < width + 20;
    const isVisible = p.opacity > 0;
    return isInside && isVisible;
  });

  // Draw remaining
  confettiParticles.forEach(p => p.draw());

  if (confettiActive || confettiParticles.length > 0) {
    requestAnimationFrame(updateConfetti);
  }
}

// Background bubble decoration builder
function generateDynamicBubbles() {
  const container = document.getElementById('bg-bubbles');
  if (!container) return;

  // Clear existing static bubbles
  container.innerHTML = '';

  const colors = ['rgba(255, 107, 139, 0.15)', 'rgba(255, 209, 102, 0.15)', 'rgba(6, 214, 160, 0.15)', 'rgba(17, 138, 178, 0.15)', 'rgba(232, 219, 252, 0.3)'];
  
  for (let i = 0; i < 15; i++) {
    const bubble = document.createElement('div');
    bubble.classList.add('floating-bubble');
    
    const size = Math.random() * 50 + 20;
    const left = Math.random() * 100;
    const duration = Math.random() * 15 + 8;
    const delay = Math.random() * 8;
    const color = colors[Math.floor(Math.random() * colors.length)];

    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${left}%`;
    bubble.style.backgroundColor = color;
    bubble.style.animationDuration = `${duration}s`;
    bubble.style.animationDelay = `${delay}s`;

    container.appendChild(bubble);
  }
}
