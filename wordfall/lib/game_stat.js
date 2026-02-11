class GameStat extends Button {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, x, y, width, height, text) {
    super(scene, x, y, width, height)

    this.textContent = text
    this.initContainer()
  }

  static get textConfig() {
    return {
      ...UiConfig.UI_FONT_CONFIG,
      color: UiConfig.BLACK_COLOR
    }
  }

  get centerOffset() {
    return [0, -1]
  }

  initContainer() {
    this.shape = this.scene.add.rectangle(0, 0, this.width, this.height, UiConfig.WHITE_OBJECT_COLOR.darken(10).color)
    this.shape.setStrokeStyle(6, UiConfig.WHITE_OBJECT_COLOR.lighten(10).color)
    this.text = this.scene.add.text(
      0, 0,
      this.textContent,
      GameStat.textConfig,
    )

    const scale = this.width / this.text.width
    console.log(scale);
    this.text.setFontSize(GameStat.textConfig.fontSize * scale)

    Phaser.Display.Align.In.Center(this.text, this.shape, ...this.centerOffset);

    this.container = this.scene.add.container(this.x, this.y, [this.shape, this.text])
    this.container.setSize(this.width, this.height)
      .setInteractive()
  }
}
