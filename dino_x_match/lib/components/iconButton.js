class IconButton extends Button {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, x, y, width, height, texture, text=null, options={ fontSize: null, shadow: true }) {
    super(scene, x, y, width, height)

    this.texture = texture
    this.text = text
    this.fontSize = options.fontSize
    this.shadow = options.shadow
    this.fontOptions = { fontFamily: 'Silkscreen', fontSize: this.fontSize || 60 }
    this.initContainer()
  }

  static loadAssets(scene) {
    const path = 'assets/ui/'
    const extension = '.png'
    const frameConfig = { frameWidth: 359, frameHeight: 162 }
    const spriteNames = ['greenRectNormal']
    const spriteCodes = [54, 55]

    spriteNames.forEach((value, index) => {
      scene.load.spritesheet(spriteNames[index], `${path}${value}${extension}`, frameConfig)
    })
  }

  get centerOffset() {
    return [0, -3]
  }

  initContainer() {
    this.shape = this.scene.add.rectangle(0, 0, this.width, this.height)
    this.sprite = this.scene.add.sprite(
      0, 0,
      this.texture
      )
      
    const scale = this.width / this.sprite.width
    this.sprite.setScale(scale)
    this.sprite.setDisplaySize(this.width, this.height)
    if (this.shadow) this.sprite.preFX.addShadow(-3, -3, 0.006, 1, 0x333333, 10)

    Phaser.Display.Align.In.Center(this.sprite, this.shape, ...this.centerOffset);
    
    let content = [this.shape, this.sprite]

    if (this.text) {

      this.buttonText = this.scene.add.text(0, 0, this.text, { ...this.fontOptions });

      content.push(this.buttonText) 

      if (!this.fontSize) {
        const textScale = (this.width / 1.2) / this.buttonText.width
        this.buttonText.setFontSize(this.fontOptions.fontSize * textScale)
      }

      Phaser.Display.Align.In.Center(this.buttonText, this.sprite, ...this.centerOffset);
    }


    this.container = this.scene.add.container(this.x, this.y, content)
    this.container.setSize(this.width, this.height)
      .setInteractive()
  }

  onPointerDown(callback, context = this) {
    this.container.input.cursor = 'pointer'
    this.container.on("pointerdown", callback, context)
  }
}
