const SHOP_FRAME_OPTIONS = { frameWidth: 128, frameHeight: 120 }

class ShopItem extends SpriteContainer {

  static loadAssets(scene) {
    scene.load.image("giftBox", "assets/sprites/gift.png");
  }
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, x, y, width, height, itemObject = { texture: "giftBox", frame: 0, price: 0}) {
    super(scene, x, y, width, height, itemObject.texture, itemObject.frame, { property: "height", size: SHOP_FRAME_OPTIONS.frameHeight })

    this.price = itemObject.price
  }

  initContainer() {
    super.initContainer()

    this.container.setInteractive()
    this.onPointerDown(() => this.openTween())
  }
}
