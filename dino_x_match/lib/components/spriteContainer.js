class SpriteContainer extends Phaser.GameObjects.GameObject {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} scalable Scale options 
   * @param scalable.property Property "width" or "height"
   * @param scalable.size Size of scale property
  */
  constructor(scene, x, y, width, height, texture, frame, scalable) {
    super(scene)

    this.scene = scene
    this.width = width
    this.height = height
    this.x = x
    this.y = y
    this.frame = frame || 0
    this.texture = texture
    this.scalable = scalable
    this.initContainer()
  }

  initContainer() {
    this.sprite = this.scene.add.sprite(
      0, 0,
      this.texture
    )

    if (this.scalable) {
      const scale = this[this.scalable.property] / this.scalable.size
      this.sprite.setScale(scale)
      this.sprite.setDisplaySize(this.width, this.height)
    }

    this.container = this.scene.add.container(this.x, this.y, [this.sprite])
    this.container.setSize(this.width, this.height)
  }

  get centerOffset() {
    return [0, -1]
  }
}
