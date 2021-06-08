/*
 * Ref: https://rexrainbow.github.io/phaser3-rex-notes/docs/site/virtualjoystick/
 */
class BaseScene extends Phaser.Scene {
  // static for game scrool
  static CURRENT_SCORE = 0;
  constructor() {
    super();
  }

  preload() {
    var progressBar = this.add.graphics();
    var progressBox = this.add.graphics();

    var width = this.cameras.main.width;
    var height = this.cameras.main.height;

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 30, 320, 50);

    var loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: "Loading...",
      style: {
        font: "22px monospace",
        fill: "#ffffff",
      },
    });

    loadingText.setOrigin(0.5, 0.5);

    var percentText = this.make.text({
      x: width / 2,
      y: height / 2 - 5,
      text: "0%",
      style: {
        font: "20px monospace",
        fill: "#ffffff",
      },
    });
    percentText.setOrigin(0.5, 0.5);

    var assetText = this.make.text({
      x: width / 2,
      y: height / 2 + 50,
      text: "",
      style: {
        font: "20px monospace",
        fill: "#ffffff",
      },
    });

    assetText.setOrigin(0.5, 0.5);

    this.load.on("progress", function (value) {
      percentText.setText(parseInt(value * 100) + "%");
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 20, 300 * value, 30);
    });

    this.load.on("fileprogress", function (file) {
      assetText.setText("Space Ship Game");
    });

    this.load.on("complete", function () {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
      assetText.destroy();
    });

    this.load.image("logo", "assets/tilesets/star2.png");
    // only for loading page delay
    for (let i = 0; i < 1000; i++) {
      this.load.image("logo" + i, "assets/tilesets/star2.png");
    }

    //game
    this.load.image("star", "assets/tilesets/star2.png");
    this.load.image("bigStar", "assets/tilesets/star3.png");
    this.load.image("ship", "assets/tilesets/shmup-ship2.png");
    this.load.spritesheet("face", "assets/tilesets/metalface78x92.png", {
      frameWidth: 78,
      frameHeight: 92,
    });
    this.load.spritesheet("laserbase", "assets/spritesheets/laserbase.png", {
      frameWidth: 48.5,
      frameHeight: 32,
    });
    this.load.spritesheet("lasers", "assets/spritesheets/lasers.png", {
      frameWidth: 4.1,
      frameHeight: 500,
    });
    this.load.spritesheet("beam", "assets/spritesheets/beamBlue.png", {
      frameWidth: 37,
      frameHeight: 13,
    });
    this.load.spritesheet("explosion", "assets/spritesheets/explosion.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.bitmapFont("pixelFont", "../assets/font/font.png", "../assets/font/font.xml");

    this.load.audio("audio_beam", ["assets/sounds/shoot.mp3", "assets/sounds/shoot.mp3"]);
    this.load.audio("audio_explosion", ["assets/sounds/explosion-2.mp3", "assets/sounds/explosion-2.mp3"]);
    this.load.audio("audio_pickup", ["assets/sounds/explosion.mp3", "assets/sounds/explosion.mp3"]);
    this.load.audio("music", ["assets/sounds/music.mp3", "assets/sounds/music.mp3"]);

    // load virtual joystick plugin
    let vjUrl =
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js";
    this.load.plugin("rexvirtualjoystickplugin", vjUrl, true);

    // load joystick image
    this.load.image("joystick-btm", "assets/spritesheets/joystick-btm.png");
    this.load.image("joystick-top", "assets/spritesheets/joystick-top.png");

    // load button image
    this.load.image("shoot-btn", "assets/spritesheets/gray-btn.png");
  }

  create() {
    //  The world is 3200 x 600 in size
    this.physics.world.setBounds(0, 0, gameSettings.spaceLength, config.height);
    this.cameras.main.setBounds(0, 0, gameSettings.spaceLength, config.height).setName("main");

    //  The miniCam is 35% width wide, so can display the whole world at a zoom of 0.2
    let cameraWidth = deviceWidth * 0.35;
    this.minimap = this.cameras
      .add(deviceWidth - cameraWidth - 10, 10, cameraWidth, 100)
      .setZoom(0.15)
      .setName("mini");
    this.minimap.setBackgroundColor(0x002244);
    this.minimap.scrollX = 1600;
    this.minimap.scrollY = 300;

    this.createStarfield();
    this.createLandscape();
    this.createAliens();
    this.createLasers();

    //Create animation
    //Beam animation
    this.anims.create({
      key: "beam_anim",
      frames: this.anims.generateFrameNumbers("beam", { start: 0, end: 1 }),
      frameRate: 20,
      repeat: -1,
    });

    this.anims.create({
      key: "explode_anim",
      frames: this.anims.generateFrameNumbers("explosion"),
      frameRate: 20,
      repeat: 0,
      hideOnComplete: true,
    });

    //  Add a player ship and camera follow
    this.player = this.physics.add
      .sprite(1600, deviceHeight / 2, "ship")
      .setMass(30)
      .setScale(horizontalScale, verticalScale);
    this.player.setCollideWorldBounds(true);

    this.cameras.main.startFollow(this.player, false, 0.2, 0.2);
    this.cursors = this.input.keyboard.createCursorKeys();

    //key assign for shooting
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // for virtual joystick
    let radious = 40;
    let joystickBtm = this.add.sprite(0, 0, "joystick-btm");
    let joystickTop = this.add.sprite(0, 0, "joystick-top");
    joystickBtm.displayWidth = radious * 2; //set the width of the sprite
    joystickBtm.scaleY = joystickBtm.scaleX; //scale evenly
    joystickTop.displayWidth = radious - 8; //set the width of the sprite
    joystickTop.scaleY = joystickTop.scaleX; //scale evenly

    this.joyStick = this.plugins.get("rexvirtualjoystickplugin").add(this, {
      x: deviceWidth - radious - 10,
      y: deviceHeight - radious - 10,
      radius: radious,
      base: joystickBtm,
      thumb: joystickTop,
      dir: 2,
      forceMin: 5,
    });

    // for virtual button
    let btnWidth = 50;
    let shootSprite = this.add
      .sprite(btnWidth / 2 + 10, deviceHeight - btnWidth / 2 - 20, "shoot-btn")
      .setInteractive();
    shootSprite.setOrigin(0.5, 0.5);
    shootSprite.setScrollFactor(0);
    shootSprite.displayWidth = btnWidth; //set the width of the sprite
    shootSprite.scaleY = shootSprite.scaleX; //scale evenly
    shootSprite.inputEnabled = true;
    shootSprite.on("pointerdown", this.shootBeam);

    //beams
    this.beamtiles = this.add.group();

    //overlap between player and enemies
    this.physics.add.overlap(this.player, this.enemies, this.hurtPlayer, null, this);

    //overlap between beam and enemies
    this.physics.add.overlap(this.beamtiles, this.enemies, this.hitEnemy, null, this);

    //overlap between player and enemies
    this.physics.add.overlap(this.player, this.laserEnemies, this.hurtPlayer, null, this);

    //need to check high score save in browser localStorage
    this.highScore = 0;
    if (localStorage.spaceshipScore !== undefined) {
      this.highScore = localStorage.spaceshipScore;
    }

    //going to initialize and show our score and level info
    let fontObject;

    if (deviceWidth < 400) {
      fontObject = {
        font: "15px Arial",
        fill: "#ffffff",
        align: "center",
      };
    } else if (deviceWidth < 600) {
      fontObject = {
        font: "20px Arial",
        fill: "#ffffff",
        align: "center",
      };
    } else {
      fontObject = {
        font: "25px Arial",
        fill: "#ffffff",
        align: "center",
      };
    }

    this.scoreText = this.add.text(15, 25, "SCORE: " + this.zeroPad(BaseScene.CURRENT_SCORE, 6), fontObject);
    this.scoreText.setScrollFactor(0);
    this.highScoreText = this.add.text(15, 50, "HIGH SCORE: " + this.zeroPad(this.highScore, 6), fontObject);
    this.highScoreText.setScrollFactor(0);

    this.beamSound = this.sound.add("audio_beam");
    this.explosionSound = this.sound.add("audio_explosion");
    this.pickupsound = this.sound.add("audio_pickup");

    this.music = this.sound.add("music");

    let musicConfig = {
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0,
    };

    this.music.play(musicConfig);
  }

  update() {
    //update faces's position
    let baseSpeed = 0.4;
    for (let i = 0; i < this.faces.length; i++) {
      let rndSpeed = Phaser.Math.Between(1, 10);

      if (i < 5) {
        this.moveShip(this.faces[i], baseSpeed * rndSpeed);
      } else {
        this.moveShip(this.faces[i], -(baseSpeed * rndSpeed));
      }
    }

    // Control player moving
    this.controlPlayerMoving();

    // And this camera is 300px wide, so -150
    this.minimap.scrollX = Phaser.Math.Clamp(this.player.x - (deviceWidth * 0.35) / 2, deviceHeight, 2300);

    //beam update
    for (let i = 0; i < this.beamtiles.getChildren().length; i++) {
      let beam = this.beamtiles.getChildren()[i];
      beam.update();
    }
  }

  // Control player moving
  controlPlayerMoving() {
    // for virtual joystick moving
    let cursorKeys = this.joyStick.createCursorKeys();

    //check the keyboard(space) event
    if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
      this.shootBeamWithSpacekey();
    }

    // for keyboard
    if (this.cursors.left.isDown || cursorKeys["left"].isDown) {
      //x-axis
      this.player.setVelocityX(-gameSettings.playerSpeed);
      this.player.flipX = true;
    } else if (this.cursors.right.isDown || cursorKeys["right"].isDown) {
      this.player.setVelocityX(gameSettings.playerSpeed);
      this.player.flipX = false;
    }

    if (this.cursors.up.isDown || cursorKeys["up"].isDown) {
      //y-axis
      this.player.setVelocityY(-gameSettings.playerSpeed);
    } else if (this.cursors.down.isDown || cursorKeys["down"].isDown) {
      this.player.setVelocityY(gameSettings.playerSpeed);
    }
  }

  // Create stars in background
  createStarfield() {
    //  Starfield background

    //  Note the scrollFactor values which give them their 'parallax' effect

    let group = this.add.group({ key: "star", frameQuantity: 256 });

    group.createMultiple({ key: "bigStar", frameQuantity: 32 });

    let rect = new Phaser.Geom.Rectangle(0, 0, gameSettings.spaceLength, 550);

    Phaser.Actions.RandomRectangle(group.getChildren(), rect);

    group.children.iterate(function (child, index) {
      let sf = Math.max(0.3, Math.random());

      if (child.texture.key === "bigStar") {
        sf = 0.2;
      }

      child.setScrollFactor(sf);

      this.minimap.ignore(child);
    }, this);
  }

  // Create a land in background
  createLandscape() {
    //  Draw a random 'landscape'

    let landscape = this.add.graphics();

    landscape.fillStyle(0x008800, 1);
    landscape.lineStyle(2, 0x00ff00, 1);

    landscape.beginPath();

    let maxY = deviceHeight - deviceHeight * 0.1;
    let minY = deviceHeight - deviceHeight * 0.3;

    let x = 0;
    let y = maxY;
    let range = 0;
    let up = true;

    landscape.moveTo(0, deviceHeight);
    landscape.lineTo(0, deviceHeight * 0.9);

    do {
      //  How large is this 'side' of the mountain?
      range = Phaser.Math.Between(20, 100);

      if (up) {
        y = Phaser.Math.Between(y, minY);
        up = false;
      } else {
        y = Phaser.Math.Between(y, maxY);
        up = true;
      }

      landscape.lineTo(x + range, y);

      x += range;
    } while (x < 3100);

    landscape.lineTo(gameSettings.spaceLength, maxY);
    landscape.lineTo(gameSettings.spaceLength, config.height);
    landscape.closePath();

    landscape.strokePath();
    landscape.fillPath();
  }

  // Create face aliens
  createAliens() {
    // Add ememies
    this.enemies = this.physics.add.group();

    //  Create some random aliens
    const config = {
      key: "metaleyes",
      frames: this.anims.generateFrameNumbers("face", { start: 0, end: 3 }),
      frameRate: 20,
      repeat: -1,
    };

    this.anims.create(config);

    this.faces = [];
    for (let i = 0; i < 10; i++) {
      let x = Phaser.Math.Between(100, 3100);
      let y = Phaser.Math.Between(50, 500);

      this.faces.push(
        this.physics.add
          .sprite(x, y, "face")
          .play("metaleyes")
          .setMass(1)
          .setScale(horizontalScale / 2, verticalScale / 2)
      );

      const direction = Math.random() > 0.5 ? -1 : 1;
      this.faces[i].setVelocity(Phaser.Math.Between(1, 5) * direction, Phaser.Math.Between(1, 5) * direction);

      this.enemies.add(this.faces[i]);
    }
  }

  // Create laser enemies
  createLasers() {
    // Add ememies
    this.laserEnemies = this.physics.add.group();

    //Laser base animation
    this.anims.create({
      key: "laser_anim",
      frames: this.anims.generateFrameNumbers("lasers", { start: 0, end: 8 }),
      frameRate: 20,
      repeat: -1,
    });

    //Laser base animation
    this.anims.create({
      key: "laserbase_anim",
      frames: this.anims.generateFrameNumbers("laserbase", {
        start: 0,
        end: 3,
      }),
      frameRate: 20,
      repeat: -1,
    });

    this.lasers = [];

    //Add Laser Bases & Beams
    for (let i = 0; i < 4; i++) {
      let laserbase = this.add.sprite(400 + i * 800, 50 / 2, "laserbase");
      laserbase.play("laserbase_anim");
      laserbase.setInteractive();

      let laserLength = Phaser.Math.Between(deviceHeight * 0.4, deviceHeight * 0.8);
      this.lasers.push(this.add.sprite(400 + i * 800, (deviceHeight - 20) / 2, "lasers"));
      this.lasers[i].play("laser_anim");
      this.lasers[i].setInteractive();
      this.lasers[i].displayHeight = laserLength;

      this.laserEnemies.add(this.lasers[i]);
    }
  }

  shootBeam() {
    if (this.scene.player.active) {
      new Beam(this.scene);
      this.scene.beamSound.play();

      console.log("shoot--->");
    }
  }

  shootBeamWithSpacekey() {
    if (this.player.active) {
      new Beam(this);
      this.beamSound.play();

      console.log("shoot with spacekey--->");
    }
  }

  //about ships moving
  moveShip(ship, speed) {
    ship.x += speed;

    //reposition ships
    if (ship.x < 32 || ship.x > gameSettings.spaceLength - 32) {
      this.resetShipPos(ship);
    }
  }

  resetShipPos(ship) {
    ship.x = Phaser.Math.Between(100, 3100);
    ship.y = Phaser.Math.Between(50, deviceHeight - 50);
  }

  destroyShip(pointer, gameobject) {
    gameobject.setTexture("explosion");
    gameobject.play("explode");
  }

  hurtPlayer(player, enemy) {
    if (enemy.texture.key !== "lasers") {
      this.resetShipPos(enemy);
    }

    if (this.player.alpha < 1) {
      return;
    }

    new Explosion(this, player.x, player.y);

    player.disableBody(true, true);

    //check to see if we have high score
    if (localStorage.spaceshipScore === undefined || localStorage.spaceshipScore < BaseScene.CURRENT_SCORE) {
      localStorage.spaceshipScore = BaseScene.CURRENT_SCORE;
      let scoreFormated = this.zeroPad(localStorage.spaceshipScore, 6);
      this.highScoreText.text = "HIGH SCORE: " + scoreFormated;
      console.log("New high score achieved!");
    }

    // reset current score
    BaseScene.CURRENT_SCORE = 0;
    let scoreFormated = this.zeroPad(BaseScene.CURRENT_SCORE, 6);
    this.scoreText.text = "SCORE: " + scoreFormated;

    this.pickupsound.play();
    this.time.addEvent({
      delay: 1000,
      callback: this.resetPlayer,
      callbackScope: this,
      loop: false,
    });
  }

  hitEnemy(projectile, enemy) {
    let explosion = new Explosion(this, enemy.x, enemy.y);

    projectile.destroy();
    this.resetShipPos(enemy);

    BaseScene.CURRENT_SCORE += 15;

    let scoreFormated = this.zeroPad(BaseScene.CURRENT_SCORE, 6);
    this.scoreText.text = "SCORE: " + scoreFormated;

    this.explosionSound.play();
  }

  resetPlayer() {
    let x = gameSettings.spaceLength / 2;
    let y = deviceHeight / 2 - 64;

    this.player.enableBody(true, x, y, true, true);
    this.player.alpha = 0.5;

    let tween = this.tweens.add({
      targets: this.player,
      y: config.height / 2,
      ease: "Power1",
      duration: 1500,
      repeat: 0,
      onComplete: function () {
        this.player.alpha = 1;
      },
      callbackScope: this,
    });
  }

  zeroPad(number, size) {
    let stringNumber = String(number);
    while (stringNumber.length < (size || 2)) {
      stringNumber = "0" + stringNumber;
    }
    return stringNumber;
  }
}
