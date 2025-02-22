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
    // Memuat aset dari folder assets
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
  }
  
  function create() {
    // Tambahkan latar belakang di tengah canvas (600, 400)
    this.add.image(600, 400, 'background');
  
    // --- FAN & API ---
    // Fan: posisi x:725, y:370
    fan = this.add.image(725, 370, 'fan');
    // Api burner dan pilot, awalnya tidak terlihat
    api_burner = this.add.image(600, 305, 'api_burner')
                    .setVisible(false)
                    .setScale(0.8);
    api_pilot  = this.add.image(616, 367, 'api_pilot')
                    .setVisible(false)
                    .setScale(0.8);
  
    // --- LAMPU ---
    lampPurge = this.add.image(865, 319, 'green_lamp_mati');
    lampHeater = this.add.image(932, 319, 'green_lamp_mati');
    redLamp    = this.add.image(998, 319, 'red_lamp_mati');
  
    // --- VALVES & ACTUATORS ---
    valve_main_up   = this.add.image(300, 453, 'valve_closed');
    valve_main_down = this.add.image(453, 453, 'valve_closed');
    valve_pilot_up   = this.add.image(367, 610, 'valve_closed');
    valve_pilot_down = this.add.image(548, 610, 'valve_closed');
    valve_blowdown_main  = this.add.image(370, 375, 'valve_open').setAngle(90);
    valve_blowdown_pilot = this.add.image(474, 562, 'valve_open').setAngle(90);
  
    // Set depth valve agar tampil di atas (depth paling atas)
    valve_main_up.setDepth(100);
    valve_main_down.setDepth(100);
    valve_pilot_up.setDepth(100);
    valve_pilot_down.setDepth(100);
    valve_blowdown_main.setDepth(100);
    valve_blowdown_pilot.setDepth(100);
  
    // Actuators untuk valve (4 buah normal)
    actuator_main_up    = this.add.image(300, 440, 'actuator');
    actuator_main_down  = this.add.image(453, 440, 'actuator');
    actuator_pilot_up   = this.add.image(367, 597, 'actuator');
    actuator_pilot_down = this.add.image(548, 597, 'actuator');
    // 2 buah actuator untuk valve blowdown (rotasi 90°)
    actuator_blowdown_main  = this.add.image(380, 375, 'actuator').setAngle(90);
    actuator_blowdown_pilot = this.add.image(490, 562, 'actuator').setAngle(90);
  
    // --- BUTTONS ---
    btnPurge = this.add.sprite(859, 395, 'button_green_up').setInteractive();
    btnLT    = this.add.sprite(903, 395, 'button_green_up').setInteractive();
    btnPilot = this.add.sprite(948, 395, 'button_green_up').setInteractive();
    btnMain  = this.add.sprite(995, 395, 'button_green_up').setInteractive();
    btnReset = this.add.sprite(960, 475, 'button_green_up').setInteractive();
    btnESD   = this.add.sprite(889, 475, 'button_red_up').setInteractive();
  
    // Tambahkan event untuk tombol
    btnPurge.on('pointerdown', () => { animateButton.call(this, btnPurge, 'purge'); });
    btnLT.on('pointerdown',    () => { animateButton.call(this, btnLT, 'lt'); });
    // Tambahkan event pointerup untuk tombol LT agar lampu mati saat dilepas
    btnLT.on('pointerup', () => { turnOffAllLamps.call(this); });
    btnPilot.on('pointerdown', () => { animateButton.call(this, btnPilot, 'pilot'); });
    btnMain.on('pointerdown',  () => { animateButton.call(this, btnMain, 'main'); });
    btnReset.on('pointerdown', () => { animateButton.call(this, btnReset, 'reset'); });
    btnESD.on('pointerdown',   () => { animateButton.call(this, btnESD, 'esd'); });
  }
  
  function update() {
    // Update tambahan jika diperlukan (misalnya pergerakan animasi fan secara manual)
  }
  
  // Fungsi untuk mengubah tampilan tombol (down/up) dan men-trigger sequence
  function animateButton(button, type) {
    // Ganti tekstur tombol ke versi "down"
    if (button.texture.key.indexOf('green') >= 0) {
      button.setTexture('button_green_down');
    } else {
      button.setTexture('button_red_down');
    }
    // Kembalikan ke "up" setelah 200ms
    this.time.delayedCall(200, () => {
      if (button.texture.key.indexOf('green') >= 0) {
        button.setTexture('button_green_up');
      } else {
        button.setTexture('button_red_up');
      }
    });
  
    // Trigger sequence berdasarkan tipe tombol dan kondisi state
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
  
  // --- SEQUENCE FUNCTIONS ---
  
  // 1. Purge: Animasi fan berputar selama 8 detik, lalu nyalakan lamp purge
  function startPurge() {
    state.purgeCompleted = false;
    this.tweens.add({
      targets: fan,
      angle: 360,
      duration: 800,
      repeat: 10,
      onComplete: () => { fan.angle = 0; }
    });
    this.time.delayedCall(8000, () => {
      lampPurge.setTexture('green_lamp_hidup');
      state.purgeCompleted = true;
    });
  }
  
  // 2. LT: Nyalakan semua lamp indikator
  function turnOnAllLamps() {
    lampPurge.setTexture('green_lamp_hidup');
    lampHeater.setTexture('green_lamp_hidup');
    redLamp.setTexture('red_lamp_hidup');
  }
  
  // Fungsi baru: Mematikan semua lamp (dipanggil saat tombol LT dilepas)
  function turnOffAllLamps() {
    lampPurge.setTexture('green_lamp_mati');
    lampHeater.setTexture('green_lamp_mati');
    redLamp.setTexture('red_lamp_mati');
  }
  
  // 3. Pilot: Setelah purge selesai, aktifkan jalur pilot
  function startPilot() {
    state.pilotActivated = true;
    // Animasi valve blowdown pilot (actuator bergerak ke kiri)
    this.tweens.add({
      targets: actuator_blowdown_pilot,
      x: actuator_blowdown_pilot.x - 10,
      duration: 500
    });
    valve_blowdown_pilot.setTexture('valve_closed');
  
    // Valve pilot upstream dan downstream: actuator bergerak, valve berubah ke open
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
  
    // Nyalakan api pilot dengan animasi flicker
    api_pilot.setVisible(true);
    this.tweens.add({
      targets: api_pilot,
      scale: { from: 0.8, to: 1 },
      duration: 300,
      yoyo: true,
      repeat: -1
    });
  }
  
  // 4. Main Burner: Setelah pilot aktif, aktifkan jalur main burner
  function startMainBurner() {
    state.mainBurnerActivated = true;
    // Valve blowdown main burner: actuator bergerak ke kanan
    this.tweens.add({
      targets: actuator_blowdown_main,
      x: actuator_blowdown_main.x + 10,
      duration: 500
    });
    valve_blowdown_main.setTexture('valve_closed');
  
    // Valve main burner upstream dan downstream: actuator bergerak ke atas
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
      onComplete: () => { valve_main_down.setTexture('valve_open'); }
    });
  
    // Nyalakan api burner dengan animasi flicker
    api_burner.setVisible(true);
    this.tweens.add({
      targets: api_burner,
      scale: { from: 0.8, to: 1 },
      duration: 300,
      yoyo: true,
      repeat: -1
    });
    // Setelah 5 detik, nyalakan lamp heater on
    this.time.delayedCall(5000, () => {
      lampHeater.setTexture('green_lamp_hidup');
    });
  }
  
  // 5. Reset: Kembalikan semua kondisi ke posisi awal sehingga sistem berjalan seperti restart
  function resetSystem() {
    // Kembalikan state ke awal
    state = { purgeCompleted: false, pilotActivated: false, mainBurnerActivated: false, esdActivated: false };
    // Resume semua tween yang dipause (jika sebelumnya ter-pause karena ESD)
    this.tweens.resumeAll();
    
    // Reset fan
    fan.angle = 0;
    
    // Matikan API
    api_burner.setVisible(false);
    api_pilot.setVisible(false);
    this.tweens.killTweensOf(api_burner);
    this.tweens.killTweensOf(api_pilot);
  
    // Reset valve ke kondisi awal
    valve_main_up.setTexture('valve_closed');
    valve_main_down.setTexture('valve_closed');
    valve_pilot_up.setTexture('valve_closed');
    valve_pilot_down.setTexture('valve_closed');
    valve_blowdown_main.setTexture('valve_open').setAngle(90);
    valve_blowdown_pilot.setTexture('valve_open').setAngle(90);
  
    // Reset posisi actuator ke posisi awal (sesuai dengan create())
    actuator_main_up.setPosition(300, 440);
    actuator_main_down.setPosition(453, 440);
    actuator_pilot_up.setPosition(367, 610);
    actuator_pilot_down.setPosition(548, 610);
    actuator_blowdown_main.setPosition(380, 375);
    actuator_blowdown_pilot.setPosition(470, 562);
  
    // Reset lamp indikator ke kondisi mati
    lampPurge.setTexture('green_lamp_mati');
    lampHeater.setTexture('green_lamp_mati');
    redLamp.setTexture('red_lamp_mati');
  }
  
  // 6. ESD: Hentikan semua animasi, matikan API, dan nyalakan lamp alarm
  function triggerESD() {
    state.esdActivated = true;
    this.tweens.pauseAll();
    // Matikan API
    api_burner.setVisible(false);
    api_pilot.setVisible(false);
    this.tweens.killTweensOf(api_burner);
    this.tweens.killTweensOf(api_pilot);
    // Nyalakan lamp alarm
    redLamp.setTexture('red_lamp_hidup');
  }
  