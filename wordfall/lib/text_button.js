class TextButton extends Button {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, x, y, width, height, text, fillColor, strokeColor) {
    super(scene, x, y, width, height)

    this.fillColor = fillColor || LetterBox.getRandomColor()
    this.strokeColor = strokeColor || this.fillColor
    this.textContent = text
    this.initContainer()
  }

  static get textConfig() {
    return {
      ...UiConfig.UI_FONT_CONFIG,
      color: '#fff'
    }
  }

  get centerOffset() {
    return [0, -1]
  }

  initContainer() {
    const adjustFactor = this.fillColor === this.strokeColorColor ? 10 : 0

    this.shape = this.scene.add.rectangle(0, 0, this.width, this.height, this.fillColor.darken(adjustFactor).color)
    this.shape.setStrokeStyle(6, this.strokeColor.lighten(adjustFactor).color)
    this.text = this.scene.add.text(
      0, 0,
      this.textContent,
      this.constructor.textConfig,
    )

    const scale = this.width / this.text.width
    this.text.setFontSize(this.constructor.textConfig.fontSize * scale)

    Phaser.Display.Align.In.Center(this.text, this.shape, ...this.centerOffset);

    this.container = this.scene.add.container(this.x, this.y, [this.shape, this.text])
    this.container.setSize(this.width, this.height)
      .setInteractive()
  }

  onPointerDown(callback, context = this) {
    this.container.on("pointerdown", callback, context)
  }
}
