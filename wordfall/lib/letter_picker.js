class LetterPicker {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, recentlyLetters) {
    this.scene = scene
    this.recentlyLetters = recentlyLetters
    this.dict = scene.dict
  }

  pickVowel() {
    return this.minValueKey(
      this.slice(
        this.coeffVairations(),
        ...VOWELS.split('').filter(
          (char) => !this.letterRecentlyCheck(char)
        )
      )
    )
  }

  pickConsonant() {
    return this.minValueKey(
      this.slice(
        this.coeffVairations(),
        ...(CONSONANTS + SPECIAL).split('').filter(
          (char) => !this.letterRecentlyCheck(char)
        )
      )
    )
  }

  pickLetter() {
    return this.minValueKey(
      this.slice(
        this.coeffVairations,
        ...(CHARACTERS).split('').filter(
          (char) => !this.letterRecentlyCheck(char)
        )
      )
    )
  }

  pickLetters(n) {
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
  }

  processRecentlyLetters(char) {
    this.recentlyLetters.shift()
    this.recentlyLetters.push(char)
  }

  coeffVairations() {
    const lettersCoeff = {}
    const coeffVairations = {}

    Object.keys(this.dict).forEach((char) => { lettersCoeff[char] = this.dict[char] / this.scene.letterGroup.countActive() })
    Object.keys(ETALON_LETTERS)
      .forEach((char) => { coeffVairations[char] = (lettersCoeff[char] || 0) - ETALON_LETTERS[char] })

    return coeffVairations
  }

  letterRecentlyCheck(letter) {
    return this.recentlyLetters.includes(letter)
  }

  minValueKey(obj) {
    return Object.keys(obj).reduce((key, v) => obj[v] < obj[key] ? v : key);
  }

  slice(obj, ...args) {
    return args.reduce((res, key) => ({ ...res, [key]: obj[key] }), {})
  }
}
