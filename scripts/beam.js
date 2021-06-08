class Beam extends Phaser.GameObjects.Sprite {
  constructor(scene) {
    // console.log(scene);
    var x = scene.player.flipX == true ? scene.player.x - 40 : scene.player.x + 40;
    var y = scene.player.y;

    super(scene, x, y, "beam");
    scene.add.existing(this);

    this.play("beam_anim");
    scene.physics.world.enableBody(this);
    if (scene.player.flipX == true) {
      this.body.velocity.x = -gameSettings.beamSpeed;
    } else {
      this.body.velocity.x = gameSettings.beamSpeed;
    }

    scene.beamtiles.add(this);
  }

  update() {
    if (this.x < 32 || this.x > 3168) {
      this.destroy();
    }
  }
}
