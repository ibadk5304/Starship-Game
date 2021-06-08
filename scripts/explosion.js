class Explosion extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y) {
    x = scene.player.flipX == true ? x - 40 : x + 40;

    super(scene, x, y, "explosion");
    this.currentScene = scene;

    this.setScale(2);
    this.scene.add.existing(this);

    this.on("animationcomplete", this.cleanUp);

    this.play("explode_anim");
  }

  cleanUp() {
    this.destroy(true);
  }
}
