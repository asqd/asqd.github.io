class Button extends Phaser.GameObjects.GameObject {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, x, y, width, height) {
    super(scene)

    this.scene = scene
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    // this.initContainer()
  }

  get centerOffset() {
    return [0, -1]
  }

  onPointerDown(callback, context = this) {
    this.container.input.cursor = 'pointer'
    this.container.on("pointerdown", callback, context)
  }
}
