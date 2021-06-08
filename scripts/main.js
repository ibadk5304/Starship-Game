//IIFE - script at bottom
(() => {
  // put our code here - safe from global context
  let baseCanvasWidth = 800;
  let baseCanvasHeight = 600;
  let deviceWidth = window.innerWidth;
  let deviceHeight = window.innerHeight;
  let horizontalScale = deviceWidth / baseCanvasWidth;
  let verticalScale = deviceHeight / baseCanvasHeight;

  // set up our game config
  let config = {
    type: Phaser.AUTO,
    width: deviceWidth,
    height: deviceHeight,
    backgroundColor: "#2d2d2d",
    parent: "spaceship",
    pixelArt: true,
    physics: {
      default: "arcade",
      arcade: {
        gravity: {
          x: 0,
          y: 0,
        },
        enableSleeping: true,
        debug: false,
      },
    },

    scene: [Scene1],
    input: {
      activePointers: 3, // 2 is default for mouse + pointer, +1 is required for dual touch
    },
  };

  let gameSettings = {
    playerSpeed: 200,
    beamSpeed: 250,
    spaceLength: 3200,
  };

  let game = new Phaser.Game(config);

  //add global
  window.config = config;
  window.game = game;
  window.gameSettings = gameSettings;
  window.deviceWidth = deviceWidth;
  window.deviceHeight = deviceHeight;
  window.horizontalScale = horizontalScale;
  window.verticalScale = verticalScale;
})();
