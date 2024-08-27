const FRAME_OPTIONS = { frameWidth: 128, frameHeight: 120 }

class GiftBox extends SpriteContainer {
// class GiftBox extends Phaser.GameObjects.GameObject {

  static loadAssets(scene) {
    scene.load.image("giftBox", "assets/sprites/gift.png");
  }
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, x, y, width, height, texture = "giftBox") {
    super(scene, x, y, width, height, "giftBox", 0, { property: "height", size: FRAME_OPTIONS.frameHeight })

    this.collectionName = scene.collectionName || DEFAULT_COLLECTION_NAME
    this.collectionSize = COLLECTIONS[this.collectionName].itemProps.length
    this.isOpened = false
  }

  get itemScale() {
    return COLLECTION_OPTIONS.itemHeight / COLLECTIONS[this.collectionName].frameConfig.frameHeight * 2
  }


  initContainer() {
    super.initContainer()

    this.container.setInteractive()
    this.onPointerDown(() => this.openTween())
  }

  get centerOffset() {
    return [0, -1]
  }

  getFromCollection() {
    const itemNum = Phaser.Math.RND.between(0, this.collectionSize - 1)
    this.scene.registry.values[this.collectionName].add(itemNum)
    GameManager.saveItemsCollection(this.scene, this.collectionName)
    this.itemSprite = this.scene.add.sprite(this.x, this.y, this.collectionName, itemNum)
    this.itemSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
    this.itemSprite.setScale(0.1)

    Phaser.Display.Align.In.Center(this.itemSprite, this.container, 0, 1);


    this.scene.tweens.add({
      targets: this.sprite,
      scale: 0.1,
      ease: 'power3',
      duration: 500,
      onComplete: () => this.sprite.setVisible(false)
    })

    this.scene.tweens.add({
      targets: this.itemSprite,
      scale: this.itemScale,
      ease: 'power3',
      delay: 200,
      duration: 500
    })

    this.itemSprite.setInteractive()
    this.itemSprite.on("pointerdown", () => {
      this.itemSprite.setVisible(false)
      this.scene.giftBox = null
      if (this.scene.scene.key === "CollectionScene")
        this.scene.scene.restart()
    })
  }

  openTween() {
    if (this.isOpened) return

    this.isOpened = true
    this.scene.tweens.chain({
      targets: this.sprite,
      tweens: [
        {
          y: this.sprite.y - 20,
          scaleX: 1.4,
          ease: 'power3',
          duration: 500
        },
        {
          y: this.sprite.y + 30,
          scaleX: 1.1,
          ease: 'power3',
          duration: 500
        },
        {
          y: this.sprite.y - 10,
          scaleX: 1,
          ease: 'power3',
          duration: 500
        },
        {
          duration: 400,
          targets: this.sprite.preFX.addBarrel(1),
          ease: Phaser.Math.Easing.Elastic.InOut,
          amount: 1.2,
          yoyo: true,
          onStart: () => {
            this.scene.add.tween({
              duration: 400,
              targets: this.sprite,
              ease: (value) => Math.round(value),
              scale: 1.2,
            })
          }
        }
      ],
      onComplete: () => {
        this.getFromCollection()
      }
    })
  }

  onPointerDown(callback, context = this) {
    this.container.input.cursor = 'pointer'
    this.container.on("pointerdown", callback, context)
  }
}
