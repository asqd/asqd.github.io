class EndlessGameScene extends BaseGameScene {
  constructor() {
    super('EndlessGameScene')
  }

  init(_data) {
    this.wordsCollection = window.wordList
  }

  preload() {
    super.preload()
  }

  create() {
    super.create()
    this.gameManager.initLettersSpawn()
  }

  update() {
    super.update()

    if (!this.gameOver
      && this.data.values.spawnCount === 0
      && this.letterGroup.countActive() === 0) {
      this.gameManager.initLettersSpawn();
    }

    if (!this.gameOver && this.data.values.spawnCount === 0) {
      this.gameManager.LetterSpawner.dropLetters();
    }

    if (this.gameOver && !this.lettersDisabled) {
      this.letterGroup.getChildren().forEach((child) => child.container.disableInteractive());
      this.lettersDisabled = true;
    }

    if (!this.gameOver) {
      const { left, right } = this.gameManager.zone.getBounds();
      const check = this.letterGroup.getChildren().some((lb) => { return (lb.container.getBounds().left < left || lb.container.getBounds().right > right) && lb.body.y > 90; });
      if (check) {
        this.gameOver = true;
        this.add.rectangle(330, 600, 500, 200, 0xFFFFFF).setOrigin(0.5);
        this.add.text(330, 600, GAME_OVER_TEXT, FONT_CONFIG).setOrigin(0.5);
      }
    }
  }
}
