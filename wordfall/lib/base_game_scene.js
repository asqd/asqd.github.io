class BaseGameScene extends Phaser.Scene {

  init(data) {
    this.data.set({ "gameState": loadStateData() || initialGameState })
  }

  preload() {
    // Cat.loadAssets(this)
  }

  create() {
    if (!window.wordList) {
      window.wordList = [
        'КОТ',
        'ДОМ',
        'ТОРТ'
      ]
    }

    // Cat.initAnims(this)
    // this.cat = new Cat(this, 750, 550, 'sitting', 0)
    // this.cat.setScale(5)

    this.gameManager = new GameManager(this)

    this.uiManager = new UiManager(this)
    this.uiManager.initUI()

    const timedEvent = this.time.addEvent(
      {
        delay: 1000,
        callback: this.uiManager.updateTimer,
        callbackScope: this.uiManager,
        loop: true
      }
    )
  }

  update() {
    // this.cat.update()
  }
}
