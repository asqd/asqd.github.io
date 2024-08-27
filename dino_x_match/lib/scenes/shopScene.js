class ShopScene extends Phaser.Scene {
  init(data) {
    this.collectionName = data.collectionName || DEFAULT_COLLECTION_NAME
    this.frameConfig = COLLECTIONS[this.collectionName].frameConfig
    this.itemGroup = this.add.group();
    this.cameras.main.setBackgroundColor(0x999999)
    this.items = []

    GameManager.loadItemsCollection(this, this.collectionName)
  }

  constructor() {
    super("ShopScene")
    this.currentPage = 1;

    // поменять на настройки магазина
    ({
      totalItemsPerPage: this.totalItemsPerPage,
      gridCols: this.gridCols,
      gridRows: this.gridRows,
      itemWidth: this.itemWidth,
      itemHeight: this.itemHeight,
      itemSpacingX: this.itemSpacingX,
      itemSpacingY: this.itemSpacingY,
      startX: this.startX,
      startY: this.startY
    } = COLLECTION_OPTIONS);
  }

  preload() {
    ShopItem.loadAssets(this)
  }

  create() {
    for (let i=0; i < 5; i++) {
      this.createItem(i)
    }

    Phaser.Actions.GridAlign(this.itemGroup.getChildren(), {
      width: this.gridCols,
      height: this.gridRows,
      cellWidth: this.itemWidth + this.itemSpacingX,
      cellHeight: this.itemHeight + this.itemSpacingY * 2,
      x: this.startX,
      y: this.startY
    });
  }

  createItem(_index) {
    const itemText = this.add.text(0, 0, `Коробочка`, { ...FONT_OPTIONS, fontSize: 26 });
    const itemRect = this.add.rectangle(0, 0, this.itemWidth, this.itemHeight, 0xffffff, 0.5);
    const itemSprite = this.add.sprite(0, 0, 'giftBox', 0);
    itemSprite.setScale((this.itemHeight - 50) / SHOP_FRAME_OPTIONS.frameHeight);
    itemSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    const itemContainer = this.add.container(0, 0, [itemRect, itemText, itemSprite]);
    itemContainer.setSize(this.itemWidth, itemText.height + itemRect.height + 30);
    Phaser.Display.Align.In.BottomCenter(itemText, itemContainer);
    Phaser.Display.Align.In.Center(itemSprite, itemRect, 0);

    this.itemGroup.add(itemContainer);
  }

}
