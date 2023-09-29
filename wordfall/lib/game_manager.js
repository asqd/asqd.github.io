class GameManager {
  constructor(scene) {
    this.scene = scene

    Object.assign(
      GameManager.prototype, 
      pickLetterMixin, 
      spawnLettersMixin
    )
  }

  static get greyColor() {
    return Phaser.Display.Color.HexStringToColor('#808080').color
  }

  static get graphicConfig() {
    return {
      lineStyle: {
        width: 10, 
        color: GameManager.greyColor
      },
      fillStyle: {
        color: GameManager.greyColor
      }
    }
  }

  static get matterStaticConfig() {
    return { isStatic: true }
  }

  drawWordField() {
    this.wordField = new Phaser.Geom.Rectangle(30, 1000, 620, 200);

    this.graphics = this.scene.add.graphics(GameManager.graphicConfig);
    this.graphics.fillRectShape(this.wordField);
  }

  initBackgroundZone() {
    this.zone = this.scene.add.rectangle(340, 545, 620, 920)
    this.zone.setFillStyle(0x808080, 0.5)
  }

  initBounds() {  
    const pLineLeft = this.scene.add.rectangle(45, 545, 30, 920, GameManager.greyColor);
    this.scene.matter.add.gameObject(pLineLeft, GameManager.matterStaticConfig)
    
    const pLineBottom = this.scene.add.rectangle(340, 1000, 600, 20, GameManager.greyColor);
    this.scene.matter.add.gameObject(pLineBottom, GameManager.matterStaticConfig)
    
    const pLineRight = this.scene.add.rectangle(635, 545, 30, 920, GameManager.greyColor);
    this.scene.matter.add.gameObject(pLineRight, GameManager.matterStaticConfig)

    this.initBackgroundZone()
    this.drawWordField()
  }
  
  initStartConditions() {

    this.scene.dict = {}

    // устанавливаем счётчики
    this.scene.data.set({
      score: 0,
      words: 0,
      time: 0,
      spawnCount: 0
    })

    this.letterGroup = this.scene.add.group()
    this.recentlyLetters = []

    this.initBounds()

    const letters = this.genereateLetters(25).join("")
    this.spawnLetters(letters, true, null, SPAWN_Y + 100)
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
