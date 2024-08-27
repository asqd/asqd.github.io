class CollectionScene extends Phaser.Scene {
  init(data) {
    this.collectionName = data.collectionName || DEFAULT_COLLECTION_NAME
    this.frameConfig = COLLECTIONS[this.collectionName].frameConfig
    this.itemGroup = this.add.group();
    this.cameras.main.setBackgroundColor(0x999999)
    this.items = []
 
    GameManager.loadItemsCollection(this, this.collectionName)
  }

  constructor() {
    super("CollectionScene")
    this.currentPage = 1;
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
    this.load.spritesheet(this.collectionName, `assets/sprites/collections/${this.collectionName}.png`, this.frameConfig);
    this.load.image('bg', `assets/sprites/collection_bg.png`);
    GiftBox.loadAssets(this)
  }

  create() {
    this.loadCollection(this.collectionName);
    this.totalPages = Math.ceil(this.items.length / this.totalItemsPerPage);
    this.bg = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'bg')
    this.bg.setScale(this.game.config.height / this.bg.height)
    this.bg.setAlpha(0.8)
    this.createMenuButton();
    this.createItemList();
    this.createNavigationButtons();
  }

  loadCollection(name) {
    const items = []
    const counter = Object.keys(this.textures.get(name).frames).slice(0, -1).length
    for (let i = 0; i < counter; i++) {
      const id = i + 1
      const title = COLLECTIONS[this.collectionName].itemProps[i]?.title || `item${i}`
      const description = COLLECTIONS[this.collectionName].itemProps[i]?.description
      let item = {
        id: id,
        tileNumber: i,
        title: title,
        description: description,
        unlocked: false
      }
      items.push(item)
    }

    this.items = items
  }

  spawnBox() {    
    if (!this.giftBox) {
      this.giftBox = new GiftBox(this, 350, 600, 128, 120) 
    }
  }

  createItemList() {
    const startIndex = (this.currentPage - 1) * this.totalItemsPerPage;
    const limitIndex = Math.min(this.currentPage * this.totalItemsPerPage, this.items.length);

    for (let i = startIndex; i < limitIndex; i++) {
      this.createItem(i);
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

  createItem(index) {
    const item = this.items[index];
    const itemText = this.add.text(0, 0, `${item.title}`, { ...FONT_OPTIONS, fontSize: 26 });
    const itemRect = this.add.rectangle(0, 0, this.itemWidth, this.itemHeight, 0xffffff, 0.5);
    const itemSprite = this.add.sprite(0, 0, this.collectionName, index);
    itemSprite.setScale(this.itemHeight / this.frameConfig.frameHeight);
    itemSprite.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    if (!this.registry.get(this.collectionName).has(index)) {
      itemSprite.setTintFill(0x808080)
      itemSprite.preFX.addBlur(2, 2, 2, 1, 0xffffff, 6)
      itemText.text = '???'
    }

    const itemContainer = this.add.container(0, 0, [itemRect, itemText, itemSprite]);
    itemContainer.setSize(this.itemWidth, itemText.height + itemRect.height + 30);
    Phaser.Display.Align.In.BottomCenter(itemText, itemContainer);
    Phaser.Display.Align.In.Center(itemSprite, itemRect, 0);

    this.itemGroup.add(itemContainer);
  }

  createNavigationButtons() {
    this.createGitfButton()

    if (this.currentPage > 1) {
      this.createPreviousButton();
    }

    if (this.currentPage < Math.ceil(this.items.length / this.totalItemsPerPage)) {
      this.createNextButton();
    }
  }

  createPreviousButton() {
    const prevButton = this.add.text(30, 1180, '<<', { ...FONT_OPTIONS, fontSize: 60 });
    prevButton.setInteractive();

    prevButton.on('pointerdown', () => {
      if (this.currentPage > 1 && !this.giftBox) {
        this.currentPage--;
        this.scene.restart();
      }
    });
  }

  createNextButton() {
    const nextButton = this.add.text(620, 1180, '>>', { ...FONT_OPTIONS, fontSize: 60 });
    nextButton.setInteractive();

    nextButton.on('pointerdown', () => {
      if (this.currentPage < this.totalPages && !this.giftBox) {
        this.currentPage++;
        this.scene.restart();
      }
    });
  }

  createGitfButton() {
    const giftButton = this.add.text(350, 1180, '🎁', { ...FONT_OPTIONS, fontSize: 60 });
    giftButton.setInteractive();

    giftButton.on('pointerdown', () => {
      this.spawnBox()
    }, giftButton);
  }

  createMenuButton() {
    const menuX = GAME_OPTIONS.boardOffset.x + GAME_OPTIONS.gemSize * (GAME_OPTIONS.maxColumns - 0.3) 

    this.menuButton = this.add.text(menuX - 10, 20 - 21, '☰', { ...FONT_OPTIONS, fontSize: 80 })
    this.menuButton.setInteractive({ cursor: 'pointer' })

    this.menuButton.on('pointerdown', () => {
      this.cameras.main.fadeOut(400)
      this.time.delayedCall(400, () => this.scene.stop(this.scene.key).start('MenuScene'))
    })
  }
}
