class IconButton extends Button {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, x, y, width, height, texture) {
    super(scene, x, y, width, height)

    this.texture = texture
    this.initContainer()
  }

  static loadAssets(scene) {
    const path = 'assets/buttons/'
    const extension = '.png'
    const frameConfig = { frameWidth: 102 }
    const spriteNames = ['btn_ok', 'btn_cancel']
    const spriteCodes = [54, 55]

    spriteCodes.forEach((value, index) => {
      scene.load.spritesheet(spriteNames[index], `${path}Asset ${value}flat_@2x${extension}`, frameConfig)
    })
  }

  get centerOffset() {
    return [0, -1]
  }

  initContainer() {
    this.shape = this.scene.add.rectangle(0, 0, this.width, this.height)
    // this.shape.setStrokeStyle(6, this.strokeColor.lighten(adjustFactor).color)
    this.sprite = this.scene.add.sprite(
      0, 0,
      this.texture,
    )

    const scale = this.width / this.sprite.width
    console.log(scale);
    this.sprite.setScale(scale)

    Phaser.Display.Align.In.Center(this.sprite, this.shape, ...this.centerOffset);

    this.container = this.scene.add.container(this.x, this.y, [this.shape, this.sprite])
    this.container.setSize(this.width, this.height)
      .setInteractive()
  }

  onPointerDown(callback, context = this) {
    this.container.on("pointerdown", callback, context)
  }
}
