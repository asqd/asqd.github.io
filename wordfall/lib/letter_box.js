class LetterBox extends Phaser.GameObjects.GameObject {
  /**
   * @param {Phaser.Scene} scene
   */
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
    return new Phaser.Display.Color()
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
    return new Phaser.Display.Color().random(30, 220)
  }

  static getRandomLetter() {
    const index = Math.floor(Math.random() * LetterBox.charactersLength)

    return LetterBox.characters.charAt(index)
  }

  get alpha() {
    return this.shape.alpha
  }

  set alpha(value) {
    this.shape.alpha = value
    this.text.alpha = value
  }

  get stokeShift() {
    return 3
  }

  get radius() {
    return this.size / 2 - this.stokeShift
  }

  get centerOffset() {
    return [0, -1]
  }

  delete() {
    this.alpha = 1
    this.scene.dict[this.letter] -= 1
    this.tweenAlpha(0, 400, () => this.destroy())
  }

  tweenAlpha(alpha, duration = 400, onComplete = () => {}) {
    this.scene.tweens.add({
      targets: [this.shape, this.text],
      alpha: alpha,
      ease: 'Linear',
      duration: duration,
      onComplete: onComplete
    })
  }

  select() {
    this.selected = true
    this.tweenAlpha(0.5)
  }

  unSelect() {
    this.selected = false
    this.tweenAlpha(1)
  }

  initContainer(x, y) {
    this.shape = this.scene.add.circle(0, 0, this.radius, this.color.darken(10).color)
    this.shape.setStrokeStyle(6, this.color.lighten(10).color)
    this.text = this.scene.add.text(
      0, 0,
      this.letter,
      LetterBox.textConfig,
    )

    Phaser.Display.Align.In.Center(this.text, this.shape, ...this.centerOffset);

    this.container = this.scene.add.container(x, y, [this.shape, this.text])
    this.container.setSize(this.size, this.size)
      .setInteractive()
  }

  initPhysics() {
    this.body = this.scene.matter.add.gameObject(this.container)
    this.body.setCircle()
      .setFriction(0.005, 0, 0)
      .setBounce(0.2)
      .setAngle(180 * Math.random() * 10)
  }
}
