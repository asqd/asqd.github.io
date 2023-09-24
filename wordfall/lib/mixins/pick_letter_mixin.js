let pickLetterMixin = {

  coeffVairations() {
    const lettersCoeff = {}
    const coeffVairations = {}
    const dict = this.scene.dict

    Object.keys(dict).forEach((char) => { lettersCoeff[char] = dict[char] / 25 })
    Object.keys(ETALON_LETTERS)
      .forEach((char) => { coeffVairations[char] = (lettersCoeff[char] || 0) - ETALON_LETTERS[char] })

    return coeffVairations
  },

  letterRecentlyCheck(letter) {
    return this.recentlyLetters.includes(letter)
  },

  pickVowel(coeffVairations) {
    return this.minValueKey(
      this.slice(
        coeffVairations,
        ...VOWELS.split('').filter(
          (char) => !this.letterRecentlyCheck(char)
        )
      )
    )
  },

  pickConsonant(coeffVairations) {
    return this.minValueKey(
      this.slice(
        coeffVairations,
        ...(CONSONANTS + SPECIAL).split('').filter(
          (char) => !this.letterRecentlyCheck(char)
        )
      )
    )
  },

  processRecentlyLetters(char) {
    this.recentlyLetters.shift()
    this.recentlyLetters.push(char)
  },

  enqueueLetters(letters) {
    letters.forEach((letter, index) => {
      this.scene.time.delayedCall(
        LETTER_INTERVAL * (index + 1),
        () => {
          this.spawnLetter(Phaser.Math.Between(...SPAWN_LIMITS_XY), SPAWN_Y, LETTER_SIZE, null, letter.toUpperCase())
          this.scene.data.values.spawnCount -= 1
        },
        [],
        this
      )
    })
  },

  minValueKey(obj) {
    return Object.keys(obj).reduce((key, v) => obj[v] < obj[key] ? v : key);
  },

  slice(obj, ...args) {
    return args.reduce((res, key) => ({ ...res, [key]: obj[key] }), {})
  }
}
