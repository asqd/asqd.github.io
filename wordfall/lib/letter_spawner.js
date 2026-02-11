class LetterSpawner {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, recentlyLetters) {
    this.scene = scene
    this.recentlyLetters = recentlyLetters
    this.LetterPicker = new LetterPicker(scene, recentlyLetters)
  }

  spawnLetters(letters, x, y, initial = false) {
    if (this.gameOver) return

    const delay = initial ? INITIAL_LETTER_INTERVAL : LETTER_INTERVAL
    this.spawnWord(letters, delay, x, y)
  }

  spawnWord(word, delay, x, y, c) {
    if (this.gameOver) return

    const shuffledWord = word.shuffle()

    if (this.recentlyLetters) {
      this.recentlyLetters.splice(0, shuffledWord.length)
      this.recentlyLetters.push(...shuffledWord.slice(-8).split(''))
    }

    this.scene.data.set('spawnCount', shuffledWord.length)

    for (let i = 0; i < shuffledWord.length; i++) {
      if (this.gameOver) return
      this.scene.time.delayedCall(
        (i + 1) * delay,
        () => {
          this.spawnLetter(
            x || Phaser.Math.Between(...SPAWN_LIMITS_XY),
            y,
            LETTER_SIZE,
            c,
            shuffledWord[i].toUpperCase()
          )
          this.scene.data.values.spawnCount -= 1
        },
        [],
        this
      )
    }
  }

  spawnLetter(x = 340, y = 150, r = LETTER_SIZE, color = null, letter = null) {
    const letterBox = new LetterBox(this.scene, x, y, r, color, letter)

    // вешаем на букву событие на клик
    letterBox.container.on("pointerdown", () => this.addLetterToWord(letterBox, this.scene.uiManager.wordText), letterBox)

    this.scene.letterGroup.add(letterBox)
  }

  dropLetters() {
    const letter = this.LetterPicker.pickLetter()
    this.LetterPicker.processRecentlyLetters(letter)

    const letters = [letter]
    this.scene.data.values.spawnCount = letters.length

    this.enqueueLetters(letters)
  }

  enqueueLetters(letters) {
    letters.forEach((letter, index) => {
      this.scene.time.delayedCall(
        LETTER_INTERVAL * (index + 1),
        () => {
          this.spawnLetter(
            Phaser.Math.Between(...SPAWN_LIMITS_XY),
            SPAWN_Y,
            LETTER_SIZE,
            null,
            letter.toUpperCase()
          )
          this.scene.data.values.spawnCount -= 1
        },
        [],
        this
      )
    })
  }

  addLetterToWord(letter, word) {
    if (letter.selected) return

    letter.select()
    word.text += letter.text.text

    if (word.text.length >= 10) {
      this.scene.uiManager.fontSize = Math.floor(parseInt((this.scene.uiManager.fontSize * 0.96).toFixed()))
      word.setFontSize(this.scene.uiManager.fontSize)
    }
  }
}
