import { Cat, CatBreed, Chicken, ChickenType, FloatingText, GameLevelConfig, GameMode, GameStats, Particle, SafeBasket, Toy, ToyType } from '../types/game';
import { sound } from '../audio/soundEffects';
import { GAME_LEVELS } from './levels';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  public chickens: Chicken[] = [];
  public cats: Cat[] = [];
  public toys: Toy[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  public stats: GameStats = {
    score: 0,
    rescuedCount: 0,
    eatenCount: 0,
    combo: 0,
    maxCombo: 0,
    level: 1,
    mode: 'LEVELS',
    toys: {
      yarn: 2,
      catnip: 2,
      bell: 1
    }
  };

  public currentLevelConfig: GameLevelConfig = GAME_LEVELS[0];
  public isRunning: boolean = false;
  public isPaused: boolean = false;
  public isOver: boolean = false;
  public isWon: boolean = false;

  public safeBasket: SafeBasket = { x: 0, y: 0, width: 140, height: 140 };
  public heldChicken: Chicken | null = null;
  public cursorPos = { x: 0, y: 0, isDown: false };
  public tongsOffset = { x: 0, y: 0 };

  private spawnTimer: number = 0;
  private shakeAmount: number = 0;
  private hitstopTimer: number = 0;
  private globalTimer: number = 0;

  // Callback to sync React UI without breaking 60fps canvas loop
  private onStatsUpdate?: (stats: GameStats, isOver: boolean, isWon: boolean) => void;

  constructor(canvas: HTMLCanvasElement, onStatsUpdate?: (stats: GameStats, isOver: boolean, isWon: boolean) => void) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error("Could not acquire 2D context");
    this.ctx = context;
    this.onStatsUpdate = onStatsUpdate;

    this.resize();
    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    this.resize();
  };

  public resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.ctx.scale(dpr, dpr);

    // Position the Safe Basket at bottom-right corner with responsive margins
    const basketSize = Math.max(120, Math.min(160, Math.min(w, h) * 0.22));
    this.safeBasket = {
      x: w - basketSize - 24,
      y: h - basketSize - 24,
      width: basketSize,
      height: basketSize
    };
  }

  public startLevel(levelNum: number, mode: GameMode = 'LEVELS') {
    this.stats.level = levelNum;
    this.stats.mode = mode;
    this.stats.rescuedCount = 0;
    this.stats.eatenCount = 0;
    this.stats.combo = 0;
    
    // Refresh toys each level
    this.stats.toys = {
      yarn: 2 + Math.floor(levelNum * 0.5),
      catnip: 2,
      bell: 1
    };

    const configIndex = Math.min(levelNum - 1, GAME_LEVELS.length - 1);
    this.currentLevelConfig = GAME_LEVELS[configIndex];

    this.chickens = [];
    this.cats = [];
    this.toys = [];
    this.particles = [];
    this.floatingTexts = [];
    this.heldChicken = null;
    this.isOver = false;
    this.isWon = false;
    this.isPaused = false;
    this.isRunning = true;
    this.spawnTimer = 0.5; // Quick first spawn

    // Spawn initial cats from edges
    this.initCatsForLevel();

    // Spawn 2 initial chickens
    this.spawnChicken();
    this.spawnChicken();

    sound.startAmbientLoop();
    this.notifyStats();

    if (!this.animFrameId) {
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  public restartCurrent() {
    this.startLevel(this.stats.level, this.stats.mode);
  }

  public pauseToggle(): boolean {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  public stop() {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    sound.stopAmbientLoop();
    window.removeEventListener('resize', this.handleResize);
  }

  private initCatsForLevel() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.currentLevelConfig.catsConfig.forEach((cfg, idx) => {
      // Pick an initial spawn edge (top, left, right, bottom-left)
      const side = idx % 4;
      let startX = 0;
      let startY = 0;
      if (side === 0) { startX = w * (0.2 + idx * 0.3); startY = -60; }
      else if (side === 1) { startX = -60; startY = h * (0.3 + idx * 0.25); }
      else if (side === 2) { startX = w + 60; startY = h * (0.2 + idx * 0.3); }
      else { startX = w * 0.2; startY = h + 60; }

      const cat: Cat = {
        id: `cat-${idx}-${Date.now()}`,
        name: cfg.nameBn,
        breed: cfg.breed,
        x: startX,
        y: startY,
        targetX: w * 0.4 + (Math.random() * 0.2 - 0.1) * w,
        targetY: h * 0.4 + (Math.random() * 0.2 - 0.1) * h,
        size: cfg.breed === 'BOSS_CHONK' ? 64 : cfg.breed === 'CALICO' ? 52 : cfg.breed === 'SHADOW' ? 42 : 46,
        speed: cfg.speed,
        state: 'IDLE',
        stateTimer: 1.0 + idx * 0.5,
        targetChickenId: null,
        targetToyId: null,
        telegraphDuration: cfg.telegraphTime,
        eatTimer: 0,
        angle: 0,
        tailWiggle: 0,
        eyeGlow: 0,
        color: cfg.breed === 'TABBY' ? '#F97316' : cfg.breed === 'CALICO' ? '#FBBF24' : cfg.breed === 'SHADOW' ? '#1E293B' : '#C2410C',
        stripeColor: cfg.breed === 'TABBY' ? '#C2410C' : cfg.breed === 'CALICO' ? '#9A3412' : cfg.breed === 'SHADOW' ? '#0F172A' : '#7C2D12',
        bellyFullness: 0,
        pounceProgress: 0,
        pounceStart: { x: startX, y: startY }
      };
      this.cats.push(cat);
    });
  }

  private spawnChicken() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    if (this.chickens.filter(c => !c.isSaved && !c.isEaten).length >= this.currentLevelConfig.maxSimultaneousChickens) {
      return;
    }

    // Determine type based on level
    const rand = Math.random();
    let type: ChickenType = 'DRUMSTICK';
    let weight = 1;
    let points = 100;

    if (this.stats.level >= 2 && rand > 0.65) {
      type = 'HOT_WING';
      points = 150;
    } else if (this.stats.level >= 4 && rand > 0.85) {
      type = 'ROAST_CHICKEN';
      weight = 3;
      points = 300;
    } else if (rand < 0.25) {
      type = 'NUGGET';
      points = 60;
    }

    // Table play zone margins (avoid spawning directly on safe basket or too close to table edge)
    const margin = 90;
    const spawnX = margin + Math.random() * (w - margin * 2 - 120);
    const spawnY = margin + Math.random() * (h - margin * 2 - 100);

    const chicken: Chicken = {
      id: `chk-${Date.now()}-${Math.random()}`,
      type,
      x: spawnX,
      y: spawnY,
      radius: type === 'ROAST_CHICKEN' ? 38 : type === 'HOT_WING' ? 26 : type === 'NUGGET' ? 18 : 28,
      points,
      weight,
      bitesLeft: weight,
      angle: Math.random() * Math.PI * 2,
      isHeld: false,
      isSaved: false,
      isEaten: false,
      spawnTime: this.globalTimer,
      hotness: 1.0,
      scale: 0.2
    };

    this.chickens.push(chicken);

    // Spawn puff particles
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: spawnX + (Math.random() * 20 - 10),
        y: spawnY + (Math.random() * 20 - 10),
        vx: (Math.random() - 0.5) * 40,
        vy: -Math.random() * 60 - 20,
        radius: Math.random() * 4 + 2,
        color: '#FEF08A',
        alpha: 0.8,
        life: 0,
        maxLife: 0.5,
        type: 'STEAM'
      });
    }
  }

  // Toss distraction toy (yarn ball, catnip)
  public throwToy(type: ToyType) {
    if (this.stats.toys[type === 'YARN_BALL' ? 'yarn' : type === 'CATNIP' ? 'catnip' : 'bell'] <= 0) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    if (type === 'BELL_RATTLE') {
      this.stats.toys.bell--;
      sound.playBoop();
      // Scare all cats into immediate retreat
      this.cats.forEach(cat => {
        cat.state = 'RETREAT';
        cat.stateTimer = 2.5;
        cat.targetChickenId = null;
        this.addFloatingText("ঘণ্টা! পালাও!", cat.x, cat.y - 30, '#F59E0B');
      });
      sound.playHiss();
      this.notifyStats();
      return;
    }

    if (type === 'YARN_BALL') this.stats.toys.yarn--;
    if (type === 'CATNIP') this.stats.toys.catnip--;

    sound.playToyThrow();

    // Spawn near player's cursor or center table
    const targetX = this.cursorPos.x > 0 ? this.cursorPos.x : w * 0.5;
    const targetY = this.cursorPos.y > 0 ? this.cursorPos.y : h * 0.5;

    const toy: Toy = {
      id: `toy-${Date.now()}`,
      type,
      x: targetX + (Math.random() * 40 - 20),
      y: targetY + (Math.random() * 40 - 20),
      radius: type === 'YARN_BALL' ? 22 : 28,
      duration: type === 'YARN_BALL' ? 5.5 : 4.5,
      maxDuration: type === 'YARN_BALL' ? 5.5 : 4.5,
      angle: 0,
      bouncesLeft: 3,
      vx: (Math.random() - 0.5) * 80,
      vy: (Math.random() - 0.5) * 80,
      color: type === 'YARN_BALL' ? '#EC4899' : '#10B981'
    };

    this.toys.push(toy);

    // Attract all stalking cats to this toy
    this.cats.forEach(cat => {
      if (cat.state !== 'RETREAT') {
        cat.state = 'DISTRACTED';
        cat.stateTimer = toy.duration;
        cat.targetToyId = toy.id;
        cat.targetChickenId = null;
        this.addFloatingText(type === 'YARN_BALL' ? "মিয়াউ! উলের বল!" : "ক্যাটনিপ! আহা!", cat.x, cat.y - 30, '#EC4899');
      }
    });

    this.notifyStats();
  }

  // Handle player click/tap (Boop cat nose or grab chicken)
  public handlePointerDown(x: number, y: number) {
    if (!this.isRunning || this.isPaused || this.isOver || this.isWon) return;

    this.cursorPos.x = x;
    this.cursorPos.y = y;
    this.cursorPos.isDown = true;

    // Check if clicked directly on a cat (Boop the cat's nose!)
    for (const cat of this.cats) {
      const dx = x - cat.x;
      const dy = y - cat.y;
      const dist = Math.hypot(dx, dy);

      if (dist < cat.size * 1.1) {
        // Successful Boop!
        sound.playBoop();
        sound.playHiss();
        cat.state = 'RETREAT';
        cat.stateTimer = 2.0;
        cat.targetChickenId = null;

        // Visual feedback
        this.shakeAmount = 4;
        this.addFloatingText("BOOP! নো লোভী!", cat.x, cat.y - cat.size - 10, '#38BDF8');

        for (let i = 0; i < 8; i++) {
          this.particles.push({
            x: cat.x,
            y: cat.y,
            vx: (Math.random() - 0.5) * 120,
            vy: (Math.random() - 0.5) * 120,
            radius: Math.random() * 4 + 2,
            color: '#38BDF8',
            alpha: 1,
            life: 0,
            maxLife: 0.4,
            type: 'SWEAT'
          });
        }
        return;
      }
    }

    // Check if clicked on a chicken to pick it up
    for (let i = this.chickens.length - 1; i >= 0; i--) {
      const chk = this.chickens[i];
      if (chk.isSaved || chk.isEaten) continue;

      const dx = x - chk.x;
      const dy = y - chk.y;
      const dist = Math.hypot(dx, dy);

      if (dist < chk.radius * 1.5) {
        chk.isHeld = true;
        this.heldChicken = chk;
        this.tongsOffset = { x: chk.x - x, y: chk.y - y };
        sound.playChickenGrab();
        return;
      }
    }
  }

  public handlePointerMove(x: number, y: number) {
    this.cursorPos.x = x;
    this.cursorPos.y = y;

    if (this.heldChicken && this.cursorPos.isDown) {
      this.heldChicken.x = x + this.tongsOffset.x;
      this.heldChicken.y = y + this.tongsOffset.y;

      // Check if dragged over safe basket
      const basket = this.safeBasket;
      if (
        this.heldChicken.x >= basket.x &&
        this.heldChicken.x <= basket.x + basket.width &&
        this.heldChicken.y >= basket.y &&
        this.heldChicken.y <= basket.y + basket.height
      ) {
        this.rescueChicken(this.heldChicken);
        this.heldChicken = null;
      }
    }
  }

  public handlePointerUp() {
    this.cursorPos.isDown = false;
    if (this.heldChicken) {
      // Check if dropped near safe basket
      const basket = this.safeBasket;
      if (
        this.heldChicken.x >= basket.x - 20 &&
        this.heldChicken.x <= basket.x + basket.width + 20 &&
        this.heldChicken.y >= basket.y - 20 &&
        this.heldChicken.y <= basket.y + basket.height + 20
      ) {
        this.rescueChicken(this.heldChicken);
      }
      this.heldChicken.isHeld = false;
      this.heldChicken = null;
    }
  }

  // Player rescues a chicken into the hot-pot warmer
  private rescueChicken(chicken: Chicken) {
    chicken.isSaved = true;
    chicken.isHeld = false;

    this.stats.combo++;
    if (this.stats.combo > this.stats.maxCombo) {
      this.stats.maxCombo = this.stats.combo;
    }

    const earnedPoints = chicken.points * Math.min(this.stats.combo, 4);
    this.stats.score += earnedPoints;
    this.stats.rescuedCount++;

    sound.playRescueChime(this.stats.combo);

    const comboText = this.stats.combo > 1 ? ` (${this.stats.combo}x Combo!)` : '';
    this.addFloatingText(`+${earnedPoints}${comboText}`, this.safeBasket.x + 40, this.safeBasket.y, '#22C55E', 24);

    // Sparkle particles inside the safe basket
    for (let i = 0; i < 16; i++) {
      this.particles.push({
        x: this.safeBasket.x + this.safeBasket.width * 0.5 + (Math.random() - 0.5) * 40,
        y: this.safeBasket.y + this.safeBasket.height * 0.5 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 140,
        vy: -Math.random() * 120 - 30,
        radius: Math.random() * 4 + 2,
        color: '#FDE047',
        alpha: 1,
        life: 0,
        maxLife: 0.6,
        type: 'SPARKLE'
      });
    }

    // Check level win
    if (this.stats.mode === 'LEVELS' && this.stats.rescuedCount >= this.currentLevelConfig.targetRescues) {
      this.triggerLevelClear();
    } else {
      this.notifyStats();
    }
  }

  private triggerLevelClear() {
    this.isWon = true;
    sound.playLevelClear();
    this.notifyStats();
  }

  private triggerGameOver() {
    this.isOver = true;
    this.shakeAmount = 14;
    sound.playGameOver();
    this.notifyStats();
  }

  private notifyStats() {
    if (this.onStatsUpdate) {
      this.onStatsUpdate({ ...this.stats }, this.isOver, this.isWon);
    }
  }

  public addFloatingText(text: string, x: number, y: number, color = '#FDE047', size = 18) {
    this.floatingTexts.push({
      id: `ft-${Date.now()}-${Math.random()}`,
      text,
      x,
      y,
      color,
      size,
      alpha: 1,
      vy: -50,
      life: 0
    });
  }

  // Main 60 FPS Game Loop
  private loop = (timestamp: number) => {
    if (!this.isRunning) return;

    const rawDt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;
    const dt = Math.min(rawDt, 0.05); // Clamp frame delta to 50ms

    if (!this.isPaused) {
      if (this.hitstopTimer > 0) {
        this.hitstopTimer -= dt;
      } else {
        this.update(dt);
      }
    }

    this.render();

    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.globalTimer += dt;

    // Decay camera shake
    if (this.shakeAmount > 0) {
      this.shakeAmount = Math.max(0, this.shakeAmount - dt * 25);
    }

    // Spawn chickens periodically
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0 && !this.isWon && !this.isOver) {
      this.spawnChicken();
      this.spawnTimer = (this.currentLevelConfig.spawnInterval / 1000) * (0.8 + Math.random() * 0.4);
    }

    // Update chickens
    this.chickens.forEach(chk => {
      if (chk.scale < 1.0) {
        chk.scale = Math.min(1.0, chk.scale + dt * 4);
      }
      // Emit gentle steam particles
      if (chk.hotness > 0.3 && Math.random() < 0.25 && !chk.isSaved && !chk.isEaten) {
        this.particles.push({
          x: chk.x + (Math.random() - 0.5) * chk.radius,
          y: chk.y - chk.radius * 0.5,
          vx: (Math.random() - 0.5) * 15,
          vy: -Math.random() * 30 - 15,
          radius: Math.random() * 3 + 2,
          color: '#FEF9C3',
          alpha: 0.6,
          life: 0,
          maxLife: 0.8,
          type: 'STEAM'
        });
      }
    });

    // Update toys
    for (let i = this.toys.length - 1; i >= 0; i--) {
      const toy = this.toys[i];
      toy.duration -= dt;
      toy.x += toy.vx * dt;
      toy.y += toy.vy * dt;
      toy.vx *= 0.95;
      toy.vy *= 0.95;
      toy.angle += dt * 4;

      if (toy.duration <= 0) {
        this.toys.splice(i, 1);
      }
    }

    // Update Cats AI
    const availableChickens = this.chickens.filter(c => !c.isSaved && !c.isEaten && !c.isHeld);

    this.cats.forEach(cat => {
      cat.tailWiggle += dt * 6;

      // Handle Cat States
      switch (cat.state) {
        case 'IDLE': {
          cat.stateTimer -= dt;
          if (cat.stateTimer <= 0) {
            // Find a target chicken or toy
            if (this.toys.length > 0) {
              cat.state = 'DISTRACTED';
              cat.targetToyId = this.toys[0].id;
              cat.stateTimer = this.toys[0].duration;
            } else if (availableChickens.length > 0) {
              // Pick closest or highest-value chicken
              const target = availableChickens[Math.floor(Math.random() * availableChickens.length)];
              cat.targetChickenId = target.id;
              cat.state = 'STALKING';
              sound.playMeow('hungry');
            } else {
              cat.stateTimer = 0.8;
            }
          }
          break;
        }

        case 'STALKING': {
          // If a toy was tossed, immediately get distracted
          if (this.toys.length > 0) {
            cat.state = 'DISTRACTED';
            cat.targetToyId = this.toys[0].id;
            break;
          }

          const target = this.chickens.find(c => c.id === cat.targetChickenId && !c.isSaved && !c.isEaten);
          if (!target || target.isHeld) {
            cat.state = 'IDLE';
            cat.stateTimer = 0.5;
            cat.targetChickenId = null;
            break;
          }

          const dx = target.x - cat.x;
          const dy = target.y - cat.y;
          const dist = Math.hypot(dx, dy);
          cat.angle = Math.atan2(dy, dx);

          // If within strike range (~130px), enter TELEGRAPH windup!
          if (dist < 130) {
            cat.state = 'TELEGRAPH';
            cat.stateTimer = cat.telegraphDuration;
            cat.eyeGlow = 1;
            sound.playTelegraph();
          } else {
            // Slink towards target
            const moveDist = cat.speed * 0.55 * dt;
            cat.x += (dx / dist) * moveDist;
            cat.y += (dy / dist) * moveDist;
          }
          break;
        }

        case 'TELEGRAPH': {
          cat.stateTimer -= dt;
          cat.eyeGlow = 1 + Math.sin(this.globalTimer * 20) * 0.5;

          const target = this.chickens.find(c => c.id === cat.targetChickenId && !c.isSaved && !c.isEaten);
          if (!target || target.isHeld) {
            // Target was rescued just in time!
            cat.state = 'IDLE';
            cat.stateTimer = 0.6;
            cat.targetChickenId = null;
            cat.eyeGlow = 0;
            break;
          }

          cat.angle = Math.atan2(target.y - cat.y, target.x - cat.x);

          if (cat.stateTimer <= 0) {
            // POUNCE!
            cat.state = 'POUNCING';
            cat.pounceProgress = 0;
            cat.pounceStart = { x: cat.x, y: cat.y };
            cat.targetX = target.x;
            cat.targetY = target.y;
            sound.playMeow('curious');
          }
          break;
        }

        case 'POUNCING': {
          cat.pounceProgress += dt * 4.5;
          const t = Math.min(1, cat.pounceProgress);
          cat.x = cat.pounceStart.x + (cat.targetX - cat.pounceStart.x) * t;
          cat.y = cat.pounceStart.y + (cat.targetY - cat.pounceStart.y) * t;

          if (t >= 1) {
            // Check if chicken is still there
            const target = this.chickens.find(c => c.id === cat.targetChickenId && !c.isSaved && !c.isEaten && !c.isHeld);
            if (target) {
              cat.state = 'EATING';
              cat.eatTimer = 0.8;
              this.catEatChicken(cat, target);
            } else {
              // Missed!
              cat.state = 'IDLE';
              cat.stateTimer = 0.8;
            }
          }
          break;
        }

        case 'EATING': {
          cat.eatTimer -= dt;
          if (cat.eatTimer <= 0) {
            // Finished eating or ready to stalk again
            cat.state = 'IDLE';
            cat.stateTimer = 1.0;
            cat.targetChickenId = null;
          }
          break;
        }

        case 'DISTRACTED': {
          cat.stateTimer -= dt;
          const toy = this.toys.find(t => t.id === cat.targetToyId);
          if (toy) {
            const dx = toy.x - cat.x;
            const dy = toy.y - cat.y;
            const dist = Math.hypot(dx, dy);
            cat.angle = Math.atan2(dy, dx);
            if (dist > 30) {
              cat.x += (dx / dist) * cat.speed * 0.8 * dt;
              cat.y += (dy / dist) * cat.speed * 0.8 * dt;
            }
          }

          if (cat.stateTimer <= 0 || !toy) {
            cat.state = 'IDLE';
            cat.stateTimer = 0.5;
            cat.targetToyId = null;
          }
          break;
        }

        case 'RETREAT': {
          cat.stateTimer -= dt;
          // Run away from center
          const rect = this.canvas.getBoundingClientRect();
          const w = rect.width || window.innerWidth;
          const h = rect.height || window.innerHeight;
          const centerX = w * 0.5;
          const centerY = h * 0.5;

          const dx = cat.x - centerX;
          const dy = cat.y - centerY;
          const dist = Math.hypot(dx, dy) || 1;
          cat.x += (dx / dist) * cat.speed * 1.3 * dt;
          cat.y += (dy / dist) * cat.speed * 1.3 * dt;

          if (cat.stateTimer <= 0) {
            cat.state = 'IDLE';
            cat.stateTimer = 1.2;
          }
          break;
        }
      }
    });

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life += dt;
      ft.y += ft.vy * dt;
      ft.alpha = Math.max(0, 1 - ft.life / 1.0);

      if (ft.life >= 1.0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private catEatChicken(cat: Cat, chicken: Chicken) {
    chicken.bitesLeft--;
    sound.playCrunch();
    this.shakeAmount = 8;
    this.hitstopTimer = 0.05; // 50ms juicy hitstop

    // Breadcrumb particle burst
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x: chicken.x,
        y: chicken.y,
        vx: (Math.random() - 0.5) * 160,
        vy: (Math.random() - 0.5) * 160,
        radius: Math.random() * 3 + 1.5,
        color: '#D97706',
        alpha: 1,
        life: 0,
        maxLife: 0.5,
        type: 'CRUMB'
      });
    }

    if (chicken.type === 'HOT_WING') {
      // Cat ate spicy wings! Gets hiccup and flees!
      sound.playHiss();
      cat.state = 'RETREAT';
      cat.stateTimer = 3.2;
      this.addFloatingText("ঝাল লেগেছে! হায়রে!", cat.x, cat.y - cat.size, '#EF4444', 22);
      
      // Fire particles from cat mouth
      for (let i = 0; i < 10; i++) {
        this.particles.push({
          x: cat.x,
          y: cat.y,
          vx: (Math.random() - 0.5) * 80,
          vy: -Math.random() * 80 - 30,
          radius: Math.random() * 4 + 3,
          color: '#F97316',
          alpha: 1,
          life: 0,
          maxLife: 0.6,
          type: 'FIRE'
        });
      }
    }

    if (chicken.bitesLeft <= 0) {
      chicken.isEaten = true;
      this.stats.eatenCount++;
      this.stats.combo = 0; // reset combo

      this.addFloatingText("খেয়ে ফেললো! 🍗😿", chicken.x, chicken.y, '#EF4444', 20);

      // Check failure condition
      if (this.stats.eatenCount >= this.currentLevelConfig.maxAllowedEaten) {
        this.triggerGameOver();
      } else {
        this.notifyStats();
      }
    } else {
      this.addFloatingText("আধা খেলো! বাঁচাও!", chicken.x, chicken.y, '#F59E0B', 18);
    }
  }

  // Pure Canvas 2D Rendering
  private render() {
    const ctx = this.ctx;
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Apply Camera Shake
    if (this.shakeAmount > 0) {
      const shakeX = (Math.random() - 0.5) * this.shakeAmount;
      const shakeY = (Math.random() - 0.5) * this.shakeAmount;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Table Surface (Warm polished wood grain with checkered cloth border)
    this.renderTable(ctx, w, h);

    // 2. Draw Safe Basket / Hot-Pot Warmer
    this.renderSafeBasket(ctx);

    // 3. Draw Active Toys (Yarn ball, catnip)
    this.renderToys(ctx);

    // 4. Draw Chickens (on delicate serving plates)
    this.renderChickens(ctx);

    // 5. Draw Cats with expressive animations
    this.renderCats(ctx);

    // 6. Draw Particles
    this.renderParticles(ctx);

    // 7. Draw Floating Texts
    this.renderFloatingTexts(ctx);

    // 8. Draw Chef's Tongs / Interactive Hand cursor
    this.renderChefTongs(ctx);

    ctx.restore();
  }

  private renderTable(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Warm wood table background
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#582C12');
    gradient.addColorStop(0.5, '#451A03');
    gradient.addColorStop(1, '#381402');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Wood plank lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.lineWidth = 3;
    const plankHeight = 70;
    for (let y = plankHeight; y < h; y += plankHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Subtle table rim highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, w - 24, h - 24);

    // Cozy red & white checkered tablecloth banner along top and left edge
    ctx.save();
    const bannerSize = 32;
    for (let x = 0; x < w; x += bannerSize) {
      ctx.fillStyle = (Math.floor(x / bannerSize) % 2 === 0) ? '#DC2626' : '#FEF2F2';
      ctx.fillRect(x, 0, bannerSize, 12);
    }
    ctx.restore();
  }

  private renderSafeBasket(ctx: CanvasRenderingContext2D) {
    const b = this.safeBasket;

    ctx.save();
    // Soft drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;

    // Glowing warm rim for the safe plate
    const pulse = Math.sin(this.globalTimer * 4) * 0.15 + 0.85;
    ctx.strokeStyle = `rgba(34, 197, 94, ${pulse * 0.9})`;
    ctx.lineWidth = 4;

    // Outer safe plate
    const grad = ctx.createRadialGradient(
      b.x + b.width * 0.5, b.y + b.height * 0.5, 10,
      b.x + b.width * 0.5, b.y + b.height * 0.5, b.width * 0.5
    );
    grad.addColorStop(0, '#15803D');
    grad.addColorStop(0.85, '#166534');
    grad.addColorStop(1, '#14532D');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y, b.width, b.height, 24);
    ctx.fill();
    ctx.stroke();

    ctx.shadowColor = 'transparent';

    // Basket weave pattern lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(b.x + 8, b.y + 8, b.width - 16, b.height - 16);

    // Center icon & label
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 15px "Hind Siliguri", "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("নিরাপদ হট-পট", b.x + b.width * 0.5, b.y + b.height * 0.42);
    
    ctx.font = '12px "Outfit", sans-serif';
    ctx.fillStyle = '#86EFAC';
    ctx.fillText("SAFE BASKET", b.x + b.width * 0.5, b.y + b.height * 0.62);

    // Rescued count badge inside the basket
    ctx.fillStyle = '#FDE047';
    ctx.font = 'bold 18px "Outfit", sans-serif';
    ctx.fillText(`★ ${this.stats.rescuedCount}`, b.x + b.width * 0.5, b.y + b.height * 0.82);

    ctx.restore();
  }

  private renderChickens(ctx: CanvasRenderingContext2D) {
    this.chickens.forEach(chk => {
      if (chk.isSaved || chk.isEaten) return;

      ctx.save();
      ctx.translate(chk.x, chk.y);
      ctx.rotate(chk.angle);
      ctx.scale(chk.scale, chk.scale);

      // Serving plate beneath the chicken
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#F8FAFC';
      ctx.beginPath();
      ctx.arc(0, 0, chk.radius * 1.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Draw the chicken piece
      if (chk.type === 'DRUMSTICK') {
        // Golden fried drumstick
        // Bone
        ctx.fillStyle = '#F8FAFC';
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(chk.radius * 0.3, -4, chk.radius * 0.9, 8, 4);
        ctx.fill();
        ctx.stroke();

        // Bone knuckle knobs
        ctx.beginPath();
        ctx.arc(chk.radius * 1.15, -4, 4, 0, Math.PI * 2);
        ctx.arc(chk.radius * 1.15, 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Meat bulb
        const meatGrad = ctx.createRadialGradient(-chk.radius * 0.2, -chk.radius * 0.2, 4, 0, 0, chk.radius);
        meatGrad.addColorStop(0, '#F59E0B');
        meatGrad.addColorStop(0.7, '#D97706');
        meatGrad.addColorStop(1, '#92400E');
        ctx.fillStyle = meatGrad;
        ctx.beginPath();
        ctx.ellipse(-chk.radius * 0.2, 0, chk.radius * 0.9, chk.radius * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();

        // Crispy breading specks
        ctx.fillStyle = '#78350F';
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          ctx.arc(-chk.radius * 0.4 + i * 5, (i % 2 === 0 ? 4 : -4), 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (chk.type === 'HOT_WING') {
        // Spicy Fire Wing
        const wingGrad = ctx.createRadialGradient(0, 0, 3, 0, 0, chk.radius);
        wingGrad.addColorStop(0, '#EF4444');
        wingGrad.addColorStop(0.7, '#DC2626');
        wingGrad.addColorStop(1, '#7F1D1D');
        ctx.fillStyle = wingGrad;
        ctx.beginPath();
        ctx.moveTo(-chk.radius * 0.8, -chk.radius * 0.3);
        ctx.quadraticCurveTo(chk.radius * 0.4, -chk.radius * 0.8, chk.radius * 0.9, 0);
        ctx.quadraticCurveTo(chk.radius * 0.2, chk.radius * 0.8, -chk.radius * 0.6, chk.radius * 0.4);
        ctx.closePath();
        ctx.fill();

        // Chili pepper icon / spicy sparkle
        ctx.fillStyle = '#FEF08A';
        ctx.font = '10px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText("🌶️", 0, 4);
      } else if (chk.type === 'ROAST_CHICKEN') {
        // Whole Roasted Bird
        const roastGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, chk.radius * 1.1);
        roastGrad.addColorStop(0, '#F59E0B');
        roastGrad.addColorStop(0.75, '#B45309');
        roastGrad.addColorStop(1, '#78350F');
        ctx.fillStyle = roastGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, chk.radius * 0.95, chk.radius * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();

        // Two side wings/legs
        ctx.fillStyle = '#92400E';
        ctx.beginPath();
        ctx.ellipse(-chk.radius * 0.5, -chk.radius * 0.5, 12, 7, -0.4, 0, Math.PI * 2);
        ctx.ellipse(-chk.radius * 0.5, chk.radius * 0.5, 12, 7, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Parsley/Herb garnish
        ctx.fillStyle = '#22C55E';
        ctx.beginPath();
        ctx.arc(4, -4, 3, 0, Math.PI * 2);
        ctx.arc(-4, 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Nugget
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.roundRect(-chk.radius * 0.8, -chk.radius * 0.6, chk.radius * 1.6, chk.radius * 1.2, 8);
        ctx.fill();
      }

      // If held by player, draw golden selection glow
      if (chk.isHeld) {
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, chk.radius * 1.45, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  private renderCats(ctx: CanvasRenderingContext2D) {
    this.cats.forEach(cat => {
      ctx.save();
      ctx.translate(cat.x, cat.y);
      ctx.rotate(cat.angle);

      // Tail wiggling behind body
      ctx.save();
      const tailAngle = Math.sin(cat.tailWiggle) * 0.4;
      ctx.rotate(tailAngle);
      ctx.strokeStyle = cat.color;
      ctx.lineWidth = cat.size * 0.22;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(-cat.size * 0.6, 0);
      ctx.quadraticCurveTo(-cat.size * 1.1, Math.sin(cat.tailWiggle) * 15, -cat.size * 1.4, Math.cos(cat.tailWiggle) * 10);
      ctx.stroke();
      ctx.restore();

      // Cat body
      ctx.fillStyle = cat.color;
      ctx.beginPath();
      // Squash and stretch during telegraph or pounce
      const scaleX = cat.state === 'TELEGRAPH' ? 1.15 : cat.state === 'POUNCING' ? 1.25 : 1.0;
      const scaleY = cat.state === 'TELEGRAPH' ? 0.85 : cat.state === 'POUNCING' ? 0.85 : 1.0;
      ctx.scale(scaleX, scaleY);
      ctx.ellipse(0, 0, cat.size * 0.75, cat.size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stripes
      ctx.strokeStyle = cat.stripeColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-cat.size * 0.2, -cat.size * 0.45);
      ctx.lineTo(-cat.size * 0.1, -cat.size * 0.15);
      ctx.moveTo(cat.size * 0.1, -cat.size * 0.45);
      ctx.lineTo(cat.size * 0.15, -cat.size * 0.15);
      ctx.stroke();

      // Cat head (facing right relative to angle)
      ctx.fillStyle = cat.color;
      ctx.beginPath();
      ctx.arc(cat.size * 0.45, 0, cat.size * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Ears (pointy triangles)
      ctx.fillStyle = cat.stripeColor;
      // Left ear
      ctx.beginPath();
      ctx.moveTo(cat.size * 0.35, -cat.size * 0.35);
      ctx.lineTo(cat.size * 0.6, -cat.size * 0.7);
      ctx.lineTo(cat.size * 0.75, -cat.size * 0.25);
      ctx.closePath();
      ctx.fill();
      // Right ear
      ctx.beginPath();
      ctx.moveTo(cat.size * 0.35, cat.size * 0.35);
      ctx.lineTo(cat.size * 0.6, cat.size * 0.7);
      ctx.lineTo(cat.size * 0.75, cat.size * 0.25);
      ctx.closePath();
      ctx.fill();

      // Pink inner ear
      ctx.fillStyle = '#FDA4AF';
      ctx.beginPath();
      ctx.arc(cat.size * 0.55, -cat.size * 0.45, 3.5, 0, Math.PI * 2);
      ctx.arc(cat.size * 0.55, cat.size * 0.45, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      const eyeOffset = cat.size * 0.18;
      const eyeX = cat.size * 0.62;

      // Glow if targeting/telegraphing
      if (cat.eyeGlow > 0) {
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 12 * cat.eyeGlow;
      }

      ctx.fillStyle = cat.eyeGlow > 0 ? '#EF4444' : '#FDE047';
      ctx.beginPath();
      ctx.arc(eyeX, -eyeOffset, 5, 0, Math.PI * 2);
      ctx.arc(eyeX, eyeOffset, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = 'transparent';

      // Pupils (slit when hungry, big round when playing)
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      if (cat.state === 'DISTRACTED') {
        ctx.arc(eyeX + 1, -eyeOffset, 3.5, 0, Math.PI * 2);
        ctx.arc(eyeX + 1, eyeOffset, 3.5, 0, Math.PI * 2);
      } else {
        ctx.ellipse(eyeX + 1, -eyeOffset, 1.8, 4.5, 0, 0, Math.PI * 2);
        ctx.ellipse(eyeX + 1, eyeOffset, 1.8, 4.5, 0, 0, Math.PI * 2);
      }
      ctx.fill();

      // Cute Pink Nose (THE BOOP ZONE!)
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.moveTo(cat.size * 0.82, 0);
      ctx.lineTo(cat.size * 0.75, -3.5);
      ctx.lineTo(cat.size * 0.75, 3.5);
      ctx.closePath();
      ctx.fill();

      // Whiskers
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      // Top whiskers
      ctx.moveTo(cat.size * 0.72, -4);
      ctx.lineTo(cat.size * 0.95, -12);
      ctx.moveTo(cat.size * 0.72, -2);
      ctx.lineTo(cat.size * 1.0, -4);
      // Bottom whiskers
      ctx.moveTo(cat.size * 0.72, 4);
      ctx.lineTo(cat.size * 0.95, 12);
      ctx.moveTo(cat.size * 0.72, 2);
      ctx.lineTo(cat.size * 1.0, 4);
      ctx.stroke();

      // Cheeks blush
      ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
      ctx.beginPath();
      ctx.arc(cat.size * 0.65, -10, 4, 0, Math.PI * 2);
      ctx.arc(cat.size * 0.65, 10, 4, 0, Math.PI * 2);
      ctx.fill();

      // King Boss Crown if breed is BOSS_CHONK
      if (cat.breed === 'BOSS_CHONK') {
        ctx.fillStyle = '#FACC15';
        ctx.strokeStyle = '#CA8A04';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cat.size * 0.4, -14);
        ctx.lineTo(cat.size * 0.48, -24);
        ctx.lineTo(cat.size * 0.55, -16);
        ctx.lineTo(cat.size * 0.62, -24);
        ctx.lineTo(cat.size * 0.7, -14);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Telegraph warning badge or exclamation mark over cat head
      if (cat.state === 'TELEGRAPH') {
        ctx.save();
        ctx.rotate(-cat.angle); // Stay upright
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(0, -cat.size - 18, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText("!", 0, -cat.size - 18);
        ctx.restore();
      }

      ctx.restore();
    });
  }

  private renderToys(ctx: CanvasRenderingContext2D) {
    this.toys.forEach(toy => {
      ctx.save();
      ctx.translate(toy.x, toy.y);
      ctx.rotate(toy.angle);

      if (toy.type === 'YARN_BALL') {
        // Colorful yarn ball
        ctx.fillStyle = toy.color;
        ctx.beginPath();
        ctx.arc(0, 0, toy.radius, 0, Math.PI * 2);
        ctx.fill();

        // Wool strand lines
        ctx.strokeStyle = '#F472B6';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, toy.radius * 0.65, 0.4, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, toy.radius * 0.85, 2.5, Math.PI * 2.2);
        ctx.stroke();
      } else {
        // Catnip green leafy bundle
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.ellipse(0, 0, toy.radius, toy.radius * 0.6, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#34D399';
        ctx.beginPath();
        ctx.ellipse(2, -2, toy.radius * 0.7, toy.radius * 0.4, -0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D) {
    this.floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.font = `bold ${ft.size}px "Hind Siliguri", "Outfit", sans-serif`;
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  private renderChefTongs(ctx: CanvasRenderingContext2D) {
    // Render Chef's magical metal tongs hovering at cursor
    const x = this.cursorPos.x;
    const y = this.cursorPos.y;

    if (x <= 0 && y <= 0) return;

    ctx.save();
    ctx.translate(x, y);

    const isGrabbing = this.heldChicken !== null || this.cursorPos.isDown;
    const gripAngle = isGrabbing ? 0.08 : 0.25;

    // Metal tongs reflection
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    // Left arm of tongs
    ctx.save();
    ctx.rotate(-gripAngle);
    ctx.beginPath();
    ctx.moveTo(-10, -35);
    ctx.lineTo(-4, -5);
    ctx.lineTo(-12, 10);
    ctx.stroke();
    ctx.restore();

    // Right arm of tongs
    ctx.save();
    ctx.rotate(gripAngle);
    ctx.beginPath();
    ctx.moveTo(10, -35);
    ctx.lineTo(4, -5);
    ctx.lineTo(12, 10);
    ctx.stroke();
    ctx.restore();

    // Red rubber grip handle
    ctx.fillStyle = '#EF4444';
    ctx.beginPath();
    ctx.roundRect(-8, -48, 16, 18, 4);
    ctx.fill();

    ctx.restore();
  }
}
