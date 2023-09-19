Array.prototype.sample = function () {
  return this[Math.floor(Math.random() * this.length)];
}

String.prototype.shuffle = function () {
  var a = this.split(""),
    n = a.length;

  for (var i = n - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a.join("");
}

String.prototype.capitalize = function () {
  return `${this.charAt(0).toUpperCase()}${this.slice(1)}`
}

class Word extends Phaser.GameObjects.Text {
  constructor(scene, x, y, text, style) {
    super(scene, x, y, text, style)

    scene.add.existing(this)
  }

}

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  formatTime(seconds) {
    // Minutes
    var minutes = Math.floor(seconds / 60);
    // Seconds
    var seconds = seconds % 60;
    // Adds left zeros to seconds
    seconds = seconds.toString().padStart(2, '0');
    // Returns formated time
    return `${minutes}:${seconds}`;
  }

  updateTimer() {
    if (this.gameOver) return

    this.data.inc('time')

    if (this.data.get('time') < 60)
      this.timeText.text = `Time \n ${(this.data.get('time'))}`
    else
    this.timeText.text = `Time \n ${this.formatTime(this.data.get('time'))}`

  }

  updateScore() {
    this.data.inc('words')
    const scores = this.data.values.score += this.wordText.text.length * 5 + 5

    this.wordsText.setText(`Words \n ${this.data.get('words')}`)
    this.scoreText.setText(`Score \n ${this.data.get('score')}`)
  }

  getWords(n = 1) {
    const words = []

    for (let i = 0; i < n; i++ ) {
      let word = window.wordList.filter((e) => 5 < e.length && e.length < 8).sample()
      while (words.includes(word)) {
        word =  window.wordList.filter((e) => 5 < e.length && e.length < 8).sample()
      }
      words.push(word)
    }

    return words
  }

// spawnWords(n = 1, initial = false) {
//   if (this.gameOver) return

//   this.pickedWords = this.getWords(n)
//   this.usedWords.push(...this.pickedWords)
//   console.log('usedWords', this.usedWords);
//   const delay = initial ? 1 : LETTER_INTERVAL
//   this.pickedWords.forEach((word) => {
//     console.log('spawn word', word);
//     this.spawnWord(word, delay)
//     if (this.usedWords.length > 30) { this.usedWords.shift() }
//   })

//   this.time.delayedCall(
//     this.pickedWords.join("").length * delay,
//     () => {
//       this.pickedWords = []
//       this.spawnWords()
//     }
//     )
//   }

  spawnWord(word, delay, x, y) {
    const suffledWord = word.shuffle()

    if (this.recentlyLetters) {
      this.recentlyLetters.splice(0, suffledWord.length)
      this.recentlyLetters.push(...suffledWord.slice(-8).split(''))
    }

    this.data.set('spawnCount', suffledWord.length)

    for (let i = 0; i < suffledWord.length; i++) {
      if (this.gameOver) return
      this.time.delayedCall(
        (i + 1) * delay,
        () => {
          this.spawnLetter(x || Phaser.Math.Between(...SPAWN_LIMITS_XY), y, LETTER_SIZE, null, suffledWord[i].toUpperCase())
          this.data.values.spawnCount -= 1
        },
        [],
        this
        )
      }
    }

    spawnLetter(x = 340, y = 150, r = LETTER_SIZE, c, l) {
      const letterBox = new LetterBox(this, x, y, r, c, l)
      this.letterGroup.add(letterBox)
    }

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
    }

  spawnLetters(n, initial = false, x, y) {
    if (this.gameOver) return

    const letters = this.genereateLetters(n).join("")
    const delay = initial ? 300 : LETTER_INTERVAL
    this.spawnWord(letters, delay, x, y)
  }

  minValueKey(obj) {
    return Object.keys(obj).reduce((key, v) => obj[v] < obj[key] ? v : key);
  }

  slice(obj, ...args) {
    return args.reduce((res, key) => ({ ...res, [key]: obj[key] }), {})
  }

  preload() {
    Cat.loadAssets(this)
  }

  create() {
    if (!window.wordList) {
      window.wordList = [
        'КОТ',
        'ДОМ',
        'ТОРТ'
      ]
    }

    this.dict = {}

    // устанавливаем счётчики
    this.data.set({
      score: 0,
      words: 0,
      time: 0,
      spawnCount: 0
    })

    // создаём таймер
    const timedEvent = this.time.addEvent(
      {
        delay: 1000,
        callback: this.updateTimer,
        callbackScope: this,
        loop: true
      }
    )

    Cat.initAnims(this)
    this.cat = new Cat(this, 750, 550, 'sitting', 0)
    this.cat.setScale(5)

    this.zone = this.add.rectangle(340, 545, 620, 920)
    console.log(this.zone.getBounds());

    // this.zone.setStrokeStyle(2, 0xffff00)
    this.zone.setFillStyle(0x808080, 0.5)
    // Static body
    // this.matter.add.existing(zone, true);

    const wordField = new Phaser.Geom.Rectangle(30, 1000, 620, 200);

    const greyColor = Phaser.Display.Color.HexStringToColor('#808080').color;
    const graphics = this.add.graphics({ lineStyle: { width: 10, color: greyColor }, fillStyle: { color: greyColor } });
    graphics.fillRectShape(wordField);

    const pLineLeft = this.add.rectangle(45, 545, 30, 920, 0x808080);
    this.matter.add.gameObject(pLineLeft, { isStatic: true })

    const pLineBottom = this.add.rectangle(340, 1000, 600, 20, 0x808080);
    this.matter.add.gameObject(pLineBottom, { isStatic: true })

    const pLineRight = this.add.rectangle(635, 545, 30, 920, 0x808080);
    this.matter.add.gameObject(pLineRight, { isStatic: true })

    this.letterGroup = this.add.group()

    this.usedWords = []
    this.recentlyLetters = []

    this.spawnLetters(25, true, null, SPAWN_Y + 100)

    console.log(this.letterGroup);

    this.fontSize = BOTTOM_TEXT_SIZE

    const UI_FONT_CONFIG = { ...FONT_CONFIG, ...{ fontSize: 36, color: "#fff" } }
    const UI_X = 670
    const UI_Y = 90
    this.timeText = this.add.text(UI_X, UI_Y, `Time \n ${this.data.get('time')}`, UI_FONT_CONFIG)
    this.scoreText = this.add.text(UI_X, UI_Y + 100, `Score \n ${this.data.get('score')}`, UI_FONT_CONFIG)
    this.wordsText = this.add.text(UI_X, UI_Y + 200, `Words \n ${this.data.get('words')}`, UI_FONT_CONFIG)

    this.wordText = this.add.text(335, 1050, "", { ...FONT_CONFIG, ...{ fontSize: BOTTOM_TEXT_SIZE } })
    this.wordText.setOrigin(0.5)

    const BUTTON_FONT_CONFIG = { ...FONT_CONFIG, ...{ fontSize: BUTTON_SIZE } }
    this.wordApplyFrame = this.add.rectangle(495, 1150, 300, 85)
    this.wordApplyFrame.setStrokeStyle(4, 0x000000)
    // this.wordApplyFrame.setOrigin(0.5, 0)
    this.wordApply = this.add.text(500, 1150, "✓", { ...BUTTON_FONT_CONFIG, ...{ color: "#99cc99"} })
    this.wordApply.setOrigin(0.5)
    this.wordApplyFrame.setInteractive()
      .on("pointerdown", this.completeWord, this)

    this.wordResetFrame = this.add.rectangle(185, 1150, 300, 85)
    this.wordResetFrame.setStrokeStyle(4, 0x000000)
    this.wordReset = this.add.text(185, 1150, "✗", { ...BUTTON_FONT_CONFIG, ...{ color: "#db7070" } })
    this.wordReset.setOrigin(0.5)
    this.wordResetFrame.setInteractive()
      .on("pointerdown", this.clearWord, this)

  }

  letterRecentlyCheck(letter) {
    return this.recentlyLetters.includes(letter)
  }

  update() {
    this.cat.update()
    if (!this.gameOver && this.data.values.spawnCount === 0) {


      const lettersCoeff = {}
      const coeffVairations = {}
      Object.keys(this.dict).forEach((char) => { lettersCoeff[char] = this.dict[char] / 25 })
      //.filter((char) => !this.letterRecentlyCheck(char))
      Object.keys(ETALON_LETTERS)
      .forEach((char) => { coeffVairations[char] = (lettersCoeff[char] || 0) - ETALON_LETTERS[char] })

      const vowel = this.minValueKey(
        this.slice(
          coeffVairations,
          ...VOWELS.split('').filter(
            (char) => !this.letterRecentlyCheck(char)
          )
        )
      )

      this.recentlyLetters.shift()
      this.recentlyLetters.push(vowel)
      // this.spawnLetters(1)

      const regular = this.minValueKey(
        this.slice(
          coeffVairations,
          ...(CONSONANTS + SPECIAL).split('').filter(
            (char) => !this.letterRecentlyCheck(char)
          )
        )
      )

      this.recentlyLetters.shift()
      this.recentlyLetters.push(regular)

      this.data.values.spawnCount = 2

      const arr = [vowel, regular]

      arr.forEach((letter, i) => {
        this.time.delayedCall(
          LETTER_INTERVAL * (i + 1),
          () => {
            this.spawnLetter(Phaser.Math.Between(...SPAWN_LIMITS_XY), SPAWN_Y, LETTER_SIZE, null, letter.toUpperCase())
            this.data.values.spawnCount -= 1
          },
          [],
          this
        )
      })
    }

    if (!this.gameOver) {
      const { left, right } = this.zone.getBounds()
      const check = this.letterGroup.children.entries.some((lb) => { return lb.body.x < left || lb.body.x > right })
      if (check) {
        this.gameOver = true
        this.add.rectangle(330, 600, 500, 200, 0xFFFFFF).setOrigin(0.5)
        this.add.text(330, 600, "Вас закидали", { color: '#000000', fontSize: 80, fontFamily: 'Arial Helvetica' }).setOrigin(0.5)
      }
    }
  }

  completeWord() {
    if (!window.wordList.includes(this.wordText.text.toLocaleLowerCase())) {
      this.tweens.addCounter({
        from: 50,
        to: 200,
        ease: 'Circ',
        duration: 200,
        onUpdate: (tween) => {
          const color = Phaser.Display.Color.Interpolate.ColorWithColor(
            Phaser.Display.Color.ValueToColor("#000000"),
            Phaser.Display.Color.ValueToColor("#CC3333"),
            200,
            tween.getValue()
            )
            this.wordApply.setColor(Phaser.Display.Color.RGBToString(color.r, color.g, color.b))
            this.wordText.setColor(Phaser.Display.Color.RGBToString(color.r, color.g, color.b))
          },
          onComplete: () => {
            this.wordApply.setColor("#99cc99")
            this.wordText.setColor("#000000")
          }
        })

      this.tweens.add({
        targets: this.wordText,
        x: this.wordText.x-10,
        ease: 'Bounce.InOut',
        duration: 70,
        yoyo: true,
        onComplete: () => {
          this.tweens.add({
            targets: this.wordText,
            x: this.wordText.x + 10,
            ease: 'Bounce.InOut',
            duration: 70,
            yoyo: true,
          })
        }
      })

      return
    }

    // увеличиваем счётчик очков
    this.updateScore()

    this.tweens.addCounter({
      from: 50,
      to: 200,
      ease: 'Circ',
      duration: 400,
      onUpdate: (tween) => {
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.ValueToColor("#000000"),
          Phaser.Display.Color.ValueToColor("#99cc99"),
          200,
          tween.getValue()
        )
        this.wordText.setColor(Phaser.Display.Color.RGBToString(color.r, color.g, color.b))
      }
    })

    this.tweens.add({
      targets: this.wordText,
      scale: 1.2,
      ease: 'Circ',
      duration: 400,
      onComplete: () => {
        this.wordText.text = ""
        this.wordText.setColor("#000000")
        this.wordText.setScale(1)
        this.wordText.setFontSize(BOTTOM_TEXT_SIZE)
      }
    })


    this.letterGroup.children.entries.forEach((letter) => {
      if (letter.selected) {
        letter.delete()
      }
    })
  }

  clearWord() {
    this.tweens.addCounter({
      from: 50,
      to: 200,
      ease: 'Circ',
      duration: 400,
      onUpdate: (tween) => {
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.ValueToColor("#db7070"),
          Phaser.Display.Color.ValueToColor("#bbbbbb"),
          200,
          tween.getValue()
        )
        this.wordReset.setColor(Phaser.Display.Color.RGBToString(color.r, color.g, color.b))
      },
      onComplete: () => {
        this.wordReset.setColor("#db7070")
      }
    })

    this.tweens.add({
      targets: this.wordText,
      alpha: 0.3,
      ease: 'Circ',
      duration: 200,
      onComplete: () => {
        this.wordText.text = ""
        this.wordText.setAlpha(1)
        this.wordText.setFontSize(BOTTOM_TEXT_SIZE)
        this.fontSize = BOTTOM_TEXT_SIZE
        this.letterGroup.children.each((letter) => {
          letter.unSelect()
        })
      }
    })
  }

  writeWord() {
    if (this.selected) return

    this.select()
    this.scene.wordText.text += this.text.text

    if (this.scene.wordText.text.length >= 10) {
      this.scene.fontSize = Math.floor(parseInt((this.scene.fontSize * 0.96).toFixed()))
      this.scene.wordText.setFontSize(this.scene.fontSize)
    }
  }
}


const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 860,
    height: 1200,
  },
  scene: GameScene,
  parent: 'phaser-example',
  physics: {
    default: 'matter',
    matter: {
      gravity: { y: 0.6 },
      // debug: true
    }
  },
  backgroundColor: '#262626'
};

const game = new Phaser.Game(config);
