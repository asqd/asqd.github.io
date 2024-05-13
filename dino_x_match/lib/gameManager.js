class GameManager {
  /**
   * @param {Phaser.Scene} scene
  */
  constructor(scene) {
    this.scene = scene
  }

  static loadItemsCollection(scene, collectionName) {
    const serializedSet = new Set(JSON.parse(localStorage.getItem(collectionName)))
    scene.registry.set(collectionName, serializedSet)
  }

  static saveItemsCollection(scene, collectionName) {
    const deserializedSet = Array.from(scene.registry.get(collectionName));
    localStorage.setItem(collectionName, JSON.stringify(deserializedSet))
  }

  tileSelect(pointer) {
    if (!this.canMakeMove(pointer)) return

    if (!this.scene.timer) this.createTimer()

    this.handleTileSelection(pointer)
  }

  createTimer() {
    this.scene.timer = this.scene.time.addEvent({
      delay: 1000,
      callback: this.scene.updateTimer,
      callbackScope: this.scene,
      loop: true
    });
  }

  canMakeMove(pointer) {
    const isPointerInsideField = this.scene.fieldBackground.getBounds().contains(pointer.x, pointer.y);

    if (this.scene.gameOver) {
      if (this.scene.canRestart && isPointerInsideField) this.scene.scene.restart({ gameMode: this.scene.storeKey });
      return false;
    }

    return this.scene.canPick && isPointerInsideField;
  }

  handleTileSelection(pointer) {
    const row = Math.floor((pointer.y - this.scene.gameOptions.boardOffset.y) / this.scene.gameOptions.gemSize);
    const col = Math.floor((pointer.x - this.scene.gameOptions.boardOffset.x) / this.scene.gameOptions.gemSize);

    if (this.scene.sameGame.validPick(row, col) && !this.scene.sameGame.isEmpty(row, col)) {
      let connectedItems = this.scene.sameGame.countConnectedItems(row, col);
      if (connectedItems >= this.scene.gameOptions.minimumMatches) {
        this.scene.updateMoves();
        this.processMatches(row, col, connectedItems);
      }
    }
  }

  processMatches(row, col, connectedItems) {
    let counterKey = this.scene.sameGame.getValueAt(row, col);
    this.updateScoreCounter(counterKey, connectedItems);

    this.scene.canPick = false;
    let itemsToRemove = this.scene.sameGame.listConnectedItems(row, col);
    itemsToRemove.forEach((item, index) => {
      this.scene.poolArray.push(this.scene.sameGame.getCustomDataAt(item.row, item.column));
      this.animateItemRemoval(item, index, itemsToRemove.length);
    });
  }

  animateItemRemoval(item, index, totalItems) {
    this.scene.tweens.add({
      targets: this.scene.sameGame.getCustomDataAt(item.row, item.column),
      alpha: 0,
      duration: this.scene.gameOptions.destroySpeed,
      onComplete: () => {
        if (index === totalItems - 1) {
          this.scene.sameGame.removeConnectedItems(item.row, item.column);
          this.makeGemsFall();
          if (!(this.scene.storeKey === GAME_MODES.CLASSIC)) this.replenishGems();
        }
      }
    });
  }

  makeGemsFall() {
    const { gemSize, fallSpeed } = this.scene.gameOptions
    let moves = this.scene.sameGame.arrangeBoard();
    if (moves.length === 0 && this.scene.storeKey === GAME_MODES.CLASSIC) {
      this.makeGemsSlide();
    } else {
      moves.forEach((move, index) => {
        this.scene.tweens.add({
          targets: this.scene.sameGame.getCustomDataAt(move.row, move.column),
          y: this.scene.sameGame.getCustomDataAt(move.row, move.column).y + gemSize * move.deltaRow,
          duration: fallSpeed * move.deltaRow,
          onComplete: () => {
            if (index + 1 === moves.length) {
              if (this.scene.storeKey === GAME_MODES.CLASSIC) {
                this.makeGemsSlide();
                // this.endOfMove()
              }
            }
          }
        });
      });
    }
    // this.replenishGems()
  }

  replenishGems() {
    const { gemSize, fallSpeed, boardOffset } = this.scene.gameOptions
    let replenishMovements = this.scene.sameGame.replenishBoard();

    replenishMovements.forEach((movement, index) => {
      let sprite = this.scene.poolArray.pop();
      sprite.alpha = 1;
      sprite.y = boardOffset.y + gemSize * (movement.row - movement.deltaRow + 1) - gemSize / 2;
      sprite.x = boardOffset.x + gemSize * movement.column + gemSize / 2,
        sprite.setFrame(this.scene.sameGame.getValueAt(movement.row, movement.column));
      this.scene.sameGame.setCustomData(movement.row, movement.column, sprite);
      this.scene.tweens.add({
        targets: sprite,
        y: boardOffset.y + gemSize * movement.row + gemSize / 2,
        duration: fallSpeed * movement.deltaRow,
        onComplete: () => {
          if (index + 1 === replenishMovements.length) {
            this.endOfMove()
          }
        }
      });
    })
  }

  makeGemsSlide() {
    let moves = this.scene.sameGame.compactBoardToLeft();
    if (moves.length === 0) {
      this.endOfMove();
    } else {
      moves.forEach((move, index) => {
        this.scene.tweens.add({
          targets: this.scene.sameGame.getCustomDataAt(move.row, move.column),
          x: this.scene.sameGame.getCustomDataAt(move.row, move.column).x + this.scene.gameOptions.gemSize * move.deltaColumn,
          duration: Math.abs(this.scene.gameOptions.slideSpeed * move.deltaColumn),
          ease: "Bounce.easeOut",
          onComplete: () => {
            if (index + 1 === moves.length) {
              this.endOfMove();
            }
          }
        });
      });
    }
  }

  endOfMove() {
    if (this.scene.sameGame.stillPlayable(this.scene.gameOptions.minimumMatches)) {
      this.scene.canPick = true;
    } else {
      let newScore = Math.max(this.scene.data.values.score, this.scene.savedData.score);
      localStorage.setItem(this.scene.storeKey, JSON.stringify({ score: newScore }));
      this.scene.setGameOver()
    }
  }



  fillTilesCounter() {
    let frames = Object.keys(this.scene.textures.get('tiles').frames).slice(0, -1)
    for (let frameNumber in frames) {
      this.scene.tilesCounters[frameNumber] = { count: 0, maxCombo: 0 }
    }
  }

  renderTilesCounter() {
    const scene = this.scene

    let framesCount = Object.keys(scene.tilesCounters).length
    const { boardOffset, baseSize, baseScale } = scene.gameOptions
    let y = boardOffset.y + baseSize * 2
    let comboY = boardOffset.y + baseSize * 3.2
    // let y = 23 * 3 + baseSize / 2
    scene.add.rectangle(
      boardOffset.x + baseSize * framesCount,
      y,
      baseSize * 2 * framesCount + baseSize / 2,
      baseSize,
      0xaaaaaa,
      0.5
    )

    for (let frameNumber in scene.tilesCounters) {
      const count = scene.tilesCounters[frameNumber].count
      let x = boardOffset.x * 1.5 + frameNumber * baseSize * 1.5;

      // combo counters
      let comboTile = scene.add.sprite(x, comboY, "tiles", frameNumber)
        .setScale(baseScale / 1.3)
      let comboTileText = scene.add.text(x + 10, comboY, `X${scene.tilesCounters[frameNumber].maxCombo} `, { color: "#fff", ...scene.fontOptions, fontSize: 30 })

      // item counters
      let tile = scene.add.sprite(x, y, "tiles", frameNumber)
        .setScale(baseScale / 1.3)
      let tileText = scene.add.text(x + 5, y, String(count).padStart(3, '0'), { color: "#fff", ...scene.fontOptions, fontSize: 30 })


      scene.tilesCounters[frameNumber].tile = tile
      scene.tilesCounters[frameNumber].text = tileText

      const fxTile = tile.preFX.addReveal();
      const fxTileText = tileText.preFX.addReveal();
      const fxComboTile = comboTile.preFX.addReveal();
      const fxComboTileText = comboTileText.preFX.addReveal();

      scene.tweens.add({
        targets: [fxTile, fxTileText, fxComboTile, fxComboTileText],
        progress: 1,
        duration: 1000,
        repeat: 0,
      });
    }
  }

  updateScoreCounter(counterKey, count) {
    let counter = this.scene.tilesCounters[counterKey]
    let store = this.scene.data.values

    counter.count += count
    counter.lastCombo = count
    counter.maxCombo = Math.max(counter.maxCombo, count)

    store.score += count * (count - 1);
    store.lastCombo = count
    store.maxCombo = Math.max(store.maxCombo, count)
    if (store.maxCombo === count) store.comboItemIcon = counterKey

    this.scene.missionManager.updateMissionsCouner()
    this.scene.scoreText.text = store.score.toString();
  }
}
