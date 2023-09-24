let spawnLettersMixin = {
  genereateLetters(n) {
    const letters = "аааааааааабббвввввгггдддддеееееееееёёёжжззииииииииййййккккккллллмммммннннннннооооооооооппппппррррррсссссстттттуууфхххцччшщъыыььэюяяяя"
    let result = []
    let shuffled_letters = letters.toUpperCase().shuffle()
    for (let i = 0; i < n; i++) {
      let letter = shuffled_letters[Math.floor(Math.random() * letters.length)]
      while (this.letterRecentlyCheck(letter)) {
        console.log('generate again', letter);
        letter = shuffled_letters[Math.floor(Math.random() * letters.length)]
      }

      result.push(letter)
    }

    return result
  },

  spawnLetters(letters, initial = false, x, y) {
    if (this.gameOver) return

    const delay = initial ? INITIAL_LETTER_INTERVAL : LETTER_INTERVAL
    this.spawnWord(letters, delay, x, y)
  },

  spawnWord(word, delay, x, y) {
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
          this.spawnLetter(x || Phaser.Math.Between(...SPAWN_LIMITS_XY), y, LETTER_SIZE, null, shuffledWord[i].toUpperCase())
          this.scene.data.values.spawnCount -= 1
        },
        [],
        this
      )
    }
  },

  spawnLetter(x = 340, y = 150, r = LETTER_SIZE, c, l) {
    const letterBox = new LetterBox(this.scene, x, y, r, c, l)

    // вешаем на букву событие на клик
    letterBox.container.on("pointerdown", () => this.addLetterToWord(letterBox, this.scene.uiManager.wordText), letterBox)

    this.letterGroup.add(letterBox)
  },

  dropLetters() {
    const coeffVairations = this.coeffVairations()

    const vowel = this.pickVowel(coeffVairations)
    this.processRecentlyLetters(vowel)
    const consonant = this.pickConsonant(coeffVairations)
    this.processRecentlyLetters(consonant)

    const letters = [vowel, consonant]
    this.scene.data.values.spawnCount = letters.length

    this.enqueueLetters(letters)
  }
}
