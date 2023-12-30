class ThemedLevelScene extends BaseGameScene {
  constructor() {
    super('ThemedLevelScene')
  }

  preload() {
    super.preload()
  }

  init(data) {
    this.collectionId = data.collectionId
    this.collection = LEVEL_LIST[data.collectionId]
    this.wordsCollection = [...window[this.collection.wordList]]
    this.wordsLimit = window[this.collection.wordsLimit]
    this.timeLimit = this.collection.timeLimit
    this.data.set({ totalWords: this.collection.wordsLimit})
    this.data.set({ wordsPackCount: 1 })

    this.currentCollection = this.wordsCollection
  }

  spawnWords(n=8) {
    this.currentCollection = this.currentCollection.shuffle()
    const words = this.currentCollection.splice(0, n)
    let sumTimeShift = 0

    console.log(words);
    words.forEach((word) => {
      const timeShift = INITIAL_LETTER_INTERVAL * word.length
      this.time.delayedCall(
        sumTimeShift,
        this.gameManager.LetterSpawner.spawnWord,
        [word, INITIAL_LETTER_INTERVAL, null, null, LetterBox.getRandomColor()],
        this.gameManager.LetterSpawner
      )
      sumTimeShift += timeShift
    })
  }
  create() {
    super.create()

    this.spawnWords()
  }

  update() {
    super.update()

    if (this.data.get('words') > this.data.get('wordsPackCount') * 5) {
      this.data.inc('wordsPackCount')
      this.spawnWords(5)
    }

    if (this.gameOver && !this.lettersDisabled) {
      this.letterGroup.getChildren().forEach((child) => child.container.disableInteractive());
      this.lettersDisabled = true;
    }

    if (!this.gameOver && this.timeLimit > 0) {
      const check = this.data.get('time') > this.timeLimit
      if (check) {
        this.gameOver = true;
        this.add.rectangle(330, 600, 500, 200, 0xFFFFFF).setOrigin(0.5);
        this.add.text(330, 600, TIME_OVER_TEXT, FONT_CONFIG).setOrigin(0.5);
      }
    }
  }
}
