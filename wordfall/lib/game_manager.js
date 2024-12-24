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
    this.wordField = new Phaser.Geom.Rectangle(0, 1075, 720, 230);

    this.graphics = this.scene.add.graphics(GameManager.graphicConfig);
    this.graphics.fillRectShape(this.wordField);
  }

  initBackgroundZone() {
    this.zone = this.scene.add.rectangle(360, 590, 720, 980)
    this.zone.setFillStyle(0x808080, 0.5)
  }

  
  initBounds() {  
    const bounds = {
      left: {
        x: 5,
        y: 590,
        width: 10,
        height: 980
      },
      right: {
        x: 715,
        y: 590,
        width: 10,
        height: 980
      },
      bottom: {
        x: 360,
        y: 1075,
        width: 730,
        height: 20
      }
    }
    const extract = (obj) => Object.entries(obj).slice(0, 4).map((entry) => entry[1])

    console.log(extract(bounds.left));
    this.pLineLeft = new Bound(this.scene, ...extract(bounds.left))
    this.pLineBottom = new Bound(this.scene, ...extract(bounds.bottom))
    this.pLineRight = new Bound(this.scene, ...extract(bounds.right))

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
    this.LetterSpawner.spawnLetters(letters, null, SPAWN_Y, true)
  }
}
