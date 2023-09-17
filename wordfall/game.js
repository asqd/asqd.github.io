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

// Object.defineProperty(Object.prototype, 'minKey', {
//   value: function() {
//     return Object.keys(this).reduce((key, v) => this[v] < this[key] ? v : key);
//   }
// })
// Object.prototype.minKey = function () { 
//   return Object.keys(this).reduce((key, v) => this[v] < this[key] ? v : key);
// }

const colorObject = new Phaser.Display.Color();
const characters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
const vowels = 'АУОЫЭЯЮЁИЕ'
const consonants = 'БВГДЖЗЙКЛМНПРСТФХЦЧШЩ'
const special = 'ьъ'
const charactersLength = characters.length;

const LETTER_INTERVAL = 4000
const LETTER_SIZE = 90
const BOTTOM_TEXT_SIZE = 60
const BUTTON_SIZE = 80
const FONT_CONFIG = { color: '#000000', fontSize: 52, fontFamily: 'Arial Helvetica' }
const ETALON_LETTERS = {
  "О": 0.10983,
  "Е": 0.08483,
  "А": 0.07998,
  "И": 0.07367,
  "Н": 0.067,
  "Т": 0.06318,
  "С": 0.05473,
  "Р": 0.04746,
  "В": 0.04533,
  "Л": 0.04343,
  "К": 0.03486,
  "М": 0.03203,
  "Д": 0.02977,
  "П": 0.02804,
  "У": 0.02615,
  "Я": 0.02001,
  "Ы": 0.01898,
  "Ь": 0.01735,
  "Г": 0.01687,
  "З": 0.01641,
  "Б": 0.01592,
  "Ч": 0.0145,
  "Й": 0.01208,
  "Х": 0.00966,
  "Ж": 0.0094,
  "Ш": 0.00718,
  "Ю": 0.00639,
  "Ц": 0.00486,
  "Щ": 0.00361,
  "Э": 0.00331,
  "Ф": 0.00267,
  "Ъ": 0.00037,
  "Ё": 0.00013
}

class LetterBox extends Phaser.GameObjects.GameObject {
  static get colorObject() {
    return colorObject
  }
  static get characters() {
    return characters
  }
  static get charactersLength() {
    return charactersLength
  }

  static get textConfig() {
    return { ...FONT_CONFIG, ...{ color: '#fff' } }
  }

  static getLetter() {
    return LetterBox.characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  get alpha() { this.shape.alpha }
  set alpha(value) { this.shape.alpha = value; this.text.alpha = value }

  constructor(scene, x, y, size, color, letter) {
    super(scene)

    this.scene = scene
    this.size = size
    this.color = color
    this.letter = letter
    this.scene.dict[letter] = (this.scene.dict[letter] || 0) + 1
    this.initContainer(x, y)
    this.initPhysics()
  }

  delete() {
    this.alpha = 1
    this.scene.tweens.add({
      targets: [this.shape, this.text],
      alpha: 0,
      ease: 'Linear',
      duration: 400,
      onComplete: () => this.destroy()
    })

  }

  select() {
    this.selected = true
    this.scene.tweens.add({
      targets: [this.shape, this.text],
      alpha: 0.5,
      ease: 'Linear',
      duration: 400,
    })
  }

  unSelect() {
    this.selected = false
    this.scene.tweens.add({
      targets: [this.shape, this.text],
      alpha: 1,
      ease: 'Linear',
      duration: 400,
    })
  }

  initContainer(x, y) {
    if (!this.color) {
      this.color = LetterBox.colorObject.random(30, 220)
    }

    this.shape = this.scene.add.circle(0, 0, this.size / 2, LetterBox.colorObject.color)
    this.text = this.scene.add.text(
      0, 0,
      this.letter || LetterBox.getLetter(),
      LetterBox.textConfig,
    )

    Phaser.Display.Align.In.Center(this.text, this.shape, 0, 4);

    this.container = this.scene.add.container(x, y, [this.shape, this.text])
    this.container.setSize(this.size, this.size)
      .setInteractive()
      .on("pointerdown", this.scene.writeWord, this)
  }

  initPhysics() {
    this.body = this.scene.matter.add.gameObject(this.container)
    this.body.setCircle()
      .setFriction(0.005, 0, 0)
      .setBounce(0.1)
      .setAngle(180 * Math.random() * 10)
  }
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

  spawnWords(n = 1, initial = false) {
    if (this.gameOver) return

    this.pickedWords = this.getWords(n)
    this.usedWords.push(...this.pickedWords)
    console.log('usedWords', this.usedWords);
    const delay = initial ? 1 : 2000
    this.pickedWords.forEach((word) => {
      console.log('spawn word', word);
      this.spawnWord(word, delay)
      if (this.usedWords.length > 30) { this.usedWords.shift() }
    })

    this.time.delayedCall(
      this.pickedWords.join("").length * delay,
      () => {
        this.pickedWords = []
        this.spawnWords()
      }
    )
  }

  spawnWord(word, delay) {
    const suffledWord = word.shuffle()
    this.data.set('spawnCount', suffledWord.length)

    for (let i = 0; i < suffledWord.length; i++) {
      if (this.gameOver) return
      this.time.delayedCall(
        (i + 1) * delay, 
        () => {
          this.spawnLetter(340, 150, LETTER_SIZE, null, suffledWord[i].toUpperCase())
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
    const letters = "аааааааааабббвввввгггдддддеееееееееёёёжжззииииииииййййккккккллллмммммннннннннооооооооооппппппррррррсссссстттттуууфххцччшщъыыььэюяяяя"
    let result = []
    let shuffled_letters = letters.shuffle()
    for (let i = 0; i < n; i++) {
      result.push(shuffled_letters[Math.floor(Math.random() * letters.length)])
    }

    return result
  }

  spawnLetters(n, initial = false) {
    if (this.gameOver) return

    const letters = this.genereateLetters(n).join("")
    const delay = initial ? 1 : 4000
    this.spawnWord(letters, delay)
  }

  minValueKey(obj) {
    return Object.keys(obj).reduce((key, v) => obj[v] < obj[key] ? v : key);
  }

  slice(obj, ...args) {
    return args.reduce((res, key) => ({ ...res, [key]: obj[key] }), {})
  }

  update() {
    if (!this.gameOver && this.data.values.spawnCount === 0) {
      const lettersCoeff = {}
      const coeffVairations = {}
      Object.keys(this.dict).forEach((ch) => { lettersCoeff[ch] = this.dict[ch] / 25 })
      Object.keys(ETALON_LETTERS).forEach((ch) => { coeffVairations[ch] = (lettersCoeff[ch] || 0) - ETALON_LETTERS[ch] })

      const vowel = this.minValueKey(this.slice(coeffVairations, ...vowels.split('')))
      this.spawnLetters(1)
      const regular = this.minValueKey(coeffVairations, ...(consonants+special).split(''))

      this.data.values.spawnCount = 3
      
      const arr = [vowel, regular]
      arr.forEach((letter, i) => { 
        this.time.delayedCall(
          LETTER_INTERVAL * (i+2),
          () => {
            this.spawnLetter(340, 150, LETTER_SIZE, null, letter.toUpperCase())
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

    
    // for (let i = 0; i < 20; i++) {
    //   setTimeout(() => {
    //     this.spawnLetter()
    //   }, 0 * i)
    // }
    // this.letterGroup.add(new LetterBox(this, 340, 150, 70, null, 'К'))
    // this.letterGroup.add(new LetterBox(this, 340, 150, 70, null, 'О'))
    // this.letterGroup.add(new LetterBox(this, 340, 150, 70, null, 'Т'))

    this.usedWords = []
    this.spawnLetters(25, true)

    // this.spawnWords(3, true)

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
      gravity: { y: 0.5 },
      // debug: true
    }
  },
  backgroundColor: '#262626'
};

const game = new Phaser.Game(config);
