class LetterBox extends Phaser.GameObjects.GameObject {
  constructor(scene, x, y, size, color, letter) {
    super(scene)

    this.scene = scene
    this.size = size
    this.color = color || LetterBox.getRandomColor()
    this.letter = letter || LetterBox.getRandomLetter()
    this.scene.dict[letter] = (this.scene.dict[letter] || 0) + 1
    this.initContainer(x, y)
    this.initPhysics()
  }

  static get colorObject() {
    return COLOR_OBJECT
  }
  static get characters() {
    return CHARACTERS
  }
  static get charactersLength() {
    return CHARACTERS_LENGTH
  }

  static get textConfig() {
    return {
      ...FONT_CONFIG,
      color: '#fff'
    }
  }

  static getRandomColor() {
    return LetterBox.colorObject.random(30, 220)
  }

  static getRandomLetter() {
    const index = Math.floor(Math.random() * LetterBox.charactersLength)

    return LetterBox.characters.charAt(index)
  }

  get alpha() {
    this.shape.alpha
  }

  set alpha(value) {
    this.shape.alpha = value
    this.text.alpha = value
  }

  delete() {
    this.alpha = 1
    this.scene.dict[this.letter] -= 1
    this.scene.tweens.add({
      targets: [this.shape, this.text],
      alpha: 0,
      ease: 'Linear',
      duration: 400,
      onComplete: () => this.destroy()
    })

  }

  select() {
    this.selected = true
    this.scene.tweens.add({
      targets: [this.shape, this.text],
      alpha: 0.5,
      ease: 'Linear',
      duration: 400,
    })
  }

  unSelect() {
    this.selected = false
    this.scene.tweens.add({
      targets: [this.shape, this.text],
      alpha: 1,
      ease: 'Linear',
      duration: 400,
    })
  }

  initContainer(x, y) {
    this.shape = this.scene.add.circle(0, 0, this.size / 2, LetterBox.colorObject.color)
    this.text = this.scene.add.text(
      0, 0,
      this.letter,
      LetterBox.textConfig,
    )

    Phaser.Display.Align.In.Center(this.text, this.shape, 0, 4);

    this.container = this.scene.add.container(x, y, [this.shape, this.text])
    this.container.setSize(this.size, this.size)
      .setInteractive()
      .on("pointerdown", this.scene.writeWord, this)
  }

  initPhysics() {
    this.body = this.scene.matter.add.gameObject(this.container)
    this.body.setCircle()
      .setFriction(0.005, 0, 0)
      .setBounce(0.1)
      .setAngle(180 * Math.random() * 10)
  }
}
