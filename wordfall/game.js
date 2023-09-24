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

String.prototype.format = function () {
  let args = arguments
  // args is strings
  if (args.length === 1 && args[0] !== null && typeof args[0] === 'object') {
    args = args[0];
  }

  let string = this
  for (key in args) { 
    string = string.replace("%{" + key + "}", args[key])
  }

  return string
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

    Cat.initAnims(this)
    this.cat = new Cat(this, 750, 550, 'sitting', 0)
    this.cat.setScale(5)

    this.gameManager = new GameManager(this)
    this.gameManager.initStartConditions()

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
    this.cat.update()
    if (!this.gameOver && this.data.values.spawnCount === 0) {
      this.gameManager.dropLetters()
    }

    if (this.gameOver && !this.lettersDisabled) { 
      this.gameManager.letterGroup.getChildren().forEach((child) => child.container.disableInteractive())
      this.lettersDisabled = true 
    }

    if (!this.gameOver) {
      const { left, right } = this.gameManager.zone.getBounds()
      const check = this.gameManager.letterGroup.getChildren().some((lb) => { return (lb.container.getBounds().left < left || lb.container.getBounds().right > right) && lb.body.y > 90 })
      if (check) {
        this.gameOver = true
        this.add.rectangle(330, 600, 500, 200, 0xFFFFFF).setOrigin(0.5)
        this.add.text(330, 600, "Вас закидали", { color: '#000000', fontSize: 80, fontFamily: 'Arial Helvetica' }).setOrigin(0.5)
      }
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
