// Variabel global untuk state dan objek–objek penting
let state = {
  purgeCompleted: false,
  pilotActivated: false,
  mainBurnerActivated: false,
  esdActivated: false
};

let fan, api_burner, api_pilot;
let lampPurge, lampHeater, redLamp;
let valve_main_up, valve_main_down, valve_pilot_up, valve_pilot_down;
let valve_blowdown_main, valve_blowdown_pilot;
let actuator_main_up, actuator_main_down, actuator_pilot_up, actuator_pilot_down;
let actuator_blowdown_main, actuator_blowdown_pilot;
let btnPurge, btnLT, btnPilot, btnMain, btnReset, btnESD;
let windEmitter;        // Efek hembusan angin
let fireSparkEmitter;   // Efek percikan api main burner
let fanTween = null;    // Tween rotasi fan

// Konfigurasi game Phaser dengan canvas 1200 x 800
const config = {
  type: Phaser.AUTO,
  width: 1200,
  height: 800,
  parent: 'game-container',
  backgroundColor: "#333",
  scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('background', 'assets/background.png');
  this.load.image('actuator', 'assets/actuator.png');
  this.load.image('api_burner', 'assets/api_burner.png');
  this.load.image('api_pilot', 'assets/api_pilot.png');
  this.load.image('button_green_up', 'assets/button_green_up.png');
  this.load.image('button_green_down', 'assets/button_green_down.png');
  this.load.image('button_red_up', 'assets/button_red_up.png');
  this.load.image('button_red_down', 'assets/button_red_down.png');
  this.load.image('fan', 'assets/fan.png');
  this.load.image('green_lamp_hidup', 'assets/green_lamp_hidup.png');
  this.load.image('green_lamp_mati', 'assets/green_lamp_mati.png');
  this.load.image('red_lamp_hidup', 'assets/red_lamp_hidup.png');
  this.load.image('red_lamp_mati', 'assets/red_lamp_mati.png');
  this.load.image('valve_closed', 'assets/valve_closed.png');
  this.load.image('valve_open', 'assets/valve_open.png');
  
  let graphics = this.make.graphics({ x: 0, y: 0, add: false });
  graphics.fillStyle(0xffa500, 1);
  graphics.fillCircle(4, 4, 4);
  graphics.generateTexture('particle', 8, 8);
}

function create() {
  this.add.image(600, 400, 'background');
  fan = this.add.image(727, 370, 'fan');
  api_burner = this.add.image(600, 305, 'api_burner').setVisible(false).setScale(0.8);
  api_pilot  = this.add.image(616, 367, 'api_pilot').setVisible(false).setScale(0.8);

  lampPurge = this.add.image(865, 319, 'green_lamp_mati');
  lampHeater = this.add.image(932, 319, 'green_lamp_mati');
  redLamp    = this.add.image(998, 319, 'red_lamp_mati');

  valve_main_up   = this.add.image(300, 453, 'valve_closed').setDepth(100);
  valve_main_down = this.add.image(453, 453, 'valve_closed').setDepth(100);
  valve_pilot_up  = this.add.image(367, 610, 'valve_closed').setDepth(100);
  valve_pilot_down = this.add.image(548, 610, 'valve_closed').setDepth(100);
  valve_blowdown_main  = this.add.image(370, 375, 'valve_open').setAngle(90).setDepth(100);
  valve_blowdown_pilot = this.add.image(474, 562, 'valve_open').setAngle(90).setDepth(100);

  actuator_main_up    = this.add.image(300, 440, 'actuator');
  actuator_main_down  = this.add.image(453, 440, 'actuator');
  actuator_pilot_up   = this.add.image(367, 597, 'actuator');
  actuator_pilot_down = this.add.image(548, 597, 'actuator');
  actuator_blowdown_main  = this.add.image(388, 375, 'actuator').setAngle(90);
  actuator_blowdown_pilot = this.add.image(492, 562, 'actuator').setAngle(90);

  btnPurge = this.add.sprite(859, 395, 'button_green_up').setInteractive();
  btnLT    = this.add.sprite(903, 395, 'button_green_up').setInteractive();
  btnPilot = this.add.sprite(948, 395, 'button_green_up').setInteractive();
  btnMain  = this.add.sprite(995, 395, 'button_green_up').setInteractive();
  btnReset = this.add.sprite(960, 475, 'button_green_up').setInteractive();
  btnESD   = this.add.sprite(889, 475, 'button_red_up').setInteractive();

  btnPurge.on('pointerdown', () => { animateButton.call(this, btnPurge, 'purge'); });
  btnLT.on('pointerdown', () => { animateButton.call(this, btnLT, 'lt'); });
  btnLT.on('pointerup', () => { turnOffAllLamps.call(this); });
  btnPilot.on('pointerdown', () => { animateButton.call(this, btnPilot, 'pilot'); });
  btnMain.on('pointerdown', () => { animateButton.call(this, btnMain, 'main'); });
  btnReset.on('pointerdown', () => { animateButton.call(this, btnReset, 'reset'); });
  btnESD.on('pointerdown', () => { animateButton.call(this, btnESD, 'esd'); });
  
  let windAngle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(fan.x, fan.y, api_burner.x, api_burner.y));
  windEmitter = this.add.particles('particle').createEmitter({
    x: fan.x,
    y: fan.y,
    angle: windAngle,
    speed: { min: 150, max: 250 },
    lifespan: 600,
    quantity: 2,
    scale: { start: 0.3, end: 0 },
    frequency: 300,
    blendMode: 'MULTIPLY'
  });
}

function update() {
  if (windEmitter) {
    windEmitter.setPosition(fan.x, fan.y);
  }
}

function animateButton(button, type) {
  if (button.texture.key.indexOf('green') >= 0) {
    button.setTexture('button_green_down');
  } else {
    button.setTexture('button_red_down');
  }
  this.time.delayedCall(200, () => {
    if (button.texture.key.indexOf('green') >= 0) {
      button.setTexture('button_green_up');
    } else {
      button.setTexture('button_red_up');
    }
  });

  if (type === 'purge' && !state.purgeCompleted && !state.esdActivated) {
    startPurge.call(this);
  } else if (type === 'lt' && !state.esdActivated) {
    turnOnAllLamps.call(this);
  } else if (type === 'pilot' && state.purgeCompleted && !state.pilotActivated && !state.esdActivated) {
    startPilot.call(this);
  } else if (type === 'main' && state.purgeCompleted && state.pilotActivated && !state.mainBurnerActivated && !state.esdActivated) {
    startMainBurner.call(this);
  } else if (type === 'reset') {
    resetSystem.call(this);
  } else if (type === 'esd') {
    triggerESD.call(this);
  }
}

function startPurge() {
  state.purgeCompleted = false;
  this.tweens.add({
    targets: fan,
    angle: fan.angle + 360,
    duration: 800,
    repeat: 10,
    ease: 'Linear'
  });
  this.time.delayedCall(8000, () => {
    lampPurge.setTexture('green_lamp_hidup');
    state.purgeCompleted = true;
    if (windEmitter) {
      windEmitter.stop();
    }
    startSlowFan.call(this);
  });
}

function startSlowFan() {
  if (fanTween) {
    fanTween.remove();
    fanTween = null;
  }
  fanTween = this.tweens.add({
    targets: fan,
    angle: fan.angle + 360,
    duration: 20000,
    repeat: -1,
    ease: 'Linear'
  });
}

function turnOnAllLamps() {
  lampPurge.setTexture('green_lamp_hidup');
  lampHeater.setTexture('green_lamp_hidup');
  redLamp.setTexture('red_lamp_hidup');
}

function turnOffAllLamps() {
  lampPurge.setTexture('green_lamp_mati');
  lampHeater.setTexture('green_lamp_mati');
  redLamp.setTexture('red_lamp_mati');
}

function startPilot() {
  state.pilotActivated = true;
  this.tweens.add({
    targets: actuator_blowdown_pilot,
    x: actuator_blowdown_pilot.x - 7,
    duration: 500
  });
  valve_blowdown_pilot.setTexture('valve_closed');
  this.tweens.add({
    targets: actuator_pilot_up,
    y: actuator_pilot_up.y - 10,
    duration: 500,
    onComplete: () => { valve_pilot_up.setTexture('valve_open'); }
  });
  this.tweens.add({
    targets: actuator_pilot_down,
    y: actuator_pilot_down.y - 10,
    duration: 500,
    onComplete: () => { valve_pilot_down.setTexture('valve_open'); }
  });
  api_pilot.setVisible(true);
  this.tweens.add({
    targets: api_pilot,
    scale: { from: 0.8, to: 1 },
    duration: 300,
    yoyo: true,
    repeat: -1
  });
}

function startMainBurner() {
  state.mainBurnerActivated = true;
  this.tweens.add({
    targets: actuator_blowdown_main,
    x: actuator_blowdown_main.x - 7,
    duration: 500
  });
  valve_blowdown_main.setTexture('valve_closed');
  this.tweens.add({
    targets: actuator_main_up,
    y: actuator_main_up.y - 10,
    duration: 500,
    onComplete: () => { valve_main_up.setTexture('valve_open'); }
  });
  this.tweens.add({
    targets: actuator_main_down,
    y: actuator_main_down.y - 10,
    duration: 500,
    onComplete: () => { 
      valve_main_down.setTexture('valve_open'); 
      // Nyalakan lampu heater setelah semua valve terbuka dan api menyala
      lampHeater.setTexture('green_lamp_hidup');
    }
  });
  api_burner.setVisible(true);
  this.tweens.add({
    targets: api_burner,
    scale: { from: 0.9, to: 1 },
    duration: 300,
    yoyo: true,
    repeat: -1
  });
  fireSparkEmitter = this.add.particles('particle').createEmitter({
    x: api_burner.x,
    y: api_burner.y,
    speed: { min: 150, max: 250 },
    angle: { min: 240, max: 300 },
    lifespan: 400,
    frequency: 50,
    quantity: 5,
    scale: { start: 1, end: 0 },
    blendMode: 'ADD'
  });
}

function resetSystem() {
  state = { purgeCompleted: false, pilotActivated: false, mainBurnerActivated: false, esdActivated: false };
  if (fanTween) {
    fanTween.remove();
    fanTween = null;
  }
  this.tweens.resumeAll();
  fan.angle = 0;
  api_burner.setVisible(false);
  api_pilot.setVisible(false);
  this.tweens.killTweensOf(api_burner);
  this.tweens.killTweensOf(api_pilot);
  if (fireSparkEmitter) {
    fireSparkEmitter.stop();
    fireSparkEmitter.remove();
    fireSparkEmitter = null;
  }
  valve_main_up.setTexture('valve_closed');
  valve_main_down.setTexture('valve_closed');
  valve_pilot_up.setTexture('valve_closed');
  valve_pilot_down.setTexture('valve_closed');
  valve_blowdown_main.setTexture('valve_open').setAngle(90);
  valve_blowdown_pilot.setTexture('valve_open').setAngle(90);
  actuator_main_up.setPosition(300, 440);
  actuator_main_down.setPosition(453, 440);
  actuator_pilot_up.setPosition(367, 597);
  actuator_pilot_down.setPosition(548, 597);
  actuator_blowdown_main.setPosition(388, 375);
  actuator_blowdown_pilot.setPosition(492, 562);
  lampPurge.setTexture('green_lamp_mati');
  lampHeater.setTexture('green_lamp_mati');
  redLamp.setTexture('red_lamp_mati');
  
  let windAngle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(fan.x, fan.y, api_burner.x, api_burner.y));
  windEmitter = game.scene.scenes[0].add.particles('particle').createEmitter({
    x: fan.x,
    y: fan.y,
    angle: windAngle,
    speed: { min: 150, max: 250 },
    lifespan: 600,
    quantity: 2,
    scale: { start: 0.3, end: 0 },
    frequency: 300,
    blendMode: 'MULTIPLY'
  });
}

function triggerESD() {
  state.esdActivated = true;
  this.tweens.pauseAll();
  if (fanTween) {
    fanTween.remove();
    fanTween = null;
  }
  api_burner.setVisible(false);
  api_pilot.setVisible(false);
  this.tweens.killTweensOf(api_burner);
  this.tweens.killTweensOf(api_pilot);
  redLamp.setTexture('red_lamp_hidup');
}
