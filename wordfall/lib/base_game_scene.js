class BaseGameScene extends Phaser.Scene {

  init(data) {
    this.data.set({ "gameState": loadStateData() || initialGameState })
  }

  preload() {
    // implement in children
  }

  create() {
    if (!window.wordList) {
      window.wordList = [
        'КОТ',
        'ДОМ',
        'ТОРТ'
      ]
    }

    this.gameManager = new GameManager(this)

    this.uiManager = new UiManager(this)
    this.uiManager.initUI()
  }

  update(_time, delta) {
    this.updateTimer(delta)
  }

  updateTimer(delta) {
    const state = this.data.get('gameState')
    state.timer += delta;

    while (state.timer > 1000) {
      this.uiManager.updateTimer();
      state.timer -= 1000;
    }
  }
}
