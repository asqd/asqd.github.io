class Cat extends Phaser.GameObjects.Sprite {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, x, y, texture, frame) {
    super(scene, x, y, texture, frame)
    scene.add.existing(this)
    this.setDepth(1)

    this.setState()

    this.play(this.state)
    this.setTextureFilter()
  }

  update() {
    if (this.scene.game.getTime() > this.stateTo) {
      this.setState()

      this.play(this.state)
      this.setTextureFilter()
    }
  }

  setState() {
    this.state = this.randomState()
    this.stateTo = this.scene.game.getTime() + this.randomDuration()
  }

  randomState() {
    return Phaser.Math.RND.pick(
      Object.values(Cat.states)
    )
  }

  randomDuration() {
    return Phaser.Math.RND.pick(
      [5000, 7000, 10000]
    )
  }

  setTextureFilter(filterMode = Phaser.Textures.FilterMode.NEAREST) {
    this.texture.setFilter(filterMode)
  }

  static get states() {
    return Object.freeze({
      WALK: 'walk',
      STRETCHING: 'stretching',
      SLEEPING: 'sleeping',
      SITTING: 'sitting',
      RUN: 'run',
      LICKING: 'licking',
      LAYING: 'laying',
      ITCH: 'itch',
      IDLE: 'idle',
    })
  }

  static loadAssets(scene) {
    const catPath = 'assets/cat_6/Cat-6-'
    const extension = '.png'
    const frameConfig = { frameWidth: 50 }


    // загружаем спрайты кота для всех состояний
    Object.values(Cat.states).forEach((state) => {
      scene.load.spritesheet(state, `${catPath}${state.capitalize()}${extension}`, frameConfig)
    })
  }

  static initAnims(scene) {
    // генерируем анимации кота для всех состояний
    Object.values(Cat.states).forEach((state) => {
      const repeat = state === 'laying' ? 0 : -1

      scene.anims.create({
        key: state,
        frames: scene.anims.generateFrameNumbers(state),
        frameRate: 8,
        repeat: repeat
      })
    })
  }
}
