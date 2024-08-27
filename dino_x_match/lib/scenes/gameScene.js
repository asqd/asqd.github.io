class GameScene extends Phaser.Scene {

  init(data) {
    this.data.set(this.initialGameState())
    this.timer = null
    this.storeKey = data.gameMode || GAME_MODES.TIME_ATTACK
    this.gameOver = false
    this.canRestart = false
    this.canPick = true;
    this.tilesCounters = {}
    this.missionViews = []
    if (this.storeKey === GAME_MODES.MOVES_ATTACK) this.data.values.moves = this.data.values.movesLimit 
    this.gameManager = new GameManager(this)
    this.missionManager = new MissionManager(this)
    let engineConfig = { rows: this.gameOptions.rows, columns: this.gameOptions.columns, items: this.gameOptions.items }
    this.sameGame = new SameGame(engineConfig);
  }

  initialGameState() {
    return {
      timeLimit: TIME_LIMIT,
      movesLimit: MOVES_LIMIT,
      score: 0,
      time: 0,
      timer: 0,
      moves: 0,
      lastCombo: 0,
      maxCombo: 0,
      comboItemIcon: null
    }
  }

  constructor() {
    super({ key: 'GameScene' });
    this.gameOptions = GAME_OPTIONS;

    this.gameOptions.gemScale = parseFloat((this.gameOptions.gemSize / this.gameOptions.gemSpriteSize).toFixed(2))
    this.gameOptions.baseScale = parseFloat((this.gameOptions.baseSize / this.gameOptions.gemSpriteSize).toFixed(2))

    this.fontOptions = { fontFamily: 'Silkscreen', fontSize: 40 }

    this.sameGame = null;
    this.poolArray = [];
    this.savedData = null;
    this.scoreText = null;
    this.gameText = null;
  }

  preload() {
    IconButton.loadAssets(this)
    this.load.image('bg', 'assets/sprites/summer_bg.png');
    this.load.spritesheet("tiles", "assets/sprites/alt_tiles.png", { frameWidth: this.gameOptions.gemSpriteSize, frameHeight: this.gameOptions.gemSpriteSize, margin: 0, spacing: 0 });
    this.load.spritesheet("dino", "assets/sprites/dino.png", { frameWidth: 46, frameHeight: 38 });
  }

  create() {
    this.scale.setParentSize(window.innerWidth, window.innerHeight);
    let bg = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'bg')
    this.savedData = JSON.parse(localStorage.getItem(this.storeKey)) || { score: 0 };

    this.gameManager.fillTilesCounter()
    // this.missionManager.pickMissions()
    // this.missionManager.drawMissions()
    this.drawBackground()
    this.sameGame.generateBoard();
    this.drawField();
    this.drawUI()

    this.dino = new Character(this, this.game.config.width - 120, this.game.config.height - 80, "dino", 0)

    this.input.on("pointerdown", this.tileSelect, this);
  }

  update(_time, delta) {
  }

  updateMoves() {
    if (this.storeKey === GAME_MODES.MOVES_ATTACK) {
      this.data.values.moves -= 1
    } else {
      this.data.values.moves += 1
    }
    this.movesText.text = MOVES_TEXT.format({ moves: this.data.values.moves });
  }

  drawUI() {
    const { gemSize, boardOffset, maxColumns } = this.gameOptions
    const fontOptions = { ...this.fontOptions }

    const y = 20
    const scoreX = boardOffset.x / 2
    const timeX = boardOffset.x + gemSize * (maxColumns / 2) // +1?
    const movesX = boardOffset.x + gemSize * (maxColumns - 0.5) 
    const menuX = boardOffset.x + gemSize * (maxColumns - 0.3) 

    this.scoreText = this.add.text(scoreX, y, "0", fontOptions);
    this.versionText = this.add.text(boardOffset.x / 2 + gemSize * (maxColumns), this.game.config.height - 20, VERSION, { fontFamily: 'Silkscreen', fontSize: 20 });

    if (this.storeKey === GAME_MODES.TIME_ATTACK) {
      this.timeText = this.add.text(timeX, y, TIME_TEXT.format({ time: String(this.data.get('timeLimit')).padStart(3, ' ') }), fontOptions).setOrigin(1, 0);
    } else {
      this.timeText = this.add.text(timeX, y, TIME_TEXT.format({ time: String(0).padStart(3, ' ') }), fontOptions).setOrigin(1, 0);
    }
    if (this.storeKey === GAME_MODES.MOVES_ATTACK) {
      this.movesText = this.add.text(movesX, y, MOVES_TEXT.format({ moves: this.data.get('movesLimit') }), fontOptions).setOrigin(1, 0);
    } else {
      this.movesText = this.add.text(movesX, y, MOVES_TEXT.format({ moves: this.data.get('moves') }), fontOptions).setOrigin(1, 0);
    }

    this.menuButton = this.add.text(menuX - 10, y - 21, '☰', { fontOptions, ...{ fontSize: 80 } })
    this.menuButton.setInteractive({ cursor: 'pointer' })

    this.menuButton.on('pointerdown', () => {
      this.cameras.main.fadeOut(400)
      this.time.delayedCall(400, () => this.scene.stop(this.scene.key).start('MenuScene'))
    })
  }

  drawBackground() {
    const { gemSize, boardOffset, columns, rows } = this.gameOptions

    this.fieldBackground = this.add.rectangle(
      boardOffset.x + gemSize / 2 * columns,
      boardOffset.y + gemSize / 2 * rows,
      gemSize * columns + gemSize / 2,
      gemSize * rows + gemSize / 2,
      0xffffff,
      0.5
    )
  }

  drawField() {
    const { gemSize, boardOffset, gemScale } = this.gameOptions

    for (let row = 0; row < this.sameGame.getRows(); row++) {
      for (let col = 0; col < this.sameGame.getColumns(); col++) {
        let x = boardOffset.x + gemSize * col + gemSize / 2;
        let y = boardOffset.y + gemSize * row + gemSize / 2;
        let tile = this.add.sprite(x, y, "tiles", this.sameGame.getValueAt(row, col));
        tile.setScale(gemScale)
        this.sameGame.setCustomData(row, col, tile);
      }
    }
  }


  tileSelect(pointer) {
    return this.gameManager.tileSelect(pointer)
  }

  updateTimer() {
    if (this.gameOver) return

    const state = this.data.values

    state.time += 1
    if (this.storeKey === GAME_MODES.TIME_ATTACK) {
      this.timeText.text = TIME_TEXT.format({ time: String(state.timeLimit - state.time).padStart(3, ' ') });
      if (state.timeLimit <= state.time) {
        this.setGameOver()
      }
    } else if (this.storeKey === GAME_MODES.MOVES_ATTACK && state.moves == 0) {
      this.setGameOver()
    } else {
      this.timeText.text = TIME_TEXT.format({ time: String(state.time).padStart(3, ' ') });
    }
  }
  
  endGameTextFor(stringTemplate) {
    return stringTemplate.format({ 
      score: this.data.values.score, 
      totalScore: Math.max(this.data.values.score, this.savedData.score),
      maxCombo: this.data.values.maxCombo
    })
  }

  composeEndGameText() {
    if (this.storeKey === GAME_MODES.TIME_ATTACK) { 
      return this.endGameTextFor(TIME_ATTACK_END_GAME_TEXT)
    } else if (this.sameGame.nonEmptyItems() === 0) {
      return this.endGameTextFor(CLEAR_FIELD_END_GAME_TEXT);
    } else {
      return this.endGameTextFor(MOVES_ATTACK_END_GAME_TEXT);
    }
  }
  
  setGameOver() {
    this.gameOver = true
    this.dino.stopWalking()
    let newScore = Math.max(this.data.values.score, this.savedData.score);
    localStorage.setItem(this.storeKey, JSON.stringify({ score: newScore }));

    const { baseSize, boardOffset, maxColumns, maxRows } = this.gameOptions

    let gameTextRect = this.add.rectangle(
      boardOffset.x + baseSize / 2 * maxColumns,
      boardOffset.y + baseSize / 2 * maxRows,
      baseSize * maxColumns + baseSize,
      baseSize * maxRows + baseSize,
      0xaaaaaa,
      0.9
    )

    let text = this.composeEndGameText()
    this.gameText = this.add.text(
      boardOffset.x,
      boardOffset.y + baseSize / 2 * maxRows,
      text,
      { lineSpacing: 10, ...this.fontOptions}
    )
    this.gameText.setOrigin(0, 0.5)
    this.gameManager.renderTilesCounter()

    gameTextRect.preFX
    const fxGameText = this.gameText.preFX.addReveal();

    this.tweens.add({
      targets: fxGameText,
      progress: 1,
      duration: 1000,
      repeat: 0,
    });

    this.time.addEvent({
      delay: 1000,
      callback: () => this.canRestart = true,
      callbackScope: this,
    });

  }
}
