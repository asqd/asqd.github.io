class Bound extends Phaser.GameObjects.GameObject {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, x, y, width, height, color) {
    super(scene)

    this.scene = scene
    this.width = width
    this.height = height
    this.color = color || Bound.greyColor
    this.x = x
    this.y = y
    this.initContainer()
  }

  static get greyColor() {
    return Phaser.Display.Color.HexStringToColor('#808080').color
  }

  static get matterStaticConfig() {
    return { isStatic: true }
  }
  
  initContainer() {
    this.shape = this.scene.add.rectangle(0, 0, this.width, this.height, this.color);
    this.container = this.scene.add.container(this.x, this.y, [this.shape])
    this.container.setSize(this.width, this.height)
      .setInteractive()
    this.body = this.scene.matter.add.gameObject(this.container, Bound.matterStaticConfig)
    // this.body.setRectangle()
  }
}
