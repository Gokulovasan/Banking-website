/**
 * CyberDino: T-Rex Runner with Custom Sprite Importer
 * Core Game Engine
 */

class SoundGenerator {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }
  
  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playJump() {
    if (this.muted) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + 0.12);
      
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  playCrash() {
    if (this.muted) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(250, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.4);
      
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  playScore() {
    if (this.muted) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(900, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      
      osc.start();
      
      osc.frequency.setValueAtTime(1300, this.ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + 0.08);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.16);
      
      osc.stop(this.ctx.currentTime + 0.16);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  playSpeedUp() {
    if (this.muted) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(500, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, this.ctx.currentTime + 0.25);
      
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }
}

const sounds = new SoundGenerator();

// Game configuration constants
const GROUND_Y = 320;
const DINO_START_X = 85;
const GRAVITY = 0.65;
const JUMP_FORCE = -13.5;
const DOUBLE_JUMP_FORCE = -10.5;

// Particle System
class Particle {
  constructor(x, y, color, sizeMultiplier = 1) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 6 - 2; // drift backwards mostly
    this.vy = (Math.random() - 0.5) * 6;
    this.color = color;
    this.size = (Math.random() * 4 + 2) * sizeMultiplier;
    this.alpha = 1;
    this.decay = Math.random() * 0.03 + 0.015;
    this.gravity = 0.1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Background layer elements
class Star {
  constructor(canvasWidth, canvasHeight) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * (GROUND_Y - 100);
    this.size = Math.random() * 2 + 0.5;
    this.speed = Math.random() * 0.15 + 0.05;
    this.brightness = Math.random();
    this.blinkSpeed = Math.random() * 0.02 + 0.005;
  }

  update(canvasWidth, speed) {
    this.x -= this.speed * (speed * 0.2); // parallax speed
    if (this.x < -10) {
      this.x = canvasWidth + 10;
      this.y = Math.random() * (GROUND_Y - 100);
    }
    
    // Blink star
    this.brightness += this.blinkSpeed;
    if (this.brightness > 1 || this.brightness < 0) {
      this.blinkSpeed = -this.blinkSpeed;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0.1, this.brightness);
    ctx.fillStyle = '#00f2fe';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Mountain {
  constructor(x, width, height, speed, color) {
    this.x = x;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.color = color;
  }

  update(canvasWidth, speed) {
    this.x -= this.speed * (speed * 0.15); // parallax scroll
    if (this.x + this.width < 0) {
      this.x = canvasWidth + Math.random() * 200;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(this.x, GROUND_Y);
    ctx.lineTo(this.x + this.width / 2, GROUND_Y - this.height);
    ctx.lineTo(this.x + this.width, GROUND_Y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// Obstacles
class Obstacle {
  constructor(canvasWidth, type, speed) {
    this.type = type; // 'cactus_s', 'cactus_l', 'bird'
    this.x = canvasWidth + 50;
    this.width = 0;
    this.height = 0;
    this.y = 0;
    
    // Randomize characteristics
    if (type === 'cactus_s') {
      this.width = Math.random() * 15 + 15;
      this.height = Math.random() * 25 + 30;
      this.y = GROUND_Y - this.height;
      this.cactusCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 pack
      this.width = this.width * this.cactusCount;
      this.color = '#00f2fe';
    } else if (type === 'cactus_l') {
      this.width = Math.random() * 20 + 20;
      this.height = Math.random() * 35 + 45;
      this.y = GROUND_Y - this.height;
      this.cactusCount = Math.floor(Math.random() * 2) + 1; // 1 to 2 pack
      this.width = this.width * this.cactusCount;
      this.color = '#ff007f';
    } else if (type === 'bird') {
      this.width = 46;
      this.height = 36;
      // 3 Y levels: 1 = high (duck under), 2 = mid (duck or jump), 3 = low (must jump)
      const heights = [GROUND_Y - 80, GROUND_Y - 50, GROUND_Y - 20];
      this.y = heights[Math.floor(Math.random() * heights.length)];
      this.wingCycle = 0;
      this.color = '#f35588';
    }
  }

  update(speed) {
    this.x -= speed;
    if (this.type === 'bird') {
      this.wingCycle += 0.15;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 8;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';

    if (this.type === 'cactus_s' || this.type === 'cactus_l') {
      // Draw a neon branchy cactus
      const cWidth = this.width / this.cactusCount;
      for (let i = 0; i < this.cactusCount; i++) {
        const cx = this.x + i * cWidth + cWidth / 2;
        ctx.beginPath();
        // Main trunk
        ctx.moveTo(cx, GROUND_Y);
        ctx.lineTo(cx, this.y);
        
        // Left arm
        const armLeftY = this.y + this.height * 0.4;
        ctx.moveTo(cx, armLeftY);
        ctx.lineTo(cx - cWidth * 0.35, armLeftY);
        ctx.lineTo(cx - cWidth * 0.35, armLeftY - this.height * 0.25);
        
        // Right arm
        const armRightY = this.y + this.height * 0.3;
        ctx.moveTo(cx, armRightY);
        ctx.lineTo(cx + cWidth * 0.35, armRightY);
        ctx.lineTo(cx + cWidth * 0.35, armRightY - this.height * 0.25);

        ctx.stroke();

        // Caps
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(cx, this.y, 2, 0, Math.PI * 2);
        ctx.arc(cx - cWidth * 0.35, armLeftY - this.height * 0.25, 2, 0, Math.PI * 2);
        ctx.arc(cx + cWidth * 0.35, armRightY - this.height * 0.25, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (this.type === 'bird') {
      // Draw flying pterodactyl
      const bx = this.x;
      const by = this.y;
      const flap = Math.sin(this.wingCycle) > 0;

      ctx.beginPath();
      // Body & beak
      ctx.moveTo(bx, by + 15);
      ctx.lineTo(bx + 15, by + 5);
      ctx.lineTo(bx + 35, by + 12); // snout
      ctx.lineTo(bx + 20, by + 18);
      ctx.lineTo(bx + 10, by + 22);
      ctx.closePath();
      ctx.stroke();

      // Flapping wings
      ctx.beginPath();
      ctx.moveTo(bx + 18, by + 10);
      if (flap) {
        // Wings Up
        ctx.lineTo(bx + 22, by - 12);
        ctx.lineTo(bx + 12, by + 5);
      } else {
        // Wings Down
        ctx.lineTo(bx + 22, by + 28);
        ctx.lineTo(bx + 12, by + 15);
      }
      ctx.stroke();

      // Tail
      ctx.beginPath();
      ctx.moveTo(bx, by + 15);
      ctx.lineTo(bx - 10, by + 15);
      ctx.stroke();
    }
    ctx.restore();
  }

  getHitbox() {
    // Inset the hitbox slightly to feel more forgiving
    const insetX = this.width * 0.15;
    const insetY = this.height * 0.1;
    return {
      x: this.x + insetX,
      y: this.y + insetY,
      width: this.width - insetX * 2,
      height: this.height - insetY * 2
    };
  }
}

// The Dino Class
class Dino {
  constructor() {
    this.x = DINO_START_X;
    this.y = GROUND_Y - 50;
    this.width = 46;
    this.height = 48;
    this.vy = 0;
    
    // Jump counters
    this.isJumping = false;
    this.canDoubleJump = false;
    
    this.isDucking = false;
    this.runCycle = 0;
    this.dustTimer = 0;

    // Custom Sprite values
    this.customSpriteCanvas = null;
    this.customScale = 1.0;
    this.duckSquish = 0.5;
    this.animMode = 'wobble';
    this.spritesheetCols = 2;
    this.spritesheetRows = 1;
  }

  reset() {
    this.y = GROUND_Y - this.height;
    this.vy = 0;
    this.isJumping = false;
    this.canDoubleJump = false;
    this.isDucking = false;
    this.runCycle = 0;
  }

  jump() {
    if (!this.isJumping) {
      this.vy = JUMP_FORCE;
      this.isJumping = true;
      this.canDoubleJump = true;
      sounds.playJump();
      return true;
    } else if (this.canDoubleJump) {
      this.vy = DOUBLE_JUMP_FORCE;
      this.canDoubleJump = false;
      sounds.playJump();
      return true;
    }
    return false;
  }

  duck(state) {
    if (this.isJumping) return;
    this.isDucking = state;
  }

  update(particles, isPlaying) {
    // Apply gravity
    this.vy += GRAVITY;
    this.y += this.vy;

    // Hit ground
    const currentHeight = this.isDucking ? this.height * this.duckSquish : this.height;
    const baseGroundY = GROUND_Y - currentHeight;

    if (this.y > baseGroundY) {
      this.y = baseGroundY;
      this.vy = 0;
      this.isJumping = false;
      this.canDoubleJump = false;
    }

    if (isPlaying) {
      this.runCycle += 0.2;
      this.dustTimer++;

      // Create running dust particles when on ground
      if (!this.isJumping && this.dustTimer % 4 === 0) {
        particles.push(new Particle(
          this.x + 5, 
          GROUND_Y - 2, 
          'rgba(0, 242, 254, 0.4)', 
          0.7
        ));
      }
    }
  }

  draw(ctx) {
    ctx.save();
    
    // Determine active size & offset
    const activeWidth = this.width * this.customScale;
    const activeHeight = this.height * this.customScale;
    const currentHeight = this.isDucking ? activeHeight * this.duckSquish : activeHeight;
    const drawY = this.y;

    if (this.customSpriteCanvas) {
      // Draw CUSTOM sprite
      ctx.translate(this.x + activeWidth / 2, drawY + currentHeight / 2);

      // Apply walk cycle animations
      if (!this.isJumping && !this.isDucking) {
        if (this.animMode === 'wobble') {
          // Tilt back and forth
          const angle = Math.sin(this.runCycle * 1.5) * 0.08;
          ctx.rotate(angle);
        } else if (this.animMode === 'bounce') {
          // Bob up and down
          const bounceOffset = Math.sin(this.runCycle * 2) * 3;
          ctx.translate(0, bounceOffset);
        }
      }

      const drawX = -activeWidth / 2;
      const drawYCentered = -currentHeight / 2;

      if (this.animMode === 'spritesheet' && this.spritesheetCols > 1) {
        // Sprite sheet splicing
        const frameWidth = this.customSpriteCanvas.width / this.spritesheetCols;
        const frameHeight = this.customSpriteCanvas.height / this.spritesheetRows;
        
        // Cycle frame horizontally
        const runningFrameCount = this.spritesheetCols;
        const currentFrameIndex = this.isJumping ? 0 : Math.floor(this.runCycle) % runningFrameCount;

        const srcX = currentFrameIndex * frameWidth;
        const srcY = 0; // standard horizontal strip

        ctx.drawImage(
          this.customSpriteCanvas,
          srcX, srcY, frameWidth, frameHeight,
          drawX, drawYCentered, activeWidth, currentHeight
        );
      } else {
        // Simple/Static mode drawing
        ctx.drawImage(
          this.customSpriteCanvas, 
          drawX, drawYCentered, 
          activeWidth, currentHeight
        );
      }
    } else {
      // Draw DEFAULT cute vector neon Dino
      ctx.strokeStyle = '#00ff87'; // Green neon Dino
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00ff87';
      ctx.shadowBlur = 10;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';

      ctx.beginPath();
      
      if (!this.isDucking) {
        // Normal Standing Dino Paths
        // Head & snout
        ctx.moveTo(this.x + 25, drawY);
        ctx.lineTo(this.x + 46, drawY);
        ctx.lineTo(this.x + 46, drawY + 16);
        ctx.lineTo(this.x + 35, drawY + 16);
        ctx.lineTo(this.x + 35, drawY + 24);
        ctx.lineTo(this.x + 25, drawY + 24);
        
        // Neck & Back
        ctx.lineTo(this.x + 25, drawY + 36);
        ctx.lineTo(this.x + 10, drawY + 36);
        
        // Tail
        ctx.lineTo(this.x, drawY + 24);
        ctx.lineTo(this.x, drawY + 16);
        ctx.lineTo(this.x + 8, drawY + 28);
        ctx.lineTo(this.x + 14, drawY + 36);
        
        // Body bottom
        ctx.lineTo(this.x + 24, drawY + 44);
        ctx.lineTo(this.x + 30, drawY + 44);
        
        // Arm
        ctx.moveTo(this.x + 32, drawY + 28);
        ctx.lineTo(this.x + 38, drawY + 28);
        ctx.lineTo(this.x + 38, drawY + 32);

        ctx.stroke();

        // Draw animated legs
        const legFlap = Math.sin(this.runCycle * 1.5) > 0;
        ctx.beginPath();
        if (this.isJumping) {
          // Jumping legs (both straight down)
          ctx.moveTo(this.x + 18, drawY + 44);
          ctx.lineTo(this.x + 18, drawY + 48);
          ctx.moveTo(this.x + 26, drawY + 44);
          ctx.lineTo(this.x + 26, drawY + 48);
        } else {
          // Running legs alternating
          ctx.moveTo(this.x + 18, drawY + 44);
          ctx.lineTo(this.x + (legFlap ? 14 : 18), drawY + (legFlap ? 48 : 45));
          
          ctx.moveTo(this.x + 26, drawY + 44);
          ctx.lineTo(this.x + (legFlap ? 26 : 30), drawY + (legFlap ? 45 : 48));
        }
        ctx.stroke();

        // Eye
        ctx.fillStyle = '#00ff87';
        ctx.beginPath();
        ctx.arc(this.x + 32, drawY + 6, 2, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Ducking Dino
        ctx.moveTo(this.x + 15, drawY);
        ctx.lineTo(this.x + 46, drawY);
        ctx.lineTo(this.x + 46, drawY + 14);
        ctx.lineTo(this.x + 30, drawY + 14);
        ctx.lineTo(this.x + 26, drawY + 24); // neck down
        ctx.lineTo(this.x + 5, drawY + 24);
        
        // Tail
        ctx.lineTo(this.x, drawY + 12);
        ctx.lineTo(this.x + 5, drawY + 18);
        ctx.lineTo(this.x + 15, drawY + 24);
        
        ctx.stroke();

        // Running legs for ducking
        const legFlap = Math.sin(this.runCycle * 1.5) > 0;
        ctx.beginPath();
        ctx.moveTo(this.x + 12, drawY + 24);
        ctx.lineTo(this.x + (legFlap ? 8 : 12), drawY + 28);
        ctx.moveTo(this.x + 22, drawY + 24);
        ctx.lineTo(this.x + (legFlap ? 22 : 26), drawY + 28);
        ctx.stroke();

        // Eye
        ctx.fillStyle = '#00ff87';
        ctx.beginPath();
        ctx.arc(this.x + 38, drawY + 5, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    ctx.restore();
  }

  getHitbox() {
    const activeWidth = this.width * this.customScale;
    const activeHeight = this.height * this.customScale;
    const currentHeight = this.isDucking ? activeHeight * this.duckSquish : activeHeight;
    
    // Return bounding box with small forgiveness inset
    const insetX = activeWidth * 0.1;
    const insetY = currentHeight * 0.05;
    return {
      x: this.x + insetX,
      y: this.y + insetY,
      width: activeWidth - insetX * 2,
      height: currentHeight - insetY * 2
    };
  }
}

// Main Game Engine Controller
class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.dino = new Dino();
    this.particles = [];
    this.stars = [];
    this.mountains = [];
    this.obstacles = [];

    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('cyberdino_high') || '0', 10);
    this.speed = 6;
    this.baseSpeed = 6;
    this.maxSpeed = 22;
    this.isPlaying = false;
    this.isPaused = false;
    this.isGameOver = false;

    this.spawnTimer = 0;
    this.nextSpawnFrames = 90;
    this.scoreBlinkTimer = 0;
    
    this.initBackground();
    this.initUI();
    this.resizeCanvas();
    this.updateHighScoreDisplay();

    // Start gameloop
    requestAnimationFrame((t) => this.loop(t));
  }

  initBackground() {
    this.stars = [];
    for (let i = 0; i < 40; i++) {
      this.stars.push(new Star(this.canvas.width, this.canvas.height));
    }

    this.mountains = [
      new Mountain(100, 300, 120, 0.3, 'rgba(11, 25, 44, 0.5)'),
      new Mountain(450, 450, 160, 0.25, 'rgba(11, 25, 44, 0.3)'),
      new Mountain(800, 250, 90, 0.35, 'rgba(11, 25, 44, 0.6)')
    ];
  }

  updateHighScoreDisplay() {
    document.getElementById('high-score').textContent = this.formatScore(this.highScore);
  }

  formatScore(val) {
    const rounded = Math.floor(val);
    return rounded.toString().padStart(5, '0');
  }

  initUI() {
    // Keyboard listener
    window.addEventListener('keydown', (e) => {
      if (this.isGameOver) {
        if (e.code === 'Space') {
          e.preventDefault();
          this.restart();
        }
        return;
      }

      if (!this.isPlaying && !this.isPaused) {
        if (e.code === 'Space') {
          e.preventDefault();
          this.start();
        }
        return;
      }

      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        this.dino.jump();
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        this.dino.duck(true);
      }
      if (e.code === 'KeyP') {
        e.preventDefault();
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'ArrowDown') {
        this.dino.duck(false);
      }
    });

    // Button overlays
    document.getElementById('start-btn').addEventListener('click', () => this.start());
    document.getElementById('restart-btn').addEventListener('click', () => this.restart());

    // Audio Toggle
    const muteBtn = document.getElementById('mute-btn');
    muteBtn.addEventListener('click', () => {
      sounds.muted = !sounds.muted;
      muteBtn.classList.toggle('muted', sounds.muted);
      if (!sounds.muted) sounds.init();
    });

    // Custom Sprite uploader handlers
    const dropZone = document.getElementById('drop-zone');
    const spriteInput = document.getElementById('sprite-input');
    const resetBtn = document.getElementById('reset-sprite-btn');

    dropZone.addEventListener('click', () => spriteInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleImageFile(files[0]);
      }
    });

    spriteInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleImageFile(e.target.files[0]);
      }
    });

    resetBtn.addEventListener('click', () => {
      this.resetToDefaultSprite();
    });

    // Config options listeners
    const animModeInputs = document.querySelectorAll('input[name="anim-mode"]');
    animModeInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        this.dino.animMode = e.target.value;
        const gridConfig = document.getElementById('spritesheet-config');
        if (e.target.value === 'spritesheet') {
          gridConfig.classList.remove('hidden');
        } else {
          gridConfig.classList.add('hidden');
        }
        this.reprocessActiveImage();
      });
    });

    document.getElementById('spritesheet-cols').addEventListener('input', (e) => {
      this.dino.spritesheetCols = Math.max(1, parseInt(e.target.value, 10) || 1);
      this.reprocessActiveImage();
    });

    document.getElementById('spritesheet-rows').addEventListener('input', (e) => {
      this.dino.spritesheetRows = Math.max(1, parseInt(e.target.value, 10) || 1);
      this.reprocessActiveImage();
    });

    const scaleSlider = document.getElementById('sprite-scale');
    scaleSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.dino.customScale = val;
      document.getElementById('scale-value').textContent = `${val.toFixed(1)}x`;
    });

    const squishSlider = document.getElementById('duck-squish');
    squishSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      this.dino.duckSquish = val;
      document.getElementById('squish-value').textContent = `${val.toFixed(2)}x`;
    });

    document.getElementById('sprite-filter').addEventListener('change', () => {
      this.reprocessActiveImage();
    });
  }

  resizeCanvas() {
    // Keep internal coordinate resolution constant, while browser handles responsive scaling
    this.canvas.width = 800;
    this.canvas.height = 400;
  }

  handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.uploadedRawImage = img;
        this.reprocessActiveImage(file.name);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  reprocessActiveImage(filename) {
    if (!this.uploadedRawImage) return;

    if (filename) {
      document.getElementById('sprite-name').textContent = filename;
      document.getElementById('reset-sprite-btn').classList.remove('hidden');
    }

    const filter = document.getElementById('sprite-filter').value;
    
    // Crop & apply filters to offline canvas
    const processed = this.applyImageFilters(this.uploadedRawImage, filter);
    
    this.dino.customSpriteCanvas = processed;

    // Draw preview canvas
    const previewCanvas = document.getElementById('preview-canvas');
    const pCtx = previewCanvas.getContext('2d');
    pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    pCtx.drawImage(processed, 0, 0, previewCanvas.width, previewCanvas.height);
  }

  resetToDefaultSprite() {
    this.uploadedRawImage = null;
    this.dino.customSpriteCanvas = null;
    document.getElementById('sprite-name').textContent = 'Default Dino';
    document.getElementById('reset-sprite-btn').classList.add('hidden');

    const previewCanvas = document.getElementById('preview-canvas');
    const pCtx = previewCanvas.getContext('2d');
    pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    
    // Draw simple outline dino in preview box
    pCtx.strokeStyle = '#00ff87';
    pCtx.lineWidth = 2;
    pCtx.beginPath();
    pCtx.strokeRect(30, 30, 40, 40);
    pCtx.stroke();
  }

  applyImageFilters(img, filter) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Auto-crop transparency first
    const cropped = this.autoCropImage(img);
    const w = cropped.width;
    const h = cropped.height;

    tempCanvas.width = w;
    tempCanvas.height = h;

    if (filter === 'none') {
      tempCtx.drawImage(cropped, 0, 0);
      return tempCanvas;
    }

    if (filter === 'pixelate') {
      // Draw to a very small canvas and scale back up to pixelate
      const pixelSize = 8;
      const sw = Math.max(8, Math.round(w / pixelSize));
      const sh = Math.max(8, Math.round(h / pixelSize));

      const smCanvas = document.createElement('canvas');
      smCanvas.width = sw;
      smCanvas.height = sh;
      const smCtx = smCanvas.getContext('2d');
      smCtx.drawImage(cropped, 0, 0, sw, sh);

      tempCtx.imageSmoothingEnabled = false;
      tempCtx.msImageSmoothingEnabled = false;
      tempCtx.drawImage(smCanvas, 0, 0, sw, sh, 0, 0, w, h);
    } 
    else if (filter === 'neon') {
      // Glow wireframe style
      tempCtx.drawImage(cropped, 0, 0);
      
      // Turn sprite into cyan silhouette
      tempCtx.globalCompositeOperation = 'source-in';
      tempCtx.fillStyle = '#00f2fe';
      tempCtx.fillRect(0, 0, w, h);
      tempCtx.globalCompositeOperation = 'source-over';

      // Draw inside white layer slightly inset for core glow
      const strokeCanvas = document.createElement('canvas');
      strokeCanvas.width = w;
      strokeCanvas.height = h;
      const sCtx = strokeCanvas.getContext('2d');
      sCtx.drawImage(cropped, 2, 2, w - 4, h - 4);
      sCtx.globalCompositeOperation = 'source-in';
      sCtx.fillStyle = '#ffffff';
      sCtx.fillRect(0, 0, w, h);

      tempCtx.shadowColor = '#00f2fe';
      tempCtx.shadowBlur = 10;
      tempCtx.drawImage(strokeCanvas, 0, 0);
    } 
    else if (filter === 'gameboy') {
      // Map colors to classic Gameboy green palette
      tempCtx.drawImage(cropped, 0, 0);
      const imgData = tempCtx.getImageData(0, 0, w, h);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 30) continue; // transparent pixel
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const avg = 0.299 * r + 0.587 * g + 0.114 * b;

        if (avg < 64) {
          data[i] = 15; data[i+1] = 56; data[i+2] = 15; // #0f380f (Darkest)
        } else if (avg < 128) {
          data[i] = 48; data[i+1] = 98; data[i+2] = 48; // #306230
        } else if (avg < 192) {
          data[i] = 139; data[i+1] = 172; data[i+2] = 15; // #8bac0f
        } else {
          data[i] = 155; data[i+1] = 188; data[i+2] = 15; // #9bbc0f (Lightest)
        }
      }
      tempCtx.putImageData(imgData, 0, 0);
    } 
    else if (filter === 'silhouette') {
      tempCtx.drawImage(cropped, 0, 0);
      tempCtx.globalCompositeOperation = 'source-in';
      tempCtx.fillStyle = '#f35588'; // Neon Pink Silhouette
      tempCtx.fillRect(0, 0, w, h);
      tempCtx.globalCompositeOperation = 'source-over';
    }

    return tempCanvas;
  }

  autoCropImage(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
    let found = false;

    // Scan for bounds of non-transparent pixels
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const idx = (y * canvas.width + x) * 4;
        const alpha = data[idx + 3];
        if (alpha > 15) { // alpha tolerance threshold
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
          found = true;
        }
      }
    }

    if (!found) return img; // return original if empty

    const cropWidth = maxX - minX + 1;
    const cropHeight = maxY - minY + 1;

    const croppedCanvas = document.createElement('canvas');
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    const croppedCtx = croppedCanvas.getContext('2d');

    croppedCtx.drawImage(
      canvas, 
      minX, minY, cropWidth, cropHeight, 
      0, 0, cropWidth, cropHeight
    );

    return croppedCanvas;
  }

  start() {
    sounds.init();
    this.isPlaying = true;
    this.isPaused = false;
    this.isGameOver = false;
    this.score = 0;
    this.speed = this.baseSpeed;
    this.obstacles = [];
    this.particles = [];
    this.spawnTimer = 0;
    this.nextSpawnFrames = 90;
    this.dino.reset();

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
  }

  togglePause() {
    if (this.isGameOver) return;
    this.isPaused = !this.isPaused;
  }

  gameOver() {
    this.isPlaying = false;
    this.isGameOver = true;
    sounds.playCrash();

    // Trigger explosive particle shower at dino position
    const box = this.dino.getHitbox();
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    for (let i = 0; i < 40; i++) {
      this.particles.push(new Particle(cx, cy, '#ff007f', 1.5));
      this.particles.push(new Particle(cx, cy, '#00f2fe', 1.2));
    }

    // Save High Score
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('cyberdino_high', Math.floor(this.highScore));
      this.updateHighScoreDisplay();
    }

    document.getElementById('game-over-screen').classList.remove('hidden');
  }

  restart() {
    this.start();
  }

  spawnObstacle() {
    const types = ['cactus_s', 'cactus_l'];
    // Add flying birds after passing 250 score
    if (this.score > 250) {
      types.push('bird');
    }
    const selectedType = types[Math.floor(Math.random() * types.length)];
    this.obstacles.push(new Obstacle(this.canvas.width, selectedType, this.speed));
  }

  loop(timestamp) {
    this.update();
    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }

  update() {
    if (!this.isPlaying || this.isPaused) {
      // Just keep background stars and elements glowing slightly
      this.stars.forEach(star => star.update(this.canvas.width, 0.5));
      this.particles.forEach(p => p.update());
      this.particles = this.particles.filter(p => p.alpha > 0);
      return;
    }

    // Tick score based on distance run
    const prevScore = Math.floor(this.score);
    this.score += 0.15;
    const currentScoreInt = Math.floor(this.score);

    // Beep and speed up on every 100 points
    if (currentScoreInt > 0 && currentScoreInt % 100 === 0 && currentScoreInt !== prevScore) {
      sounds.playScore();
      this.scoreBlinkTimer = 35; // blink HUD score for 35 frames
      
      // Speed escalation
      if (this.speed < this.maxSpeed) {
        this.speed += 0.8;
        sounds.playSpeedUp();
      }
    }

    // Update Speed HUD
    const speedRatio = Math.min(100, ((this.speed - this.baseSpeed) / (this.maxSpeed - this.baseSpeed)) * 100);
    document.getElementById('speed-progress').style.width = `${speedRatio}%`;
    document.getElementById('speed-indicator').textContent = `${(this.speed / this.baseSpeed).toFixed(1)}x`;
    document.getElementById('current-score').textContent = this.formatScore(this.score);

    // Update particles
    this.particles.forEach(p => p.update());
    this.particles = this.particles.filter(p => p.alpha > 0);

    // Parallax update
    this.stars.forEach(star => star.update(this.canvas.width, this.speed));
    this.mountains.forEach(mtn => mtn.update(this.canvas.width, this.speed));

    // Dino update
    this.dino.update(this.particles, this.isPlaying);

    // Spawn manager
    this.spawnTimer++;
    if (this.spawnTimer >= this.nextSpawnFrames) {
      this.spawnObstacle();
      this.spawnTimer = 0;
      
      // Randomize frame spawn gap based on speed (higher speed = smaller gap)
      const baseGap = 70;
      this.nextSpawnFrames = baseGap + Math.random() * 80 - (this.speed * 2);
      this.nextSpawnFrames = Math.max(45, this.nextSpawnFrames);
    }

    // Obstacles update
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      obs.update(this.speed);

      // Check collision
      if (this.checkCollision(this.dino.getHitbox(), obs.getHitbox())) {
        this.gameOver();
        break;
      }

      // Remove off-screen obstacles
      if (obs.x + obs.width < -50) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  checkCollision(box1, box2) {
    return (
      box1.x < box2.x + box2.width &&
      box1.x + box1.width > box2.x &&
      box1.y < box2.y + box2.height &&
      box1.y + box1.height > box2.y
    );
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Starfield
    this.stars.forEach(star => star.draw(this.ctx));

    // 2. Draw Mountains (Background Parallax)
    this.mountains.forEach(mtn => mtn.draw(this.ctx));

    // 3. Draw Horizon line with synthwave grid gradient
    this.ctx.save();
    const grad = this.ctx.createLinearGradient(0, GROUND_Y, 0, this.canvas.height);
    grad.addColorStop(0, 'rgba(0, 242, 254, 0.4)'); // cyan boundary line
    grad.addColorStop(0.15, 'rgba(243, 85, 136, 0.1)'); // grid pink fade
    grad.addColorStop(1, 'rgba(11, 12, 22, 0.9)');
    
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, GROUND_Y, this.canvas.width, this.canvas.height - GROUND_Y);

    // Neon horizon line
    this.ctx.strokeStyle = '#00f2fe';
    this.ctx.shadowColor = '#00f2fe';
    this.ctx.shadowBlur = 10;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(0, GROUND_Y);
    this.ctx.lineTo(this.canvas.width, GROUND_Y);
    this.ctx.stroke();
    this.ctx.restore();

    // 4. Draw Obstacles
    this.obstacles.forEach(obs => obs.draw(this.ctx));

    // 5. Draw Particles
    this.particles.forEach(p => p.draw(this.ctx));

    // 6. Draw Dino
    this.dino.draw(this.ctx);

    // Blink score HUD on points checkpoints
    if (this.scoreBlinkTimer > 0) {
      this.scoreBlinkTimer--;
      const hudScore = document.getElementById('current-score');
      if (Math.floor(this.scoreBlinkTimer / 5) % 2 === 0) {
        hudScore.style.opacity = '0.3';
      } else {
        hudScore.style.opacity = '1';
      }
    } else {
      document.getElementById('current-score').style.opacity = '1';
    }
  }
}

// Initialise game on load
window.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new Game();
});
