class GameManager {
  /** 
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    this.scene = scene
    this.initStartConditions()
    this.LetterSpawner = new LetterSpawner(scene, this.scene.recentlyLetters)
    this.LetterPicker = this.LetterSpawner.LetterPicker
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
    
    const pLineBottom = this.scene.add.rectangle(340, 1000, 600, 30, GameManager.greyColor);
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

    this.scene.letterGroup = this.scene.add.group()
    this.scene.recentlyLetters = []
    this.initBounds()
  }

  initLettersSpawn(n = 25) {
    const letters = this.LetterPicker.pickLetters(n).join("")
    this.LetterSpawner.spawnLetters(letters, true, null, SPAWN_Y + 100)
  }
}
