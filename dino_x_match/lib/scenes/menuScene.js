class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene')
    this.fadeDuration = 500
  }

  fadeOutToMode(duration, gameMode) {
    this.cameras.main.fadeOut(duration)
    this.time.delayedCall(duration, () => this.scene.start('GameScene', { gameMode: gameMode }))
  }

  fadeOutToScene(duration, sceneName) {
    this.cameras.main.fadeOut(duration)
    this.time.delayedCall(duration, () => this.scene.start(sceneName))
  }

  preload() {
    this.cameras.main.fadeIn(this.fadeDuration)
    this.load.image('menu_bg', 'assets/sprites/menu_bg.png');
    this.load.image('collection_btn', 'assets/sprites/g2007.png');
    this.load.spritesheet("dino", "assets/sprites/dino.png", { frameWidth: 46, frameHeight: 38 });
    IconButton.loadAssets(this)
  }

  create() {
    let bg = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'menu_bg')
    bg.setAlpha(0.9)
    this.cameras.main.fadeIn(this.fadeDuration)
    const fontOptions = {
      fontFamily: 'Silkscreen', fontSize: 70,
      color: '#6BE26D', stroke: "#ffffff", strokeThickness: 5,
      shadow: { stroke: 2, offsetX: 3, offsetY: 3 }
    }

    this.titleText = this.add.text(20, 100, 'Приключения', fontOptions);
    this.titleText = this.add.text(this.game.config.width - 370, 170, 'Тотошки', fontOptions);

    this.dino = new Character(this, this.game.config.width - 120, this.game.config.height - 80, "dino", 0)

    let classicalModeButton = new IconButton(this, this.game.config.width / 2, this.game.config.height / 2.5, 400, 100, 'greenRectNormal', 'Классика')

    let timeAttackButton = new IconButton(this, this.game.config.width / 2, this.game.config.height / 2.5 + 120, 400, 100, 'greenRectNormal', 'На время')

    let movesAttackButton = new IconButton(this, this.game.config.width / 2, this.game.config.height / 2.5 + 240, 400, 100, 'greenRectNormal', 'На ходы')

    // Сделать через компонент IconButton
    // Включить после реализации накопления валюты для покупки коробок
    // let collectionButton = this.add.image(this.game.config.width / 1.15, this.game.config.height / 2.5 + 360, 'collection_btn')
    // collectionButton.preFX.addShadow(-3, -3, 0.006, 1, 0x333333, 10)
    // collectionButton.setInteractive()
    // collectionButton.setScale(0.25)

    classicalModeButton.onPointerDown(() => {
      this.fadeOutToMode(this.fadeDuration, GAME_MODES.CLASSIC)
    })

    timeAttackButton.onPointerDown(() => {
      this.fadeOutToMode(this.fadeDuration, GAME_MODES.TIME_ATTACK)
    })

    movesAttackButton.onPointerDown(() => {
      this.fadeOutToMode(this.fadeDuration, GAME_MODES.MOVES_ATTACK)
    })

    // collectionButton.input.cursor = 'pointer'
    // collectionButton.on("pointerdown", () => {
    //   this.fadeOutToScene(this.fadeDuration, 'CollectionScene')
    // })
  }
}
