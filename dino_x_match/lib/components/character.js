class Character extends Phaser.GameObjects.Sprite {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame)
    scene.add.existing(this)

    this.setScale(3)
    this.setFlipX(true)
    this.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)

    this.walkAround()
  }

  walkAround() {
    this.tweenMove = this.scene.tweens.add({
      targets: this,
      props: {
        x: { value: 120, duration: 10000, flipX: true },
      },
      ease: Phaser.Math.Easing.Linear
      ,
      yoyo: true,
      repeat: -1,
    });

    this.tweenStep = this.scene.tweens.add({
      targets: this,
      angle: { start: -2, to: 2 },
      yoyo: true,
      repeat: -1,
      duration: 500
    });
  }

  stopWalking(){
    this.tweenMove.pause()
    this.tweenStep.pause()
  }

  onPointerDown(callback, context = this) {
    this.container.on("pointerdown", callback, context)
  }
}
